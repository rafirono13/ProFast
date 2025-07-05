import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';

const usePayments = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate: processPayment, isPending: isProcessingPayment } =
    useMutation({
      // The mutation function sends the payment data to our backend
      mutationFn: async (paymentInfo) => {
        const { data } = await axiosSecure.post('/payments', paymentInfo);
        return data;
      },
      // What to do on a successful mutation
      onSuccess: (data, variables) => {
        console.log('✅ Payment saved and parcel updated:', data);

        // This is the magic! It tells TanStack Query to refetch the user's parcel list.
        // The UsersPanel will automatically update to show the "paid" status.
        queryClient.invalidateQueries({ queryKey: ['myParcels', user?.email] });

        Swal.fire({
          title: 'Payment Successful!',
          html: `
            <p>Your booking is confirmed.</p>
            <p><strong>Transaction ID:</strong> ${variables.transactionId}</p>
          `,
          icon: 'success',
          confirmButtonColor: '#84cc16',
        }).then(() => {
          // Navigate the user back to their parcel list after they see the success message.
          navigate('/dashboard/my-parcels');
        });
      },
      // What to do if the mutation fails
      onError: (error) => {
        console.error('Failed to save payment:', error);
        Swal.fire({
          title: 'Update Failed',
          text: 'Your payment was successful, but we had trouble updating your booking. Please contact support.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b',
        });
      },
    });

  return { processPayment, isProcessingPayment };
};

export default usePayments;
