import { createBrowserRouter } from 'react-router';
import HomeLayout from '../Layouts/HomeLayout';
import HomePage from '../Components/Pages/Home/HomePage';
import Authlayout from '../Layouts/Authlayout';
import Login from '../Components/Pages/Auth Pages/Login';
import Register from '../Components/Pages/Auth Pages/Register';
import Coverage from '../Components/Pages/Others/Coverage';
import AddParcel from '../Components/Pages/Private/AddParcel';
import PrivateRoute from './PrivateRoute';
import DashBoardLayouts from '../Layouts/DashBoardLayouts';
import AdminPanel from '../Components/Pages/Private/AdminPanel';
import AdminRoute from './AdminRoute';
import UsersPanel from './../Components/Pages/Private/UsersPanel';
import UserProfile from './../Components/Pages/Private/UserProfile';

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
        element: (
          <PrivateRoute>
            <AddParcel></AddParcel>
          </PrivateRoute>
        ),
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
  {
    path: '/dashboard',
    element: <DashBoardLayouts></DashBoardLayouts>,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <UserProfile></UserProfile>
          </PrivateRoute>
        ),
      },
      {
        path: 'my-parcels',
        element: (
          <PrivateRoute>
            <UsersPanel></UsersPanel>
          </PrivateRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminPanel></AdminPanel>
          </AdminRoute>
        ),
      },
    ],
  },
]);

export default router;
