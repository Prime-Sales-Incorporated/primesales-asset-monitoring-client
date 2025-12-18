import React from "react";
import { QrReader } from "react-qr-reader";

export default function CameraTest() {
  const handleScan = (result, error) => {
    if (!!result) console.log("QR:", result?.text);
    if (error) console.warn(error);
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", height: "400px" }}>
      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={handleScan}
        scanDelay={300}
        videoContainerStyle={{ width: "100%", height: "100%" }}
        videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
