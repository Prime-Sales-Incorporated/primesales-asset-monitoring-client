import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar1 = ({ mobile = false, isOpen = false, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  const handleClick = () => {
    if (mobile && onClose) onClose();
  };

  const navItems = [
    { to: "/dashboard", label: "Overview", icon: "dashboard" },
    { to: "/assets/add", label: "Add Asset", icon: "add_box" },
    { to: "/assets/list", label: "Inventory", icon: "inventory_2" },
    {
      to: "/assets/depreciation",
      label: "Depreciation",
      icon: "trending_down",
    },
    { to: "/assets/rentals", label: "Rentals", icon: "car_rental" },
    { to: "/warehouse", label: "Warehouse", icon: "warehouse" },
    { to: "/reports", label: "Reports", icon: "assessment" },
    { to: "/scanner", label: "Scan", icon: "barcode_scanner" },
  ];

  return (
    <aside
      className={`
        flex flex-col bg-[#000b1e] text-slate-400 shadow-2xl transition-all duration-200
        ${
          mobile
            ? `fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-64 min-h-screen"
        }
      `}
    >
      {/* Brand */}
      <div className="px-8 py-4">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleClick}
          className="flex items-center justify-center py-4"
        >
          <div className="h-10 w-28">
            <img src="/logo1.png" alt="Logo" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={handleClick}
            className={`flex items-center gap-3 px-4 py-3 group transition-all duration-200
              ${
                isActive(item.to)
                  ? "text-white bg-gradient-to-r from-blue-900/50 to-transparent border-l-4 border-emerald-500"
                  : "hover:text-white hover:bg-white/5"
              }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pb-8">
        <div className="px-4 mb-6 space-y-1">
          <Link
            to="/settings"
            onClick={handleClick}
            className="flex items-center gap-3 px-4 py-3 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </Link>

          <button className="flex items-center gap-3 px-4 py-3 hover:text-white hover:bg-white/5 transition-colors w-full text-left">
            <span className="material-symbols-outlined text-red-500">
              logout
            </span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* User Card */}
        <div className="mx-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center gap-3">
          <div className="relative">
            <img
              className="w-10 h-10 rounded-lg object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0EiblwgW6lSEibrhyFnchU2PXg9jXDe3Zwc_FavfVNd-z6elf6ly9K0xq72uyIkORPjyOQ3-NJusaaaJgKsq6GwlAhcPDk3aSEwoTSqJ75TLnzlWw4Yni_rBC-KT0O9WVPemJXx9HYCN8nYt-DCuwyZsDYN6ZbWhfeW_MUCNJhy_MrbHsOL-SyzFGhWxAbM7uOXsI7c1yoBqDvdb6tUE2VhtgPfp8abBLuxfKWejnHK4AdM1pFZByTXhkSm6_e4TURwYMd185x_o"
              alt=""
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#000b1e] rounded-full"></span>
          </div>

          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              Alex Johnson
            </p>
            <p className="text-[10px] text-slate-400 truncate">Admin Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar1;
