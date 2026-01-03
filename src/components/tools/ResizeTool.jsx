import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export default function ResizeToolZen({ color = '#3b82f6' }) {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); 
  const [resizeMode, setResizeMode] = useState('pixels'); // pixels, percentage, social
  
  // Settings
  const [targetW, setTargetW] = useState('');
  const [targetH, setTargetH] = useState('');
  const [percentage, setPercentage] = useState(50);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [format, setFormat] = useState('original');
  const [socialPreset, setSocialPreset] = useState('ig-post');

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- PRESETS CONFIG ---
  const socialPresets = {
    'ig-post': { w: 1080, h: 1080, label: 'Instagram Post' },
    'ig-story': { w: 1080, h: 1920, label: 'Instagram Story' },
    'fb-cover': { w: 820, h: 312, label: 'Facebook Cover' },
    'yt-thumb': { w: 1280, h: 720, label: 'YouTube Thumbnail' },
    'twitter': { w: 1500, h: 500, label: 'Twitter Header' }
  };

  // --- LOGIC ---

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;

    // Load first image to set defaults
    const img = new Image();
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      setAspectRatio(w / h);
      setTargetW(w);
      setTargetH(h);
      
      const newEntries = valid.map(f => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        origW: w, // Note: In batch, this usually varies, but for UI simplicty we track logic globally or per file. 
        // For a true batch resize tool, calculating per-file preview requires reading all.
        // We will simplify by showing "Target" based on mode.
        size: f.size
      }));
      setFiles(prev => [...prev, ...newEntries]);
      setViewState('workspace');
    };
    img.src = URL.createObjectURL(valid[0]);
  };

  const handleDrag = (e, active) => { e.preventDefault(); e.stopPropagation(); setIsDragging(active); };
  const onDrop = (e) => { handleDrag(e, false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); };

  // --- CALCULATIONS ---
  
  // Update inputs when Pixels change
  const handlePixelChange = (dim, val) => {
    const v = Number(val);
    if (dim === 'w') {
      setTargetW(v);
      if (lockAspect && v > 0) setTargetH(Math.round(v / aspectRatio));
    } else {
      setTargetH(v);
      if (lockAspect && v > 0) setTargetW(Math.round(v * aspectRatio));
    }
  };

  // Run the resize
  const processResize = async () => {
    setProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    let done = 0;

    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      
      // Determine final dimensions per file
      let finalW, finalH;
      
      // We need to load each image to know its specific aspect ratio if we are doing percentage
      // OR if we are doing pixels but "Lock Aspect" is on and images have different ratios.
      // For this user-friendly version, we will load the image to be precise.
      
      const img = await loadImage(item.file);
      const imgRatio = img.width / img.height;

      if (resizeMode === 'percentage') {
        finalW = Math.round(img.width * (percentage / 100));
        finalH = Math.round(img.height * (percentage / 100));
      } else if (resizeMode === 'social') {
        finalW = socialPresets[socialPreset].w;
        finalH = socialPresets[socialPreset].h;
        // Social usually implies cropping or stretching, but here we force fit for simplicity 
        // or user might want "Fit within". We will force dimensions for exact match.
      } else {
        // Pixels mode
        finalW = targetW;
        finalH = lockAspect ? Math.round(targetW / imgRatio) : targetH;
      }

      try {
        const blob = await resizeCanvas(img, finalW, finalH, format);
        
        let newName = item.name;
        if (format !== 'original') {
          newName = newName.substring(0, newName.lastIndexOf('.')) + '.' + format.split('/')[1];
        }

        zip.file(newName, blob);
        done++;
        setProgress(Math.round((done / files.length) * 100));
      } catch (e) { console.error(e); }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setResult({
      url: URL.createObjectURL(content),
      count: files.length,
      mode: resizeMode
    });
    
    setTimeout(() => { setProcessing(false); setViewState('finished'); }, 500);
  };

  const loadImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(file);
    });
  };

  const resizeCanvas = (img, w, h, fmt) => {
    return new Promise(resolve => {
      const cvs = document.createElement('canvas');
      cvs.width = w; cvs.height = h;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      // Determine Mime
      // If format is original, we try to guess from src or default to jpeg
      let mime = fmt === 'original' ? 'image/jpeg' : fmt; 
      cvs.toBlob(resolve, mime, 0.9);
    });
  };

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); setProgress(0); };

  return (
    <div className="zen-tool" style={{'--primary': color}}>
      <style>{`
        .zen-tool {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 1000px; margin: 0 auto;
          color: #1f2937;
        }

        /* --- 1. MODERN UPLOAD (Clean & Big) --- */
        .upload-hero {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
          height: 400px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .upload-hero:hover, .upload-hero.drag {
          transform: translateY(-5px);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.1);
          border-color: var(--primary);
        }
        .hero-icon-circle {
          width: 90px; height: 90px; background: #eff6ff;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px; color: var(--primary); font-size: 36px;
        }
        .hero-title { font-size: 1.8rem; font-weight: 800; color: #111827; letter-spacing: -0.5px; }
        .hero-sub { color: #6b7280; margin-top: 8px; font-size: 1.1rem; }
        .hero-btn {
          margin-top: 30px; background: #111827; color: white;
          padding: 14px 32px; border-radius: 50px; font-weight: 600;
        }

        /* --- 2. WORKSPACE GRID --- */
        .workspace {
          display: grid; grid-template-columns: 1fr 340px; gap: 30px;
          animation: fadeUp 0.5s ease;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* LEFT: File Manager */
        .file-manager {
          background: white; border-radius: 20px;
          border: 1px solid #e5e7eb; overflow: hidden;
          display: flex; flex-direction: column; height: 600px;
        }
        .fm-header {
          padding: 20px 24px; border-bottom: 1px solid #f3f4f6;
          display: flex; justify-content: space-between; align-items: center;
        }
        .fm-title { font-weight: 700; color: #374151; font-size: 0.95rem; }
        .add-btn { color: var(--primary); cursor: pointer; font-weight: 600; font-size: 0.9rem; background: none; border: none; }
        
        .file-scroller { flex: 1; overflow-y: auto; padding: 10px; background: #f9fafb; }
        .file-item {
          display: flex; align-items: center; padding: 12px;
          background: white; border-radius: 12px; margin-bottom: 10px;
          border: 1px solid #f3f4f6; transition: 0.2s;
        }
        .file-item:hover { transform: scale(1.01); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .f-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background: #eee; margin-right: 16px; }
        .f-info { flex: 1; min-width: 0; }
        .f-name { font-weight: 600; font-size: 0.9rem; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .f-meta { font-size: 0.75rem; color: #9ca3af; margin-top: 4px; display: flex; gap: 8px; align-items: center; }
        .arrow-right { color: var(--primary); font-size: 10px; }
        .f-remove { 
          width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: #d1d5db; cursor: pointer; transition: 0.2s;
        }
        .f-remove:hover { background: #fee2e2; color: #ef4444; }

        /* RIGHT: Control Panel */
        .controls {
          background: white; border-radius: 20px;
          border: 1px solid #e5e7eb; padding: 24px;
          display: flex; flex-direction: column; height: fit-content;
        }
        
        /* TABS (Segmented Control) */
        .tabs {
          display: flex; background: #f3f4f6; padding: 4px; border-radius: 10px; margin-bottom: 24px;
        }
        .tab {
          flex: 1; text-align: center; padding: 10px; font-size: 0.85rem; font-weight: 600;
          color: #6b7280; cursor: pointer; border-radius: 8px; transition: 0.2s;
        }
        .tab.active { background: white; color: #111827; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        /* INPUTS */
        .section-label { font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; display: block; }
        .input-row { display: flex; gap: 10px; margin-bottom: 20px; }
        
        .clean-input {
          width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e5e7eb;
          font-size: 1rem; font-weight: 600; color: #111;
        }
        .clean-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        
        .toggle-icon {
          width: 48px; display: flex; align-items: center; justify-content: center;
          border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer; color: #9ca3af;
        }
        .toggle-icon.active { background: #eff6ff; color: var(--primary); border-color: var(--primary); }

        .preset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .preset-card {
          padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer;
          transition: 0.2s;
        }
        .preset-card:hover { border-color: #d1d5db; background: #f9fafb; }
        .preset-card.selected { border-color: var(--primary); background: #eff6ff; color: var(--primary); }
        .p-icon { font-size: 18px; margin-bottom: 6px; }
        .p-name { font-size: 0.8rem; font-weight: 600; }
        .p-dims { font-size: 0.7rem; opacity: 0.7; }

        .action-btn {
          width: 100%; padding: 18px; border-radius: 12px;
          background: #111827; color: white; font-weight: 700; font-size: 1.05rem;
          border: none; cursor: pointer; transition: 0.2s;
          display: flex; justify-content: center; align-items: center; gap: 10px;
        }
        .action-btn:hover { background: black; transform: translateY(-2px); }
        .action-btn:disabled { opacity: 0.7; transform: none; cursor: wait; }

        /* RESULT OVERLAY */
        .result-modal {
          grid-column: span 2; background: #f0fdf4; border: 1px solid #dcfce7;
          border-radius: 20px; padding: 60px; text-align: center;
        }
        .confetti-icon {
          width: 80px; height: 80px; background: #22c55e; color: white; border-radius: 50%;
          font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;
        }

        @media (max-width: 800px) {
          .workspace { grid-template-columns: 1fr; }
          .file-manager { height: 400px; }
        }
      `}</style>

      {/* VIEW 1: UPLOAD */}
      {viewState === 'upload' && (
        <div 
          className={`upload-hero ${isDragging ? 'drag' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="hero-icon-circle">
            <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
          </div>
          <div className="hero-title">Resize Images</div>
          <div className="hero-sub">The simplest way to resize for web & social</div>
          <button className="hero-btn">Select Images</button>
        </div>
      )}

      {/* VIEW 2: WORKSPACE */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* RESULT STATE OVERRIDE */}
          {viewState === 'finished' && result ? (
            <div className="result-modal">
              <div className="confetti-icon"><i className="fa-solid fa-check"></i></div>
              <h2 style={{fontSize:'2rem', marginBottom:'10px', color:'#14532d'}}>All Done!</h2>
              <p style={{color:'#166534', marginBottom:'30px'}}>Your {result.count} images are ready to use.</p>
              
              <a href={result.url} download="resized.zip" className="action-btn" style={{maxWidth:'300px', margin:'0 auto', background:'#16a34a'}}>
                Download ZIP
              </a>
              <button onClick={reset} style={{marginTop:'20px', background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontWeight:'600'}}>
                Resize More
              </button>
            </div>
          ) : (
            <>
              {/* LEFT: FILE LIST */}
              <div className="file-manager">
                <div className="fm-header">
                  <span className="fm-title">{files.length} Images</span>
                  <button className="add-btn" onClick={() => fileInputRef.current.click()}>+ Add More</button>
                </div>
                <div className="file-scroller">
                  {files.map(f => (
                    <div key={f.id} className="file-item">
                      <img src={f.preview} className="f-thumb" alt="" />
                      <div className="f-info">
                        <div className="f-name">{f.name}</div>
                        <div className="f-meta">
                          {/* Live Preview Calculation */}
                          {resizeMode === 'pixels' && `${targetW} × ${targetH}`}
                          {resizeMode === 'percentage' && `${percentage}% size`}
                          {resizeMode === 'social' && socialPresets[socialPreset].label}
                        </div>
                      </div>
                      <div className="f-remove" onClick={() => setFiles(files.filter(x => x.id !== f.id))}>
                        <i className="fa-solid fa-xmark"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: SETTINGS */}
              <div className="controls">
                
                {/* TABS */}
                <div className="tabs">
                  <div className={`tab ${resizeMode === 'pixels' ? 'active' : ''}`} onClick={() => setResizeMode('pixels')}>Pixels</div>
                  <div className={`tab ${resizeMode === 'percentage' ? 'active' : ''}`} onClick={() => setResizeMode('percentage')}>%</div>
                  <div className={`tab ${resizeMode === 'social' ? 'active' : ''}`} onClick={() => setResizeMode('social')}>Social</div>
                </div>

                {/* PIXELS MODE */}
                {resizeMode === 'pixels' && (
                  <div className="animate-fade">
                    <span className="section-label">Target Dimensions</span>
                    <div className="input-row">
                      <input type="number" className="clean-input" placeholder="W" value={targetW} onChange={e => handlePixelChange('w', e.target.value)} />
                      <div className={`toggle-icon ${lockAspect ? 'active' : ''}`} onClick={() => setLockAspect(!lockAspect)}>
                        <i className={`fa-solid ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
                      </div>
                      <input type="number" className="clean-input" placeholder="H" value={targetH} onChange={e => handlePixelChange('h', e.target.value)} />
                    </div>
                  </div>
                )}

                {/* PERCENTAGE MODE */}
                {resizeMode === 'percentage' && (
                  <div className="animate-fade">
                    <span className="section-label">Scale By</span>
                    <div className="input-row">
                      <input type="range" style={{width:'100%', accentColor:color}} min="10" max="200" value={percentage} onChange={e => setPercentage(e.target.value)} />
                    </div>
                    <div style={{textAlign:'center', fontWeight:'800', fontSize:'1.5rem', marginBottom:'20px'}}>
                      {percentage}%
                    </div>
                    <div className="preset-grid">
                      {[25, 50, 75].map(p => (
                        <div key={p} className="preset-card" onClick={() => setPercentage(p)} style={{textAlign:'center'}}>
                          {p}%
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SOCIAL MODE (USER FRIENDLY MAGIC) */}
                {resizeMode === 'social' && (
                  <div className="animate-fade">
                    <span className="section-label">Choose Preset</span>
                    <div className="preset-grid">
                      {Object.entries(socialPresets).map(([key, val]) => (
                        <div key={key} className={`preset-card ${socialPreset === key ? 'selected' : ''}`} onClick={() => setSocialPreset(key)}>
                          <div className="p-icon">
                            {key.includes('ig') && <i className="fa-brands fa-instagram"></i>}
                            {key.includes('fb') && <i className="fa-brands fa-facebook"></i>}
                            {key.includes('yt') && <i className="fa-brands fa-youtube"></i>}
                            {key.includes('twitter') && <i className="fa-brands fa-twitter"></i>}
                          </div>
                          <div className="p-name">{val.label}</div>
                          <div className="p-dims">{val.w} x {val.h}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{marginTop:'auto'}}>
                  <span className="section-label">Format</span>
                  <div style={{marginBottom:'20px'}}>
                    <select className="clean-input" value={format} onChange={e => setFormat(e.target.value)}>
                      <option value="original">Keep Original</option>
                      <option value="image/jpeg">JPG</option>
                      <option value="image/png">PNG</option>
                      <option value="image/webp">WEBP</option>
                    </select>
                  </div>

                  <button className="action-btn" onClick={processResize} disabled={processing}>
                    {processing ? 'Processing...' : 'Resize Images'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
