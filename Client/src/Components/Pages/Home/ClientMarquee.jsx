import React from 'react';
import Marquee from 'react-fast-marquee';
import amazonLogo from '../../../assets/Brands/amazon.png';
import casioLogo from '../../../assets/Brands/casio.png';
import moonstarLogo from '../../../assets/Brands/moonstar.png';
import randstadLogo from '../../../assets/Brands/randstad.png';
import starLogo from '../../../assets/Brands/start.png';
import startPeopleLogo from '../../../assets/Brands/star-people.png';

// Storing our client info in an array makes it so easy to manage!
const clientsData = [
  {
    id: 1,
    name: 'Casio',
    logo: casioLogo,
  },
  {
    id: 2,
    name: 'Amazon',
    logo: amazonLogo,
  },
  {
    id: 3,
    name: 'Moonstar',
    logo: moonstarLogo,
  },
  {
    id: 4,
    name: 'STAR',
    logo: starLogo,
  },
  {
    id: 5,
    name: 'Start People',
    logo: startPeopleLogo,
  },
  {
    id: 6,
    name: 'Randstad',
    logo: randstadLogo,
  },
  // Add more clients here and they'll magically appear in the marquee!
  {
    id: 7,
    name: 'Casio',
    logo: casioLogo,
  },
  {
    id: 8,
    name: 'Amazon',
    logo: amazonLogo,
  },
];

const ClientMarquee = () => {
  return (
    <div className="my-10 rounded-box bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Title */}
        <h3 className="mb-8 text-center text-xl font-semibold text-teal-900">
          We've helped thousands of sales teams
        </h3>

        {/* The Marquee Component */}
        <Marquee
          gradient={true}
          gradientColor="#f8fafc" // This should match your bg-slate-50 color!
          gradientWidth={50}
          speed={40}
          pauseOnHover={true}
        >
          {clientsData.map((client) => (
            <div key={client.id} className="mx-12">
              <img
                src={client.logo}
                alt={client.name}
                className="filter h-8 w-auto grayscale transition-all duration-300 hover:grayscale-0"
              />
            </div>
          ))}
        </Marquee>

        {/* Dotted Line Divider */}
        <hr className="mx-auto mt-12 max-w-4xl border-t-2 border-dashed border-gray-300" />
      </div>
    </div>
  );
};

export default ClientMarquee;
