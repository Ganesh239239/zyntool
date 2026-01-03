import React, { useState } from 'react';
import './CompressTool.css';

export default function CompressTool({ color, toolName }) {
  const [isDragging, setIsDragging] = useState(false);

  // Future logic for Step 2 will go here
  const handleFiles = (files) => {
    console.log("Files received for compression:", files);
    // Transition to workspace will happen in the next step
  };

  const onDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setIsAttachmentsDragging(true);
    else setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="compress-engine-init">
      <div 
        className={`liquid-portal ${isDragging ? 'active' : ''}`}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        onClick={() => document.getElementById('compress-upload').click()}
      >
        {/* THE LIQUID CLOUD ICON */}
        <div class="liquid-wrapper" style={{ '--tool-color': color }}>
          <div class="liquid-base">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
          <i class="fa-solid fa-cloud-arrow-up cloud-icon"></i>
        </div>

        <div class="portal-text">
          <h2 class="title">Optimize Your Images</h2>
          <p class="subtitle">Drag & drop or click to shrink your images with ZynEngine v5</p>
          
          <div class="specs-bar">
             <span>JPG</span> • <span>PNG</span> • <span>WEBP</span>
          </div>
        </div>

        <input 
          type="file" 
          id="compress-upload" 
          multiple 
          hidden 
          accept="image/*" 
          onChange={(e) => handleFiles(Array.from(e.target.files))} 
        />
      </div>
    </div>
  );
}
