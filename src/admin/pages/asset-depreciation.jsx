// src/components/AssetDepreciation.jsx
import React, { useState } from "react";
import Header from "../components/header";

const AssetDepreciation = () => {
  const [purchaseDate, setPurchaseDate] = useState("");
  const [assetCost, setAssetCost] = useState("");
  const [usefulLife, setUsefulLife] = useState(""); // in years
  const [depreciation, setDepreciation] = useState(null);

  // Calculate full years from purchase date
  const getAssetAgeInYears = (date) => {
    if (!date) return 0;
    const issued = new Date(date);
    const today = new Date();
    let years = today.getFullYear() - issued.getFullYear();
    const hasNotReachedAnniversary =
      today.getMonth() < issued.getMonth() ||
      (today.getMonth() === issued.getMonth() &&
        today.getDate() < issued.getDate());
    if (hasNotReachedAnniversary) years--;
    return Math.max(years, 0);
  };

  const handleCalculate = (e) => {
    e.preventDefault();

    if (!purchaseDate || !assetCost || !usefulLife) {
      alert("Please enter all fields");
      return;
    }

    const age = getAssetAgeInYears(purchaseDate);
    const cost = parseFloat(assetCost);
    const life = parseFloat(usefulLife);

    // Straight-line depreciation
    const yearlyDepreciation = cost / life;
    const accumulatedDepreciation = yearlyDepreciation * age;
    const bookValue = Math.max(cost - accumulatedDepreciation, 0);

    setDepreciation({
      age,
      yearlyDepreciation: yearlyDepreciation.toFixed(2),
      accumulatedDepreciation: accumulatedDepreciation.toFixed(2),
      bookValue: bookValue.toFixed(2),
    });
  };

  return (
    <main className="flex-1 w-full bg-background-light dark:bg-background-dark pb-10">
      <Header />
      <div className="max-w-md mx-auto bg-background-light dark:bg-background-dark p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Asset Depreciation Calculator
        </h2>
        <form className="space-y-4" onSubmit={handleCalculate}>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Asset Cost
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="e.g. 45000.00"
              className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={assetCost}
              onChange={(e) => setAssetCost(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Useful Life (years)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={usefulLife}
              onChange={(e) => setUsefulLife(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center justify-center h-11 px-6 text-sm font-bold text-white rounded-lg bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary"
            >
              Calculate
            </button>
          </div>
        </form>

        {depreciation && (
          <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              Depreciation Results
            </h3>
            <p>Asset Age: {depreciation.age} year(s)</p>
            <p>Yearly Depreciation: ₱{depreciation.yearlyDepreciation}</p>
            <p>
              Accumulated Depreciation: ₱{depreciation.accumulatedDepreciation}
            </p>
            <p>Book Value: ₱{depreciation.bookValue}</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default AssetDepreciation;
