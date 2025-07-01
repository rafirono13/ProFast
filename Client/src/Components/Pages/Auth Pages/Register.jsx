import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import AuthImg from '../../../assets/AuthImg.png';
import ImgUpload from '../../../assets/image-upload-icon.png';
import { Link, useNavigate } from 'react-router';
import useAuth from '../../../Hooks/useAuth';
import Swal from 'sweetalert2';
import useUserActions from '../../../Hooks/Users/useUserActions';

const Register = () => {
  const { createUser, updateUserProfile, googleSignIn } = useAuth();
  const navigate = useNavigate();

  // Mutation fucntion from hook
  const { createUserInDb } = useUserActions();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [photoUrl, setPhotoUrl] = useState('');

  const onSubmit = async (data) => {
    console.log('Registration form submitted! Data:', data);

    const photoURL =
      data.photoURL || 'https://i.ibb.co/MkYb03C3/user-Avatar.png';

    // --- Firebase User Creation ---
    createUser(data.email, data.password)
      .then((result) => {
        const createdUser = result.user;
        updateUserProfile(data.name, photoURL).then(() => {
          const userInfoForDb = {
            name: data.name,
            email: data.email,
            role: 'user',
            photoURL: photoURL,
            creationTime: createdUser.metadata.creationTime,
            lastSignInTime: createdUser.metadata.lastSignInTime,
          };

          createUserInDb(userInfoForDb, {
            onSuccess: (dbResponse) => {
              if (dbResponse.insertedId) {
                Swal.fire({
                  title: 'Account Created!',
                  text: "You're all set!",
                  icon: 'success',
                });
                navigate('/');
              }
            },
            onError: (error) => {
              console.error('Error saving user to DB:', error);
              Swal.fire({
                title: 'Oops!',
                text: 'Could not save your profile.',
                icon: 'error',
              });
            },
          });
        });
      })
      .catch((error) => {
        Swal.fire({
          title: 'Registration Failed',
          text: error.message,
          icon: 'error',
        });
      });
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    googleSignIn()
      .then((result) => {
        const googleUser = result.user;
        console.log('Google Sign-In User:', googleUser);

        // Prepare the user info object for our database
        const userInfoForDb = {
          email: googleUser.email,
          name: googleUser.displayName,
          role: 'user', // Default role for Google sign-ups
          photoURL: googleUser.photoURL,
          creationTime: googleUser.metadata.creationTime,
          lastSignInTime: googleUser.metadata.lastSignInTime,
        };

        // Use our custom hook to send the data to the backend
        createUserInDb(userInfoForDb, {
          onSuccess: () => {
            Swal.fire({
              title: 'Signed In!',
              text: `Welcome, ${googleUser.displayName}!`,
              icon: 'success',
            });
            navigate('/');
          },
          onError: (error) => {
            console.error('Error saving Google user to DB:', error);
            Swal.fire({
              title: 'Oops!',
              text: 'Could not save your profile after Google Sign-In.',
              icon: 'error',
            });
          },
        });
      })
      .catch((error) => {
        console.error('Google Sign-In Error:', error);
        Swal.fire({
          title: 'Google Sign-In Failed',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
        });
      });
  };

  const password = watch('password', '');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 md:flex-row">
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="mb-2 text-4xl font-bold">Create an Account</h2>
          <p className="mb-8 text-gray-500">Register with Profast</p>

          {/* --- Profile Picture Preview --- */}
          <div className="mb-6 flex justify-center">
            <img
              src={
                photoUrl ||
                ImgUpload /* Show pasted URL or default upload icon */
              }
              alt="Profile Preview"
              onError={(e) => {
                // If the URL is broken, fall back to the default icon
                e.currentTarget.src = ImgUpload;
              }}
              className="h-24 w-24 transform rounded-full border-4 border-lime-400 object-cover shadow-md transition-transform duration-200 ease-in-out hover:scale-105"
            />
          </div>

          {/* --- Registration Form --- */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="name"
              >
                Name
              </label>
              <input
                className={`input-bordered input w-full ${errors.name ? 'input-error' : ''}`}
                id="name"
                type="text"
                placeholder="Full Name"
                {...register('name', { required: 'Name is required!' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name.message}</p>
              )}
            </div>

            {/* Photo URL */}
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="photoURL"
              >
                Photo URL (Optional)
              </label>
              <input
                className={`input-bordered input w-full ${errors.photoURL ? 'input-error' : ''}`}
                id="photoURL"
                type="url"
                placeholder="https://example.com/image.png"
                {...register('photoURL', {
                  pattern: {
                    value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
                    message: 'Please enter a valid URL',
                  },
                })}
                // Update the state on every change for the live preview
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              {errors.photoURL && (
                <p className="mt-1 text-sm text-error">
                  {errors.photoURL.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className={`input-bordered input w-full ${errors.email ? 'input-error' : ''}`}
                id="email"
                type="email"
                placeholder="Email"
                {...register('email', {
                  required: 'Email is required!',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className={`input-bordered input w-full ${errors.password ? 'input-error' : ''}`}
                id="password"
                type="password"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required!',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                className={`input-bordered input w-full ${errors.confirmPassword ? 'input-error' : ''}`}
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password!',
                  validate: (value) =>
                    value === password || 'Passwords do not match!',
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <button
                className="btn w-full bg-lime-400 text-white hover:bg-lime-500"
                type="submit"
              >
                Register
              </button>
            </div>
          </form>

          <div className="mb-4 text-center text-gray-500">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-lime-500 hover:text-lime-700"
            >
              Login
            </Link>
          </div>
          <div className="divider">Or</div>
          <div className="mb-4">
            <button
              onClick={handleGoogleSignIn}
              className="btn w-full border-gray-300 btn-outline"
              type="button"
            >
              <FcGoogle className="mr-2 text-xl" />
              Register with Google
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div>
          <img src={AuthImg} alt="Registration illustration" />
        </div>
      </div>
    </div>
  );
};

export default Register;
