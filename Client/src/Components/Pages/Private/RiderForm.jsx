import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import axios from 'axios';
import useAuth from '../../../Hooks/useAuth';
import useAxiosSecure from '../../../Hooks/useAxiosSecure';
import riderImage from '../../../assets/Rider.png';

const RiderForm = () => {
  // --- STATE AND HOOKS SETUP ---
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [divisions, setDivisions] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- FORM SETUP (React Hook Form) ---
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    // Prefill the form with the logged-in user's data
    defaultValues: {
      applicantName: user?.displayName || '',
      applicantEmail: user?.email || '',
    },
  });

  // Watch the 'region' field to dynamically update the warehouse options
  const watchedRegion = watch('region');

  // --- DATA FETCHING FOR DROPDOWNS ---
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
          text: 'Could not load required data. Please try refreshing.',
          icon: 'error',
        });
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- FORM SUBMISSION HANDLER ---
  const onSubmit = (data) => {
    console.log('Submitting Rider Application:', data);

    axiosSecure
      .post('/riders', data)
      .then((res) => {
        if (res.data.insertedId) {
          Swal.fire({
            title: 'Application Submitted!',
            text: 'Thank you for applying. We will review your application and get back to you soon.',
            icon: 'success',
            confirmButtonColor: '#84cc16',
          });
          reset(); // Clear the form after successful submission
        }
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          title: 'Submission Failed',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
        });
      });
  };

  return (
    <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-lg sm:p-8 md:p-12">
      <div className="mx-auto max-w-6xl">
        {/* --- HEADER SECTION --- */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800 md:text-5xl">
            Be a Rider
          </h1>
          <p className="mt-3 max-w-2xl text-gray-500">
            Enjoy fast, reliable parcel delivery with real-time tracking and
            zero hassle. From personal packages to business shipments — we
            deliver on time, every time.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* --- FORM SECTION --- */}
          <div className="w-full">
            <h3 className="mb-6 text-2xl font-semibold text-gray-700">
              Tell us about yourself
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Read-only Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Your Name
                  </label>
                  <input
                    {...register('applicantName')}
                    type="text"
                    readOnly
                    className="input-bordered input w-full bg-gray-100"
                  />
                </div>
                {/* Read-only Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Your Email
                  </label>
                  <input
                    {...register('applicantEmail')}
                    type="email"
                    readOnly
                    className="input-bordered input w-full bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Age */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Your age
                  </label>
                  <input
                    {...register('age', {
                      required: 'Age is required',
                      valueAsNumber: true,
                      min: { value: 18, message: 'Must be at least 18' },
                    })}
                    type="number"
                    placeholder="Your age"
                    className="input-bordered input w-full"
                  />
                  {errors.age && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.age.message}
                    </p>
                  )}
                </div>
                {/* NID No */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    NID No
                  </label>
                  <input
                    {...register('nid', {
                      required: 'NID number is required',
                      pattern: {
                        value: /^\d{10}$|^\d{13}$|^\d{17}$/,
                        message: 'Enter a valid 10, 13, or 17 digit NID',
                      },
                    })}
                    type="text"
                    placeholder="NID"
                    className="input-bordered input w-full"
                  />
                  {errors.nid && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.nid.message}
                    </p>
                  )}
                </div>
              </div>

              {/* --- ✨ NEW FIELDS ADDED HERE ✨ --- */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Bike Brand */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Bike Brand
                  </label>
                  <input
                    {...register('bikeBrand', {
                      required: 'Bike brand is required',
                    })}
                    type="text"
                    placeholder="e.g., Honda, Yamaha"
                    className="input-bordered input w-full"
                  />
                  {errors.bikeBrand && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bikeBrand.message}
                    </p>
                  )}
                </div>
                {/* Bike Registration No */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Bike Registration No
                  </label>
                  <input
                    {...register('bikeRegNo', {
                      required: 'Registration number is required',
                    })}
                    type="text"
                    placeholder="e.g., DHAKA-METRO-LA-123456"
                    className="input-bordered input w-full"
                  />
                  {errors.bikeRegNo && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.bikeRegNo.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Contact */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Contact
                  </label>
                  <input
                    {...register('contact', {
                      required: 'Contact number is required',
                    })}
                    type="tel"
                    placeholder="Contact"
                    className="input-bordered input w-full"
                  />
                  {errors.contact && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.contact.message}
                    </p>
                  )}
                </div>
                {/* Region */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Your Region
                  </label>
                  <select
                    {...register('region', { required: 'Region is required' })}
                    className="select-bordered select w-full"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select your region
                    </option>
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.region && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.region.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Warehouse */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  Which warehouse you want to work?
                </label>
                <select
                  {...register('warehouse', {
                    required: 'Warehouse is required',
                  })}
                  disabled={!watchedRegion || isDataLoading}
                  className="select-bordered select w-full"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select warehouse
                  </option>
                  {allWarehouses
                    .filter((w) => w.region === watchedRegion)
                    .map((w) => (
                      <option key={w.city} value={w.city}>
                        {w.city}
                      </option>
                    ))}
                </select>
                {errors.warehouse && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.warehouse.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn w-full rounded-full border-none bg-lime-400 py-3 text-lg font-bold text-white transition-colors duration-300 hover:bg-lime-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>

          {/* --- IMAGE SECTION --- */}
          <div className="hidden lg:block">
            <img
              src={riderImage}
              alt="A delivery rider on a scooter"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderForm;
