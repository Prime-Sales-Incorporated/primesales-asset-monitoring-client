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
    <header className="flex items-center justify-between border-b border-background-light/20 dark:border-background-dark/20 px-4 py-3">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-0">
        <div className="h-6 w-6">
          <img src="/psi.png" alt="Logo" />
        </div>
        <h2 className="text-lg font-bold font-mono text-slate-800 dark:text-white">
          PrimeTrack
        </h2>
      </Link>

      {/* Nav + Dark Mode */}
      <div className="flex items-center gap-6">
        {/* Nav */}
        <nav className="hidden md:flex gap-4">
          <Link
            to="/dashboard"
            className="text-slate-800 dark:text-white hover:"
          >
            Dashboard
          </Link>
          <Link
            to="/assets/list"
            className="text-slate-800 dark:text-white hover:"
          >
            Assets
          </Link>
          <Link
            to="/assets/add"
            className="text-slate-800 dark:text-white hover:"
          >
            Add
          </Link>
          <Link
            to="/assets/depreciation"
            className="text-slate-800 dark:text-white hover:"
          >
            Depreciation
          </Link>
          <Link to="/scanner" className="text-slate-800 dark:text-white hover:">
            Scan
          </Link>
        </nav>

        {/* Dark Mode Toggle */}
        {/* <div
          className={`relative flex items-center justify-between w-12 h-6 p-1 rounded-full cursor-pointer transition-colors duration-300 ${
            dark ? "bg-gray-800" : "bg-gray-800"
          }`}
          onClick={() => setDark(!dark)}
        >
          <FaMoon
            className={`text-yellow-300 ${
              dark ? "opacity-100" : "opacity-50"
            } transition-opacity`}
          />
          <FaSun
            className={`text-yellow-400 ${
              dark ? "opacity-50" : "opacity-100"
            } transition-opacity`}
          />
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              dark ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </div> */}
      </div>
    </header>
  );
};

export default Header;
