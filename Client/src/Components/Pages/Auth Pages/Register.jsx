import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import AuthImg from '../../../assets/AuthImg.png';
import ImgUpload from '../../../assets/image-upload-icon.png';

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue, // ✨ NEW: setValue is handy for programmatically setting form values
    formState: { errors },
  } = useForm();

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  // ✨ NEW: State to manage the profile image URL input value
  const [profileImageUrl, setProfileImageUrl] = useState('');
  // ✨ NEW: State to toggle between file upload and URL upload
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImagePreview(URL.createObjectURL(file));
      setProfileImageUrl(''); // Clear URL if a file is selected ✨ NEW:
      setValue('profileImageUrl', ''); // Clear URL field in form data ✨ NEW:
    } else {
      setProfileImagePreview(null);
    }
  };

  // ✨ NEW: Function to handle URL input changes
  const handleProfileUrlChange = (event) => {
    const url = event.target.value;
    setProfileImageUrl(url);
    if (url) {
      setProfileImagePreview(url); // Use the URL directly for preview
      setValue('profilePicture', null); // Clear file input if URL is entered ✨ NEW:
    } else {
      setProfileImagePreview(null);
    }
  };

  const onSubmit = (data) => {
    console.log('Registration form submitted! Data:', data);

    // ✨ MODIFIED: Now, decide whether to send a file or a URL
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);

    if (
      uploadMethod === 'file' &&
      data.profilePicture &&
      data.profilePicture[0]
    ) {
      formData.append('profilePicture', data.profilePicture[0]);
    } else if (uploadMethod === 'url' && data.profileImageUrl) {
      formData.append('profileImageUrl', data.profileImageUrl);
    }

    // Example with Axios (uncomment and use when ready):
    // axios.post('/api/register', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data' // Still important if sending FormData
    //   }
    // })
    //   .then(response => {
    //     console.log('Registration successful:', response.data);
    //     // Handle successful registration (e.g., redirect to login, show success message)
    //   })
    //   .catch(error => {
    //     console.error('Registration error:', error.response?.data || error.message);
    //     // Handle registration errors
    //   });
  };

  const password = watch('password', '');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 md:flex-row">
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="mb-2 text-4xl font-bold">Create an Account</h2>
          <p className="mb-8 text-gray-500">Register with Profast</p>

          {/* Profile Picture Upload Section */}
          <div className="mb-6 flex flex-col">
            {/* ✨ MODIFIED: Image preview now checks for both sources */}
            <div className="mb-4 flex justify-center">
              {' '}
              {/* Centering the preview */}
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

            {/* ✨ NEW: Toggle between file and URL upload */}
            <div className="mb-4 flex justify-center gap-2">
              <button
                type="button"
                className={`btn bg-lime-400 btn-sm ${uploadMethod === 'file' ? 'btn' : 'btn-ghost'}`}
                onClick={() => {
                  setUploadMethod('file');
                  setProfileImageUrl(''); // Clear URL input when switching
                  setValue('profileImageUrl', ''); // Clear URL from form data
                  setProfileImagePreview(null); // Clear preview
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                className={`btn btn-sm ${uploadMethod === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => {
                  setUploadMethod('url');
                  // Clear file input value when switching to URL
                  setValue('profilePicture', null);
                  setProfileImagePreview(null); // Clear preview
                }}
              >
                Use URL
              </button>
            </div>

            {/* ✨ NEW: Conditional rendering for upload type */}
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
                  value={profileImageUrl} // Controlled component for immediate preview
                  {...register('profileImageUrl', {
                    onChange: handleProfileUrlChange,
                    // You might want to add pattern validation for URLs here
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
                <p className="mt-2 text-sm text-gray-500">
                  Or use an image URL (Optional)
                </p>
              </div>
            )}
            {/* Errors for profilePicture are still relevant for file uploads */}
            {errors.profilePicture && (
              <p className="mt-1 text-sm text-error">
                {errors.profilePicture.message}
              </p>
            )}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ... (rest of your form inputs remain the same) ... */}
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
            Already have an account?
            <a href="#" className="text-lime-500 hover:text-lime-700">
              Login
            </a>
          </div>
          <div className="divider">Or</div>
          <div className="mb-4">
            <button
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
