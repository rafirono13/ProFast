import Swal from 'sweetalert2';
import useAxiosSecure from '../useAxiosSecure';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

const useEditParcel = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const { mutateAsync: editParcel, isPending: isEditing } = useMutation({
    mutationFn: async ({ parcelId, updatedData }) => {
      const { data } = await axiosSecure.put(
        `/parcels/${parcelId}`,
        updatedData,
      );
      return data;
    },
    onSuccess: () => {
      Swal.fire({
        title: 'Updated!',
        text: 'Parcel details updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate('/dashboard/my-parcels');
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'Update Failed',
        text: error.response?.data?.message || 'Could not update parcel',
        icon: 'error',
      });
    },
  });

  return { editParcel, isEditing };
};

export default useEditParcel;
