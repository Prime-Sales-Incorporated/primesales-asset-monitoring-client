import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Webcam from "react-webcam";
import API_BASE_URL from "../../../API";
import db from "../../../offline/db";
import AuditHistoryModal from "./audtmodal";
import { ConfirmDeleteModal } from "./confirmdeletemodal";

/* ========================================
AUDIT STRUCTURE
======================================== */
const AUDIT_STRUCTURE = {
  "General Condition": [
    "Forklift clean, no major leaks",
    "No structural/frame cracks or damage",
    "Overhead guard intact and secure",
  ],
  "Safety Features": [
    "Seatbelt functional",
    "Horn operational",
    "Lights (head, tail, warning) working",
    "Backup alarm functional",
    "Fire extinguisher present & valid",
  ],
  "Controls & Operation": [
    "Steering smooth and responsive",
    "Service brake works properly",
    "Parking brake holds firmly",
    "Accelerator/clutch functional",
    "Hydraulic controls  (lift/tilt/side-shift) working properly",
  ],
  "Mast & Forks": [
    "No cracks, bends or weld defects",
    "Forks equal height, locking pins in place",
    "Mast chains properly lubricated not overstretched",
    "Hydraulic cylinders free of leaks",
  ],
  "Wheels & Tires": [
    "No excessive wear, chunking or cracks",
    "Proper inflation (if pneumatic)",
    "Even tread wear",
  ],
  "Fluids & Power Source": [
    "Engine oil level correct",
    "Hydraulic fluid sufficient",
    "Coolant level",
    "Battery charged / Fuel adequate",
  ],
};

/* ========================================
CUSTOM HOOK
======================================== */
function useAuditForm(AUDIT_STRUCTURE, unitId) {
  const [items, setItems] = useState(() => {
    const init = {};
    Object.keys(AUDIT_STRUCTURE).forEach((section) => {
      init[section] = { checklist: {}, note: "" };
      AUDIT_STRUCTURE[section].forEach((item) => {
        init[section].checklist[item] = false;
      });
    });
    return init;
  });

  const [signature, setSignature] = useState("");
  const [photos, setPhotos] = useState([]); // { preview, file }
  const [uploading, setUploading] = useState(false);

  const toggleItem = (section, item, checked) => {
    setItems((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        checklist: { ...prev[section].checklist, [item]: checked },
      },
    }));
  };

  const updateNote = (section, note) => {
    setItems((prev) => ({
      ...prev,
      [section]: { ...prev[section], note },
    }));
  };

  const addPhoto = (photo) => setPhotos((prev) => [...prev, photo]);
  const removePhoto = (index) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const submitAudit = async () => {
    if (!signature) throw new Error("Signature required");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("serialNumber", unitId);
      formData.append("audit", JSON.stringify({ items, signature }));

      photos.forEach((photo, i) => {
        const blob = dataURLtoBlob(photo.file || photo.preview);
        formData.append("photos", blob, `photo-${i}.jpg`);
      });

      const res = await fetch(`${API_BASE_URL}/api/audit`, {
        method: "POST",
        body: formData, // ✅ no JSON.stringify, no Content-Type
      });

      if (!res.ok) throw new Error("Audit submit failed");
      return await res.json();
    } finally {
      setUploading(false);
    }
  };

  return {
    items,
    toggleItem,
    updateNote,
    photos,
    addPhoto,
    removePhoto,
    signature,
    setSignature,
    uploading,
    submitAudit,
  };
}

