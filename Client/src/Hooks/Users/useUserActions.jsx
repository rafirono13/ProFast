import { useMutation } from '@tanstack/react-query';
import axiosPublic from './../../API/axiosPublic';

const useUserActions = () => {
  const { mutate: createUserInDb } = useMutation({
    mutationFn: async (userInfo) => {
      const { data } = await axiosPublic.post('/users', userInfo);
      console.log(data);
      return data;
    },
  });

  return { createUserInDb };
};

export default useUserActions;
