import React, { useEffect, useMemo, useState } from "react";
import { fetchAssetStats } from "../../../OCSIhelper";

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-500">
    <p className="text-sm font-medium text-black/60 dark:text-white/60">
      {title}
    </p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function buildChartData(monthlyMap, monthsBack = 7) {
  const now = new Date();
  const data = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    data.push({
      label: MONTH_NAMES[d.getMonth()],
      value: Number((monthlyMap[key] || 0).toFixed(2)),
    });
  }

  return data;
}

const BarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative">
      <div className="grid min-h-[180px] grid-flow-col gap-4 items-end justify-items-center pt-8 px-3">
        {data.map((d, idx) => (
          <div
            key={idx}
            className="bg-blue-500/30 w-full rounded-t relative cursor-pointer"
            style={{ height: `${(d.value / max) * 100}%` }}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === idx && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-black dark:text-white bg-white dark:bg-slate-900 px-2 py-1 rounded shadow z-10">
                ₱{d.value.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-4 text-center mt-2">
        {data.map((d) => (
          <p
            key={d.label}
            className="text-xs font-bold text-black/50 dark:text-white/50"
          >
            {d.label}
          </p>
        ))}
      </div>
    </div>
  );
};

const LineChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 472;
  const height = 150;
  const [hovered, setHovered] = useState(null);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / max) * height;
    return { x, y, value: d.value, label: d.label };
  });

  const path = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`;

  return (
    <div className="relative">
      <svg
        fill="none"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2={height}>
            <stop stopColor="#1173d4" stopOpacity="0.4" />
            <stop offset="1" stopColor="#1173d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L ${width},${height} L 0,${height} Z`}
          fill="url(#chartGradient)"
        />
        <path d={path} stroke="#1173d4" strokeWidth="2" strokeLinecap="round" />
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={8}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>
      {hovered !== null && (
        <div
          className="absolute -translate-x-1/2 text-xs font-bold text-black dark:text-white bg-white dark:bg-slate-900 px-2 py-1 rounded shadow z-10"
          style={{
            left: `${points[hovered].x}px`,
            top: `${points[hovered].y - 20}px`,
          }}
        >
          ₱{points[hovered].value.toLocaleString()}
        </div>
      )}
    </div>
  );
};

const OCSIMainDashboard = () => {
  const [stats, setStats] = useState({
    totalAssets: 0,
    fullyDepreciated: 0,
    newAssets: 0,
    totalDepreciation: 0,
    monthlyMap: {},
  });

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchAssetStats();
      setStats(data);
    };
    loadStats();
  }, []);

  const chartData = useMemo(
    () => buildChartData(stats.monthlyMap, 7),
    [stats.monthlyMap],
  );

  const totalLast7Months = chartData.reduce((sum, d) => sum + d.value, 0);
  const utilization =
    stats.totalAssets === 0
      ? 0
      : ((stats.totalAssets - stats.fullyDepreciated) / stats.totalAssets) *
        100;

  return (
    <main className=" min-h-screen bg-[#f7fafc]">
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* PAGE TITLE */}
        <h2 className="text-2xl font-bold dark:text-white mb-6">Dashboard</h2>

        {/* ================= KPI GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Assets */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <span className="material-symbols-outlined text-blue-600">
                  inventory_2
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Live Count
              </span>
            </div>

            <p className="text-sm text-slate-500 uppercase">Total Assets</p>
            <h3 className="text-4xl font-extrabold text-slate-900">
              {stats.totalAssets}
            </h3>
          </div>

          {/* Fully Depreciated */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <span className="material-symbols-outlined text-red-600">
                  history_toggle_off
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Cycle End
              </span>
            </div>

            <p className="text-sm text-slate-500 uppercase">
              Fully Depreciated
            </p>
            <h3 className="text-4xl font-extrabold text-slate-900">
              {stats.fullyDepreciated}
            </h3>
          </div>

          {/* New Assets */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <span className="material-symbols-outlined text-green-600">
                  fiber_new
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                purchased within 15 days
              </span>
            </div>

            <p className="text-sm text-slate-500 uppercase">New Assets</p>
            <h3 className="text-4xl font-extrabold text-slate-900">
              {stats.newAssets}
            </h3>
          </div>

          {/* Depreciation */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16" />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-blue-50 rounded-lg">
                <span className="material-symbols-outlined text-blue-600">
                  payments
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase">
                Active
              </span>
            </div>

            <p className="text-sm text-slate-500 uppercase relative z-10">
              Depreciation this Month
            </p>

            <h3 className="text-2xl font-extrabold text-slate-900 relative z-10">
              ₱
              {stats.totalDepreciation.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>

        {/* ================= BENTO GRID ================= */}
        <div className="grid grid-cols-12 gap-8">
          {/* LEFT CHART (BAR) */}
          <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  Monthly Depreciation
                </h4>
                <p className="text-sm text-slate-500">
                  Comparative fiscal trend from last 7 months
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Cumulative
                </p>
                <p className="text-2xl font-black text-blue-600">
                  ₱{totalLast7Months.toLocaleString()}
                </p>
              </div>
            </div>

            <BarChart data={chartData} />
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* UTILIZATION CARD (CIRCLE STYLE BLOCK) */}
            <div className="bg-[#00174b] p-6 rounded-xl text-white shadow-xl">
              <h4 className="font-bold text-lg mb-1">Asset Utilization</h4>
              <p className="text-xs text-slate-400 mb-6">
                Capacity performance index
              </p>

              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full border-8 border-slate-700 relative flex items-center justify-center">
                  <div className="absolute inset-0 border-8 border-blue-400 rounded-full border-t-transparent rotate-45" />
                  <span className="text-2xl font-black">
                    {utilization.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm bg-white/5 p-3 rounded-lg">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Trend</p>
                  <span className="text-green-400 font-bold">+4.2%</span>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase">Peak</p>
                  <span className="font-bold">88.1%</span>
                </div>
              </div>
            </div>

            {/* QUICK INSIGHTS */}
            <div className="bg-white p-6 rounded-xl border">
              <h5 className="text-xs font-bold text-slate-500 uppercase mb-4">
                Quick Insights
              </h5>

              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <p className="text-sm">3 High-value assets pending review</p>
                </li>

                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <p className="text-sm">Depreciation cycle optimized for Q2</p>
                </li>
              </ul>

              <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-bold">
                Generate Full Audit
              </button>
            </div>
          </div>
        </div>

        {/* ================= LINE CHART SECTION ================= */}
        <div className="bg-white mt-8 dark:bg-slate-900 rounded-lg p-6 border w-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-black/60 dark:text-white/60">
                Asset Utilization
              </p>
              <p className="text-3xl font-bold mt-1">
                {utilization.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-black/60 dark:text-white/60">
                Based on assets
              </p>
            </div>
          </div>

          <div className="relative  mt-8">
            <LineChart data={chartData} />
          </div>

          <div className="grid grid-cols-7 gap-4 text-center mt-2">
            {chartData.map((d) => (
              <p
                key={d.label}
                className="text-xs font-bold text-black/50 dark:text-white/50"
              >
                {d.label}
              </p>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OCSIMainDashboard;
