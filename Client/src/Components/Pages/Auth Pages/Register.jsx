import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import AuthImg from '../../../assets/AuthImg.png';
import ImgUpload from '../../../assets/image-upload-icon.png';
import { Link, useNavigate } from 'react-router';
import useAuth from '../../../Hooks/useAuth';
import Swal from 'sweetalert2';

const Register = () => {
  const { createUser, updateUserProfile, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // State to hold the photo URL from the input for live preview
  const [photoUrl, setPhotoUrl] = useState('');

  const onSubmit = async (data) => {
    console.log('Registration form submitted! Data:', data);

    // Use the provided photoURL or a default one if the field is empty
    const photoURL =
      data.photoURL || 'https://i.ibb.co/MkYb03C3/user-Avatar.png';

    // --- Firebase User Creation ---
    createUser(data.email, data.password)
      .then((result) => {
        const createdUser = result.user;
        console.log('User created in Firebase:', createdUser);

        // --- Update Firebase Profile with name and photoURL ---
        updateUserProfile(data.name, photoURL)
          .then(() => {
            console.log('Firebase profile updated with name and photo.');

            // 🔥 **API Call to Your Backend (MongoDB)** 🔥
            // Now that the user is created and the profile is updated,
            // we send all the info to our own database.
            const userInfo = {
              email: data.email,
              name: data.name,
              uid: createdUser.uid,
              photoURL: photoURL, // Send the final photoURL
              creationTime: createdUser.metadata.creationTime,
              lastSignInTime: createdUser.metadata.lastSignInTime,
            };
            console.log('firebase user Register info', userInfo);

            /*
            axiosPublic.post('/users', userInfo)
              .then(res => {
                console.log('New user saved to DB:', res.data);
              })
              .catch(err => {
                console.error('Error saving new user to DB:', err);
              });
            */

            Swal.fire({
              title: 'Account Created!',
              text: "You've successfully registered!",
              icon: 'success',
              confirmButtonColor: '#84cc16',
            });
            navigate('/');
          })
          .catch((error) => {
            console.error('Firebase profile update error:', error);
            // Handle error (e.g., show a notification)
          });
      })
      .catch((error) => {
        console.error('Firebase user creation error:', error);
        Swal.fire({
          title: 'Registration Failed',
          text:
            error.code === 'auth/email-already-in-use'
              ? 'This email is already registered. Please login.'
              : 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      });
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    googleSignIn()
      .then((result) => {
        const googleUser = result.user;
        console.log('Google Sign-In User:', googleUser);

        // 🔥 **API Call to Your Backend (MongoDB)** 🔥
        const userInfo = {
          email: googleUser.email,
          name: googleUser.displayName,
          uid: googleUser.uid,
          photoURL: googleUser.photoURL,
          creationTime: googleUser.metadata.creationTime,
          lastSignInTime: googleUser.metadata.lastSignInTime,
        };
        console.log('google user Register info', userInfo);

        /*
        axiosPublic.put('/users', userInfo)
          .then(res => {
            console.log('User data sent to DB after Google sign-in:', res.data);
          })
          .catch(err => {
            console.error('Error sending user data to DB:', err);
          });
        */

        Swal.fire({
          title: 'Signed In with Google!',
          text: `Welcome, ${googleUser.displayName}!`,
          icon: 'success',
          confirmButtonColor: '#84cc16',
        });
        navigate('/');
      })
      .catch((error) => {
        console.error('Google Sign-In Error:', error);
        Swal.fire({
          title: 'Google Sign-In Failed',
          text: 'Something went wrong. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
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
