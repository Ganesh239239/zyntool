import React, { useState } from 'react';
import './Uploader.css';

export default function Uploader({ onUpload, color }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div className="uploader-portal-wrapper">
      <div 
        className={`liquid-container ${isDragging ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        {/* THE LIQUID CLOUD ANIMATION */}
        <div className="liquid-blob" style={{'--brand-color': color}}>
          <div className="water-wave"></div>
          <div className="water-wave"></div>
          <div className="water-wave"></div>
          <i className="fa-solid fa-cloud-arrow-up cloud-icon"></i>
        </div>

        <div className="text-content">
          <h2 className="title-realistic">Choose Images</h2>
          <p className="subtitle-realistic">Drag & drop your files or click to browse</p>
        </div>

        <input 
          type="file" 
          id="file-input" 
          multiple 
          hidden 
          accept="image/*" 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
}
