import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#4f46e5' }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing, processing, working, result
  const [quality, setQuality] = useState(0.6);
  const [results, setResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- HANDLERS ---

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList) => {
    const selected = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (selected.length === 0) return alert("Please select image files.");

    const newFiles = selected.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(0) // KB
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setStatus('processing');
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) setStatus('landing');
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setStatus('working');
    
    // Artificial delay for UI smoothness (optional)
    await new Promise(r => setTimeout(r, 500));

    const zip = new JSZip();
    let totalOldSize = 0;
    let totalNewSize = 0;

    try {
      await Promise.all(files.map(async (item) => {
        totalOldSize += item.file.size;
        
        const options = { 
          maxSizeMB: 1, // Cap at 1MB
          maxWidthOrHeight: 1920,
          initialQuality: quality, 
          useWebWorker: true 
        };
        
        const compressedBlob = await imageCompression(item.file, options);
        totalNewSize += compressedBlob.size;
        zip.file(item.name, compressedBlob);
      }));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      setResults({
        url: URL.createObjectURL(zipBlob),
        savedPercentage: Math.round(((totalOldSize - totalNewSize) / totalOldSize) * 100),
        oldSizeMB: (totalOldSize / 1024 / 1024).toFixed(2),
        newSizeMB: (totalNewSize / 1024 / 1024).toFixed(2),
        count: files.length
      });
      
      setStatus('result');
    } catch (error) {
      console.error(error);
      alert("Something went wrong during compression.");
      setStatus('processing');
    }
  };

  const resetTool = () => {
    setFiles([]);
    setResults(null);
    setStatus('landing');
  };

  // --- RENDER ---

  return (
    <div className="compress-tool-root" style={{ '--theme-color': color }}>
      
      {/* NATIVE CSS STYLES */}
      <style>{`
        .compress-tool-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }

        /* --- ANIMATIONS --- */
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(var(--theme-rgb), 0.7); } 70% { box-shadow: 0 0 0 10px rgba(var(--theme-rgb), 0); } 100% { box-shadow: 0 0 0 0 rgba(var(--theme-rgb), 0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* --- LANDING STATE --- */
        .dropzone {
          background: #ffffff;
          border: 2px dashed #cbd5e1;
          border-radius: 24px;
          padding: 80px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .dropzone:hover, .dropzone.active {
          border-color: var(--theme-color);
          background: #f8fafc;
          transform: scale(1.01);
        }
        .dropzone.active {
          background: #eff6ff;
          border-style: solid;
        }
        .icon-wrapper {
          width: 80px;
          height: 80px;
          background: var(--theme-color);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          font-size: 32px;
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .drop-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
        .drop-desc { color: #64748b; font-size: 1rem; }

        /* --- WORKBENCH (PROCESSING) --- */
        .workbench {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          animation: fade-in 0.4s ease-out;
        }
        .file-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 16px;
          padding: 24px;
          background: #f8fafc;
          max-height: 300px;
          overflow-y: auto;
        }
        .file-card {
          position: relative;
          background: white;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s;
        }
        .file-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .file-thumb {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          background: #eee;
        }
        .file-info { font-size: 0.75rem; color: #64748b; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .remove-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ef4444;
          color: white;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .file-card:hover .remove-btn { opacity: 1; }

        .controls-area {
          padding: 24px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }
        .slider-container { margin-bottom: 24px; }
        .slider-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 600; color: #334155; }
        
        /* Custom Range Slider */
        input[type=range] {
          width: 100%;
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--theme-color);
          cursor: pointer;
          margin-top: -8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #e2e8f0;
          border-radius: 2px;
        }

        .action-row { display: flex; gap: 12px; justify-content: flex-end; }
        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: 0.2s;
          font-size: 1rem;
        }
        .btn-ghost { background: transparent; color: #64748b; }
        .btn-ghost:hover { background: #f1f5f9; color: #1e293b; }
        .btn-primary { 
          background: var(--theme-color); 
          color: white; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          display: flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { filter: brightness(110%); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        /* --- LOADING OVERLAY --- */
        .loading-overlay {
          position: absolute; inset: 0; background: rgba(255,255,255,0.85);
          backdrop-filter: blur(4px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          z-index: 10;
          border-radius: 24px;
        }
        .spinner {
          width: 40px; height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: var(--theme-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        /* --- RESULT CARD --- */
        .result-card {
          background: white;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: fade-in 0.5s ease-out;
        }
        .success-icon {
          width: 64px; height: 64px;
          background: #dcfce7; color: #16a34a;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
          margin: 0 auto 24px;
        }
        .stat-grid {
          display: flex; gap: 20px; justify-content: center;
          margin: 30px 0;
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
        }
        .stat-item h4 { margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 500; }
        .stat-item p { margin: 4px 0 0; color: #0f172a; font-size: 1.5rem; font-weight: 800; }
        .saved-badge { color: var(--theme-color); }
        
        .download-btn {
          display: inline-block;
          background: #0f172a;
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }
        .download-btn:hover { transform: scale(1.05); background: black; }
        
        .restart-link {
          display: block; margin-top: 20px;
          color: #94a3b8; cursor: pointer;
          font-weight: 600; font-size: 0.9rem;
        }
        .restart-link:hover { color: var(--theme-color); }

      `}</style>

      {/* --- STATE 1: LANDING --- */}
      {status === 'landing' && (
        <div 
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="icon-wrapper">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h3 className="drop-title">Upload your Images</h3>
          <p className="drop-desc">Drag & drop or click to browse (JPG, PNG)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            multiple 
            hidden 
            accept="image/*"
          />
        </div>
      )}

      {/* --- STATE 2 & 3: WORKBENCH (PROCESSING & WORKING) --- */}
      {(status === 'processing' || status === 'working') && (
        <div className="workbench">
          {/* File Grid */}
          <div className="file-grid">
            {files.map(f => (
              <div key={f.id} className="file-card">
                <img src={f.url} alt={f.name} className="file-thumb" />
                <div className="file-info">{f.size} KB</div>
                <button className="remove-btn" onClick={() => removeFile(f.id)}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
            {/* Add more button */}
            <div 
              className="file-card" 
              style={{display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', borderStyle:'dashed'}}
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fa-solid fa-plus" style={{color:'#cbd5e1', fontSize:'24px'}}></i>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-area">
            <div className="slider-container">
              <div className="slider-header">
                <span>Compression Level</span>
                <span style={{color: color}}>{Math.round((1 - quality) * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="0.9" 
                step="0.05" 
                value={quality} 
                onChange={(e) => setQuality(parseFloat(e.target.value))} 
              />
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#94a3b8', marginTop:'8px'}}>
                <span>Better Quality</span>
                <span>Smaller Size</span>
              </div>
            </div>

            <div className="action-row">
              <button className="btn btn-ghost" onClick={resetTool}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCompress}>
                Compress {files.length} Images <i className="fa-solid fa-bolt"></i>
              </button>
            </div>
          </div>

          {/* Loading Overlay */}
          {status === 'working' && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <h3 style={{color: '#1e293b', marginBottom: '4px'}}>Optimizing...</h3>
              <p style={{color: '#64748b', fontSize: '0.9rem'}}>Crunching pixels for you</p>
            </div>
          )}
        </div>
      )}

      {/* --- STATE 4: RESULTS --- */}
      {status === 'result' && results && (
        <div className="result-card">
          <div className="success-icon">
            <i className="fa-solid fa-check"></i>
          </div>
          <h2 style={{fontSize:'2rem', marginBottom:'10px', color:'#0f172a'}}>Compression Complete!</h2>
          <p style={{color:'#64748b'}}>Your images are now lighter and faster.</p>

          <div className="stat-grid">
            <div className="stat-item">
              <h4>Original</h4>
              <p>{results.oldSizeMB} MB</p>
            </div>
            <div className="stat-item">
              <h4>New Size</h4>
              <p>{results.newSizeMB} MB</p>
            </div>
            <div className="stat-item">
              <h4 className="saved-badge">Saved</h4>
              <p className="saved-badge">{results.savedPercentage}%</p>
            </div>
          </div>

          <a href={results.url} download="compressed-images.zip" className="download-btn">
            Download ZIP
          </a>
          
          <div className="restart-link" onClick={resetTool}>
            <i className="fa-solid fa-rotate-left"></i> Compress More Images
          </div>
        </div>
      )}
    </div>
  );
}
