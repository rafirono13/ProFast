import React from 'react';
import { NavLink, Outlet } from 'react-router';
import {
  FaHome,
  FaBox,
  FaPlusCircle,
  FaRegUserCircle,
  FaListAlt,
} from 'react-icons/fa';
import useAuth from '../Hooks/useAuth';
// We'll need this later to show different links for admins
// import useAdmin from '../Hooks/useAdmin';

const DashBoardLayouts = () => {
  const { user } = useAuth();
  // const [isAdmin] = useAdmin(); // We'll uncomment this later!

  // --- Navigation Links for the Sidebar ---
  const userLinks = (
    <>
      <li>
        <NavLink to="/dashboard" end>
          <FaRegUserCircle /> My Profile
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/my-parcels">
          <FaBox /> My Parcels
        </NavLink>
      </li>
      <li>
        <NavLink to="/addParcel">
          <FaPlusCircle /> Book a Parcel
        </NavLink>
      </li>
      {/* Add more user-specific links here */}
    </>
  );

  const adminLinks = (
    <>
      {/* We will build these out later! */}
      <li>
        <NavLink to="/dashboard/admin/stats">
          <FaHome /> Admin Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/all-parcels">
          <FaListAlt /> All Parcels
        </NavLink>
      </li>
      <li>
        <NavLink to="/dashboard/admin/all-users">
          <FaRegUserCircle /> All Users
        </NavLink>
      </li>
    </>
  );

  return (
    <div className="drawer bg-gray-50 lg:drawer-open">
      {/* This checkbox is for toggling the drawer on mobile */}
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* --- Main Content Area --- */}
      {/* This is where your pages like UsersPanel will be rendered */}
      <div className="drawer-content flex flex-col items-center justify-center">
        <div className="w-full p-4 md:p-8">
          <Outlet />
        </div>
        {/* Mobile Drawer Button: A hamburger menu icon */}
        <label
          htmlFor="my-drawer-2"
          className="drawer-button btn fixed top-4 left-4 z-50 btn-primary lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </label>
      </div>

      {/* --- Sidebar --- */}
      <div className="drawer-side shadow-lg">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu min-h-full w-80 bg-base-100 p-4 text-base-content">
          {/* Sidebar content here */}
          <div className="mb-4 p-4">
            <h2 className="text-2xl font-bold text-lime-500">ProFast</h2>
            <p className="text-sm text-gray-500">Your Delivery Partner</p>
          </div>

          {/* --- Dynamic Links based on role --- */}
          {/* For now, we are just showing user links */}
          {userLinks}

          {/* Divider */}
          <div className="divider my-4"></div>

          {/* --- Shared Links --- */}
          <li>
            <NavLink to="/">
              <FaHome /> Home
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashBoardLayouts;
