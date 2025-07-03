import React from 'react';
import { FaEdit, FaTrashAlt, FaCreditCard, FaBoxOpen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useMyParcels from '../../../Hooks/Users/useMyParcels';
import axiosPublic from '../../../API/axiosPublic';

const UsersPanel = () => {
  // Using your custom hook to get the data! So clean!
  const { myParcels, isLoading, refetch } = useMyParcels();

  // --- Action Handlers for the Buttons ---

  const handleEdit = (parcel) => {
    // This would navigate to an edit page or open a modal.
    // For now, we'll show a placeholder alert.
    console.log('Editing parcel:', parcel._id);
    Swal.fire(
      'Edit Clicked!',
      `This will open an edit form for parcel: ${parcel.trackingId}`,
      'info',
    );
  };

  const handlePay = (parcel) => {
    // This is where you'll integrate your payment gateway later.
    console.log('Paying for parcel:', parcel._id);
    Swal.fire(
      'Payment Gateway',
      'This will redirect to the payment page!',
      'info',
    );
  };

  const handleDelete = (parcel) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel this parcel booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the DELETE endpoint on the server.
        axiosPublic
          .delete(`/parcels/${parcel._id}`)
          .then((res) => {
            if (res.data.deletedCount > 0) {
              Swal.fire(
                'Cancelled!',
                'Your booking has been cancelled.',
                'success',
              );
              refetch(); // This is the magic of Tanstack Query - refetch the data to update the UI!
            }
          })
          .catch((err) => {
            console.error(err);
            Swal.fire(
              'Error!',
              'Could not cancel the booking. Please try again.',
              'error',
            );
          });
      }
    });
  };

  // Show a loading spinner while data is being fetched.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-lg loading-spinner text-lime-500"></span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-1">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Parcels</h1>
        <p className="mt-2 text-gray-500">
          A list of all your booked parcels and their status.
        </p>
      </div>

      {myParcels.length > 0 ? (
        <div className="overflow-x-auto rounded-lg bg-white shadow-md">
          <table className="table w-full">
            {/* Table Head */}
            <thead className="bg-gray-50 text-sm uppercase">
              <tr>
                <th className="p-4">Parcel Details</th>
                <th className="p-4">Receiver's Name</th>
                <th className="p-4">Booking Date</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myParcels.map((parcel) => (
                <tr key={parcel._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{parcel.parcelName}</div>
                    <div className="text-sm opacity-50">
                      {parcel.parcelType}
                    </div>
                  </td>
                  <td className="p-4">{parcel.receiverName}</td>
                  <td className="p-4">
                    {new Date(parcel.bookingDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold">৳{parcel.cost}</td>
                  <td className="p-4">
                    <span
                      className={`badge font-semibold ${parcel.status === 'unpaid' ? 'badge-warning' : 'badge-primary'}`}
                    >
                      {parcel.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* --- Conditional Action Buttons --- */}
                      <button
                        onClick={() => handleEdit(parcel)}
                        className="btn text-blue-600 btn-ghost btn-xs disabled:text-gray-300"
                        disabled={parcel.status !== 'unpaid'}
                        title="Edit Parcel"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handlePay(parcel)}
                        className="btn text-green-600 btn-ghost btn-xs disabled:text-gray-300"
                        disabled={parcel.status !== 'unpaid'}
                        title="Pay Now"
                      >
                        <FaCreditCard size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(parcel)}
                        className="btn text-red-600 btn-ghost btn-xs disabled:text-gray-300"
                        disabled={parcel.status !== 'unpaid'}
                        title="Cancel Booking"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-24 text-center">
          <div className="mx-auto w-fit rounded-full bg-lime-100 p-4">
            <FaBoxOpen size={40} className="text-lime-500" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-gray-600">
            No Parcels Found
          </h2>
          <p className="mt-2 text-gray-400">
            You haven't booked any parcels yet. Let's change that!
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersPanel;
