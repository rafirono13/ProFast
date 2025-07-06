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
import EditParcel from '../Components/Pages/Private/EditParcel';
import Payment from '../Components/Pages/Others/Payment';
import TrackParcel from '../Components/Pages/Private/TrackParcel';
import PaymentHistory from '../Components/Pages/Private/PaymentHistory';
import RiderForm from '../Components/Pages/Private/RiderForm';
import PendingRiders from '../Components/Pages/Private/PendingRiders';
import ActiveRiders from '../Components/Pages/Private/ActiveRiders';

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
        path: 'add-parcel',
        element: (
          <PrivateRoute>
            <AddParcel></AddParcel>
          </PrivateRoute>
        ),
      },
      {
        path: 'rider-form',
        element: <RiderForm></RiderForm>,
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
        path: 'payment/:parcelId',
        element: (
          <PrivateRoute>
            <Payment></Payment>
          </PrivateRoute>
        ),
      },
      {
        path: 'payment-history',
        element: (
          <PrivateRoute>
            <PaymentHistory></PaymentHistory>
          </PrivateRoute>
        ),
      },
      {
        path: 'track-parcel',
        element: (
          <PrivateRoute>
            <TrackParcel></TrackParcel>
          </PrivateRoute>
        ),
      },
      {
        path: 'edit-parcel/:id',
        element: (
          <PrivateRoute>
            <EditParcel></EditParcel>
          </PrivateRoute>
        ),
      },
      {
        path: 'pending-riders',
        element: (
          <PrivateRoute>
            <PendingRiders></PendingRiders>
          </PrivateRoute>
        ),
      },
      {
        path: 'active-riders',
        element: (
          <PrivateRoute>
            <ActiveRiders></ActiveRiders>
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
