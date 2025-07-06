import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const usePaymentHistory = () => {
  const { user, loading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: paymentHistory = [], isLoading: isPaymentHistoryLoading } =
    useQuery({
      enabled: !loading && !!user?.email,
      queryKey: ['paymentHistory', user?.email],
      queryFn: async () => {
        if (user?.email) {
          const res = await axiosSecure.get(`/payments/user/${user.email}`);
          return res.data;
        }
        return [];
      },
    });

  return { paymentHistory, isPaymentHistoryLoading };
};

export default usePaymentHistory;
