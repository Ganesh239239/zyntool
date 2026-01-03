import React, { useState } from 'react';
import './CompressTool.css';

export default function CompressTool({ color, toolName }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    console.log("Processing files...", files);
    // Transition to workspace will follow in Step 2
  };

  const onDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="compress-engine-container">
      {/* THE DASHED DROPZONE */}
      <div 
        className={`dropzone-pro ${isDragging ? 'drag-active' : ''}`}
        style={{ '--active-color': color }}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        onClick={() => document.getElementById('compress-upload').click()}
      >
        <div className="dropzone-content">
          {/* REDUCED LIQUID CLOUD ICON */}
          <div className="liquid-wrapper-sm">
            <div className="liquid-base-sm">
              <div className="water-layer"></div>
              <div className="water-layer"></div>
            </div>
            <i className="fa-solid fa-cloud-arrow-up cloud-icon-sm"></i>
          </div>

          <div className="text-stack">
            <h2 className="title-pro">Choose Images</h2>
            <p className="subtitle-pro">Drag and drop or click to optimize your photos</p>
            
            <div className="badge-row">
               <span className="file-badge">JPG</span>
               <span className="file-badge">PNG</span>
               <span className="file-badge">WEBP</span>
            </div>
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
