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
  1: [0, 1, 2], // Q1: Jan, Feb, Mar
  2: [3, 4, 5], // Q2: Apr, May, Jun
  3: [6, 7, 8], // Q3: Jul, Aug, Sep
  4: [9, 10, 11], // Q4: Oct, Nov, Dec
};

export const fiscalMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const getMonthlySchedule = (asset) => {
  const cost = Number(asset.assetCost) || 0;
  const life = Number(asset.lifeSpan) || 1;

  if (!asset.purchaseDate || cost <= 0 || life <= 0) return [];

  const purchase = new Date(asset.purchaseDate);
  if (isNaN(purchase)) return [];

  const standardMonthly = cost / life;
  const dailyRate = standardMonthly / 30;

  // Round the standard monthly ONCE — all full months use this value.
  // This prevents accumulated drift between raw floats and rounded entries.
  const roundedMonthly = Number(standardMonthly.toFixed(2));

  let schedule = [];
  // accumulated now tracks the SUM OF ROUNDED values, eliminating float drift.
  let accumulated = 0;
  let month = purchase.getMonth();
  let year = purchase.getFullYear();

  // First partial month — prorated from purchase day to end of month
  const firstMonthDep = Number(
    (dailyRate * (30 - purchase.getDate() + 1)).toFixed(2),
  );
  schedule.push({ year, month, dep: firstMonthDep });
  accumulated += firstMonthDep;

  // Add full monthly entries as long as another full rounded installment fits.
  // Use 0.005 epsilon to guard against floating-point edge cases producing
  // a near-zero ghost entry at the end.
  while (accumulated + roundedMonthly <= cost - 0.005) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    schedule.push({ year, month, dep: roundedMonthly });
    accumulated += roundedMonthly;
  }

  // Final entry: exact remainder so total depreciation == assetCost exactly.
  // This ensures NBV reaches 0.00 with no leftover cents.
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

// Calendar year: the year of the entry is always the calendar year
export const getFiscalYearLabel = (year, month) => year;

// Returns the ending NBV after the given fiscal year + quarter.
// quarter = "ALL" means end of full year; otherwise 1–4.
export const getNBVForPeriod = (asset, fiscalYear, quarter = "ALL") => {
  const schedule = getMonthlySchedule(asset);
  const cost = Number(asset.assetCost) || 0;

  let accumulatedDep = 0;

  if (quarter === "ALL") {
    schedule.forEach((s) => {
      const fy = getFiscalYearLabel(s.year, s.month);
      if (fy <= fiscalYear) accumulatedDep += s.dep;
    });
  } else {
    // Include all months up to and including the last month of the selected quarter.
    // e.g. Q2 → lastMonth = 5 (Jun), so Jan–Jun of fiscalYear are all included.
    const qMonths = quarterMap[quarter];
    const lastMonthOfQuarter = qMonths[qMonths.length - 1];

    schedule.forEach((s) => {
      const fy = getFiscalYearLabel(s.year, s.month);
      if (
        fy < fiscalYear ||
        (fy === fiscalYear && s.month <= lastMonthOfQuarter)
      ) {
        accumulatedDep += s.dep;
      }
    });
  }

  return Math.max(cost - accumulatedDep, 0);
};

// Returns the beginning NBV for the given fiscal year + quarter.
// When quarter is null/"ALL" → beginning of the fiscal year (end of prev year).
// When quarter is 1–4     → end of the previous quarter (or end of prev year for Q1).
export const getBeginningNBV = (asset, fiscalYear, quarter = null) => {
  const schedule = getMonthlySchedule(asset);
  const cost = Number(asset.assetCost) || 0;
  let accumulated = 0;

  if (!quarter || quarter === "ALL") {
    // Everything before this fiscal year
    schedule.forEach((s) => {
      const fy = getFiscalYearLabel(s.year, s.month);
      if (fy < fiscalYear) accumulated += s.dep;
    });
  } else {
    // Include everything before fiscalYear PLUS all months in fiscalYear
    // that come BEFORE this quarter's first month.
    // e.g. Q2 → firstMonth = 3 (Apr), so Jan–Mar of fiscalYear are included.
    const qMonths = quarterMap[quarter];
    const firstMonthOfQuarter = qMonths[0];

    schedule.forEach((s) => {
      const fy = getFiscalYearLabel(s.year, s.month);
      if (
        fy < fiscalYear ||
        (fy === fiscalYear && s.month < firstMonthOfQuarter)
      ) {
        accumulated += s.dep;
      }
    });
  }

  return Math.max(cost - accumulated, 0);
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
