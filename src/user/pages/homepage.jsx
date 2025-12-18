import React from "react";
import Header from "../components/header";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        {/* Hero Section */}
        <div className="relative flex min-h-[60vh] md:min-h-[70vh] items-center justify-center text-center overflow-hidden">
          {/* Light Mode Background */}
          {/* Light Mode Background */}
          <div className="absolute inset-0 overflow-hidden dark:hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/bg1.mp4" type="video/mp4" />
            </video>

            {/* Gradient overlay for light mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#f6f7f8] via-[#f6f7f8]/10 to-transparent"></div>
          </div>

          {/* Dark Mode Background */}
          <div className="absolute inset-0 overflow-hidden hidden dark:block">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/bg.mp4" type="video/mp4" />
            </video>

            {/* Gradient overlay for dark mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-[#101922]/60 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-white">
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Welcome to PrimeTrack
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-300">
              Manage your inventory and assets efficiently with our
              comprehensive system. Track, monitor, and optimize your resources
              in real-time.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
        <div className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Features
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need to manage your assets
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
                AssetTrack provides a range of powerful features to help you
                manage your inventory and assets effectively.
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
                  Inventory Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Maintain a detailed record of all your inventory items,
                  including quantities, locations, and values.
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
                  Asset Tracking
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track the location and status of your assets in real-time,
                  ensuring accountability and reducing loss.
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
                  Reporting & Analytics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate comprehensive reports and analytics to gain insights
                  into your inventory and asset performance.
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
                  Security & Access Control
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Control access to sensitive information and ensure the
                  security of your data with robust access control features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 dark:border-primary/30">
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
              © 2025 AssetTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
