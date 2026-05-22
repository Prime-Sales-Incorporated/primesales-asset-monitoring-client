// depreciationHelpers.js

export const months = [
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

export const quarterMap = {
  1: [5, 6, 7],
  2: [8, 9, 10],
  3: [11, 0, 1],
  4: [2, 3, 4],
};

export const fiscalMonths = [5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4];

export const getMonthlySchedule = (asset) => {
  const cost = Number(asset.assetCost) || 0;
  const life = Number(asset.lifeSpan) || 1;

  if (!asset.purchaseDate || cost <= 0 || life <= 0) return [];

  const purchase = new Date(asset.purchaseDate);
  if (isNaN(purchase)) return [];

  const standardMonthly = cost / life;
  const dailyRate = standardMonthly / 30;

  let schedule = [];
  let accumulated = 0;
  let month = purchase.getMonth();
  let year = purchase.getFullYear();

  // First partial month
  const firstMonthDep = Number(
    (dailyRate * (30 - purchase.getDate() + 1)).toFixed(2),
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

export const getFiscalYearLabel = (year, month, fiscalStartMonth = 5) =>
  month >= fiscalStartMonth ? year : year - 1;

export const getNBVForPeriod = (asset, fiscalYear, quarter = "ALL") => {
  const schedule = getMonthlySchedule(asset);
  const cost = Number(asset.assetCost) || 0;

  let accumulatedDep = 0;
  schedule.forEach((s) => {
    const fy = getFiscalYearLabel(s.year, s.month);
    if (quarter === "ALL") {
      if (fy <= fiscalYear) accumulatedDep += s.dep;
    } else {
      const qMonths = quarterMap[quarter];
      if (fy < fiscalYear || (fy === fiscalYear && qMonths.includes(s.month))) {
        accumulatedDep += s.dep;
      }
    }
  });

  return Math.max(cost - accumulatedDep, 0);
};

export const getBeginningNBV = (asset, fiscalYear) => {
  const schedule = getMonthlySchedule(asset);
  const cost = Number(asset.assetCost) || 0;
  let accumulatedBeforeYear = 0;

  schedule.forEach((s) => {
    const fy = getFiscalYearLabel(s.year, s.month);
    if (fy < fiscalYear) accumulatedBeforeYear += s.dep;
  });

  return Math.max(cost - accumulatedBeforeYear, 0);
};

export const getScheduleForQuarter = (schedule, fiscalYear, quarter) => {
  const qMonths = quarterMap[quarter];
  return qMonths.map((m) => {
    const entry = schedule.find(
      (s) =>
        getFiscalYearLabel(s.year, s.month) === fiscalYear && s.month === m,
    );
    return entry ? entry.dep : 0;
  });
};

export const getScheduleForFiscalYear = (schedule, fiscalYear) =>
  fiscalMonths.map((m) => {
    const entry = schedule.find(
      (s) =>
        getFiscalYearLabel(s.year, s.month) === fiscalYear && s.month === m,
    );
    return entry ? entry.dep : 0;
  });

export const getCompleteTimeline = (assets) => {
  if (!assets || assets.length === 0) return [];

  let earliestYear = new Date().getFullYear();
  let earliestMonth = new Date().getMonth();
  let latestYear = earliestYear;
  let latestMonth = earliestMonth;

  assets.forEach((asset) => {
    const schedule = getMonthlySchedule(asset);
    if (schedule.length) {
      const first = schedule[0];
      const last = schedule[schedule.length - 1];

      if (
        first.year < earliestYear ||
        (first.year === earliestYear && first.month < earliestMonth)
      ) {
        earliestYear = first.year;
        earliestMonth = first.month;
      }

      if (
        last.year > latestYear ||
        (last.year === latestYear && last.month > latestMonth)
      ) {
        latestYear = last.year;
        latestMonth = last.month;
      }
    }
  });

  const timeline = [];
  let y = earliestYear;
  let m = earliestMonth;

  while (y < latestYear || (y === latestYear && m <= latestMonth)) {
    timeline.push({ year: y, month: m, label: `${months[m]} ${y}` });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  return timeline;
};
