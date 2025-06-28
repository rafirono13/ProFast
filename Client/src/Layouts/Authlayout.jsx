import { Outlet } from 'react-router';
import Navbar from '../Components/Common/Navbar';

const Authlayout = () => {
  return (
    <div>
      <div className="mx-auto max-w-11/12">
        <nav className="py-8">
          <Navbar></Navbar>
        </nav>
        <main>
          <div className="min-h-screen">
            <Outlet></Outlet>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Authlayout;
