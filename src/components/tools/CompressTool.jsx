import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#4f46e5' }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing, idle (files added), working, result
  const [quality, setQuality] = useState(0.6);
  const [resultZip, setResultZip] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  // --- HANDLERS ---
  
  const handleDrag = (e, active) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(active);
  };

  const handleDrop = (e) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        file: f,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(f),
        name: f.name,
        originalSize: f.size,
        compressedSize: null,
        status: 'ready' // ready, done
      }));

    if (newFiles.length === 0) return;

    setFiles(prev => [...prev, ...newFiles]);
    setStatus('idle');
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length - 1 === 0) setStatus('landing');
  };

  const startCompression = async () => {
    setStatus('working');
    setCompressionProgress(0);
    const zip = new JSZip();
    
    // Process files sequentially to show progress
    const processedFiles = [...files];
    let totalOld = 0;
    let totalNew = 0;

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      totalOld += item.originalSize;

      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, initialQuality: quality, useWebWorker: true };
        const compressedBlob = await imageCompression(item.file, options);
        
        // Update individual file status
        processedFiles[i].compressedSize = compressedBlob.size;
        processedFiles[i].status = 'done';
        totalNew += compressedBlob.size;
        
        zip.file(item.name, compressedBlob);
        setFiles([...processedFiles]); // Trigger re-render to show green checkmarks
        
        // Update progress bar
        setCompressionProgress(Math.round(((i + 1) / processedFiles.length) * 100));
        
      } catch (err) {
        console.error("Error compressing " + item.name, err);
      }
    }

    // Generate Zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setResultZip({
      url: URL.createObjectURL(zipBlob),
      oldSize: (totalOld / 1024 / 1024).toFixed(2),
      newSize: (totalNew / 1024 / 1024).toFixed(2),
      saved: Math.round(((totalOld - totalNew) / totalOld) * 100)
    });

    // Small delay to let user see 100% bar
    setTimeout(() => setStatus('result'), 600);
  };

  const reset = () => {
    setFiles([]);
    setResultZip(null);
    setStatus('landing');
    setCompressionProgress(0);
  };

  // --- RENDER ---
  return (
    <div className="tool-container" style={{ '--accent': color }}>
      <style>{`
        /* --- CORE STYLES --- */
        .tool-container {
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 1000px;
          margin: 0 auto;
          color: #1e293b;
        }

        /* --- ANIMATIONS --- */
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-border { 0% { border-color: rgba(var(--accent-rgb), 0.4); } 50% { border-color: var(--accent); } 100% { border-color: rgba(var(--accent-rgb), 0.4); } }
        @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

        /* --- 1. LANDING ZONE --- */
        .drop-zone {
          background: #ffffff;
          border: 3px dashed #e2e8f0;
          border-radius: 32px;
          padding: 80px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .drop-zone:hover, .drop-zone.active {
          border-color: var(--accent);
          background: #f8fafc;
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
        }
        .icon-circle {
          width: 100px; height: 100px;
          background: var(--accent);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 30px;
          color: white; font-size: 40px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        /* --- 2. WORKBENCH (GRID) --- */
        .workbench {
          animation: slideUp 0.4s ease-out;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }
        
        /* HEADER */
        .wb-header {
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
          background: #f8fafc;
        }
        .file-count { font-weight: 700; color: #334155; font-size: 1.1rem; }
        .add-more-btn {
          color: var(--accent); font-weight: 600; cursor: pointer; font-size: 0.9rem;
          display: flex; align-items: center; gap: 6px;
        }

        /* GRID */
        .grid-scroller {
          max-height: 400px; overflow-y: auto; padding: 32px;
          background: #ffffff;
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 20px;
        }
        .img-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #f1f5f9;
          aspect-ratio: 1;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: transform 0.2s;
        }
        .img-card:hover { transform: scale(1.03); }
        .img-card img { width: 100%; height: 100%; object-fit: cover; }
        
        /* CARD OVERLAYS */
        .remove-icon {
          position: absolute; top: 8px; right: 8px;
          background: rgba(0,0,0,0.5); color: white;
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 12px; backdrop-filter: blur(4px);
        }
        .status-badge {
          position: absolute; bottom: 8px; left: 8px; right: 8px;
          background: rgba(255,255,255,0.9);
          padding: 4px 8px; border-radius: 8px;
          font-size: 10px; font-weight: 700; color: #334155;
          display: flex; justify-content: space-between; align-items: center;
          backdrop-filter: blur(4px);
        }
        .check-icon { color: #22c55e; } /* Green check */

        /* CONTROLS FOOTER */
        .wb-footer {
          padding: 24px 32px;
          border-top: 1px solid #e2e8f0;
          display: flex; align-items: center; gap: 30px;
          background: #fff;
        }
        .quality-slider { flex: 1; }
        .slider-label { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #475569; }
        
        input[type=range] {
          width: 100%; -webkit-appearance: none; background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; height: 20px; width: 20px;
          border-radius: 50%; background: var(--accent);
          cursor: pointer; margin-top: -8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px;
        }

        .compress-btn {
          background: #0f172a; color: white; border: none;
          padding: 14px 32px; border-radius: 12px;
          font-weight: 700; font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; gap: 10px;
          transition: all 0.2s;
        }
        .compress-btn:hover { background: var(--accent); transform: translateY(-2px); }
        .compress-btn:disabled { opacity: 0.7; cursor: wait; transform: none; }

        /* --- 3. LOADING OVERLAY --- */
        .scanner-line {
          position: absolute; left: 0; right: 0; height: 2px;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
          animation: scan 1.5s linear infinite;
          z-index: 10;
        }
        .progress-bar-container {
          position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: #e2e8f0;
        }
        .progress-fill {
          height: 100%; background: #22c55e; transition: width 0.3s ease;
        }

        /* --- 4. RESULT --- */
        .result-view {
          text-align: center; animation: slideUp 0.5s ease;
          background: #fff; padding: 60px 40px; border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
        }
        .big-stat {
          font-size: 4rem; font-weight: 900; color: #0f172a;
          line-height: 1; letter-spacing: -2px; margin: 10px 0;
        }
        .stat-label { font-size: 1.25rem; font-weight: 600; color: #64748b; margin-bottom: 40px; }
        
        .download-hero {
          background: var(--accent); color: white;
          padding: 20px 40px; border-radius: 50px;
          font-size: 1.2rem; font-weight: 800; text-decoration: none;
          display: inline-flex; align-items: center; gap: 12px;
          box-shadow: 0 20px 40px -10px rgba(var(--accent-rgb), 0.4);
          transition: transform 0.2s;
        }
        .download-hero:hover { transform: scale(1.05); }

        @media(max-width: 600px) {
          .wb-footer { flex-direction: column; align-items: stretch; }
          .image-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* --- STATE: LANDING --- */}
      {status === 'landing' && (
        <div 
          className={`drop-zone ${isDragging ? 'active' : ''}`}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="icon-circle">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>Bulk Image Compressor</h2>
          <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Drop folder or multiple images here</p>
          <input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={(e) => addFiles(e.target.files)} />
        </div>
      )}

      {/* --- STATE: WORKBENCH (IDLE & WORKING) --- */}
      {(status === 'idle' || status === 'working') && (
        <div className="workbench">
          <div className="wb-header">
            <div className="file-count"><i className="fa-regular fa-images"></i> {files.length} Images Ready</div>
            {status === 'idle' && (
              <div className="add-more-btn" onClick={() => fileInputRef.current.click()}>
                <i className="fa-solid fa-plus-circle"></i> Add More
              </div>
            )}
          </div>

          <div className="grid-scroller">
            <div className="image-grid">
              {files.map((f) => (
                <div key={f.id} className="img-card">
                  <img src={f.preview} alt="preview" />
                  
                  {/* Scanner Effect per card if working */}
                  {status === 'working' && f.status !== 'done' && <div className="scanner-line"></div>}

                  {/* Badges */}
                  <div className="status-badge">
                    <span>{f.status === 'done' ? 'SAVED' : (f.originalSize/1024).toFixed(0) + 'KB'}</span>
                    {f.status === 'done' && <i className="fa-solid fa-check check-icon"></i>}
                  </div>

                  {/* Remove Button (Only in idle) */}
                  {status === 'idle' && (
                    <div className="remove-icon" onClick={() => removeFile(f.id)}>
                      <i className="fa-solid fa-times"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar (Bottom) */}
          {status === 'working' && (
            <div className="progress-bar-container">
              <div className="progress-fill" style={{ width: `${compressionProgress}%` }}></div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="wb-footer">
            <div className="quality-slider">
              <div className="slider-label">
                <span>Compression Strength</span>
                <span style={{color: color}}>{Math.round((1-quality)*100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="0.9" step="0.1" 
                value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} 
                disabled={status === 'working'}
              />
            </div>
            
            <button className="compress-btn" onClick={startCompression} disabled={status === 'working'}>
              {status === 'working' ? (
                 <>Compressing {compressionProgress}%...</>
              ) : (
                 <>Compress All <i className="fa-solid fa-bolt"></i></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- STATE: RESULT --- */}
      {status === 'result' && resultZip && (
        <div className="result-view">
          <div style={{fontSize:'60px', color: '#22c55e', marginBottom:'20px'}}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="big-stat">{resultZip.saved}%</div>
          <div className="stat-label">Size reduced from {resultZip.oldSize}MB to {resultZip.newSize}MB</div>
          
          <a href={resultZip.url} download="compressed_images.zip" className="download-hero">
            <i className="fa-solid fa-download"></i> Download All
          </a>

          <div style={{marginTop: '40px'}}>
             <button onClick={reset} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontWeight:'600'}}>
               Start Over
             </button>
          </div>
        </div>
      )}
      
      {/* Hidden Input for Add More */}
      <input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}
