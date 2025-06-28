import { FcGoogle } from 'react-icons/fc';
import AuthImg from '../../../assets/AuthImg.png';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
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
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
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
                type="button"
              >
                Login
              </button>
            </div>
          </form>
          <div className="mb-4 text-center text-gray-500">
            Don't have any account?
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
