import React from "react";

const Navbar = () => {
  return (
    <header className="bg-white shadow-lg top-0 sticky">
      <div className="container mx-auto flex flex-wrap p-5 justify-between items-center">
        <a
          href="/"
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="w-10 h-10 p-2 bg-indigo-500 text-white rounded-full"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-2xl font-bold">WebRTC-Client</span>
        </a>
        <nav className="flex items-center space-x-5 text-base">
          <a
            href="/"
            className="text-gray-700 hover:text-indigo-600 transition duration-200"
          >
            Home
          </a>
          <a
            href="https://github.com/manzil-infinity180/webrtc-client"
            className="text-gray-700 hover:text-indigo-600 transition duration-200"
          >
            About Us
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
