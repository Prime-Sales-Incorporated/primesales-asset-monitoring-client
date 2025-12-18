import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Video */}

      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/bg1.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm py-4 px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}

          <div className="text-white font-serif text-xl flex items-center">
            <img src="/logo1.png" alt="" className="h-8 w-16" />
          </div>

          {/* Navigation Links */}
          {/* <div className="flex items-center gap-8 text-white/90 font-sans text-sm font-light">
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
          </div> */}
        </div>
      </nav>

      {/* Hero Section */}
      {/* Hero Section */}
      <div className="relative z-10 flex items-center h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="font-serif text-white text-4xl lg:text-6xl font-normal tracking-tight mb-8 opacity-0 animate-fadeInUp">
              Where Efficiency Meets{" "}
              <em className="text-green-500">Innovation</em>
            </h1>

            <p className="font-sans text-gray-200 text-lg lg:text-xl font-light leading-relaxed mb-12 max-w-xl opacity-0 animate-fadeInUp [animation-delay:0.3s]">
              Providing reliable intralogistics solutions — from forklifts to
              racking systems — that move your business forward with strength
              and precision.
            </p>
            <Link to="/main">
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans font-medium px-6 py-3 rounded-lg text-base hover:bg-white/20 hover:scale-105 hover:shadow-lg transition-all duration-300 opacity-0 animate-fadeInUp [animation-delay:0.6s]">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <p className="font-sans text-white/70 text-xs font-light">
              © 2025 Prime Sales. All rights reserved.
            </p>
            <p className="font-sans text-white/70 text-xs font-light">
              Crafted with mindfulness
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
