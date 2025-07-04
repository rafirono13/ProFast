import React, { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import { FaBox, FaFileAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import useUpdateParcel from '../../../Hooks/Users/useUpdateParcel';

const EditParcel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { editParcel, isEditing } = useUpdateParcel();
  const [parcel, setParcel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [divisions, setDivisions] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch parcel data
        const parcelRes = await axiosSecure.get(`/parcels/${id}`);
        setParcel(parcelRes.data);
        reset(parcelRes.data);

        // Fetch static data
        const [divisionRes, warehousesRes] = await Promise.all([
          axios.get('/data/division.json'),
          axios.get('/data/warehouses.json'),
        ]);
        setDivisions(divisionRes.data);
        setAllWarehouses(warehousesRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
        Swal.fire('Error', 'Failed to load parcel data', 'error');
        navigate('/dashboard/my-parcels');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, reset, axiosSecure, navigate]);

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
    if (parcel.status !== 'unpaid') {
      Swal.fire('Cannot Edit', 'Paid parcels cannot be modified', 'warning');
      return;
    }

    // Recalculate cost if needed
    const costDetails = calculateCostDetails(data);
    const updatedData = {
      ...data,
      cost: costDetails.total,
    };

    editParcel({ parcelId: id, updatedData });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="loading loading-lg loading-spinner text-lime-500"></span>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600">
            Parcel Not Found
          </h2>
          <p className="mt-2 text-gray-400">
            The parcel you're trying to edit doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100/80 bg-gray-50/50 p-4 shadow-lg sm:p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-800">Edit Parcel</h1>
          <p className="mt-2 text-gray-500">
            Update your parcel details below.
          </p>
          {parcel.status !== 'unpaid' && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <strong>Note:</strong> This parcel has been paid and can no longer
              be edited.
            </div>
          )}
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
              {/* Document */}
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
                />
                <div className="flex items-center gap-3">
                  <FaFileAlt
                    className={`text-xl ${watchedParcelType === 'Document' ? 'text-lime-500' : 'text-gray-400'}`}
                  />
                  <span>Document</span>
                </div>
              </label>

              {/* Non-Document */}
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
              {/* Parcel Name */}
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
                  disabled={parcel.status !== 'unpaid'}
                />
                {errors.parcelName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.parcelName.message}
                  </p>
                )}
              </div>

              {/* Parcel Weight (Conditional) */}
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
                    disabled={parcel.status !== 'unpaid'}
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
                {/* Sender Name */}
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
                    disabled={parcel.status !== 'unpaid'}
                  />
                  {errors.senderName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.senderName.message}
                    </p>
                  )}
                </div>

                {/* Sender Contact */}
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
                    disabled={parcel.status !== 'unpaid'}
                  />
                  {errors.senderContact && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.senderContact.message}
                    </p>
                  )}
                </div>

                {/* Sender Region */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Your Region
                  </label>
                  <select
                    {...register('senderRegion', {
                      required: 'Region is required',
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                    disabled={parcel.status !== 'unpaid'}
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

                {/* Sender Warehouse */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Sender Pickup Warehouse
                  </label>
                  <select
                    {...register('senderWarehouse', {
                      required: 'Warehouse is required',
                    })}
                    disabled={
                      !watchedSenderRegion || parcel.status !== 'unpaid'
                    }
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

              {/* Sender Address */}
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
                  disabled={parcel.status !== 'unpaid'}
                ></textarea>
                {errors.senderAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.senderAddress.message}
                  </p>
                )}
              </div>

              {/* Pickup Instructions */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Pickup Instruction
                </label>
                <textarea
                  {...register('pickupInstruction')}
                  rows="3"
                  placeholder="e.g., Call upon arrival, leave at reception"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  disabled={parcel.status !== 'unpaid'}
                ></textarea>
              </div>
            </div>

            {/* Receiver Details */}
            <div className="space-y-6">
              <h2 className="border-b pb-2 text-xl font-semibold text-gray-700">
                Receiver Details
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Receiver Name */}
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
                    disabled={parcel.status !== 'unpaid'}
                  />
                  {errors.receiverName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiverName.message}
                    </p>
                  )}
                </div>

                {/* Receiver Contact */}
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
                    disabled={parcel.status !== 'unpaid'}
                  />
                  {errors.receiverContact && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.receiverContact.message}
                    </p>
                  )}
                </div>

                {/* Receiver Region */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Receiver Region
                  </label>
                  <select
                    {...register('receiverRegion', {
                      required: 'Region is required',
                    })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                    disabled={parcel.status !== 'unpaid'}
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

                {/* Receiver Warehouse */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Receiver Delivery Warehouse
                  </label>
                  <select
                    {...register('receiverWarehouse', {
                      required: 'Warehouse is required',
                    })}
                    disabled={
                      !watchedReceiverRegion || parcel.status !== 'unpaid'
                    }
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

              {/* Receiver Address */}
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
                  disabled={parcel.status !== 'unpaid'}
                ></textarea>
                {errors.receiverAddress && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.receiverAddress.message}
                  </p>
                )}
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Delivery Instruction
                </label>
                <textarea
                  {...register('deliveryInstruction')}
                  rows="3"
                  placeholder="e.g., Fragile item, please handle with care"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-lime-500 focus:ring-lime-500"
                  disabled={parcel.status !== 'unpaid'}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="mb-4 text-center text-sm text-gray-500">
              * Our rider will pickup the parcel from your location between 4 PM
              and 7 PM approximately.
            </p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/my-parcels')}
                className="btn px-8 btn-outline"
                disabled={isEditing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn bg-lime-500 px-8 text-white hover:bg-lime-600 disabled:bg-lime-300"
                disabled={isEditing || parcel.status !== 'unpaid'}
              >
                {isEditing ? 'Updating...' : 'Update Parcel'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditParcel;
