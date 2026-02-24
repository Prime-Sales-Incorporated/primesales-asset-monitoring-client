import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../../API";

export default function PrimeTrackAudit() {
  const { serialNumber } = useParams();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [auditData, setAuditData] = useState({
    items: {},
    signature: "",
    notes: "",
  });

  const [photos, setPhotos] = useState([]);

  // FETCH UNIT
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/asset/audit/${serialNumber}`,
        );
        const data = await res.json();
        setUnit(data);
      } catch (err) {
        console.error("Error fetching unit:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [serialNumber]);

  const handleStatusChange = (title, status) => {
    setAuditData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [title]: {
          ...prev.items[title],
          status,
        },
      },
    }));
  };

  const handleNoteChange = (title, note) => {
    setAuditData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [title]: {
          ...prev.items[title],
          note,
        },
      },
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...previews]);
  };

  const handleSubmit = async () => {
    if (!auditData.signature) {
      alert("Signature is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        serialNumber,
        audit: auditData,
      };

      const res = await fetch(`${API_BASE_URL}/api/audit/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submit failed");

      alert("Audit submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error submitting audit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg bg-slate-50 dark:bg-slate-900 dark:text-white">
        Loading audit data...
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg bg-slate-50 dark:bg-slate-900 dark:text-white">
        Unit not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Asset"
                src={unit.image || "https://via.placeholder.com/500"}
              />
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                {unit.assetName}
              </h2>

              <InfoRow label="Serial Number" value={unit.serialNumber} mono />
              <InfoRow label="Category" value={unit.category} />
              <InfoRow label="Status" value={unit.status} />
              <InfoRow
                label="Purchase Date"
                value={
                  unit.purchaseDate
                    ? new Date(unit.purchaseDate).toLocaleDateString()
                    : "-"
                }
              />
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          <AuditSection title="Physical Condition">
            <AuditItem
              title="Tires & Wheels"
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
            <AuditItem
              title="Forks, Mast & Chains"
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
            <AuditItem
              title="Chassis & Body Panel"
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
          </AuditSection>

          <AuditSection title="Operational Check">
            <AuditItem
              title="Braking System"
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
            <AuditItem
              title="Steering Control"
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
          </AuditSection>

          {/* Evidence Photos */}
          <AuditSection title="Evidence Photos">
            <div className="p-6">
              <input
                type="file"
                multiple
                onChange={handlePhotoUpload}
                className="mb-4"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((p, i) => (
                  <img
                    key={i}
                    src={p.preview}
                    alt="preview"
                    className="rounded-lg border"
                  />
                ))}
              </div>
            </div>
          </AuditSection>

          {/* Signature */}
          <AuditSection title="Auditor Signature">
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Type your full name"
                className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:text-white"
                value={auditData.signature}
                onChange={(e) =>
                  setAuditData({ ...auditData, signature: e.target.value })
                }
              />

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg"
              >
                {submitting ? "Submitting..." : "Submit Audit Report"}
              </button>
            </div>
          </AuditSection>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex justify-between border-b pb-3 mb-3 dark:border-slate-700">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-medium dark:text-white ${mono ? "font-mono" : ""}`}
      >
        {value || "-"}
      </span>
    </div>
  );
}

function AuditSection({ title, children }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-b dark:border-slate-700 font-bold dark:text-white">
        {title}
      </div>
      {children}
    </section>
  );
}

function AuditItem({ title, onStatusChange, onNoteChange }) {
  return (
    <div className="p-6 border-b last:border-0 dark:border-slate-700">
      <h4 className="font-semibold mb-3 dark:text-white">{title}</h4>

      <div className="flex gap-6 mb-3 text-sm">
        {["Pass", "Fail", "N/A"].map((status) => (
          <label key={status} className="flex items-center gap-2">
            <input
              type="radio"
              name={title}
              onChange={() => onStatusChange(title, status)}
            />
            {status}
          </label>
        ))}
      </div>

      <textarea
        placeholder="Add notes..."
        className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:text-white"
        onChange={(e) => onNoteChange(title, e.target.value)}
      />
    </div>
  );
}
