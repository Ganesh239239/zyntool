import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#2563eb' }) {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace, finished
  const [quality, setQuality] = useState(0.7); // 0.1 to 1.0
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);

  // --- LOGIC ---

  const handleDrag = (e, active) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(active);
  };

  const onDrop = (e) => {
    handleDrag(e, false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;

    const newEntries = valid.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      origSize: f.size,
      status: 'pending' // pending, done, error
    }));

    setFiles(prev => [...prev, ...newEntries]);
    setViewState('workspace');
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) setViewState('upload');
  };

  const runCompression = async () => {
    setProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    let oldTotal = 0; 
    let newTotal = 0;

    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      oldTotal += item.origSize;
      
      try {
        const opts = { 
          maxSizeMB: 2, 
          maxWidthOrHeight: 2048, 
          useWebWorker: true,
          initialQuality: quality
        };

        const compressed = await imageCompression(item.file, opts);
        newTotal += compressed.size;
        
        zip.file(item.name, compressed);
        
        processedFiles[i].status = 'done';
        processedFiles[i].newSize = compressed.size;
        setFiles([...processedFiles]); 
        
        setProgress(Math.round(((i + 1) / processedFiles.length) * 100));

      } catch (e) {
        console.error(e);
        processedFiles[i].status = 'error';
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    
    setResult({
      url: URL.createObjectURL(blob),
      saved: Math.round(((oldTotal - newTotal) / oldTotal) * 100),
      oldMB: (oldTotal / 1024 / 1024).toFixed(2),
      newMB: (newTotal / 1024 / 1024).toFixed(2)
    });

    setTimeout(() => {
      setProcessing(false);
      setViewState('finished');
    }, 500);
  };

  const reset = () => {
    setFiles([]); setViewState('upload'); setResult(null); setProgress(0);
  };

  // --- HELPERS ---
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="dev-compressor-root" style={{'--accent': color}}>
      <style>{`
        .dev-compressor-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
          max-width: 900px;
          margin: 0 auto;
          color: #111827;
        }

        /* 1. UPLOAD ZONE */
        .upload-zone {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          background: #f9fafb;
          cursor: pointer;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--accent);
          background: #eff6ff;
        }
        .upload-zone i { font-size: 48px; color: #9ca3af; margin-bottom: 16px; transition: 0.2s; }
        .upload-zone:hover i { color: var(--accent); transform: translateY(-5px); }
        .upload-main-text { font-size: 1.25rem; font-weight: 600; color: #374151; }
        .upload-sub-text { font-size: 0.9rem; color: #6b7280; margin-top: 8px; }

        /* 2. WORKSPACE LAYOUT */
        .workspace { 
          margin-top: 20px; 
          background: white; 
          border: 1px solid #e5e7eb; 
          border-radius: 8px; 
          overflow: hidden; /* Keeps children inside rounded corners */
        }
        
        /* SUCCESS BANNER (Moved to Top) */
        .success-banner {
          background: #ecfdf5; 
          border-bottom: 1px solid #d1fae5;
          padding: 24px; 
          text-align: center;
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .stat-row {
          display: flex; justify-content: center; gap: 40px; margin: 16px 0 24px 0;
        }
        .stat h3 { font-size: 0.8rem; text-transform: uppercase; color: #059669; margin: 0 0 4px 0; }
        .stat p { font-size: 1.5rem; font-weight: 700; color: #064e3b; margin: 0; }
        
        .dl-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #059669; color: white;
          padding: 12px 30px; border-radius: 6px; text-decoration: none;
          font-weight: 600; transition: 0.2s;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .dl-btn:hover { background: #047857; transform: translateY(-1px); }

        /* TOOLBAR */
        .toolbar {
          display: flex; gap: 24px; align-items: flex-end; justify-content: space-between;
          padding: 20px; border-bottom: 1px solid #e5e7eb;
          background: #fff;
        }
        
        .slider-group { flex: 1; max-width: 400px; }
        .slider-header {
          display: flex; justify-content: space-between; font-size: 0.85rem; 
          font-weight: 600; text-transform: uppercase; color: #6b7280; margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        
        input[type=range] {
          -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer;
        }
        input[type=range]:focus { outline: none; }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 6px; border-radius: 4px;
          background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--fill-pct), #e5e7eb var(--fill-pct), #e5e7eb 100%);
        }
        input[type=range]::-webkit-slider-thumb {
          height: 20px; width: 20px; border-radius: 50%;
          background: #ffffff; border: 2px solid var(--accent);
          -webkit-appearance: none; margin-top: -7px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.1); }
        
        .tradeoff-labels {
          display: flex; justify-content: space-between; margin-top: 8px;
          font-size: 10px; color: #9ca3af; font-weight: 500;
        }

        .actions { display: flex; gap: 12px; }
        .btn {
          padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; border: 1px solid transparent; transition: 0.2s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-ghost { background: transparent; color: #4b5563; border-color: #d1d5db; }
        .btn-ghost:hover { background: #f3f4f6; color: #111827; }
        .btn-primary { background: #111827; color: white; }
        .btn-primary:hover { background: #000; }
        .btn-primary:disabled { opacity: 0.6; cursor: wait; }

        /* FILE LIST */
        .file-list { border-top: 1px solid #e5e7eb; }
        .list-header {
          display: grid; grid-template-columns: 60px 2fr 1fr 1fr 40px;
          background: #f9fafb; padding: 12px 16px;
          font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        .list-row {
          display: grid; grid-template-columns: 60px 2fr 1fr 1fr 40px;
          align-items: center; padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6; background: white;
          font-size: 0.9rem;
        }
        .list-row:last-child { border-bottom: none; }
        .preview-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; background: #eee; }
        .fname { font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px; }
        .fsize { color: #6b7280; font-family: 'SF Mono', Consolas, monospace; font-size: 0.85rem; }
        .rm-btn {
          background: none; border: none; color: #d1d5db; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .rm-btn:hover { color: #ef4444; }

        /* LOADING BAR */
        .progress-line {
          height: 4px; background: #e5e7eb; width: 100%; position: relative; overflow: hidden;
        }
        .progress-active {
          height: 100%; background: var(--accent); transition: width 0.2s;
        }

        @media (max-width: 600px) {
          .toolbar { flex-direction: column; align-items: stretch; }
          .slider-group { max-width: 100%; }
          .list-header, .list-row { grid-template-columns: 50px 1fr 40px; }
          .list-header > :nth-child(3), .list-header > :nth-child(4),
          .list-row > :nth-child(3), .list-row > :nth-child(4) { display: none; }
        }
      `}</style>

      {/* --- VIEW 1: UPLOAD --- */}
      {viewState === 'upload' && (
        <div 
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <i className="fa-solid fa-cloud-arrow-up"></i>
          <div className="upload-main-text">Click or Drop Images</div>
          <div className="upload-sub-text">Up to 50 files • JPG, PNG, WebP</div>
        </div>
      )}

      {/* --- VIEW 2: WORKSPACE --- */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* 1. SUCCESS BANNER (NOW AT TOP) */}
          {viewState === 'finished' && result && (
            <div className="success-banner">
              <h2 style={{fontSize: '1.5rem', marginBottom:'10px'}}>Optimization Complete</h2>
              <div className="stat-row">
                <div className="stat">
                  <h3>Saved</h3>
                  <p>{result.saved}%</p>
                </div>
                <div className="stat">
                  <h3>Size</h3>
                  <p>{result.newMB} MB</p>
                </div>
              </div>
              <a href={result.url} download="optimized-images.zip" className="dl-btn">
                <i className="fa-solid fa-download"></i> Download ZIP
              </a>
            </div>
          )}
          
          {/* 2. TOOLBAR */}
          <div className="toolbar">
            <div className="slider-group">
              <div className="slider-header">
                <span>Compression Quality</span>
                <span style={{color: color}}>{Math.round(quality * 100)}%</span>
              </div>
              
              <input 
                type="range" min="0.1" max="1.0" step="0.05"
                value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))}
                style={{'--fill-pct': `${((quality - 0.1) / 0.9) * 100}%`}}
                disabled={processing || viewState === 'finished'}
              />
              
              <div className="tradeoff-labels">
                <span>Small Size</span>
                <span>Best Quality</span>
              </div>
            </div>

            <div className="actions">
              {viewState === 'finished' ? (
                <button className="btn btn-ghost" onClick={reset}>
                  <i className="fa-solid fa-rotate-right"></i> Start Over
                </button>
              ) : (
                <>
                  <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()}>
                    + Add
                  </button>
                  <button className="btn btn-primary" onClick={runCompression} disabled={processing}>
                    {processing ? `Processing ${progress}%` : 'Compress Now'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 3. LOADING BAR */}
          {processing && (
            <div className="progress-line">
              <div className="progress-active" style={{width: `${progress}%`}}></div>
            </div>
          )}

          {/* 4. FILE LIST */}
          <div className="file-list">
            <div className="list-header">
              <span>Preview</span>
              <span>Filename</span>
              <span>Original</span>
              <span>New Size</span>
              <span></span>
            </div>
            
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {files.map(f => (
                <div key={f.id} className="list-row">
                  <img src={f.preview} className="preview-thumb" alt="" />
                  <div className="fname" title={f.name}>{f.name}</div>
                  <div className="fsize">{formatBytes(f.origSize)}</div>
                  <div className="fsize" style={{color: f.status==='done' ? '#059669' : ''}}>
                     {f.newSize ? formatBytes(f.newSize) : '—'}
                  </div>
                  <div style={{textAlign: 'center'}}>
                    {f.status === 'done' ? (
                      <i className="fa-solid fa-check" style={{color:'#059669'}}></i>
                    ) : (
                      !processing && (
                        <button className="rm-btn" onClick={() => removeFile(f.id)}>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Input */}
      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
