import React from "react";
import "./SkeletonLoader.css";

const SkeletonLoader = ({ width, height, style, borderRadius = "8px" }) => (
  <div 
    className="skeleton-loader" 
    style={{ 
      width, 
      height, 
      borderRadius,
      ...style 
    }} 
  />
);

export default SkeletonLoader;