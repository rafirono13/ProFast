import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import AuthImg from '../../../assets/AuthImg.png';
import ImgUpload from '../../../assets/image-upload-icon.png';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import useAuth from '../../../Hooks/useAuth';
import axiosPublic from './../../../API/axiosPublic';

// ✨ IMPORTANT: Add your ImgBB API key here. You can get a free one from imgbb.com.
const IMAGE_HOSTING_KEY = 'YOUR_IMAGE_HOSTING_API_KEY';
const IMAGE_HOSTING_API = `https://api.imgbb.com/1/upload?key=${IMAGE_HOSTING_KEY}`;

const Register = () => {
  const { createUser, updateUserProfile, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImagePreview(URL.createObjectURL(file));
      setProfileImageUrl('');
      setValue('profileImageUrl', '');
    } else {
      setProfileImagePreview(null);
    }
  };

  const handleProfileUrlChange = (event) => {
    const url = event.target.value;
    setProfileImageUrl(url);
    if (url) {
      setProfileImagePreview(url);
      setValue('profilePicture', null);
    } else {
      setProfileImagePreview(null);
    }
  };

  const onSubmit = async (data) => {
    console.log('Registration form submitted! Data:', data);

    let photoURL = 'https://i.ibb.co/3sWp2z0/user-default-image-modified.png'; // A default profile picture

    // --- Image Hosting Logic ---
    // If a file is uploaded, host it on ImgBB to get a URL
    if (uploadMethod === 'file' && data.profilePicture[0]) {
      const imageFile = { image: data.profilePicture[0] };
      try {
        const res = await axiosPublic.post(IMAGE_HOSTING_API, imageFile, {
          headers: {
            'content-type': 'multipart/form-data',
          },
        });
        if (res.data.success) {
          photoURL = res.data.data.display_url;
          console.log('Image hosted successfully:', photoURL);
        }
      } catch (error) {
        console.error('Image hosting failed:', error);
        Swal.fire({
          title: 'Image Upload Failed',
          text: 'Could not upload your profile picture. Using a default one for now.',
          icon: 'warning',
          confirmButtonColor: '#f97316', // orange-500
        });
      }
    }
    // If a URL is provided, use that
    else if (uploadMethod === 'url' && data.profileImageUrl) {
      photoURL = data.profileImageUrl;
    }

    // --- Firebase User Creation ---
    createUser(data.email, data.password)
      .then((result) => {
        const createdUser = result.user;
        console.log('User created in Firebase:', createdUser);

        // --- Update Firebase Profile ---
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
              photoURL: photoURL,
              creationTime: createdUser.metadata.creationTime,
              lastSignInTime: createdUser.metadata.lastSignInTime,
            };

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
            navigate('/'); // Redirect after successful registration
          })
          .catch((error) => {
            console.error('Firebase profile update error:', error);
            // Even if profile update fails, the user is created, so we might just warn them.
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
        // This is where you would send the new user's information to your database.
        // We use PUT here to handle both new and existing users gracefully.
        const userInfo = {
          email: googleUser.email,
          name: googleUser.displayName,
          uid: googleUser.uid,
          photoURL: googleUser.photoURL,
          creationTime: googleUser.metadata.creationTime,
          lastSignInTime: googleUser.metadata.lastSignInTime,
        };

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

          <div className="mb-6 flex flex-col">
            <div className="mb-4 flex justify-center">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile Preview"
                  className="h-24 w-24 transform rounded-full border-4 border-lime-400 object-cover shadow-md transition-transform duration-200 ease-in-out hover:scale-105"
                />
              ) : (
                <img
                  src={ImgUpload}
                  alt="Upload Profile"
                  className="h-24 w-24 transform rounded-full border-4 border-lime-400 bg-white object-cover p-2 shadow-md transition-transform duration-200 ease-in-out hover:scale-105"
                />
              )}
            </div>

            <div className="mb-4 flex justify-center gap-2">
              <button
                type="button"
                className={`btn btn-sm ${uploadMethod === 'file' ? 'bg-lime-400 text-white' : 'btn-ghost'}`}
                onClick={() => {
                  setUploadMethod('file');
                  setProfileImageUrl('');
                  setValue('profileImageUrl', '');
                  setProfileImagePreview(null);
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`btn btn-sm ${uploadMethod === 'url' ? 'bg-lime-400 text-white' : 'btn-ghost'}`}
                onClick={() => {
                  setUploadMethod('url');
                  setValue('profilePicture', null);
                  setProfileImagePreview(null);
                }}
              >
                Use URL
              </button>
            </div>

            {uploadMethod === 'file' ? (
              <label
                htmlFor="profilePicture"
                className="cursor-pointer text-center"
              >
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register('profilePicture', {
                    onChange: handleProfileImageChange,
                  })}
                />
                <p className="mt-2 text-sm text-gray-500 transition-colors duration-200 hover:text-lime-500">
                  Click to Upload Profile Picture (Optional)
                </p>
              </label>
            ) : (
              <div className="flex flex-col items-center">
                <input
                  className={`input-bordered input w-full max-w-xs ${errors.profileImageUrl ? 'input-error' : ''}`}
                  id="profileImageUrl"
                  type="url"
                  placeholder="Paste image URL here"
                  value={profileImageUrl}
                  {...register('profileImageUrl', {
                    onChange: handleProfileUrlChange,
                    pattern: {
                      value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
                      message: 'Please enter a valid URL',
                    },
                  })}
                />
                {errors.profileImageUrl && (
                  <p className="mt-1 text-sm text-error">
                    {errors.profileImageUrl.message}
                  </p>
                )}
              </div>
            )}
            {errors.profilePicture && (
              <p className="mt-1 text-sm text-error">
                {errors.profilePicture.message}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
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
