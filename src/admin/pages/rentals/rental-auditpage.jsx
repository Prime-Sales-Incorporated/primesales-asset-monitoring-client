import React from "react";

export default function PrimeTrackAudit() {
  return (
    <div className="dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons text-white">forklift</span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              PrimeTrack <span className="text-primary">Audit</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Asset Management System v2.4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium">Marcus Chen</p>
            <p className="text-xs text-slate-500">Field Auditor ID: #8821</p>
          </div>

          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
            <img
              alt="Auditor Avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpMgKhGNvcarJllIke1D9K2sN_KDWE0ZtvC6Ksga2A99T9fbWu73x9AJx8gh2bGsReLSlKgbY2tNBHVZ4oFwYrcBpnuvKInPLWPrlJHtKh1uirDWTNA5JvUberBP-T91tzJGeWEzs7YLDFeI38pWv1EqbhxHV59tUFXhGjOaCkpflcHs8aSLshmDoJSQm_210NPvrFUJuVeFHOuRtJvtWtkZAMoIrGlTqiiTvStGDm2HwfbdkSlXvifrF6C-0za7UAzcMyy2-VsSU"
            />
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= SIDEBAR ================= */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-card-dark rounded-xl border overflow-hidden shadow-sm sticky top-24">
            {/* Forklift Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Forklift Unit"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCschOMx1B0Fcdmzngw1EFXDTW9jVt4z4aeJZl26mrzeMPtwKkNZF8W04Tb_4_6EMXOYfLBa4xKwtPoIb7bCkKF78XjKRUOI3MAcZ3VosN4IwDODbeEzo3M0sDDx43bkeNHROK4TBZxROFKuGhncFsuxeHIvC-9UFczo4dTUu5C8CydubGBlkQ1a7Z2guahdjxnCRKWQOiLVvyrTu2maAPe0eUOnA7tIN1hf-RIlEVP1TAV_QnE4V1zAzklJpyBeMofYz2B7v9pCWk"
              />

              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                ID: FL-9022
              </div>
            </div>

            {/* Forklift Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-1">Hyster H190-FT</h2>

              <p className="text-slate-500 mb-6 flex items-center gap-2">
                <span className="material-icons text-sm">location_on</span>
                West Warehouse, Bay 14
              </p>

              {/* Details */}
              <div className="space-y-4">
                <InfoRow label="Serial Number" value="A299-X992-K01" mono />
                <InfoRow label="Client Site" value="LogiLink Solutions Ltd." />
                <InfoRow label="Hour Meter" value="1,422.5 hrs" />
                <InfoRow label="Last Audit" value="Oct 12, 2023" warning />
              </div>

              {/* Progress */}
              <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-primary uppercase">
                    Audit Progress
                  </span>
                  <span className="text-xs font-bold text-primary">65%</span>
                </div>

                <div className="w-full bg-primary/20 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-[65%]" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Session Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-card-dark p-6 rounded-xl border shadow-sm">
            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-400 mb-1">
                Current Session
              </h3>
              <p className="text-lg font-bold">
                Standard Quarterly Safety Inspection
              </p>
            </div>

            <div className="flex gap-4">
              <SessionInfo label="Date" value="Jan 18, 2024" />
              <SessionInfo label="Audit ID" value="AUD-7781-B" />
            </div>
          </div>

          {/* Section 1 */}
          <AuditSection
            title="1. Physical Condition"
            icon="precision_manufacturing"
          >
            <AuditItem
              title="Tires & Wheels"
              desc="Check for wear, cracks, loose lug nuts."
            />
            <AuditItem
              title="Forks, Mast & Chains"
              desc="Inspect cracks, bends, lubrication."
              failNote="Minor hydraulic seepage detected on left tilt cylinder."
            />
            <AuditItem
              title="Chassis & Body Panel"
              desc="Check loose parts and capacity plates."
            />
          </AuditSection>

          {/* Section 2 */}
          <AuditSection title="2. Operational Check" icon="settings_suggest">
            <AuditItem
              title="Braking System"
              desc="Service and parking brake performance."
            />
            <AuditItem
              title="Steering Control"
              desc="Smoothness and hydraulic assist response."
            />
          </AuditSection>

          {/* Section 3 */}
          <AuditSection title="3. Safety Features" icon="gpp_maybe">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SafetyCheck label="Horn & Backup Alarm" status="Operational" />
              <SafetyCheck
                label="Strobe & Warning Lights"
                status="Operational"
              />
              <SafetyCheck
                label="Seatbelt & Locking Mechanism"
                status="Operational"
              />
              <SafetyCheck
                label="Fire Extinguisher Present"
                status="Missing / Expired"
                danger
              />
            </div>
          </AuditSection>

          {/* Evidence Photos */}
          <AuditSection title="Unit Evidence Photos" icon="add_a_photo">
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <EvidencePhoto />

                <button className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition">
                  <span className="material-icons text-3xl">
                    add_circle_outline
                  </span>
                  <span className="text-xs font-medium">Add Photo</span>
                </button>
              </div>

              <div className="p-8 border-2 border-dashed rounded-xl text-center">
                <p className="text-sm text-slate-500">
                  Drag and drop documentation or{" "}
                  <span className="text-primary font-semibold cursor-pointer">
                    browse files
                  </span>
                </p>
              </div>
            </div>
          </AuditSection>

          {/* Signature */}
          <AuditSection title="Auditor Signature" icon="draw">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="h-32 bg-slate-50 dark:bg-background-dark/50 border rounded-lg flex items-center justify-center relative">
                  <p className="text-sm font-mono italic opacity-30">
                    Marcus Chen - Digitally Signed
                  </p>
                  <button className="absolute bottom-2 right-2 text-xs text-slate-500 hover:text-primary underline">
                    Clear
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 mt-2 italic">
                  I certify the above inspection is accurate.
                </p>
              </div>

              <div className="flex flex-col justify-end gap-3">
                <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <span className="material-icons">task_alt</span>
                  SUBMIT AUDIT REPORT
                </button>

                <button className="w-full bg-slate-100 dark:bg-white/5 font-semibold py-3 rounded-xl">
                  SAVE PROGRESS AS DRAFT
                </button>
              </div>
            </div>
          </AuditSection>
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-card-dark border-t p-4 flex gap-3 z-50">
        <button className="flex-1 bg-primary text-white font-bold py-3 rounded-lg text-sm">
          SUBMIT AUDIT
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-lg border">
          <span className="material-icons">more_vert</span>
        </button>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function InfoRow({ label, value, mono, warning }) {
  return (
    <div className="flex justify-between border-b pb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-medium ${
          mono ? "font-mono" : ""
        } ${warning ? "text-amber-500" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function SessionInfo({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function AuditSection({ title, icon, children }) {
  return (
    <section className="bg-white dark:bg-card-dark rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 dark:bg-white/5 border-b flex items-center gap-3">
        <span className="material-icons text-primary">{icon}</span>
        <h3 className="font-bold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function AuditItem({ title, desc, failNote }) {
  return (
    <div className="p-6 border-b last:border-0">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>

        {/* Radio Buttons */}
        <div className="flex gap-2">
          <Radio label="Pass" icon="check_circle" />
          <Radio label="Fail" icon="cancel" />
          <Radio label="N/A" icon="block" />
        </div>
      </div>

      <input
        className={`mt-4 w-full rounded-lg text-sm ${
          failNote
            ? "bg-red-50 border-red-200 text-red-600"
            : "bg-slate-50 border-slate-200"
        }`}
        defaultValue={failNote || ""}
        placeholder="Add notes..."
      />
    </div>
  );
}

function Radio({ label, icon }) {
  return (
    <label className="flex items-center gap-1 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium">
      <span className="material-icons text-xs">{icon}</span>
      {label}
    </label>
  );
}

function SafetyCheck({ label, status, danger }) {
  return (
    <label className="flex justify-between p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5">
      <span className="flex gap-3">
        <input type="checkbox" defaultChecked={!danger} />
        <span className="text-sm font-medium">{label}</span>
      </span>

      <span
        className={`text-xs font-bold uppercase ${
          danger ? "text-rose-500" : "text-emerald-500"
        }`}
      >
        {status}
      </span>
    </label>
  );
}

function EvidencePhoto() {
  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border">
      <img
        className="w-full h-full object-cover"
        alt="Evidence"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-VQUQ5fLf8mo-Rq5bH8aQwNUEN0ebRWXHodtHmESxkFWTVstTQt4HDpeDasPObNQI8dzQYRzuK4eh70ysyFLEOuCRaTuwFcJj75SaQwOT2nQ4D4xxSV0cwb7EN6tbEJHLw4wdzgjEQ6uQN3JduYDwtAiCZVj6FWissjiIJvFwsSe1vOlNXhxsBKCJoowswe8t35WXTr3rQJVIHO4zV9clJgjiNYcvpp2nnXgZLVfn-Og1jyXglDyxMzlcFAKUZ0sV6HacBgQ0vhE"
      />

      <button className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
        <span className="material-icons text-sm">close</span>
      </button>
    </div>
  );
}
