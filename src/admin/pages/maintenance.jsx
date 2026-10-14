// MaintenanceScreen.jsx
// A (fake) "system under maintenance" screen. Drop it in front of the
// depreciation page to prank a friend.
//
// Usage inside AssetDepreciationDashboard.jsx (or a route):
//   import MaintenanceScreen from "./MaintenanceScreen";
//   ...
//   const PRANK_MODE = true;           // flip to false to bring the page back
//   if (PRANK_MODE) return <MaintenanceScreen />;
//
// Secret exit: click the gear 5 times (calls onDismiss if provided).

import React, { useEffect, useState } from "react";

const MESSAGES = [
  "Recalculating depreciation of the entire universe…",
  "Convincing the cents to add up…",
  "Asking the forklift to depreciate faster…",
  "Waiting for Allen…",
  "Still waiting for Allen…",
];

const MaintenanceScreen = ({
  name = "Kenneth",
  master = "Allen",
  onDismiss,
}) => {
  const [progress, setProgress] = useState(12);
  const [msgIdx, setMsgIdx] = useState(0);
  const [taps, setTaps] = useState(0);
  const [called, setCalled] = useState(false);

  // Progress creeps up and then "gets stuck" at 99%
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p >= 99 ? 99 : p + Math.ceil(Math.random() * 6)));
    }, 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      2600,
    );
    return () => clearInterval(t);
  }, []);

  const handleGearTap = () => {
    const next = taps + 1;
    setTaps(next);
    if (next >= 5 && onDismiss) onDismiss();
  };

  const shownProgress = Math.min(progress, 99);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950 px-4 text-slate-100">
      <style>{`
        @keyframes ms-spin { to { transform: rotate(360deg); } }
        @keyframes ms-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes ms-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes ms-stripes { to { background-position: 40px 0; } }
        @keyframes ms-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
      `}</style>

      {/* soft background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur">
        {/* gears */}
        <div
          className="mx-auto mb-6 flex items-center justify-center gap-1"
          style={{ animation: "ms-float 3s ease-in-out infinite" }}
        >
          <button
            type="button"
            onClick={handleGearTap}
            aria-label="gear"
            className="select-none text-6xl focus:outline-none"
            style={{ animation: "ms-spin 6s linear infinite" }}
          >
            ⚙️
          </button>
          <span
            className="select-none text-4xl"
            style={{ animation: "ms-spin-rev 4s linear infinite" }}
          >
            ⚙️
          </span>
          <span className="select-none text-6xl">🛠️</span>
        </div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-300">
          <span
            className="h-2 w-2 rounded-full bg-amber-400"
            style={{ animation: "ms-blink 1.2s ease-in-out infinite" }}
          />
          Scheduled Maintenance
        </div>

        <h1 className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Sorry {name}! 😔
        </h1>

        <p className="mb-2 text-base text-slate-300 sm:text-lg">
          The system is currently under maintenance.
        </p>
        <p className="mb-6 text-base font-semibold text-indigo-300 sm:text-lg">
          Please call <span className="text-amber-300">{master}</span>, your
          master 👑, so he can fix it himself.
        </p>

        {/* fake progress bar */}
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${shownProgress}%`,
              backgroundImage:
                "linear-gradient(45deg, rgba(255,255,255,.18) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.18) 75%, transparent 75%, transparent)",
              backgroundSize: "40px 40px",
              backgroundColor: "#6366f1",
              animation: "ms-stripes 1s linear infinite",
            }}
          />
        </div>
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>{MESSAGES[msgIdx]}</span>
          <span>{shownProgress}%</span>
        </div>
        {shownProgress >= 99 && (
          <p className="mb-2 text-[11px] italic text-slate-500">
            (stuck at 99% — it only moves when {master} gets involved)
          </p>
        )}

        <button
          type="button"
          onClick={() => setCalled(true)}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-500 active:scale-95"
        >
          📞 Call {master}
        </button>

        {called && (
          <p className="mt-4 text-sm text-emerald-300">
            Calling {master}… he said{" "}
            <span className="font-semibold">
              “have you tried bowing first?”
            </span>{" "}
            🙇
          </p>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-widest text-slate-600">
          Estimated time of recovery: whenever {master} feels like it
        </p>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
