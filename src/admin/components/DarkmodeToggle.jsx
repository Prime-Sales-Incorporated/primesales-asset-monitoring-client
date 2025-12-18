import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa"; // FontAwesome React icons

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative flex items-center justify-between w-12 h-6 p-1 rounded-full cursor-pointer transition-colors duration-300 ${
          dark ? "bg-yellow-400" : "bg-gray-800"
        }`}
        onClick={() => setDark(!dark)}
      >
        {/* Moon Icon */}
        <FaMoon
          className={`text-yellow-300 ${
            dark ? "opacity-100" : "opacity-50"
          } transition-opacity duration-300`}
        />
        {/* Sun Icon */}
        <FaSun
          className={`text-yellow-600 ${
            dark ? "opacity-50" : "opacity-100"
          } transition-opacity duration-300`}
        />

        {/* Sliding Ball */}
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            dark ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default DarkModeToggle;
