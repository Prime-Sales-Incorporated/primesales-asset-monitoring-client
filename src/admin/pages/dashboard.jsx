// src/components/MainDashboard.jsx
import React from "react";
import Header from "../../user/components/header";

const StatCard = ({ title, value, trend, trendColor }) => (
  <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow border">
    <p className="text-sm font-medium text-black/60 dark:text-white/60">
      {title}
    </p>
    <p className="text-3xl font-bold mt-1">{value}</p>
    <p className={`text-sm font-medium mt-1 ${trendColor}`}>{trend}</p>
  </div>
);

const MainDashboard = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const stockHeights = [90, 100, 20, 60, 80, 20, 80];

  return (
    <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark text-black dark:text-white">
      {/* Stats Cards */}
      <Header />
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <StatCard
          title="Total Assets"
          value="1,250"
          trend="+10%"
          trendColor="text-green-500"
        />
        <StatCard
          title="Low Stock Alerts"
          value="35"
          trend="-5%"
          trendColor="text-red-500"
        />
        <StatCard
          title="Recent Activity"
          value="12"
          trend="+2%"
          trendColor="text-green-500"
        />
      </section>

      {/* Inventory Overview */}
      <section className="p-6">
        <h2 className="text-xl font-bold mb-4">Inventory Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Levels Bar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Stock Levels
                </p>
                <p className="text-3xl font-bold mt-1">85%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-black/60 dark:text-white/60">
                  Last 30 Days
                </p>
                <p className="text-sm font-medium text-green-500">+5%</p>
              </div>
            </div>
            <div className="grid min-h-[180px] grid-flow-col gap-4 items-end justify-items-center pt-8 px-3">
              {stockHeights.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-primary/20 w-full rounded-t"
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4 text-center mt-2">
              {months.map((m) => (
                <p
                  key={m}
                  className="text-xs font-bold text-black/50 dark:text-white/50"
                >
                  {m}
                </p>
              ))}
            </div>
          </div>

          {/* Asset Utilization Line Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Asset Utilization
                </p>
                <p className="text-3xl font-bold mt-1">70%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-black/60 dark:text-white/60">
                  Last 30 Days
                </p>
                <p className="text-sm font-medium text-red-500">-2%</p>
              </div>
            </div>
            <div className="relative h-[180px] mt-8">
              <svg
                fill="none"
                height="100%"
                preserveAspectRatio="none"
                viewBox="0 0 472 150"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="150"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#1173d4" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#1173d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V150H0V109Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#1173d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="grid grid-cols-7 gap-4 text-center mt-2">
              {months.map((m) => (
                <p
                  key={m}
                  className="text-xs font-bold text-black/50 dark:text-white/50"
                >
                  {m}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Table */}
      <section className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="overflow-x-auto bg-white dark:bg-slate-900 border rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-black/60 dark:text-white/60 uppercase bg-background-light dark:bg-slate-900 ">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Activity</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  date: "2023-08-15",
                  act: "Asset added",
                  det: "New laptop added to inventory",
                },
                {
                  date: "2023-08-14",
                  act: "Stock alert",
                  det: "Low stock for printer paper",
                },
                {
                  date: "2023-08-12",
                  act: "Asset updated",
                  det: "Updated location for server",
                },
                {
                  date: "2023-08-10",
                  act: "Report generated",
                  det: "Generated inventory report",
                },
                {
                  date: "2023-08-08",
                  act: "User login",
                  det: "Admin user logged in",
                },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-white/10">
                  <td className="px-6 py-4">{row.date}</td>
                  <td className="px-6 py-4">{row.act}</td>
                  <td className="px-6 py-4">{row.det}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default MainDashboard;
