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

    const fullyDepreciated = assets.filter(
      (a) => a.lifeSpan === 0 || a.status?.toLowerCase() === "fully depreciated"
    ).length;

    const newAssets = assets.filter((a) => {
      const created = new Date(a.purchaseDate || a.createdAt);
      const now = new Date();
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 15; // <-- only change
    }).length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalDepreciation = 0;

    assets.forEach((asset) => {
      const schedule = buildMonthlySchedule(asset);

      const currentEntry = schedule.find(
        (m) => m.month === currentMonth && m.year === currentYear
      );

      if (currentEntry) {
        totalDepreciation += currentEntry.value;
      }
    });

    return {
      totalAssets,
      fullyDepreciated,
      newAssets,
      totalDepreciation: Number(totalDepreciation.toFixed(2)),
    };
  } catch (err) {
    console.error("Error fetching asset stats:", err);
    return {
      totalAssets: 0,
      fullyDepreciated: 0,
      newAssets: 0,
      totalDepreciation: 0,
    };
  }
};
