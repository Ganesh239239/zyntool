import React, { useState, useRef, useMemo, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

// --- HIGH-PERFORMANCE ICONS (Inline SVG) ---
const Icon = {
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Wasm: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Bolt: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
};

export default function CompressTool({ color = '#3b82f6' }) {
  // --- STATE ---
  const [files, setFiles] = useState([]);
  const [view, setView] = useState('empty'); // empty, workspace
  const [quality, setQuality] = useState(0.75);
  const [useWebP, setUseWebP] = useState(true); // Google Recommendation
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // --- STATS ENGINE ---
  const stats = useMemo(() => {
    let orig = 0, comp = 0, count = 0;
    files.forEach(f => {
      orig += f.origSize;
      if (f.status === 'done') {
        comp += f.newSize;
        count++;
      }
    });
    const saved = orig - comp;
    return {
      totalSavedMB: (saved / 1024 / 1024).toFixed(2),
      percent: comp > 0 ? Math.round((saved / orig) * 100) : 0,
      isDone: count === files.length && count > 0
    };
  }, [files]);

  // --- CORE LOGIC ---
  const handleFiles = (incoming) => {
    if (!incoming || incoming.length === 0) return;
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    
    if (valid.length > 0) {
      const queue = valid.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        origSize: f.size,
        status: 'queued',
        saved: 0
      }));
      setFiles(prev => [...prev, ...queue]);
      setView('workspace');
      // Auto-start using current settings
      processQueue([...files, ...queue]);
    }
  };

  const processQueue = async (queue) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const zip = new JSZip();
    const workQueue = [...queue];

    // Mark queued as working
    workQueue.forEach(f => { if(f.status === 'queued') f.status = 'processing'; });
    setFiles([...workQueue]);

    for (let i = 0; i < workQueue.length; i++) {
      const item = workQueue[i];
      if (item.status === 'done') {
        // Re-add already done files to zip if we are re-zipping
        zip.file(item.newName || item.name, item.blob);
        continue; 
      }

      try {
        const options = { 
          maxSizeMB: 2, 
          maxWidthOrHeight: 2048, 
          useWebWorker: true, // Uses browser internal threading
          initialQuality: quality,
          fileType: useWebP ? "image/webp" : undefined // Google WebP Logic
        };
        
        const blob = await imageCompression(item.file, options);
        
        // Handle Extension Change
        let finalName = item.name;
        if (useWebP && !item.name.toLowerCase().endsWith('.webp')) {
          finalName = item.name.substring(0, item.name.lastIndexOf('.')) + '.webp';
        }

        item.newSize = blob.size;
        item.saved = Math.round(((item.origSize - blob.size) / item.origSize) * 100);
        item.status = 'done';
        item.blob = blob;
        item.newName = finalName;
        
        zip.file(finalName, blob);
      } catch (err) {
        item.status = 'error';
      }
      setFiles([...workQueue]); // Live Paint
    }

    if (workQueue.some(f => f.status === 'done')) {
      const content = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(content));
    }
    setIsProcessing(false);
  };

  const removeFile = (id) => {
    const next = files.filter(f => f.id !== id);
    setFiles(next);
    if (next.length === 0) {
      setView('empty');
      setZipUrl(null);
    }
  };

  const formatSize = (b) => {
    if (!b) return '...';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return parseFloat((b / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  // --- RENDER ---
  return (
    <div className="zenith-engine" style={{'--accent': color}}>
      <style>{`
        .zenith-engine {
          --bg: #0f172a;       /* Deep Slate */
          --card: #1e293b;     /* Lighter Slate */
          --border: #334155;
          --text: #f8fafc;
          --sub: #94a3b8;
          --active: var(--accent);
          --success: #10b981;
          
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 950px; margin: 0 auto;
          color: var(--text);
          min-height: 600px;
          display: flex; flex-direction: column;
        }

        /* --- 1. UPLOAD PORTAL --- */
        .portal {
          flex: 1;
          background: var(--card);
          border: 2px dashed var(--border);
          border-radius: 24px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; position: relative; overflow: hidden;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .portal:hover, .portal.drag {
          border-color: var(--active);
          background: #1e293b; /* slightly lighter */
          box-shadow: 0 0 40px -10px rgba(59, 130, 246, 0.2);
        }
        .orb {
          width: 80px; height: 80px; background: rgba(59, 130, 246, 0.1);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: var(--active); margin-bottom: 24px;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
          transition: 0.3s;
        }
        .portal:hover .orb { transform: scale(1.1); box-shadow: 0 0 20px var(--active); }
        
        .portal h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.02em; }
        .portal p { color: var(--sub); }
        
        .badge-wasm {
          position: absolute; top: 20px; right: 20px;
          background: rgba(0,0,0,0.3); border: 1px solid var(--border);
          padding: 6px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; gap: 6px; letter-spacing: 1px; color: var(--sub);
        }

        /* --- 2. WORKSPACE TABLE --- */
        .workspace {
          background: var(--bg);
          border-radius: 24px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 20px 50px -20px rgba(0,0,0,0.5);
          position: relative;
          padding-bottom: 100px; /* Space for dock */
        }

        .ws-head {
          padding: 20px 30px; border-bottom: 1px solid var(--border);
          background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px);
          display: flex; justify-content: space-between; align-items: center;
          position: sticky; top: 0; z-index: 10;
        }
        .ws-title { font-weight: 700; font-size: 1rem; color: var(--text); }
        .add-btn { background: none; border: none; color: var(--sub); cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; font-weight: 600; }
        .add-btn:hover { color: var(--text); }

        .file-list { display: flex; flex-direction: column; }
        .file-row {
          display: grid; grid-template-columns: 50px 2fr 1fr 1fr 40px;
          align-items: center; padding: 16px 30px;
          border-bottom: 1px solid var(--border);
          transition: 0.1s;
        }
        .file-row:hover { background: rgba(255,255,255,0.02); }
        
        .thumb { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; background: #334155; }
        .fname { font-weight: 500; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px; }
        .fmeta { font-family: monospace; color: var(--sub); font-size: 0.8rem; }
        
        .status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;
        }
        .pill-done { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .pill-work { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
        
        .del-btn { color: var(--border); cursor: pointer; transition: 0.2s; display: flex; justify-content: flex-end; }
        .del-btn:hover { color: #ef4444; }

        /* --- 3. FLOATING DOCK (The "React High End" part) --- */
        .dock-wrapper {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
          z-index: 100; width: 90%; max-width: 600px;
        }
        
        .dock {
          background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 12px 20px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
          animation: floatUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes floatUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .dock-controls { display: flex; align-items: center; gap: 20px; }
        
        /* Custom Checkbox */
        .webp-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: var(--sub); }
        .webp-toggle input { accent-color: var(--active); }
        .webp-toggle:hover { color: var(--text); }

        /* Custom Slider */
        .slider-wrap { display: flex; align-items: center; gap: 10px; }
        .slider-wrap input { width: 100px; accent-color: var(--active); cursor: pointer; }
        .q-val { font-family: monospace; font-weight: 700; color: var(--active); width: 35px; }

        .dl-btn {
          background: var(--text); color: #000;
          padding: 10px 24px; border-radius: 12px;
          font-weight: 700; font-size: 0.9rem; text-decoration: none;
          display: flex; align-items: center; gap: 8px;
          transition: transform 0.2s;
        }
        .dl-btn:hover { transform: scale(1.05); background: white; }
        
        .loading-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Stats in Dock */
        .dock-stat { display: flex; flex-direction: column; line-height: 1; }
        .ds-label { font-size: 0.65rem; color: var(--sub); text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
        .ds-val { font-size: 0.95rem; font-weight: 700; color: #34d399; }

        @media (max-width: 600px) {
          .dock { flex-direction: column; gap: 15px; padding: 20px; border-radius: 20px; }
          .dock-controls { width: 100%; justify-content: space-between; }
          .file-row { grid-template-columns: 40px 1fr 60px; }
          .fmeta, .f-stat-col { display: none; }
        }
      `}</style>

      {/* VIEW 1: PORTAL */}
      {view === 'empty' && (
        <div 
          className={`portal ${dragActive ? 'drag' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="badge-wasm"><Icon.Wasm /> WASM ENABLED</div>
          <div className="orb"><Icon.Upload /></div>
          <h2>Compress Images</h2>
          <p>Drag & Drop • WebP • JPG • PNG</p>
        </div>
      )}

      {/* VIEW 2: WORKSPACE */}
      {view === 'workspace' && (
        <>
          <div className="workspace">
            <div className="ws-head">
              <div className="ws-title">Queue ({files.length})</div>
              <button className="add-btn" onClick={() => fileInputRef.current.click()}>
                <Icon.Upload /> Add
              </button>
            </div>

            <div className="file-list">
              {files.map(f => (
                <div key={f.id} className="file-row">
                  <img src={f.preview} className="thumb" alt="" />
                  <div className="fname" title={f.name}>{f.name}</div>
                  <div className="fmeta">{formatSize(f.origSize)}</div>
                  <div className="f-stat-col">
                    {f.status === 'done' ? (
                      <span className="status-pill pill-done"><Icon.Check /> -{f.saved}%</span>
                    ) : (
                      <span className="status-pill pill-work"><div className="loading-spin"></div> Working</span>
                    )}
                  </div>
                  <div className="del-btn" onClick={() => removeFile(f.id)}><Icon.Close /></div>
                </div>
              ))}
            </div>
          </div>

          {/* FLOATING COMMAND DOCK */}
          <div className="dock-wrapper">
            <div className="dock">
              
              {/* Left: Controls */}
              <div className="dock-controls">
                <div className="slider-wrap">
                  <span className="q-val">{Math.round(quality*10)}</span>
                  <input 
                    type="range" min="0.1" max="1.0" step="0.1" 
                    value={quality} onChange={e => setQuality(parseFloat(e.target.value))} 
                    disabled={isProcessing}
                  />
                </div>
                
                <label className="webp-toggle">
                  <input 
                    type="checkbox" 
                    checked={useWebP} 
                    onChange={e => setUseWebP(e.target.checked)} 
                    disabled={isProcessing}
                  />
                  <span>WebP</span>
                </label>
              </div>

              {/* Center: Stat (if done) */}
              {stats.totalSavedMB > 0 && (
                <div className="dock-stat">
                  <span className="ds-label">Saved</span>
                  <span className="ds-val">{stats.totalSavedMB} MB</span>
                </div>
              )}

              {/* Right: Action */}
              {stats.isDone ? (
                <a href={zipUrl} download="compressed.zip" className="dl-btn">
                  Download <Icon.Download />
                </a>
              ) : (
                <button className="dl-btn" style={{opacity:0.7, cursor:'wait'}}>
                  <div className="loading-spin" style={{borderColor:'black', borderTopColor:'transparent'}}></div> Processing
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
