import React from 'react';
import { Link, NavLink } from 'react-router';
import ProFastLogo from '../Custom/ProFastLogo';

const Navbar = () => {
  const menuItems = (
    <>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      <li>
        <NavLink to="/about">About us</NavLink>
      </li>
      <li>
        <NavLink to="/addParcel">Add Parcel</NavLink>
      </li>
      <li>
        <NavLink to="/coverage">Coverage</NavLink>
      </li>
    </>
  );

  return (
    <div>
      <div className="navbar rounded-box bg-base-100 px-8 py-4 shadow-sm">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {' '}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />{' '}
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu z-1 mt-3 w-52 menu-sm rounded-box bg-base-100 p-2 shadow"
            >
              {menuItems}
            </ul>
          </div>
          <Link to="/" className="cursor-pointer text-xl">
            <ProFastLogo></ProFastLogo>
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">{menuItems}</ul>
        </div>
        <div className="navbar-end">
          <Link to="/auth/login">
            <div>
              <button className="btn rounded-full bg-lime-400 px-8 text-white hover:bg-lime-500">
                Login
              </button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
