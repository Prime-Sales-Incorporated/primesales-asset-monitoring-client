import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // function to check if link is active
  const isActive = (path) => currentPath === path;

  return (
    <aside className="w-56 bg-slate-950 h-screen text-slate-300 hidden md:flex flex-col shrink-0">
      <Link to="/" className="flex items-center justify-center py-4 gap-0">
        <div className="h-6 w-6">
          <img src="/psi.png" alt="Logo" />
        </div>
        <h2 className="text-lg font-bold font-mono text-white">PrimeTrack</h2>
      </Link>

      <nav className="flex-1 py-4 space-y-1">
        <Link
          to="/dashboard"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive("/dashboard")
              ? "text-primary bg-primary/10 border-r-4 border-primary"
              : "hover:bg-slate-900 hover:text-white"
          }`}
        >
          <img src="/layout12.png" className="size-10 text-lg mr-2" />
          <span className="font-medium text-sm">Overview</span>
        </Link>
        <Link
          to="/assets/add"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive("/assets/add")
              ? "text-primary bg-primary/10 border-r-4 border-primary"
              : "hover:bg-slate-900 hover:text-white"
          }`}
        >
          <img src="/box.png" className="size-10 text-lg mr-2" />
          <span className="font-medium text-sm">Add Asset</span>
        </Link>
        <Link
          to="/assets/list"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive("/assets/list")
              ? "text-primary bg-primary/10 border-r-4 border-primary"
              : "hover:bg-slate-900 hover:text-white"
          }`}
        >
          <img src="/inv1.png" className="size-10 text-lg mr-2" />
          <span className="font-medium text-sm">Inventory</span>
        </Link>

        <Link
          to="/assets/depreciation"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive("/assets/depreciation")
              ? "text-primary bg-primary/10 border-r-4 border-primary"
              : "hover:bg-slate-900 hover:text-white"
          }`}
        >
          <img src="/depr.png" className="size-10 text-lg mr-2" />
          <span className="font-medium text-sm">Depreciation</span>
        </Link>
        <Link
          to="/assets/rentals"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive("/assets/rentals")
              ? "text-primary bg-primary/10 border-r-4 border-primary"
              : "hover:bg-slate-900 hover:text-white"
          }`}
        >
          <img src="/forklift.png" className="size-10 text-lg mr-2" />

          <span className="font-medium text-sm">Units</span>
        </Link>
        <Link
          to="/reports"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive("/reports")
              ? "text-primary bg-primary/10 border-r-4 border-primary"
              : "hover:bg-slate-900 hover:text-white"
          }`}
        >
          <img src="/analyt.png" className="size-10 text-lg mr-2" />
          <span className="font-medium text-sm">Reports</span>
        </Link>
        <Link
          to="/scanner"
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive("/scanner")
              ? "text-primary bg-primary/10 border-r-4 border-primary"
              : "hover:bg-slate-900 hover:text-white"
          }`}
        >
          <img src="/scanner.png" className="size-10 text-lg mr-2" />
          <span className="font-medium text-sm">Scan</span>
        </Link>

        {/* 
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Administration
          </p>
        </div>

        <a
          className="flex items-center px-6 py-3 hover:bg-slate-900 hover:text-white transition-colors"
          href="#"
        >
          <span className="material-icons-outlined mr-3">people</span>
          <span className="font-medium">Users</span>
        </a>

        <a
          className="flex items-center px-6 py-3 hover:bg-slate-900 hover:text-white transition-colors"
          href="#"
        >
          <span className="material-icons-outlined mr-3">settings</span>
          <span className="font-medium">Settings</span>
        </a> */}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
            <img
              alt="User avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0EiblwgW6lSEibrhyFnchU2PXg9jXDe3Zwc_FavfVNd-z6elf6ly9K0xq72uyIkORPjyOQ3-NJusaaaJgKsq6GwlAhcPDk3aSEwoTSqJ75TLnzlWw4Yni_rBC-KT0O9WVPemJXx9HYCN8nYt-DCuwyZsDYN6ZbWhfeW_MUCNJhy_MrbHsOL-SyzFGhWxAbM7uOXsI7c1yoBqDvdb6tUE2VhtgPfp8abBLuxfKWejnHK4AdM1pFZByTXhkSm6_e4TURwYMd185x_o"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              Alex Johnson
            </p>
            <p className="text-xs text-slate-500 truncate">Admin Account</p>
          </div>
          <button className="text-slate-500 hover:text-white">
            <span className="material-icons-outlined text-sm">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
