import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handlelogin = () => {
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-md top-0 sticky">
      <div className="container mx-auto flex flex-wrap p-5 justify-between items-center">
        <a
          href="/"
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0 no-underline"
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
          <span className="ml-3 text-2xl font-bold">ZoomXF</span>
        </a>
        <nav className="flex justify-between items-center space-x-5 text-base">
          <a
            href="/"
            className={`${
              isActive("/") ? "text-blue-600" : "text-gray-700"
            } no-underline hover:text-indigo-600 transition duration-200`}
          >
            Home
          </a>
          <a
            href="/signup"
            className={`${
              isActive("/signup") ? "text-blue-600" : "text-gray-700"
            } no-underline hover:text-indigo-600 transition duration-200`}
          >
            SignUp
          </a>
          <a
            href="/login"
            className={`${
              isActive("/login") ? "text-blue-600" : "text-gray-700"
            } no-underline hover:text-indigo-600 transition duration-200`}
          >
            Login
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
