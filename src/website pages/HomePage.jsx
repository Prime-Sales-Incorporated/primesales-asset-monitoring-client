import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../user/components/header";
import { FaMoon, FaSun } from "react-icons/fa";
import { ChevronDown } from "lucide-react";

const WebsiteMain = () => {
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
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm py-4 px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}

          <div className="text-white font-serif text-xl flex items-center">
            <img src="/logo1.png" alt="" className="h-8 w-16" />
          </div>
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
          {/* Navigation Links */}
          <div className="flex items-center gap-8 text-white/90 font-sans text-sm font-light">
            <a
              href="#"
              className="hover:text-white hover:scale-105 transition-all duration-300"
            >
              Our Mission
            </a>
            <a
              href="#"
              className="hover:text-white hover:scale-105 transition-all duration-300"
            >
              Services
            </a>
            <a
              href="#"
              className="hover:text-white hover:scale-105 transition-all duration-300"
            >
              Products
            </a>
            <a
              href="#"
              className="hover:text-white hover:scale-105 transition-all duration-300"
            >
              Support Us
            </a>
            <a
              href="#"
              className="hover:text-white hover:scale-105 transition-all duration-300"
            >
              Contact
            </a>
            <button className="flex items-center gap-1 hover:text-white hover:scale-105 transition-all duration-300 cursor-pointer">
              EN
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        {/* Hero Section */}
        <div className="relative flex min-h-[60vh] md:min-h-[70vh] items-center justify-center text-center overflow-hidden">
          {/* Light Mode Background */}
          {/* Light Mode Background */}
          {/* Shared Background Video (no restart when toggling theme) */}
          <div className="absolute inset-0 overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={dark ? "/bg.mp4" : "/bg1.mp4"} type="video/mp4" />
            </video>

            {/* Bottom Gradient Fade Overlay */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[40%] transition-all duration-700 ${
                dark
                  ? "bg-gradient-to-t from-[#101922] via-[#101922]/60 to-transparent"
                  : "bg-gradient-to-t from-[#f6f7f8] via-[#f6f7f8]/60 to-transparent"
              }`}
            ></div>
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-white">
            <h1 className="font-serif text-white text-4xl lg:text-6xl font-normal tracking-tight mb-8 opacity-0 animate-fadeInUp">
              Prime <span className="text-green-500"> Sales</span>
            </h1>
            <p className="mt-6 font-sans font-light leading-relaxed max-w-2xl mx-auto text-lg  text-gray-300 opacity-0 animate-fadeInUp [animation-delay:0.3s]">
              Prime Sales Inc. (PSI) is a Philippine company founded in 1976
              that supplies intralogistics solutions for the dry and cold chain
              industries. It partners with global manufacturers to provide
              services like warehouse design, storage systems, and after-sales
              support, focusing on optimizing supply chains and logistics
              operations for its clients.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-lg bg-green-500 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-500/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Get Started
              </Link>
              <Link
                to="/register"
                className="text-base font-semibold leading-6 text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-4 py-16 sm:px-6 sm:py-0  lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              {/* <h2 className="text-base font-serif  font-semibold leading-relaxed text-white">
                All about <span className="text-green-500">Prime Sales</span>
              </h2> */}
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Our <span className="text-green-500">Story</span>
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                Prime Sales Inc. (PSI) founded in 1976, is a leading supplier of
                intelligent intralogistics solution for dry and cold chain
                applications. Exemplifying remarkable reputation for more than
                40 years in the industry, PSI works in synergy with proven
                global partners to offer strong and efficient supply chain
                solutions in the Philippines.
              </p>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="flex flex-col gap-3 rounded-lg border border-primary/20 dark:border-primary/30 bg-background-light p-6 shadow-sm dark:bg-background-dark">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    fill="currentColor"
                    height="24px"
                    width="24px"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Founding <span className="text-green-500">Evolution </span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Established in 1976, the company has over 40 years of
                  experience in the industry. In 1986, it began offering premium
                  storage solutions like racking systems, and its services have
                  expanded over the years to include consultation, safety
                  inspections, repairs, and system expansions.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col gap-3 rounded-lg border border-primary/20 dark:border-primary/30 bg-background-light p-6 shadow-sm dark:bg-background-dark">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    fill="currentColor"
                    height="24px"
                    width="24px"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Key <span className="text-green-500">Services</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PSI provides intelligent intralogistics solutions, which
                  include the design and implementation of advanced storage
                  systems and materials handling equipment. It works with
                  partners to offer high-performance solutions for both dry and
                  cold chain environments.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col gap-3 rounded-lg border border-primary/20 dark:border-primary/30 bg-background-light p-6 shadow-sm dark:bg-background-dark">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    fill="currentColor"
                    height="24px"
                    width="24px"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0v94.37L90.73,98a8,8,0,0,1,10.07-.38l58.81,44.11L218.73,90a8,8,0,1,1,10.54,12l-64,56a8,8,0,0,1-10.07.38L96.39,114.29,40,163.63V200H224A8,8,0,0,1,232,208Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Busuiness <span className="text-green-500">Model</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The company works in synergy with global partners to provide
                  efficient and reliable supply chain solutions within the
                  Philippines. It emphasizes a customer-centric approach,
                  focusing on providing solutions tailored to each client's
                  needs and maintaining strong after-sales relationships.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col gap-3 rounded-lg border border-primary/20 dark:border-primary/30 bg-background-light p-6 shadow-sm dark:bg-background-dark">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <svg
                    fill="currentColor"
                    height="24px"
                    width="24px"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Company <span className="text-green-500">Philosophy</span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PSI has a history of viewing change positively, adapting to
                  industry shifts as opportunities for improvement and growth.
                  This adaptability is reflected in their continuous development
                  of their salesforce and overall strategy.
                </p>
              </div>
            </div>
            <div className="flex w-full grid-cols-1 md:grid-cols-2 mt-8 gap-8 ">
              <div className="text-center border border-primary/20 dark:border-primary/30 rounded-lg">
                {/* <h2 className="text-base font-serif  font-semibold leading-relaxed text-white">
                All about <span className="text-green-500">Prime Sales</span>
              </h2> */}
                <p className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Our <span className="text-green-500">Mission</span>
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 text-left px-8">
                  Prime Sales Inc. (PSI) founded in 1976, is a leading supplier
                  of intelligent intralogistics solution for dry and cold chain
                  applications. Exemplifying remarkable reputation for more than
                  40 years in the industry, PSI works in synergy with proven
                  global partners to offer strong and efficient supply chain
                  solutions in the Philippines.
                </p>
              </div>
              <div className="text-center border border-primary/20 dark:border-primary/30 rounded-lg pb-8 ">
                {/* <h2 className="text-base font-serif  font-semibold leading-relaxed text-white">
                All about <span className="text-green-500">Prime Sales</span>
              </h2> */}
                <p className="mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl ">
                  Our <span className="text-green-500">Vision</span>
                </p>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 text-left px-8">
                  Prime Sales Inc. (PSI) founded in 1976, is a leading supplier
                  of intelligent intralogistics solution for dry and cold chain
                  applications. Exemplifying remarkable reputation for more than
                  40 years in the industry, PSI works in synergy with proven
                  global partners to offer strong and efficient supply chain
                  solutions in the Philippines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 border-primary/20 dark:border-primary/30">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Terms of Service
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
              © 2025 Prime Sales. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteMain;
