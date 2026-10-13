// QuarterlyReportButton.jsx
// mode="gross" → Non-Departmentalized report; mode="dept" → Departmentalized report.
// Layouts mirror the accounting file "DEPRECIATION … KEN.xls".
//
// Props
//   rowData            – UNFILTERED dashboard rows for the selected quarter
//                        ({ asset, beginningNBV, endingNBV, deps })
//   selectedFiscalYear – number, e.g. 2026 (FY 2026-2027)
//   selectedQuarter    – "1" | "2" | "3" | "4"  ("ALL" disables the button)
//   mode               – "gross" (default) | "dept"

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { buildQuarterlyWorkbook } from "../../pages/reports/quarterlyworkbook";

const QuarterlyReportButton = ({
  rowData = [],
  selectedFiscalYear,
  selectedQuarter,
  mode = "gross",
}) => {
  const [loading, setLoading] = useState(false);
  const canGenerate =
    selectedQuarter && selectedQuarter !== "ALL" && selectedFiscalYear != null;

  const preview = canGenerate
    ? buildQuarterlyWorkbook({
        rowData: [],
        fiscalYear: selectedFiscalYear,
        quarter: selectedQuarter,
        mode,
      })
    : null;

  const generateReport = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const { workbook, fileName } = buildQuarterlyWorkbook({
        rowData,
        fiscalYear: selectedFiscalYear,
        quarter: selectedQuarter,
        mode,
      });
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        fileName,
      );
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const label = preview?.buttonLabel ?? "Quarterly Report";
  const tooltip = canGenerate
    ? label
    : "Select a specific quarter (not Fiscal Year) to generate the report";

  return (
    <button
      onClick={generateReport}
      disabled={!canGenerate || loading}
      title={tooltip}
      className={[
        "flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-semibold transition",
        canGenerate && !loading
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400",
      ].join(" ")}
    >
      {loading ? "Generating…" : label}
    </button>
  );
};

export default QuarterlyReportButton;
