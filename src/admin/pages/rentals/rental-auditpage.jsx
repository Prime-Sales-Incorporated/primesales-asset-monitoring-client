import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../../API";
import Webcam from "react-webcam";
import db from "../../../offline/db";
/*
========================================================
AUDIT STRUCTURE CONFIG (EASY TO MODIFY)
========================================================
*/

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

/*
========================================================
MAIN COMPONENT
========================================================
*/

export default function PrimeTrackAudit() {
  const { serialNumber } = useParams();

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const webcamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [photos, setPhotos] = useState([]);

  const [auditData, setAuditData] = useState({
    items: {},
    signature: "",
    notes: "",
  });

  /*
  ========================================================
  FETCH ASSET
  ========================================================
  */
  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);

      try {
        let data = null;

        if (navigator.onLine) {
          const res = await fetch(
            `${API_BASE_URL}/api/asset/audit/${serialNumber}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          data = await res.json();

          // Save to local cache
          if (data) {
            await db.assets.put(data);
          }
        } else {
          // Offline → load from cache
          data = await db.assets.get(serialNumber);
        }

        setUnit(data);
      } catch (err) {
        console.log("Offline load failed:", err);

        // Final fallback → local cache
        const localData = await db.assets.get(serialNumber);
        setUnit(localData);
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [serialNumber]);

  /*
  ========================================================
  CHECKLIST HANDLER
  ========================================================
  */

  const handleChecklistChange = (section, item, checked) => {
    setAuditData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [section]: {
          ...prev.items[section],
          checklist: {
            ...prev.items[section]?.checklist,
            [item]: checked,
          },
        },
      },
    }));
  };

  const handleNoteChange = (section, note) => {
    setAuditData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [section]: {
          ...prev.items[section],
          note,
        },
      },
    }));
  };

  /*
  ========================================================
  PHOTO CAPTURE + WATERMARK
  ========================================================
  */

  const capturePhoto = () => {
    if (!webcamRef.current) return;

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot({
      width: 1920,
      height: 1440,
    });

    if (!imageSrc) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);

        const locationData = await reverseGeocode(lat, lon);

        const locationText = locationData
          ? `${locationData.city}, ${locationData.province}, ${locationData.country}`
          : "Location unavailable";

        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // ⭐ USE HIGH QUALITY AUDIT STANDARD SIZE
          const targetWidth = 1920;
          const targetHeight = 1440;

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // ⭐ VERY IMPORTANT (Fix Blur)
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw full image to fill canvas (no weird cropping math)
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Watermark
          const now = new Date().toLocaleString();
          const watermarkText = `${now} | ${locationText}`;

          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(0, targetHeight - 80, targetWidth, 80);

          ctx.fillStyle = "white";
          ctx.font = "32px Arial";
          ctx.fillText(watermarkText, 30, targetHeight - 40);

          const finalImage = canvas.toDataURL("image/jpeg", 1.0);

          setPhotos((prev) => [
            ...prev,
            { preview: finalImage, file: finalImage },
          ]);
        };
      },
      () => alert("Location permission required"),
    );
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  /*
  ========================================================
  SUBMIT AUDIT
  ========================================================
  */

  const handleSubmit = async () => {
    if (!auditData.signature) {
      alert("Signature required");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        serialNumber,
        audit: auditData,
        photos,
      };

      const res = await fetch(`${API_BASE_URL}/api/audit/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submit failed");

      alert("Audit submitted successfully");
    } catch (err) {
      console.error(err);
      alert("Submit error");
    } finally {
      setSubmitting(false);
    }
  };

  /*
  ========================================================
  LOADING STATES
  ========================================================
  */

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading audit data...
      </div>
    );

  if (!unit)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Unit not found
      </div>
    );

  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <main className="max-w-[1400px] mx-auto p-6 grid lg:grid-cols-12 gap-6">
        {/* LEFT ASSET INFO */}
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
            </div>
          </div>
        </aside>

        {/* RIGHT AUDIT CONTENT */}
        <div className="lg:col-span-8 space-y-6 ">
          <div className="grid md:grid-cols-1 gap-6">
            {/* AUDIT SECTIONS */}
            {Object.entries(AUDIT_STRUCTURE).map(([section, items]) => (
              <AuditSection key={section} title={section}>
                <div className="p-6 space-y-4 flex flex-col">
                  {items.map((item) => (
                    <label
                      key={item}
                      className="flex gap-3 text-sm dark:text-white"
                    >
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          handleChecklistChange(section, item, e.target.checked)
                        }
                      />
                      {item}
                    </label>
                  ))}

                  <textarea
                    placeholder="Add notes..."
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:text-white"
                    onChange={(e) => handleNoteChange(section, e.target.value)}
                  />
                </div>
              </AuditSection>
            ))}

            {/* PHOTOS */}
            <AuditSection title="Evidence Photos">
              <div className="p-6 space-y-4">
                {!cameraOpen ? (
                  <button
                    onClick={() => setCameraOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
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
                            width: { ideal: 1920 },
                            height: { ideal: 1440 },
                            aspectRatio: 4 / 3,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={capturePhoto}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Capture
                      </button>

                      <button
                        onClick={() => setCameraOpen(false)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg"
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

            {/* SIGNATURE */}
            <AuditSection title="Signature">
              <div className="p-6 space-y-4">
                <input
                  placeholder="Enter full name"
                  className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:text-white"
                  value={auditData.signature}
                  onChange={(e) =>
                    setAuditData({
                      ...auditData,
                      signature: e.target.value,
                    })
                  }
                />

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
                >
                  {submitting ? "Submitting..." : "Submit Audit"}
                </button>
              </div>
            </AuditSection>
          </div>
        </div>
      </main>

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
    </div>
  );
}

/*
========================================================
UI HELPERS
========================================================
*/

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
