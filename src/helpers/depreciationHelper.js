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

// Fiscal year starts June (month 5).
// Q1: Jun Jul Aug  (months 5,6,7)
// Q2: Sep Oct Nov  (months 8,9,10)
// Q3: Dec Jan Feb  (months 11,0,1)  ← wraps across calendar year
// Q4: Mar Apr May  (months 2,3,4)
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

// Fiscal year label: Jun–Dec of `year` belongs to FY `year`; Jan–May of `year` belongs to FY `year-1`.
export const getFiscalYearLabel = (year, month, fiscalStartMonth = 5) =>
  month >= fiscalStartMonth ? year : year - 1;

// ─── Fiscal position helpers (EXPORTED so QuarterlyReportButton can reuse them) ─

// Fiscal position index of a month within the fiscal year (0 = Jun, 11 = May).
// Returns -1 if the month is not found (should never happen).
export const fiscalPos = (month) => fiscalMonths.indexOf(month);

// Fiscal position of the LAST month of a quarter:
// Q1 → 2 (Aug), Q2 → 5 (Nov), Q3 → 8 (Feb), Q4 → 11 (May)
export const lastPosOfQuarter = (quarter) =>
  fiscalPos(quarterMap[quarter][quarterMap[quarter].length - 1]);

// Fiscal position of the FIRST month of a quarter:
// Q1 → 0 (Jun), Q2 → 3 (Sep), Q3 → 6 (Dec), Q4 → 9 (Mar)
export const firstPosOfQuarter = (quarter) => fiscalPos(quarterMap[quarter][0]);

// ─────────────────────────────────────────────────────────────────────────────

// Returns ending NBV after the given fiscal year + quarter.
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
    // Include all entries at or before the last fiscal-position of the selected quarter.
    // Using fiscalPos avoids the calendar-year-wrap problem (e.g. Q3 spans Dec–Feb).
    const lastPos = lastPosOfQuarter(quarter);

    schedule.forEach((s) => {
      const fy = getFiscalYearLabel(s.year, s.month);
      if (fy < fiscalYear) {
        accumulatedDep += s.dep;
      } else if (fy === fiscalYear) {
        const pos = fiscalPos(s.month);
        if (pos !== -1 && pos <= lastPos) accumulatedDep += s.dep;
      }
    });
  }

  return Math.max(cost - accumulatedDep, 0);
};

// Returns beginning NBV for the given fiscal year + quarter.
// quarter = null / "ALL" → beginning of the fiscal year (= end of previous FY).
// quarter = 1–4          → end of the previous quarter within the same FY.
export const getBeginningNBV = (asset, fiscalYear, quarter = null) => {
  const schedule = getMonthlySchedule(asset);
  const cost = Number(asset.assetCost) || 0;
  let accumulated = 0;

  if (!quarter || quarter === "ALL") {
    // Everything strictly before this fiscal year
    schedule.forEach((s) => {
      const fy = getFiscalYearLabel(s.year, s.month);
      if (fy < fiscalYear) accumulated += s.dep;
    });
  } else {
    // Everything before this fiscal year PLUS all months in this fiscal year
    // that come BEFORE the first month of the selected quarter (by fiscal position).
    const firstPos = firstPosOfQuarter(quarter);

    schedule.forEach((s) => {
      const fy = getFiscalYearLabel(s.year, s.month);
      if (fy < fiscalYear) {
        accumulated += s.dep;
      } else if (fy === fiscalYear) {
        const pos = fiscalPos(s.month);
        if (pos !== -1 && pos < firstPos) accumulated += s.dep;
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
