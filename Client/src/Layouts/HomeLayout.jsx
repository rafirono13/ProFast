import { Outlet } from 'react-router';
import Navbar from '../Components/Common/Navbar';
import Footer from '../Components/Common/Footer';

const HomeLayout = () => {
  return (
    <div className="mx-auto max-w-11/12">
      <nav className="py-8">
        <Navbar></Navbar>
      </nav>
      <main>
        <div className="min-h-screen">
          <Outlet></Outlet>
        </div>
      </main>
      <footer className="mt-8">
        <Footer></Footer>
      </footer>
    </div>
  );
};

export default HomeLayout;
