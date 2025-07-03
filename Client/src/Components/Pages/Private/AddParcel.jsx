import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FaBox, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';

const generateTrackingId = () => {
  const prefix = 'ZAP';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${randomSuffix}`;
};

const AddParcel = () => {
  // --- STATE MANAGEMENT ---
  const [divisions, setDivisions] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisionRes, warehousesRes] = await Promise.all([
          axios.get('/data/division.json'),
          axios.get('/data/warehouses.json'),
        ]);
        setDivisions(divisionRes.data);
        setAllWarehouses(warehousesRes.data);
      } catch (error) {
        console.error('Failed to fetch form data', error);
        Swal.fire({
          title: 'Error!',
          text: 'Could not load required data. Please try refreshing the page.',
          icon: 'error',
          confirmButtonColor: '#d33',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FORM SETUP (React Hook Form) ---
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const watchedParcelType = watch('parcelType');
  const watchedSenderRegion = watch('senderRegion');
  const watchedReceiverRegion = watch('receiverRegion');

  const calculateCostDetails = (data) => {
    const weight = parseFloat(data.parcelWeight) || 0;
    const withinCity =
      data.senderRegion &&
      data.receiverRegion &&
      data.senderRegion === data.receiverRegion;
    let details = {
      baseFare: 0,
      weightCharge: 0,
      outsideCityCharge: 0,
      total: 0,
    };

    if (data.parcelType === 'Document') {
      details.baseFare = withinCity ? 60 : 80;
    } else {
      // Non-Document
      if (withinCity) {
        details.baseFare = 110;
        if (weight > 3) {
          details.weightCharge = Math.ceil(weight - 3) * 40;
        }
      } else {
        // Outside City
        details.baseFare = 150;
        if (weight > 3) {
          details.weightCharge = Math.ceil(weight - 3) * 40;
          details.outsideCityCharge = 40;
        }
      }
    }
    details.total =
      details.baseFare + details.weightCharge + details.outsideCityCharge;
    return details;
  };

  const onSubmit = (data) => {
    const costDetails = calculateCostDetails(data);
    const trackingId = generateTrackingId();

    const weightInfo =
      data.parcelType === 'Non-Document'
        ? `<p class="text-sm text-gray-600"><strong>Weight:</strong> ${data.parcelWeight} kg</p>`
        : '';

    const costBreakdownHtml = `
      <div class="space-y-1 py-2 text-sm text-gray-600 border-t border-b mb-2">
        <div class="flex justify-between"><span>Base Fare</span><span>৳${costDetails.baseFare}</span></div>
        ${costDetails.weightCharge > 0 ? `<div class="flex justify-between"><span>Extra Weight Charge</span><span>৳${costDetails.weightCharge}</span></div>` : ''}
        ${costDetails.outsideCityCharge > 0 ? `<div class="flex justify-between"><span>Outside City Charge</span><span>৳${costDetails.outsideCityCharge}</span></div>` : ''}
      </div>
    `;

    Swal.fire({
      title: 'Booking Summary',
      html: `
        <div class="text-left p-2 space-y-4">
          <div class="grid grid-cols-2 gap-4 border-b pb-2">
            <div>
              <h4 class="font-bold text-gray-700">From:</h4>
              <p class="text-sm text-gray-600">${data.senderName}</p>
              <p class="text-sm text-gray-500">${data.senderWarehouse}, ${data.senderRegion}</p>
            </div>
            <div>
              <h4 class="font-bold text-gray-700">To:</h4>
              <p class="text-sm text-gray-600">${data.receiverName}</p>
              <p class="text-sm text-gray-500">${data.receiverWarehouse}, ${data.receiverRegion}</p>
            </div>
          </div>
          <div class="pb-2">
             <h4 class="font-bold text-gray-700">Parcel Details:</h4>
             <p class="text-sm text-gray-600"><strong>Title:</strong> ${data.parcelName}</p>
             <p class="text-sm text-gray-600"><strong>Type:</strong> ${data.parcelType}</p>
             ${weightInfo}
          </div>
          <div>
            <h4 class="font-bold text-gray-700">Cost Breakdown:</h4>
            ${costBreakdownHtml}
          </div>
          <div class="flex justify-between items-center pt-2 border-t mt-2">
            <p class="text-lg font-bold text-gray-800">Total Estimated Cost:</p>
            <p class="text-2xl font-bold text-lime-500">৳${costDetails.total}</p>
          </div>
        </div>
      `,
      icon: 'info',
      iconColor: '#84cc16',
      showCancelButton: true,
      confirmButtonColor: '#84cc16',
      cancelButtonColor: '#f59e0b',
      confirmButtonText: 'Confirm & Book Parcel',
      cancelButtonText: 'Go Back & Edit',
      width: '40rem',
      customClass: {
        popup: 'rounded-xl shadow-lg',
        title: 'text-2xl font-bold text-gray-800 pt-4',
        htmlContainer: 'text-base',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const finalData = {
          ...data,
          cost: costDetails.total,
          bookingDate: new Date().toISOString(),
          status: 'unpaid',
          deliveryStatus: 'pending',
          trackingId: trackingId,
          userEmail: user?.email,
        };
        console.log('Submitting this object to database:', finalData);

        axiosSecure
          .post('/parcels', finalData)
          .then((res) => {
            if (res.data.insertedId) {
              Swal.fire({
                title: 'Success!',
                html: `Your parcel has been booked! <br>Your Tracking ID is: <br><strong class="text-lime-600 text-lg">${trackingId}</strong>`,
                icon: 'success',
                confirmButtonColor: '#84cc16',
              });
              reset();
            }
          })
          .catch((err) => {
            console.log(err);
            Swal.fire({
              title: 'Error!',
              text: 'Could not book your parcel.',
              icon: 'error',
            });
          });
      }
    });
  };

  // Show a loading spinner while fetching data.
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="loading loading-lg loading-spinner text-lime-500"></span>
      </div>
    );
  }

  // --- RENDER THE FORM (JSX) ---
  return (
    <div className="rounded-2xl border border-gray-100/80 bg-gray-50/50 p-4 shadow-lg sm:p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-800">Add Parcel</h1>
          <p className="mt-2 text-gray-500">
            Enter your parcel details to start a new delivery.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
          {/* --- Parcel Details Section --- */}
          <div className="space-y-6">
            <h2 className="border-b pb-2 text-xl font-semibold text-gray-700">
              Parcel Details
            </h2>
            <p className="text-sm font-medium text-gray-600">
              Select your parcel type:
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Radio buttons for parcel type */}
              <label
                className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                  watchedParcelType === 'Document'
                    ? 'border-lime-400 bg-lime-50 ring-2 ring-lime-300'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  value="Document"
                  {...register('parcelType', { required: true })}
                  className="hidden"
                  defaultChecked
                />
                <div className="flex items-center gap-3">
                  <FaFileAlt
                    className={`text-xl ${watchedParcelType === 'Document' ? 'text-lime-500' : 'text-gray-400'}`}
                  />
                  <span>Document</span>
                </div>
              </label>
              <label
                className={`flex-1 cursor-pointer rounded-lg border p-4 transition-all ${
                  watchedParcelType === 'Non-Document'
                    ? 'border-lime-400 bg-lime-50 ring-2 ring-lime-300'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  value="Non-Document"
                  {...register('parcelType', { required: true })}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <FaBox
                    className={`text-xl ${watchedParcelType === 'Non-Document' ? 'text-lime-500' : 'text-gray-400'}`}
                  />
                  <span>Non-Document</span>
                </div>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Parcel Name
                </label>
                <input
                  {...register('parcelName', {
                    required: 'Parcel name is required',
                  })}
                  type="text"
                  placeholder="e.g., Important Documents"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                />
                {errors.parcelName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.parcelName.message}
                  </p>
                )}
              </div>
              {/* Conditional weight field */}
              {watchedParcelType === 'Non-Document' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Parcel Weight (KG)
                  </label>
                  <input
                    {...register('parcelWeight', {
                      required: 'Weight is required',
                      valueAsNumber: true,
                      min: { value: 0.1, message: 'Weight must be > 0' },
                    })}
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.5"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  />
                  {errors.parcelWeight && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.parcelWeight.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* --- Sender & Receiver Details Section --- */}
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
            {/* Sender Details */}
            <div className="space-y-6">
              <h2 className="border-b pb-2 text-xl font-semibold text-gray-700">
                Sender Details
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Sender Name
                  </label>
                  <input
                    {...register('senderName', {
                      required: 'Sender name is required',
                    })}
                    type="text"
                    placeholder="Your Full Name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  />
                  {errors.senderName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.senderName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Sender Contact No
                  </label>
                  <input
                    {...register('senderContact', {
                      required: 'Contact number is required',
                    })}
                    type="tel"
                    placeholder="Your Contact Number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  />
                  {errors.senderContact && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.senderContact.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Your Region
                  </label>
                  <select
                    {...register('senderRegion', {
                      required: 'Region is required',
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  >
                    <option value="">Select your region</option>
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.senderRegion && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.senderRegion.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Sender Pickup Warehouse
                  </label>
                  <select
                    {...register('senderWarehouse', {
                      required: 'Warehouse is required',
                    })}
                    disabled={!watchedSenderRegion}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Warehouse</option>
                    {allWarehouses
                      .filter((w) => w.region === watchedSenderRegion)
                      .map((w) => (
                        <option key={w.city} value={w.city}>
                          {w.city}
                        </option>
                      ))}
                  </select>
                  {errors.senderWarehouse && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.senderWarehouse.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Address
                </label>
                <textarea
                  {...register('senderAddress', {
                    required: 'Address is required',
                  })}
                  rows="2"
                  placeholder="Your full pickup address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                ></textarea>
                {errors.senderAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.senderAddress.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Pickup Instruction
                </label>
                <textarea
                  {...register('pickupInstruction')}
                  rows="3"
                  placeholder="e.g., Call upon arrival, leave at reception"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                ></textarea>
              </div>
            </div>

            {/* Receiver Details */}
            <div className="space-y-6">
              <h2 className="border-b pb-2 text-xl font-semibold text-gray-700">
                Receiver Details
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Receiver Name
                  </label>
                  <input
                    {...register('receiverName', {
                      required: 'Receiver name is required',
                    })}
                    type="text"
                    placeholder="Receiver's Full Name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  />
                  {errors.receiverName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiverName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Receiver Contact No
                  </label>
                  <input
                    {...register('receiverContact', {
                      required: 'Contact number is required',
                    })}
                    type="tel"
                    placeholder="Receiver's Contact Number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  />
                  {errors.receiverContact && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiverContact.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Receiver Region
                  </label>
                  <select
                    {...register('receiverRegion', {
                      required: 'Region is required',
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  >
                    <option value="">Select receiver's region</option>
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.receiverRegion && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiverRegion.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Receiver Delivery Warehouse
                  </label>
                  <select
                    {...register('receiverWarehouse', {
                      required: 'Warehouse is required',
                    })}
                    disabled={!watchedReceiverRegion}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Warehouse</option>
                    {allWarehouses
                      .filter((w) => w.region === watchedReceiverRegion)
                      .map((w) => (
                        <option key={w.city} value={w.city}>
                          {w.city}
                        </option>
                      ))}
                  </select>
                  {errors.receiverWarehouse && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiverWarehouse.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Address
                </label>
                <textarea
                  {...register('receiverAddress', {
                    required: 'Address is required',
                  })}
                  rows="2"
                  placeholder="Receiver's full delivery address"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                ></textarea>
                {errors.receiverAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.receiverAddress.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Delivery Instruction
                </label>
                <textarea
                  {...register('deliveryInstruction')}
                  rows="3"
                  placeholder="e.g., Fragile item, please handle with care"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="mb-4 text-center text-sm text-gray-500">
              * Our rider will pickup the parcel from your location between 4 PM
              and 7 PM approximately.
            </p>
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-full transform rounded-full bg-lime-500 px-12 py-3 font-bold text-white transition-colors duration-300 hover:scale-105 hover:bg-lime-600 focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 focus:outline-none md:w-auto"
              >
                Proceed to Confirm Booking
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParcel;
