import { useQuery } from '@tanstack/react-query';
import useAuth from '../useAuth';
import axiosPublic from './../../API/axiosPublic';

const useMyParcels = () => {
  const { user, loading } = useAuth();
  const {
    data: myParcels = [],
    isLoading,
    refetch,
  } = useQuery({
    enabled: !loading && !!user?.email,
    queryKey: ['myParcels', user?.email],
    queryFn: async () => {
      if (user?.email) {
        const res = await axiosPublic.get(`/parcels/user/${user.email}`);
        return res.data;
      }
      return [];
    },
  });

  return { myParcels, isLoading, refetch };
};

export default useMyParcels;
