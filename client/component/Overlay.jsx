import React from "react";

/**
 * Simple loading indicator for the system.
 */
const Overlay = ({ text }) => (
  <div className="overlay">
    <div className="overlay-text">{text}</div>
  </div>
);

export default Overlay;
