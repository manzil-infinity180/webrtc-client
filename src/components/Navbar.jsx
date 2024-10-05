import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handlelogin = () => {
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md top-0 sticky">
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
        <button
          class="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0 cursor-pointer"
          onClick={handlelogin}
        >
          Login
          <svg
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            class="w-4 h-4 ml-1"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
