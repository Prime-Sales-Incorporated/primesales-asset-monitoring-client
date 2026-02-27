import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ mobile = false, isOpen = false, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  const handleClick = () => {
    if (mobile && onClose) onClose();
  };

  return (
    <aside
      className={`
        bg-slate-950 text-slate-300 flex flex-col
        ${
          mobile
            ? `fixed top-0 left-0 min-h-screen w-64 z-50 transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-56 min-h-screen shrink-0"
        }
      `}
    >
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

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        {[
          { to: "/dashboard", label: "Overview", icon: "/layout12.png" },
          { to: "/assets/add", label: "Add Asset", icon: "/box.png" },
          { to: "/assets/list", label: "Inventory", icon: "/inv1.png" },
          {
            to: "/assets/depreciation",
            label: "Depreciation",
            icon: "/depr.png",
          },
          { to: "/assets/rentals", label: "Rentals", icon: "/forklift.png" },
          { to: "/reports", label: "Reports", icon: "/analyt.png" },
          { to: "/scanner", label: "Scan", icon: "/scanner.png" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={handleClick}
            className={`flex items-center px-6 py-3 transition-colors ${
              isActive(item.to)
                ? "text-primary bg-primary/10 border-r-4 border-primary"
                : "hover:bg-slate-900 hover:text-white"
            }`}
          >
            <img src={item.icon} className="size-6 mr-3" alt="" />
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Card */}
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
