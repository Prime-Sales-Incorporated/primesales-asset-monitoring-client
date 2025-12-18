import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { Link } from "react-router-dom";

const Header = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <header className="flex items-center border-b border-background-light/20 dark:border-background-dark/20 px-4 py-3 relative">
      {/* Dark Mode Toggle */}
      <div
        className={`absolute top-4 right-4 flex items-center justify-between w-12 h-6 p-1 rounded-full cursor-pointer transition-colors duration-300 ${
          dark ? "bg-gray-800" : "bg-gray-800"
        }`}
        onClick={() => setDark(!dark)}
      >
        <FaMoon
          className={`text-yellow-300 ${
            dark ? "opacity-100" : "opacity-50"
          } transition-opacity duration-300`}
        />
        <FaSun
          className={`text-yellow-400 ${
            dark ? "opacity-50" : "opacity-100"
          } transition-opacity duration-300`}
        />
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            dark ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </div>

      <div cclassName="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-4 text-slate-800 dark:text-white ml-auto justify-start ">
            <div className="h-6 w-6">
              <svg
                className="text-primary"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold">PrimeTrack</h2>
          </div>
        </Link>
      </div>
      {/* Logo */}
    </header>
  );
};

export default Header;
