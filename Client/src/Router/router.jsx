import { createBrowserRouter } from 'react-router';
import HomeLayout from '../Layouts/HomeLayout';
import HomePage from '../Components/Pages/Home/HomePage';
import Authlayout from '../Layouts/Authlayout';
import Login from '../Components/Pages/Auth Pages/Login';
import Register from '../Components/Pages/Auth Pages/Register';
import Coverage from '../Components/Pages/Others/Coverage';
import AddParcel from '../Components/Pages/Private/AddParcel';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout></HomeLayout>,
    children: [
      {
        index: true,
        element: <HomePage></HomePage>,
      },
      {
        path: 'coverage',
        element: <Coverage></Coverage>,
        loader: () => fetch('/data/warehouses.json'),
      },
      {
        path: 'AddParcel',
        element: <AddParcel></AddParcel>,
      },
    ],
  },
  {
    path: '/auth',
    element: <Authlayout></Authlayout>,
    children: [
      {
        path: 'login',
        element: <Login></Login>,
      },
      {
        path: 'register',
        element: <Register></Register>,
      },
    ],
  },
]);

export default router;
