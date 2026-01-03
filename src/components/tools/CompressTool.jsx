import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#4f46e5' }) {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); 
  const [quality, setQuality] = useState(0.75);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
      status: 'pending' 
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
    let oldTotal = 0; let newTotal = 0;
    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      oldTotal += item.origSize;
      try {
        const opts = { maxSizeMB: 2, maxWidthOrHeight: 2048, useWebWorker: true, initialQuality: quality };
        const compressed = await imageCompression(item.file, opts);
        newTotal += compressed.size;
        zip.file(item.name, compressed);
        processedFiles[i].status = 'done';
        processedFiles[i].newSize = compressed.size;
        setFiles([...processedFiles]); 
        setProgress(Math.round(((i + 1) / processedFiles.length) * 100));
      } catch (e) { console.error(e); }
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

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); setProgress(0); };
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  return (
    <div className="compress-root" style={{'--theme': color}}>
      <style>{`
        .compress-root {
          font-family: 'Inter', -apple-system, sans-serif;
          max-width: 950px; margin: 0 auto; color: #1e293b;
        }

        /* --- 1. PREMIUM UPLOAD BOX --- */
        .upload-wrapper {
          position: relative;
          height: 360px;
          border-radius: 32px;
          background: #ffffff;
          /* Subtle Mesh Gradient Background */
          background-image: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,0) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,0) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,0) 0, transparent 50%);
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 
            0 20px 40px -20px rgba(0,0,0,0.1),
            0 0 0 1px rgba(255,255,255,0.5) inset;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Interactive Hover State */
        .upload-wrapper:hover, .upload-wrapper.drag {
          border-color: var(--theme);
          box-shadow: 0 30px 60px -15px rgba(var(--theme), 0.15);
          transform: translateY(-4px);
        }

        /* REALISTIC WATER ICON */
        .water-container {
          width: 120px; height: 120px;
          border-radius: 50%;
          background: #e0f2fe; /* Light Blue Base */
          position: relative; overflow: hidden;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.1), 0 15px 30px rgba(59, 130, 246, 0.2);
          margin-bottom: 24px;
          border: 4px solid #fff;
          z-index: 10;
        }
        
        .water-wave {
          position: absolute; bottom: 0; left: 0; width: 200%; height: 200%;
          background: var(--theme); 
          border-radius: 40%;
          opacity: 0.4;
          margin-left: -50%; margin-bottom: -60%;
          animation: spin 8s linear infinite;
        }
        .water-wave:nth-child(2) { opacity: 0.6; margin-bottom: -65%; animation-duration: 10s; }
        .water-wave:nth-child(3) { opacity: 0.9; margin-bottom: -70%; animation-duration: 6s; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .upload-icon-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 40px; text-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 20;
        }

        .hero-text { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; letter-spacing: -0.5px; }
        .sub-text { font-size: 1rem; color: #64748b; font-weight: 500; }
        .badge { 
          margin-top: 16px; background: #f1f5f9; padding: 6px 16px; 
          border-radius: 20px; font-size: 0.8rem; font-weight: 700; color: #475569; letter-spacing: 0.5px;
        }

        /* --- 2. PREMIUM SLIDER --- */
        .controls-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 24px 32px; margin-bottom: 24px;
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.05);
          display: flex; align-items: center; gap: 40px;
        }
        
        .slider-section { flex: 1; }
        .slider-top { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .slider-title { font-weight: 700; font-size: 0.95rem; color: #334155; }
        .slider-value { 
          font-family: 'SF Mono', Consolas, monospace; 
          background: #eff6ff; color: var(--theme); padding: 4px 10px; 
          border-radius: 6px; font-weight: 700; font-size: 0.9rem;
        }

        /* CUSTOM RANGE INPUT */
        input[type=range] {
          -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer;
        }
        /* Track */
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 10px; background: #e2e8f0; border-radius: 10px;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }
        /* Thumb (The Circle) */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 26px; width: 26px; border-radius: 50%;
          background: white; border: 2px solid #cbd5e1;
          margin-top: -8px; /* Centers thumb */
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s, border-color 0.2s;
        }
        input[type=range]:hover::-webkit-slider-thumb {
          transform: scale(1.1); border-color: var(--theme);
        }
        /* Dynamic Fill Hack for Chrome/Safari */
        input[type=range] {
          background: linear-gradient(90deg, var(--theme) var(--percent), transparent var(--percent));
          background-size: 100% 10px;
          background-repeat: no-repeat;
          background-position: center;
        }

        /* ACTION BUTTONS */
        .btn-group { display: flex; gap: 12px; }
        .btn { padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: none; transition: 0.2s; }
        .btn-ghost { background: transparent; color: #64748b; }
        .btn-ghost:hover { background: #f8fafc; color: #0f172a; }
        .btn-primary { 
          background: #0f172a; color: white; 
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
          display: flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { background: black; transform: translateY(-2px); }
        .btn-primary:disabled { opacity: 0.7; transform: none; cursor: wait; }

        /* --- 3. RESULTS & TABLE (Minimalist) --- */
        .success-banner {
          background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 16px;
          padding: 20px; margin-bottom: 24px; text-align: center;
          animation: slideDown 0.4s ease;
        }
        @keyframes slideDown { from{opacity:0; transform:translateY(-10px)} to{opacity:1; transform:translateY(0)}}
        
        .dl-link { 
          display: inline-block; margin-top: 12px; 
          background: #059669; color: white; padding: 12px 32px; 
          border-radius: 50px; font-weight: 700; text-decoration: none;
          box-shadow: 0 4px 10px rgba(5,150,105,0.3);
        }

        .file-list { background: white; border-radius: 16px; border: 1px solid #f1f5f9; overflow: hidden; }
        .file-row { display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #f8fafc; }
        .file-row:last-child { border-bottom: none; }
        .file-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; margin-right: 16px; background: #f1f5f9; }
        .file-info { flex: 1; }
        .file-name { font-weight: 600; color: #334155; font-size: 0.9rem; }
        .file-meta { font-size: 0.8rem; color: #94a3b8; margin-top: 2px; }
        .file-status { font-weight: 700; font-size: 0.9rem; color: #10b981; }

        @media(max-width: 600px) {
          .controls-card { flex-direction: column; align-items: stretch; gap: 20px; }
        }
      `}</style>

      {/* VIEW 1: PREMIUM UPLOAD */}
      {viewState === 'upload' && (
        <div 
          className={`upload-wrapper ${isDragging ? 'drag' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="water-container">
            <div className="water-wave"></div>
            <div className="water-wave"></div>
            <div className="water-wave"></div>
            <div className="upload-icon-overlay">
              <i className="fa-solid fa-arrow-up-from-bracket"></i>
            </div>
          </div>
          
          <div className="hero-text">Upload Images</div>
          <div className="sub-text">We compress, you save space.</div>
          <div className="badge">JPG • PNG • WEBP</div>
        </div>
      )}

      {/* VIEW 2: WORKSPACE */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* SUCCESS BANNER (TOP) */}
          {viewState === 'finished' && result && (
            <div className="success-banner">
              <h2 style={{margin:'0 0 5px 0', fontSize:'1.2rem', color:'#065f46'}}>Compression Successful!</h2>
              <div style={{fontSize:'2rem', fontWeight:'800', color:'#047857'}}>{result.saved}% Saved</div>
              <p style={{margin:'5px 0 0 0', color:'#064e3b', fontSize:'0.9rem'}}>Reduced from {result.oldMB}MB to {result.newMB}MB</p>
              <a href={result.url} download="optimized-images.zip" className="dl-link">
                Download All Images
              </a>
              <div style={{marginTop:'15px'}}>
                <button onClick={reset} style={{background:'none', border:'none', color:'#6b7280', fontSize:'0.85rem', fontWeight:'600', cursor:'pointer'}}>Start Over</button>
              </div>
            </div>
          )}

          {/* CONTROLS CARD */}
          <div className="controls-card">
            <div className="slider-section">
              <div className="slider-top">
                <span className="slider-title">Image Quality</span>
                <span className="slider-value">{Math.round(quality * 100)}%</span>
              </div>
              
              {/* STYLE FIX: We use inline style for the dynamic gradient percentage */}
              <input 
                type="range" 
                min="0.1" max="1.0" step="0.05"
                value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))}
                style={{ '--percent': `${((quality - 0.1) / 0.9) * 100}%` }}
                disabled={processing || viewState === 'finished'}
              />
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'#94a3b8', marginTop:'8px', fontWeight:'500'}}>
                <span>Smaller Size</span>
                <span>Better Quality</span>
              </div>
            </div>

            <div className="btn-group">
               {viewState !== 'finished' && (
                 <>
                   <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()}>+ Add</button>
                   <button className="btn btn-primary" onClick={runCompression} disabled={processing}>
                     {processing ? 'Processing...' : 'Compress'} 
                     {!processing && <i className="fa-solid fa-bolt"></i>}
                   </button>
                 </>
               )}
            </div>
          </div>

          {/* FILE LIST */}
          <div className="file-list">
             {files.map(f => (
               <div key={f.id} className="file-row">
                 <img src={f.preview} className="file-thumb" alt="" />
                 <div className="file-info">
                   <div className="file-name">{f.name}</div>
                   <div className="file-meta">
                     {formatBytes(f.origSize)} 
                     {f.newSize && <span style={{color:'#10b981'}}> → {formatBytes(f.newSize)}</span>}
                   </div>
                 </div>
                 <div className="file-action">
                   {f.status === 'done' ? (
                     <div className="file-status"><i className="fa-solid fa-circle-check"></i></div>
                   ) : (
                     !processing && (
                       <i className="fa-solid fa-trash" style={{color:'#cbd5e1', cursor:'pointer'}} onClick={() => removeFile(f.id)}></i>
                     )
                   )}
                 </div>
               </div>
             ))}
          </div>

        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
