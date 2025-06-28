import React from 'react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router';

const ProFastLogo = () => {
  return (
    <Link to="/">
      <div className="flex items-end">
        <img src={logo} alt="ProFast Logo" />
        <p className="relative top-1 right-3 text-3xl font-extrabold">
          ProFast
        </p>
      </div>
    </Link>
  );
};

export default ProFastLogo;
