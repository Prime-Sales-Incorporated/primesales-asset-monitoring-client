import { useState } from "react";
import API_BASE_URL from "../../API";
export function useAuditForm(AUDIT_STRUCTURE, unitId) {
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
  const [photos, setPhotos] = useState([]);

  // Toggle checkbox
  const toggleItem = (section, item, checked) => {
    setItems((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        checklist: { ...prev[section].checklist, [item]: checked },
      },
    }));
  };

  // Update note
  const updateNote = (section, note) => {
    setItems((prev) => ({
      ...prev,
      [section]: { ...prev[section], note },
    }));
  };

  // Add / remove photos
  const addPhoto = (photo) => setPhotos((prev) => [...prev, photo]);
  const removePhoto = (index) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  // Submit audit
  const submitAudit = async () => {
    if (!signature) throw new Error("Signature required");

    const payload = {
      assetId: unitId,
      inspectorName: signature,
      items,
      photos: photos.map((p) => p.file || p.preview),
    };

    const res = await fetch(`${API_BASE_URL}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Submit failed");
    return await res.json();
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
    submitAudit,
  };
}
