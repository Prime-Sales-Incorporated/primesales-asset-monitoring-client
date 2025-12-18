import React from "react";
import { Link } from "react-router-dom";

const OurSolutions = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark  text-gray-900 dark:text-white font-display min-h-screen">
      {/* Header */}
      <header className="bg-background-light dark:bg-background-dark shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/home">
              <div className="flex-shrink-0">
                <img
                  src="/logo1.png"
                  alt="Prime Sales Logo"
                  className="h-8 w-auto"
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-sm font-medium text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary"
              >
                Our Mission
              </a>
              <a
                href="#"
                className="text-sm font-medium text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary"
              >
                About Us
              </a>
              <a
                href="#"
                className="text-sm font-medium text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary"
              >
                Support Us
              </a>
              <a
                href="#"
                className="text-sm font-medium text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-sm font-medium text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary"
              >
                Contact
              </a>
              <button className="flex items-center text-sm font-medium text-text-secondary-light hover:text-primary dark:text-text-secondary-dark dark:hover:text-primary">
                <span>EN</span>
                <span className="material-icons text-lg">expand_more</span>
              </button>
            </nav>
            <div className="md:hidden">
              <button className="text-text-light dark:text-text-dark">
                <span className="material-icons">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-light dark:text-text-dark">
            Our <span className="text-green-500">Solutions</span>
          </h1>
          <p className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
            We provide a comprehensive range of intralogistics solutions
            tailored to meet your specific needs.
          </p>
        </div>

        {/* Grid of Solutions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Material Handling Equipment",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuATOnPlS6_h1gQHBxebXeHQ65NaJbuzE9WWEXhMj-Inc5ncODptXaj4QDgF05LEJ0dN609FyDQlQU05aLKlgvZLEzLe5-U3ECLktbo-1YTIezHRFW1nmWF8b2yh6yGvYMdh03-XSWDrv1Gg16SVcP79LEDxIjZW89lu3ApyXieFFh1a5VOTDs93reQVwD45DJ5jZPFNXyGxrjGC8NYZIthDrUmTDhYHvQW-oV_yrkA1huasJYkPmjp9aQhoDtN5qOm9WcpM9Xk6dkE",
              desc: "High-performance forklifts designed for reliability and efficiency in various industrial applications.",
            },
            {
              title: "Racking Systems",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNW_nVSRhCGbRNUmfJjMf_qqbetLTR1MfkYTjlbN1bxowIFGpPc_pqjlkz57tkrqzGzTxPq8PwzE9ipVXNDdZIAcKiVL5N4Mz3E6P2z-We6QhbdIFbA831k-Xr4BLA58iwOx551cKoYW8PmuSg3HT7CMPJIcIoL7cn-HQRpWWzfpZg00nFAVOORvBeAQvR4Qd0YnaiVZIF0cIvTnm6Dvi1xXQ9nfy5pWpChb4G6UiUZD4aVnHtb8QUacEPEQZG-H8IW_1JI0spUF4",
              desc: "Optimize your warehouse space with our durable and versatile racking and shelving solutions.",
            },
            {
              title: "Warehouse Automation",
              img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGGSThrlguVhMZyhxolbW6gvgAG3wmWFGtc-9atK_OJxP1UDmqJ167tUmqymcGpawV6khJuXBqqm9z19CBdWX9qHLT972AGYuHwNTR6YHK8GZoEAGlPjAgGeQYO5H59j7r1VslSNDMpmSCvHS85actfkRSPlfLliBCDDb57G1jWrpS_5s4Ew5OlPa0D_q2gqZrMCk0EX2TZLCoCCigcLqHyOuJvU8WWfLIloxFoIIQCB71aAIE8tqdUZmBxdBVzj0kxoLqz-yNXWA",
              desc: "Boost productivity and precision with our cutting-edge automated systems and robotics.",
            },
            {
              title: "Structural Insulated Panel",
              img: "https://tsscgroup.com/wp-content/uploads/2023/05/cold-storage.jpg",
              desc: "Intelligent software to monitor, manage, and optimize your entire fleet of equipment.",
            },
            {
              title: "Panel and Door Accessories",
              img: "https://image.made-in-china.com/202f0j00RWMoTsEKbUqA/Vertical-Lifting-up-Industrial-Overhead-Panel-Door.webp",
              desc: "Ensure a secure working environment with our comprehensive safety systems and training.",
            },

            {
              title: "Material Handling Equipment",
              img: "https://imrnrwxhkjji5o.leadongcdn.com/cloud/qjBqqKRrkSjlrrirlkr/qh-1515_kantuwang.jpg",
              desc: "High-performance forklifts designed for reliability and efficiency in various industrial applications.",
            },
            {
              title: "Industrial Doors",
              img: "https://media.istockphoto.com/id/595161836/photo/shutter-door-night.jpg?s=612x612&w=0&k=20&c=_Bz2bADjkMb35UbKQm573Hd4lVIwKRlykXJ0opVBh8o=",
              desc: "Expert consulting to analyze and improve your entire intralogistics workflow for maximum efficiency.",
            },
          ].map((solution, i) => (
            <div
              key={i}
              className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              <img
                src={solution.img}
                alt={solution.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-text-light dark:text-text-dark">
                  {solution.title}
                </h3>
                <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                  {solution.desc}
                </p>
                <a
                  href="#"
                  className="inline-block mt-4 text-primary font-medium group"
                >
                  Learn More{" "}
                  <span className="material-icons transition-transform duration-300 group-hover:translate-x-1 align-middle">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              © 2025 Prime Sales. All rights reserved.
            </p>
            <p className="mt-2 md:mt-0 text-text-secondary-light dark:text-text-secondary-dark">
              Crafted with mindfulness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OurSolutions;
