import React from 'react';
// I've picked some cute icons from React Icons, feel free to swap them!
import { TbTruckDelivery, TbTruckReturn } from 'react-icons/tb';
import { FaWarehouse, FaShippingFast } from 'react-icons/fa';
import { BsBoxes, BsCashCoin } from 'react-icons/bs';

// Data for our service cards - makes it super easy to manage!
const servicesData = [
  {
    icon: <FaShippingFast className="h-12 w-12 text-pink-400" />,
    title: 'Express & Standard Delivery',
    description:
      'We deliver parcels within 24-72 hours in Dhaka, Chittagong, Sylhet, Khulna, and Rajshahi. Express delivery available in Dhaka within 4-6 hours from pick-up to drop-off.',
    isHighlighted: false,
  },
  {
    icon: <TbTruckDelivery className="h-12 w-12 text-gray-800" />,
    title: 'Nationwide Delivery',
    description:
      'We deliver parcels nationwide with home delivery in every district, ensuring your products reach customers within 48-72 hours.',
    isHighlighted: true, // This one gets the special highlighted style!
  },
  {
    icon: <BsBoxes className="h-12 w-12 text-pink-400" />,
    title: 'Fulfillment Solution',
    description:
      'We also offer customized service with inventory management support, online order processing, packaging, and other sales support.',
    isHighlighted: false,
  },
  {
    icon: <BsCashCoin className="h-12 w-12 text-pink-400" />,
    title: 'Cash on Home Delivery',
    description:
      '100% cash on delivery anywhere in Bangladesh with guaranteed safety of your product.',
    isHighlighted: false,
  },
  {
    icon: <FaWarehouse className="h-12 w-12 text-pink-400" />,
    title: 'Corporate Service / Contract In Logistics',
    description:
      'Customized corporate services which includes warehouse and inventory management support.',
    isHighlighted: false,
  },
  {
    icon: <TbTruckReturn className="h-12 w-12 text-pink-400" />,
    title: 'Parcel Return',
    description:
      'Through our reverse logistics facility we allow end customers to return or exchange their products with online business merchants.',
    isHighlighted: false,
  },
];

const ServiceSection = () => {
  return (
    <div className="my-10 rounded-3xl bg-teal-900 p-4 md:p-8">
      <section className="mx-auto max-w-7xl p-8 py-16 text-white">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold">Our Services</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Enjoy fast, reliable parcel delivery with real-time tracking and
            zero hassle. From personal packages to business shipments — we
            deliver on time, every time.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid grid-cols-1 place-items-center gap-8 md:grid-cols-2 lg:grid-cols-3">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className={`flex h-[350px] w-full max-w-[410px] flex-col items-center justify-center rounded-2xl p-8 text-center shadow-lg transition-all duration-300 ease-in-out ${
                service.isHighlighted
                  ? 'bg-lime-300 text-gray-800' // Highlighted state
                  : 'bg-white text-gray-800 hover:-translate-y-2 hover:bg-lime-300 hover:shadow-xl' // Default state with hover effect
              } `}
            >
              <div
                className={`transition-colors duration-300 ${service.isHighlighted ? 'text-gray-800' : 'text-pink-400'} `}
              >
                {service.icon}
              </div>
              <h3 className="mt-6 text-2xl font-bold">{service.title}</h3>
              <p className="mt-2 text-base">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ServiceSection;
