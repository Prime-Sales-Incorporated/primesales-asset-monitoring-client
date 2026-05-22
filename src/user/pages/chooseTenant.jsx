import React from "react";
import { useNavigate } from "react-router-dom";

const tenants = [
  {
    id: "prime-sales",
    name: "Prime Sales Inc",
    description: "Sales & asset operations",
    icon: "🏬",
    path: "/dashboard",
    accent: "#185FA5",
    bg: "#E6F1FB",
  },
  {
    id: "optichain",
    name: "Optichain Solutions Inc",
    description: "Supply chain & logistics",
    icon: "🏭",
    path: "/ocsi/dashboard",
    accent: "#0F6E56",
    bg: "#E1F5EE",
  },
];

const TenantSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          PrimeTrack
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose your workspace
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select the organization you want to sign in to
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {tenants.map((tenant) => (
          <button
            key={tenant.id}
            onClick={() => navigate(tenant.path)}
            className="bg-white dark:bg-background-dark border border-primary/20 dark:border-primary/30 rounded-xl p-7 text-left flex flex-col gap-3 hover:border-primary/60 dark:hover:border-primary/60 transition-colors group"
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-xl"
              style={{ background: tenant.bg }}
            >
              {tenant.icon}
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {tenant.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tenant.description}
              </p>
            </div>
            <div
              className="mt-auto flex items-center gap-1 text-sm font-medium"
              style={{ color: tenant.accent }}
            >
              Sign in <span aria-hidden="true">→</span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">
        Not sure which to pick?{" "}
        <a href="#" className="text-primary hover:underline">
          Contact your admin
        </a>
      </p>
    </div>
  );
};

export default TenantSelect;
