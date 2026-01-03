import React, { useState } from 'react';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing | processing | result
  const [quality, setQuality] = useState(0.5);

  // --- HANDLE UPLOAD & TRANSITION ---
  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    setFiles(selected.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      status: 'ready'
    })));
    
    setStatus('processing');
  };

  return (
    <div className="zyn-app-root">
      {/* STAGE 1: LANDING */}
      {status === 'landing' && (
        <div className="compress-engine-container">
          <div 
            className="dropzone-pro"
            style={{ '--active-color': color }}
            onClick={() => document.getElementById('compress-upload').click()}
          >
            <div className="dropzone-content">
              <div className="liquid-wrapper-centered">
                <div className="liquid-base-sm">
                  <div className="water-layer"></div>
                  <div className="water-layer"></div>
                </div>
                <i className="fa-solid fa-cloud-arrow-up cloud-icon-sm"></i>
              </div>
              <div className="text-stack">
                <h2 className="title-pro">Choose Images</h2>
                <p className="subtitle-pro">Drag and drop or click to optimize your photos</p>
              </div>
            </div>
            <input type="file" id="compress-upload" multiple hidden accept="image/*" onChange={handleUpload} />
          </div>
        </div>
      )}

      {/* STAGE 2: THE WORKBENCH (NEW) */}
      {status === 'processing' && (
        <div className="workbench-layout animate-in">
          
          {/* Main Gallery Area */}
          <div className="workbench-main">
            <div className="batch-header">
                <h3>Queue <span className="badge-count">{files.length}</span></h3>
                <button className="btn-add-small" onClick={() => document.getElementById('compress-upload-more').click()}>
                    <i className="fa-solid fa-plus me-2"></i>Add More
                </button>
                <input type="file" id="compress-upload-more" multiple hidden onChange={(e) => {
                    const newFiles = Array.from(e.target.files).map(file => ({
                        id: Math.random().toString(36).substr(2, 9),
                        file,
                        url: URL.createObjectURL(file),
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        status: 'ready'
                    }));
                    setFiles(prev => [...prev, ...newFiles]);
                }} />
            </div>

            <div class="assets-grid">
              {files.map(f => (
                <div key={f.id} className="asset-card-pro">
                  <div className="asset-img-container">
                    <img src={f.url} alt="preview" />
                  </div>
                  <div className="asset-info">
                    <span className="file-name">{f.name}</span>
                    <span className="file-size">{f.size}</span>
                  </div>
                  <button className="remove-asset" onClick={() => setFiles(files.filter(item => item.id !== f.id))}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Settings */}
          <aside className="workbench-sidebar">
            <div className="sidebar-card shadow-pro">
                <h4 className="fw-bold mb-4">Configuration</h4>
                
                <div className="config-group mb-5">
                    <div className="d-flex justify-content-between mb-3">
                        <label className="label-caps">Compression Strength</label>
                        <span className="text-primary fw-bold">{Math.round((1 - quality) * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="pro-range" />
                    <div class="d-flex justify-content-between mt-2 x-small text-muted fw-bold">
                        <span>ORIGINAL</span>
                        <span>SMALLEST</span>
                    </div>
                </div>

                <button className="btn-execute-pro" style={{background: color}}>
                    START OPTIMIZATION <i class="fa-solid fa-bolt-lightning ms-2"></i>
                </button>
                
                <p className="text-center mt-4 extra-small text-muted fw-bold uppercase">
                    <i class="fa-solid fa-shield-halved me-1"></i> Browser-Only Processing
                </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
