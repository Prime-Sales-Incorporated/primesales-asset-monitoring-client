import React, { useEffect, useState } from "react";
import Header from "../components/header";
import API_BASE_URL from "../../API";

const months = [
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

// Fiscal quarters starting June
const quarterMap = {
  1: [5, 6, 7], // Jun, Jul, Aug
  2: [8, 9, 10], // Sep, Oct, Nov
  3: [11, 0, 1], // Dec, Jan, Feb
  4: [2, 3, 4], // Mar, Apr, May
};

const fiscalMonths = [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];

// ===== Depreciation Helpers =====
const getMonthlySchedule = (asset) => {
  const cost = Number(asset.assetCost) || 0;
  const life = Number(asset.lifeSpan) || 1;
  if (!asset.purchaseDate || cost <= 0 || life <= 0) return [];

  const purchase = new Date(asset.purchaseDate);
  if (isNaN(purchase)) return [];

  const standardMonthly = cost / (life * 12);
  const dailyRate = standardMonthly / 30;

  let schedule = [];
  let accumulated = 0;
  let month = purchase.getMonth();
  let year = purchase.getFullYear();

  const firstMonthDep = Number(
    (dailyRate * (30 - purchase.getDate() + 1)).toFixed(2)
  );

  schedule.push({ year, month, dep: firstMonthDep });
  accumulated += firstMonthDep;

  while (accumulated + standardMonthly < cost) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    schedule.push({ year, month, dep: Number(standardMonthly.toFixed(2)) });
    accumulated += standardMonthly;
  }

  const remaining = Number((cost - accumulated).toFixed(2));
  if (remaining > 0) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    schedule.push({ year, month, dep: remaining });
  }

  return schedule;
};

// Fiscal year label (June-May)
const getFiscalYearLabel = (year, month, fiscalStartMonth = 5) => {
  return month >= fiscalStartMonth ? year : year - 1;
};

const getScheduleForQuarter = (schedule, fiscalYear, quarter) => {
  const qMonths = quarterMap[quarter];
  return qMonths.map((m) => {
    const entry = schedule.find(
      (s) => getFiscalYearLabel(s.year, s.month) === fiscalYear && s.month === m
    );
    return entry ? entry.dep : 0;
  });
};

const getScheduleForFiscalYear = (schedule, fiscalYear) => {
  return fiscalMonths.map((m) => {
    const entry = schedule.find(
      (s) => getFiscalYearLabel(s.year, s.month) === fiscalYear && s.month === m
    );
    return entry ? entry.dep : 0;
  });
};

const AssetDepreciationDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxFiscalYear, setMaxFiscalYear] = useState(new Date().getFullYear());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    new Date().getFullYear()
  );
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");

  const formatMoney = (v) =>
    new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/asset/get/all`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setAssets(data);

        let lastYear = new Date().getFullYear();
        data.forEach((a) => {
          const schedule = getMonthlySchedule(a);
          if (schedule.length) {
            const lastMonth = schedule[schedule.length - 1];
            lastYear = Math.max(
              lastYear,
              getFiscalYearLabel(lastMonth.year, lastMonth.month)
            );
          }
        });
        setMaxFiscalYear(lastYear);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading assets...
      </div>
    );

  let totalPeriodDep = 0;

  const headerMonths =
    selectedQuarter === "ALL" ? fiscalMonths : quarterMap[selectedQuarter];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark dark:text-gray-300">
      <Header />
      <main className="px-3 py-4">
        <h1 className="text-lg font-bold mb-3">Asset Depreciation Schedule</h1>

        <div className="flex gap-4 mb-3 text-sm">
          <div>
            <label className="mr-1 font-semibold">Fiscal Year:</label>
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(Number(e.target.value))}
              className="border px-2 py-1"
            >
              {Array.from(
                { length: maxFiscalYear - 2020 + 1 },
                (_, i) => 2020 + i
              ).map((y) => (
                <option key={y} value={y}>
                  {y}-{y + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mr-1 font-semibold">Period:</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="ALL"> Fiscal Year</option>
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>
                  Q{q}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full border">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-black/10">
                <th colSpan={5}></th>
                <th
                  colSpan={headerMonths.length}
                  className="border bg-yellow-300 text-center"
                >
                  Fiscal Year {selectedFiscalYear}-{selectedFiscalYear + 1}
                  {selectedQuarter !== "ALL" && ` – Q${selectedQuarter}`}
                </th>
                <th className="border">Total</th>
              </tr>
              <tr>
                {["Particulars", "Class", "Date", "Life", "Cost"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="sticky z-30 bg-white outline outline-1 p-1"
                    >
                      {h}
                    </th>
                  )
                )}

                {headerMonths.map((m) => (
                  <th key={m} className="border p-1 w-[70px]">
                    {months[m]}
                  </th>
                ))}

                <th className="border p-1">Total</th>
              </tr>
            </thead>

            <tbody>
              {assets.map((asset) => {
                const schedule = getMonthlySchedule(asset);

                const deps =
                  selectedQuarter === "ALL"
                    ? getScheduleForFiscalYear(schedule, selectedFiscalYear)
                    : getScheduleForQuarter(
                        schedule,
                        selectedFiscalYear,
                        Number(selectedQuarter)
                      );

                const periodTotal = deps.reduce((a, b) => a + b, 0);
                totalPeriodDep += periodTotal;

                return (
                  <tr key={asset._id}>
                    <td className="sticky left-0 z-20 bg-white outline outline-1 p-1">
                      {asset.assetName}
                    </td>
                    <td className="sticky left-[140px] z-20 bg-white outline outline-1 p-1">
                      {asset.category}
                    </td>
                    <td className="sticky left-[230px] z-20 bg-white outline outline-1 p-1">
                      {asset.purchaseDate
                        ? new Date(asset.purchaseDate).toLocaleDateString(
                            "en-PH"
                          )
                        : "-"}
                    </td>
                    <td className="sticky left-[320px] z-20 bg-white outline outline-1 p-1 text-center">
                      {asset.lifeSpan}
                    </td>
                    <td className="sticky left-[370px] z-20 bg-white outline outline-1 p-1">
                      ₱{formatMoney(asset.assetCost)}
                    </td>

                    {deps.map((dep, i) => (
                      <td key={i} className="border p-1 text-right">
                        {dep > 0 ? `₱${formatMoney(dep)}` : "-"}
                      </td>
                    ))}

                    <td className="border p-1 text-right font-semibold">
                      ₱{formatMoney(periodTotal)}
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-black/10 font-bold">
                <td colSpan={5} className="text-right p-1">
                  TOTAL
                </td>
                <td colSpan={headerMonths.length}></td>
                <td className="border p-1 text-right">
                  ₱{formatMoney(totalPeriodDep)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AssetDepreciationDashboard;