/* ========================================
MAIN COMPONENT
======================================== */
export default function PrimeTrackAudit() {
  const { serialNumber } = useParams();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const webcamRef = useRef(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteAuditId, setDeleteAuditId] = useState(null);
  const {
    items,
    toggleItem,
    updateNote,
    photos,
    addPhoto,
    removePhoto,
    signature,
    setSignature,
    uploading,
    submitAudit,
  } = useAuditForm(AUDIT_STRUCTURE, serialNumber);
  const [auditHistory, setAuditHistory] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  /* FETCH UNIT DATA */

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/audit/history/${serialNumber}`,
        );
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setAuditHistory(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [serialNumber]);

  const handleDeleteAudit = async () => {
    if (!deleteAuditId) return;
    try {
      // Call your API
      const res = await fetch(
        `${API_BASE_URL}/api/audit/delete/${deleteAuditId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Delete failed");

      // Remove from local state
      setAuditHistory((prev) => prev.filter((a) => a._id !== deleteAuditId));
      setConfirmDeleteOpen(false);
      setDeleteAuditId(null);
      alert("Audit deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Delete error: " + err.message);
    }
  };

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      try {
        let data = null;
        if (navigator.onLine) {
          const res = await fetch(
            `${API_BASE_URL}/api/asset/audit/${serialNumber}`,
          );
          data = await res.json();
          if (data) await db.assets.put(data);
        } else {
          data = await db.assets.get(serialNumber);
        }
        setUnit(data);
      } catch (err) {
        console.error(err);
        const localData = await db.assets.get(serialNumber);
        setUnit(localData);
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [serialNumber]);

  /* PHOTO CAPTURE */
  const capturePhoto = () => {
    if (!webcamRef.current) return;
    if (!navigator.geolocation) return alert("Geolocation not supported");

    const imageSrc = webcamRef.current.getScreenshot({
      width: 960,
      height: 720,
    }); // smaller
    if (!imageSrc) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const locationData = await reverseGeocode(
          pos.coords.latitude,
          pos.coords.longitude,
        );
        const locationText = locationData
          ? `${locationData.city}, ${locationData.province}, ${locationData.country}`
          : "Location unavailable";

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const targetWidth = 1024;
          const targetHeight = 768;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const now = new Date().toLocaleString();
          const watermarkText = `${now} | ${locationText}`;
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(0, targetHeight - 40, targetWidth, 40);
          ctx.fillStyle = "white";
          ctx.font = "20px Arial";
          ctx.fillText(watermarkText, 10, targetHeight - 15);
          const finalImage = canvas.toDataURL("image/jpeg", 0.4); // reduce to 40% quality
          addPhoto({ preview: finalImage, file: finalImage });
        };
      },
      () => alert("Location permission required"),
    );
  };

  const handleSubmit = async () => {
    try {
      await submitAudit(serialNumber);
      alert("Audit submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Submit error: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  if (!unit)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Unit not found
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <main className="max-w-[1400px] mx-auto p-6 grid lg:grid-cols-12 gap-6">
        {/* LEFT */}
        <aside className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border shadow">
            <img
              src={
                unit.image ||
                "https://image.made-in-china.com/2f0j00ELHcbPShYmzQ/Linde-Forklifts-E30-6ton-Electric-Forklift-Diesel-LPG-Forklift-Trucks-Fork-Lift.webp"
              }
              className="h-48 w-full object-cover"
            />
            <div className="p-6 space-y-2">
              <h2 className="text-2xl font-bold dark:text-white">
                {unit.assetName}
              </h2>
              <InfoRow label="Serial" value={unit.serialNumber} />
              <InfoRow label="Category" value={unit.category} />
              <InfoRow label="Status" value={unit.status} />
              <InfoRow label="Location" value={unit.unitLocation} />
            </div>
          </div>
          <AuditSection title="Audit History">
            <div className="p-6 space-y-3">
              {auditHistory.length === 0 && <p>No previous audits.</p>}
              {auditHistory.map((audit, index) => {
                const date = new Date(audit.createdAt);
                const formattedDate = date.toLocaleDateString();
                const formattedTime = date.toLocaleTimeString();

                return (
                  <div
                    key={index}
                    className="audit-item group flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <button
                      onClick={() => setSelectedAudit(audit)}
                      className="flex flex-col text-left flex-1"
                    >
                      <span className="text-slate-600 font-medium text-sm">
                        {formattedDate}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {formattedTime}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setDeleteAuditId(audit._id);
                        setConfirmDeleteOpen(true);
                      }}
                      className="delete-btn  p-2 bg-red-400 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200 transition-all"
                      title="Delete audit"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </AuditSection>
        </aside>

        {/* RIGHT */}
        <div className="lg:col-span-8 space-y-6">
          {Object.entries(AUDIT_STRUCTURE).map(([section, itemsArr]) => (
            <AuditSection key={section} title={section}>
              <div className="p-6 space-y-4 flex flex-col">
                {itemsArr.map((item) => (
                  <label
                    key={item}
                    className="flex gap-3 text-sm dark:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={items[section]?.checklist[item] || false}
                      onChange={(e) =>
                        toggleItem(section, item, e.target.checked)
                      }
                    />
                    {item}
                  </label>
                ))}
                <textarea
                  placeholder="Add notes..."
                  className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:text-white"
                  value={items[section]?.note || ""}
                  onChange={(e) => updateNote(section, e.target.value)}
                />
              </div>
            </AuditSection>
          ))}

          <AuditSection title="Evidence Photos">
            <div className="p-6 space-y-4">
              {!cameraOpen ? (
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => setCameraOpen(true)}
                >
                  Open Camera
                </button>
              ) : (
                <>
                  <div className="w-full flex justify-center">
                    <div className="w-full max-w-[480px] aspect-[4/3] overflow-hidden rounded-lg">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                        videoConstraints={{
                          facingMode: "environment",
                          width: 1920,
                          height: 1440,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                      onClick={capturePhoto}
                    >
                      Capture
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => setCameraOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img
                      src={p.preview}
                      className="rounded-lg cursor-pointer border"
                      onClick={() => setSelectedPhoto(p.preview)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(i);
                      }}
                      className="absolute top-2 right-2 bg-gray-600 text-white w-6 h-6 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </AuditSection>

          <AuditSection title="Signature">
            <div className="p-6 space-y-4">
              <input
                placeholder="Enter full name"
                className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:text-white"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
              <button
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
                onClick={handleSubmit}
              >
                {uploading ? "Submitting..." : "Submit Audit"}
              </button>
            </div>
          </AuditSection>
        </div>
      </main>
      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteAudit}
        message="Are you sure you want to delete this audit history?"
      />
      {/* PHOTO MODAL */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            className="max-h-[90%] max-w-[90%] rounded-lg"
          />
        </div>
      )}
      {selectedAudit && (
        <AuditHistoryModal
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
        />
      )}
    </div>
  );
}

/* ========================================
HELPERS
======================================== */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm border-b pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium dark:text-white">{value || "-"}</span>
    </div>
  );
}

function AuditSection({ title, children }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-xl border shadow overflow-hidden">
      <div className="px-6 py-3 bg-slate-100 dark:bg-slate-900 font-bold dark:text-white">
        {title}
      </div>
      {children}
    </section>
  );
}

const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    );
    const data = await res.json();
    return {
      city:
        data.address.city || data.address.town || data.address.village || "",
      province: data.address.state || data.address.region || "",
      country: data.address.country || "",
    };
  } catch (err) {
    console.error("Reverse geocode failed", err);
    return null;
  }
};
