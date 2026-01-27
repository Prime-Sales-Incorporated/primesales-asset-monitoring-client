import API_BASE_URL from "../src/API";

/* ================================
   Build accurate monthly schedule
================================ */
function buildMonthlySchedule(asset) {
  const cost = Number(asset.assetCost) || 0;
  const lifeYears = Number(asset.lifeSpan) || 0;

  if (!asset.purchaseDate || cost <= 0 || lifeYears <= 0) return [];

  const purchaseDate = new Date(asset.purchaseDate);
  const totalMonths = lifeYears * 12;

  const standardMonthly = cost / totalMonths;
  const dailyRate = standardMonthly / 30;

  let schedule = [];
  let accumulated = 0;

  let month = purchaseDate.getMonth();
  let year = purchaseDate.getFullYear();

  // ---- First month (partial) ----
  const remainingDays = 30 - purchaseDate.getDate() + 1;
  let firstMonthDep = dailyRate * remainingDays;

  if (firstMonthDep > cost) firstMonthDep = cost;

  firstMonthDep = Number(firstMonthDep.toFixed(2));

  schedule.push({ year, month, value: firstMonthDep });
  accumulated += firstMonthDep;

  // ---- Next full months ----
  while (accumulated < cost) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }

    let dep = standardMonthly;

    if (accumulated + dep > cost) {
      dep = cost - accumulated;
    }

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

    const newAssets = assets.filter((a) => {
      const created = new Date(a.purchaseDate || a.createdAt);
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 15;
    }).length;

    assets.forEach((asset) => {
      const schedule = buildMonthlySchedule(asset);

      // ---- Calculate fully depreciated ----
      const totalDep = schedule.reduce((sum, m) => sum + m.value, 0);
      if (totalDep >= Number(asset.assetCost || 0)) {
        fullyDepreciated++;
      }

      // ---- Build monthly map for charts ----
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
    console.error(err);
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
