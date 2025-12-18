import React from "react";

const Forklift3D = () => {
  return (
    <div>
      <h1>3D Linde Forklift</h1>

      <div
        className="-embed-wrapper"
        style={{ width: "640px", height: "480px" }}
      >
        <iframe
          title=""
          frameBorder="0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          mozAllowFullScreen="true"
          webkitAllowFullScreen="true"
          src="https://sketchfab.com/models/e283a5f6ec8046ffafb72368f625eb4f/embed"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

export default Forklift3D;
