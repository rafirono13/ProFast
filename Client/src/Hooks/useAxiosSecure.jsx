import axios from 'axios';
import React, { useEffect } from 'react';
import useAuth from './useAuth';
import { useNavigate } from 'react-router';

const axiosSecure = axios.create({
  baseURL: 'http://localhost:5000',
});

const useAxiosSecure = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // This function will run BEFORE every request using axiosSecure.
    const requestInterceptor = axiosSecure.interceptors.request.use(
      async (config) => {
        console.log('Request interceptor triggered...');
        if (user) {
          const token = await user.getIdToken();
          // console.log('Attaching token:', token);
          // We are attaching the user's Firebase token to the request headers.
          config.headers.authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // This function will run AFTER a response is received.
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status;
        // If we get a 401 or 403, it means our token is bad.
        // So, we log the user out and send them to the login page.
        if (status === 401 || status === 403) {
          await logOut();
          navigate('/auth/login');
        }
        return Promise.reject(error);
      },
    );

    // This is a cleanup function to prevent memory leaks.
    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [user, logOut, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
