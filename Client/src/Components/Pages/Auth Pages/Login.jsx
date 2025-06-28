import { FcGoogle } from 'react-icons/fc';
import AuthImg from '../../../assets/AuthImg.png';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import useAuth from '../../../Hooks/useAuth';

const Login = () => {
  const { signInUser, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle form submission for email/password login
  const onSubmit = (data) => {
    console.log(data);
    signInUser(data.email, data.password)
      .then((result) => {
        const loggedInUser = result.user;
        console.log('User logged in:', loggedInUser);

        // 🔥 **API Call to Your Backend (MongoDB)** 🔥
        // Here's where you'll send the user info to your database.
        // We are creating/updating the user info on every login to keep the last login time updated.
        const userInfo = {
          email: loggedInUser.email,
          name: loggedInUser.displayName,
          uid: loggedInUser.uid,
          photoURL: loggedInUser.photoURL,
          lastSignInTime: loggedInUser.metadata.lastSignInTime,
        };
        console.log('Login user info', userInfo);

        /*
        axiosPublic.put('/users', userInfo)
          .then(res => {
            console.log('User data sent to DB:', res.data);
          })
          .catch(err => {
            console.error('Error sending user data to DB:', err);
          });
        */

        Swal.fire({
          title: 'Login Successful!',
          text: `Welcome back, ${loggedInUser.displayName || 'friend'}!`,
          icon: 'success',
          confirmButtonColor: '#84cc16', // lime-500
        });
        navigate('/'); // Redirect to homepage or dashboard after login
      })
      .catch((error) => {
        console.error('Login Error:', error);
        Swal.fire({
          title: 'Oops!',
          text:
            error.code === 'auth/invalid-credential'
              ? 'Invalid email or password. Please try again.'
              : error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444', // red-500
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
        const userInfo = {
          email: googleUser.email,
          name: googleUser.displayName,
          uid: googleUser.uid,
          photoURL: googleUser.photoURL,
          creationTime: googleUser.metadata.creationTime,
          lastSignInTime: googleUser.metadata.lastSignInTime,
        };
        console.log('Google login user info', userInfo);

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-200 md:flex-row">
      {/* Left side with the form */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <h2 className="mb-2 text-4xl font-bold">Welcome Back</h2>
          <p className="mb-8 text-gray-500">Login with Profast</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="input-bordered input w-full"
                id="email"
                type="email"
                placeholder="Email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
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
                className="input-bordered input w-full"
                id="password"
                type="password"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="mb-6 text-right">
              <a href="#" className="text-sm text-lime-500 hover:text-lime-700">
                Forgot Password?
              </a>
            </div>
            <div className="mb-4">
              <button
                className="btn w-full bg-lime-400 text-white hover:bg-lime-500"
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
          <div className="mb-4 text-center text-gray-500">
            Don't have any account?{' '}
            <Link
              to="/auth/register"
              className="text-lime-500 hover:text-lime-700"
            >
              Register
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
              Login with Google
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div>
          <img src={AuthImg} alt="Background" />
        </div>
      </div>
    </div>
  );
};

export default Login;
