import API_BASE_URL from "../src/API";

/* ================================
   Build accurate monthly schedule
   Assumes lifeSpan is in MONTHS
================================ */
function buildMonthlySchedule(asset) {
  const cost = Number(asset.assetCost) || 0;
  const totalMonths = Number(asset.lifeSpan) || 0; // <-- already in months

  if (!asset.purchaseDate || cost <= 0 || totalMonths <= 0) return [];

  const purchaseDate = new Date(asset.purchaseDate);
  if (isNaN(purchaseDate)) return [];

  const standardMonthly = cost / totalMonths;
  const dailyRate = standardMonthly / 30;

  let schedule = [];
  let accumulated = 0;
  let month = purchaseDate.getMonth();
  let year = purchaseDate.getFullYear();

  // First partial month
  const remainingDays = 30 - purchaseDate.getDate() + 1;
  let firstMonthDep = Math.min(dailyRate * remainingDays, cost);
  firstMonthDep = Number(firstMonthDep.toFixed(2));
  schedule.push({ year, month, value: firstMonthDep });
  accumulated += firstMonthDep;

  // Remaining months
  while (accumulated < cost) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }

    let dep = standardMonthly;
    if (accumulated + dep > cost) dep = cost - accumulated;

    dep = Number(dep.toFixed(2));
    schedule.push({ year, month, value: dep });
    accumulated += dep;

    if (schedule.length > totalMonths + 2) break; // safety
  }

  return schedule;
}

/* ================================
   Fetch Asset Stats
================================ */
export const fetchAssetStats = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/asset/get/all`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      },
    });
    const assets = await res.json();
    const totalAssets = assets.length;

    let fullyDepreciated = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalDepreciation = 0;
    let monthlyMap = {};

    // New assets (<=15 days old)
    const newAssets = assets.filter((a) => {
      const created = new Date(a.purchaseDate || a.createdAt);
      if (isNaN(created)) return false;
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 15;
    }).length;

    assets.forEach((asset) => {
      const assetCost = Number(asset.assetCost) || 0;
      const schedule = buildMonthlySchedule(asset);

      // Cumulative depreciation up to today
      const depreciationToDate = schedule
        .filter((m) => {
          const monthEnd = new Date(m.year, m.month + 1, 0); // last day of that month
          return monthEnd <= now;
        })
        .reduce((sum, m) => sum + m.value, 0);

      // Fully depreciated if depreciation is very close to cost
      if (depreciationToDate >= assetCost - 0.01) {
        // <-- allows rounding tolerance
        fullyDepreciated++;
      }

      // Build monthly map for charts
      schedule.forEach((m) => {
        const key = `${m.year}-${m.month}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + m.value;

        // Current month depreciation
        if (m.year === currentYear && m.month === currentMonth) {
          totalDepreciation += m.value;
        }
      });
    });

    return {
      totalAssets,
      fullyDepreciated,
      newAssets,
      totalDepreciation: Number(totalDepreciation.toFixed(2)),
      monthlyMap,
      assets,
    };
  } catch (err) {
    console.error("Error fetching asset stats:", err);
    return {
      totalAssets: 0,
      fullyDepreciated: 0,
      newAssets: 0,
      totalDepreciation: 0,
      monthlyMap: {},
      assets: [],
    };
  }
};
