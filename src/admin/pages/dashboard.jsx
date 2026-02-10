import React, { useEffect, useMemo, useState } from "react";
import { fetchAssetStats } from "../../helper";

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

const MainDashboard = () => {
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
    <>
      <div className="text-2xl p-4 font-bold">Dashboard</div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
        <StatCard title="Total Assets" value={stats.totalAssets} />
        <StatCard title="Fully Depreciated" value={stats.fullyDepreciated} />
        <StatCard title="New Assets" value={stats.newAssets} />
        <StatCard
          title="Current Month Depreciation"
          value={`₱${stats.totalDepreciation.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
        />
      </section>

      <section className="p-6">
        <h2 className="text-xl font-bold mb-4">Asset Chart</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-black/60 dark:text-white/60">
                  Monthly Depreciation
                </p>
                <p className="text-3xl font-bold mt-1">
                  ₱{totalLast7Months.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-black/60 dark:text-white/60">
                  Last 7 Months
                </p>
              </div>
            </div>
            <BarChart data={chartData} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border w-full">
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

            <div className="relative h-[180px] mt-8">
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
      </section>
    </>
  );
};

export default MainDashboard;
