import React, { useState, useEffect } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FaStripe } from 'react-icons/fa';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import axiosPublic from '../../../API/axiosPublic';
import useAuth from '../../../Hooks/useAuth';
import usePayments from '../../../Hooks/usePayment';

// --- STYLING FOR THE STRIPE CARD ELEMENT ---
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Urbanist, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { parcelId } = useParams();
  const { processPayment, isProcessingPayment } = usePayments();

  // --- Understanding the State Management ---
  // Instead of multiple `useState` hooks, we use ONE object to hold all states
  // related to the payment *submission* process. This is our control panel.
  // - `submissionError`: Stores any error message from Stripe. Starts as `null`.
  // - `processing`: A boolean (true/false) to know if we're currently talking to Stripe.
  //   Used to disable the button and show "Processing...". Starts as `false`.
  // - `clientSecret`: The special key from our server that authorizes this specific payment.
  //   Starts as an empty string `''`. The form is disabled until we get this.
  const [paymentState, setPaymentState] = useState({
    submissionError: null,
    processing: false,
    clientSecret: '',
  });

  // --- DATA FETCHING (TanStack Query) ---
  // This hook fetches the parcel details from our server.
  // `isLoading` and `fetchError` are managed for us automatically.
  const {
    data: parcel,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['parcel', parcelId],
    queryFn: async () => {
      const res = await axiosPublic.get(`/parcels/${parcelId}`);
      return res.data;
    },
    enabled: !!parcelId,
  });

  // --- PAYMENT LOGIC STEP 1: Get Authorization from Our Server ---
  // This `useEffect` hook runs automatically after the `parcel` data is successfully fetched.
  useEffect(() => {
    // We only proceed if we have a parcel with a cost greater than 0.
    if (parcel?.cost > 0) {
      // We send the cost to our backend.
      axiosPublic
        .post('/create-payment-intent', {
          amount: parseInt(parcel.cost * 100), // Stripe needs the amount in the smallest unit (paisa).
          currency: 'bdt',
        })
        .then((res) => {
          // Our server responds with the `clientSecret`.
          // Now, we update our state to store this secret.
          // DATA FLOW: The `clientSecret` flows from our server into our `paymentState` object.
          setPaymentState((prevState) => ({
            ...prevState, // Keep the old state values (`submissionError`, `processing`)
            clientSecret: res.data.clientSecret, // And add the new `clientSecret`.
          }));
        })
        .catch((err) => {
          console.error('Error creating payment intent:', err);
          // DATA FLOW: If this fails, an error message flows into `submissionError`.
          setPaymentState((prevState) => ({
            ...prevState,
            submissionError: 'Could not initialize payment. Please refresh.',
          }));
        });
    }
  }, [parcel]); // Dependency array: This code re-runs if `parcel` changes.

  // --- PAYMENT LOGIC STEP 2: Handle the User Clicking "Pay" ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard clause: Don't proceed if Stripe.js isn't ready or if we don't have the `clientSecret`.
    if (!stripe || !elements || !paymentState.clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (cardElement == null) {
      return;
    }

    // DATA FLOW: User clicked pay. We set `processing` to `true` and clear any old errors.
    // This immediately updates the UI to show "Processing..." and hides old error messages.
    setPaymentState((prevState) => ({
      ...prevState,
      processing: true,
      submissionError: null,
    }));

    // --- PAYMENT LOGIC STEP 3: Confirm the Payment with Stripe ---
    // This is the final step. We send the card info and the `clientSecret` directly to Stripe's servers.
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      paymentState.clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.displayName,
            email: user?.email,
          },
        },
      },
    );

    if (error) {
      // Oh no, Stripe found an error (e.g., wrong CVC, insufficient funds).
      console.error('[payment_error]', error);
      // DATA FLOW: The error message from Stripe flows into `submissionError`, and we set
      // `processing` back to `false`. The UI will show the error and re-enable the button.
      setPaymentState((prevState) => ({
        ...prevState,
        submissionError: error.message,
        processing: false,
      }));
    } else {
      // SUCCESS! The payment went through.
      console.log('✅ Payment successful! [PaymentIntent]', paymentIntent);
      // DATA FLOW: We reset the state for any potential future payments and log the success.
      // `processing` becomes `false`, `submissionError` is cleared.
      setPaymentState({
        submissionError: null,
        processing: false,
        clientSecret: paymentState.clientSecret,
      });
      if (paymentIntent.status === 'succeeded') {
        console.log('Transaction ID:', paymentIntent.id);
        // This is where you would make a final API call to your server to save the
        // payment record and update the parcel's status to 'paid'.
        const paymentInfo = {
          transactionId: paymentIntent.id,
          parcelId: parcel._id,
          userEmail: user?.email,
          amount: parcel.cost,
          currency: 'bdt',
          paymentMethod: paymentIntent.payment_method_types[0],
        };
        processPayment(paymentInfo);
      }
    }
  };

  // --- UI RENDER ---

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-lg loading-spinner text-lime-500"></span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-red-600">Oh No!</h2>
        <p className="mt-2 text-gray-600">
          Could not load parcel details. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-gray-100/80 bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Complete Your Booking
        </h2>
        <p className="mt-2 text-gray-500">
          Total amount for your parcel "{parcel?.parcelName}"
        </p>
      </div>

      <div className="mb-6 rounded-md bg-gray-100 p-4 text-center">
        <p className="text-lg font-semibold text-gray-600">Total To Pay</p>
        <p className="text-4xl font-bold text-lime-500">৳{parcel?.cost}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Card Information
          </label>
          <div className="rounded-lg border border-gray-300 bg-gray-50/50 p-3 shadow-inner focus-within:border-lime-500 focus-within:ring-1 focus-within:ring-lime-500">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {paymentState.submissionError && (
          <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-600">
            {paymentState.submissionError}
          </div>
        )}

        <button
          type="submit"
          disabled={
            !stripe ||
            !elements ||
            !paymentState.clientSecret ||
            paymentState.processing ||
            !parcel
          }
          className="btn w-full transform rounded-full bg-lime-500 px-12 py-3 font-bold text-white transition-colors duration-300 hover:scale-105 hover:bg-lime-600 focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:scale-100 disabled:bg-gray-300"
        >
          {paymentState.processing ? 'Processing...' : `Pay ৳${parcel?.cost}`}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
        <p>Powered by</p>
        <FaStripe className="text-2xl text-gray-500" />
      </div>
    </div>
  );
};

export default PaymentForm;
