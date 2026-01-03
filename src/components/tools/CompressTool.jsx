import React, { useState, useRef, useEffect, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

// --- ICONS (Inline SVG for zero dependencies & fast loading) ---
const Icons = {
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Zip: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12h4"/><path d="M10 16h4"/><path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
};

export default function CompressTool({ color = '#6366f1' }) {
  // --- STATE ---
  const [files, setFiles] = useState([]);
  const [view, setView] = useState('empty'); // empty, workspace
  const [quality, setQuality] = useState(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // --- DERIVED STATS (High-End Performance) ---
  const stats = useMemo(() => {
    let original = 0;
    let compressed = 0;
    let count = 0;
    files.forEach(f => {
      original += f.origSize;
      if (f.status === 'done') {
        compressed += f.newSize;
        count++;
      }
    });
    const saved = original - compressed;
    return {
      original: (original / 1024 / 1024).toFixed(2),
      saved: compressed > 0 ? (saved / 1024 / 1024).toFixed(2) : '0.00',
      percent: compressed > 0 ? Math.round((saved / original) * 100) : 0,
      isDone: count === files.length && files.length > 0
    };
  }, [files]);

  // --- CORE ENGINE ---
  const handleFiles = (incoming) => {
    if (!incoming || incoming.length === 0) return;
    const validFiles = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
      const newQueue = validFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        origSize: f.size,
        status: 'queued',
      }));
      setFiles(prev => [...prev, ...newQueue]);
      setView('workspace');
      processQueue([...files, ...newQueue], quality);
    }
  };

  const processQueue = async (queue, q) => {
    setIsProcessing(true);
    const zip = new JSZip();
    const workingQueue = [...queue];

    for (let i = 0; i < workingQueue.length; i++) {
      const item = workingQueue[i];
      if (item.status === 'done') {
        zip.file(item.name, item.blob);
        continue; // Skip already processed
      }

      // Optimistic UI Update
      item.status = 'processing';
      setFiles([...workingQueue]);

      try {
        const options = { maxSizeMB: 2, maxWidthOrHeight: 2048, useWebWorker: true, initialQuality: q };
        const blob = await imageCompression(item.file, options);
        
        item.newSize = blob.size;
        item.status = 'done';
        item.blob = blob;
        zip.file(item.name, blob);
      } catch (err) {
        item.status = 'error';
      }
      setFiles([...workingQueue]); // Live Update
    }

    if (workingQueue.length > 0) {
      const content = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(content));
    }
    setIsProcessing(false);
  };

  const removeFile = (id) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    if (updated.length === 0) {
      setView('empty');
      setZipUrl(null);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  // --- RENDER ---
  return (
    <div className="zenith-interface" style={{'--accent': color}}>
      <style>{`
        /* --- ZENITH DESIGN SYSTEM --- */
        .zenith-interface {
          --bg-body: #f8fafc;
          --bg-card: #ffffff;
          --text-main: #0f172a;
          --text-sub: #64748b;
          --border: #e2e8f0;
          --glass: rgba(255, 255, 255, 0.7);
          --shadow-sm: 0 4px 6px -1px rgba(0,0,0,0.05);
          --shadow-lg: 0 20px 40px -5px rgba(0,0,0,0.1);
          --radius: 20px;
          
          font-family: 'Inter', -apple-system, sans-serif;
          max-width: 1000px; margin: 0 auto;
          color: var(--text-main);
          position: relative;
        }

        /* --- 1. THE DROP PORTAL (Empty State) --- */
        .drop-portal {
          background: var(--bg-card);
          border: 1px dashed var(--border);
          border-radius: var(--radius);
          height: 400px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .drop-portal:hover, .drop-portal.active {
          border-color: var(--accent);
          box-shadow: 0 20px 50px -10px rgba(99, 102, 241, 0.15);
          transform: translateY(-4px);
        }
        .portal-icon {
          width: 80px; height: 80px; background: #f1f5f9; color: var(--text-main);
          border-radius: 30px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px; transition: 0.3s;
        }
        .drop-portal:hover .portal-icon { background: var(--accent); color: white; transform: scale(1.1); }
        .portal-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
        .portal-sub { color: var(--text-sub); font-size: 1.1rem; font-weight: 500; }

        /* --- 2. WORKSPACE TABLE --- */
        .workspace-card {
          background: var(--bg-card); border-radius: var(--radius);
          box-shadow: var(--shadow-lg); border: 1px solid var(--border);
          overflow: hidden; animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Floating Header */
        .ws-header {
          padding: 20px 32px; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255,255,255,0.8); backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 10;
        }
        
        /* The File Table */
        .file-grid { display: flex; flex-direction: column; }
        .file-row {
          display: grid; grid-template-columns: 60px 2fr 1fr 1fr 50px;
          align-items: center; padding: 16px 32px;
          border-bottom: 1px solid #f8fafc; transition: background 0.1s;
        }
        .file-row:hover { background: #f8fafc; }
        
        .f-preview { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: #eee; border: 1px solid var(--border); }
        .f-name { font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 20px; }
        .f-size { font-family: monospace; color: var(--text-sub); font-size: 0.9rem; }
        
        /* Status Badges */
        .status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;
        }
        .status-pill.done { background: #dcfce7; color: #15803d; }
        .status-pill.proc { background: #e0e7ff; color: #4338ca; }
        .loader { width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Action Buttons */
        .btn-icon {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px; color: #cbd5e1; cursor: pointer; transition: 0.2s;
        }
        .btn-icon:hover { background: #fee2e2; color: #ef4444; }

        /* --- 3. FLOATING DOCK (The "Magic" Control Bar) --- */
        .control-dock {
          position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(16px);
          padding: 12px 12px 12px 24px; border-radius: 100px;
          display: flex; align-items: center; gap: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          z-index: 100; border: 1px solid rgba(255,255,255,0.1);
          animation: floatUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes floatUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }

        .dock-stat { color: white; font-size: 0.9rem; font-weight: 500; display: flex; gap: 8px; align-items: center; }
        .dock-val { font-weight: 700; color: #4ade80; }
        
        .dock-slider { display: flex; align-items: center; gap: 10px; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 24px; }
        .slider-label { color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
        input[type=range] { width: 100px; accent-color: var(--accent); cursor: pointer; }

        .btn-primary {
          background: var(--accent); color: white; border: none;
          padding: 12px 24px; border-radius: 50px; font-weight: 600;
          display: flex; align-items: center; gap: 8px; cursor: pointer;
          transition: transform 0.2s; text-decoration: none;
        }
        .btn-primary:hover { transform: scale(1.05); filter: brightness(110%); }
        
        .btn-secondary {
          background: rgba(255,255,255,0.1); color: white; border: none;
          width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.2); }

        @media (max-width: 768px) {
          .control-dock { 
            width: 90%; bottom: 20px; flex-direction: column; 
            border-radius: 20px; padding: 20px; gap: 16px;
          }
          .dock-slider { border-left: none; padding-left: 0; width: 100%; justify-content: space-between; }
          .file-row { grid-template-columns: 50px 1fr 60px; }
          .f-size, .f-stat-col { display: none; }
        }
      `}</style>

      {/* --- VIEW 1: EMPTY STATE --- */}
      {view === 'empty' && (
        <div 
          className={`drop-portal ${dragActive ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="portal-icon"><Icons.Upload /></div>
          <h2 className="portal-title">Drop images to compress</h2>
          <p className="portal-sub">Or click to browse (JPG, PNG, WebP)</p>
        </div>
      )}

      {/* --- VIEW 2: WORKSPACE --- */}
      {view === 'workspace' && (
        <div className="workspace-card">
          <div className="ws-header">
            <h3 style={{fontWeight: 800, fontSize: '1.2rem'}}>Workspace ({files.length})</h3>
            <button className="btn-icon" onClick={() => fileInputRef.current.click()} title="Add more">
              <Icons.Plus />
            </button>
          </div>

          <div className="file-grid">
            {files.map(f => (
              <div key={f.id} className="file-row">
                <img src={f.preview} className="f-preview" alt="" />
                
                <div className="f-name" title={f.name}>{f.name}</div>
                
                <div className="f-size">{formatBytes(f.origSize)}</div>
                
                <div className="f-stat-col">
                  {f.status === 'done' ? (
                    <div className="status-pill done">
                      <Icons.Check /> -{f.saved}%
                    </div>
                  ) : (
                    <div className="status-pill proc">
                      <div className="loader"></div> Working
                    </div>
                  )}
                </div>

                <div style={{textAlign: 'right'}}>
                  <div className="btn-icon" onClick={() => removeFile(f.id)}>
                    <Icons.Close />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Spacer for floating dock */}
          <div style={{height: '120px'}}></div>
        </div>
      )}

      {/* --- 3. FLOATING DOCK (The High-End Touch) --- */}
      {view === 'workspace' && (
        <div className="control-dock">
          <div className="dock-stat">
            <span>SAVED</span>
            <span className="dock-val">{stats.saved} MB</span>
          </div>

          <div className="dock-slider">
            <span className="slider-label">Power</span>
            <input 
              type="range" min="0.1" max="1.0" step="0.05" 
              value={quality} 
              onChange={e => {
                setQuality(parseFloat(e.target.value));
                if(!isProcessing) processQueue(files, parseFloat(e.target.value));
              }}
              disabled={isProcessing}
            />
          </div>

          <div style={{flex:1}}></div>

          <button className="btn-secondary" onClick={() => fileInputRef.current.click()} title="Add Images">
            <Icons.Plus />
          </button>

          {stats.isDone ? (
            <a href={zipUrl} download="compressed-assets.zip" className="btn-primary">
              <Icons.Download /> Download All
            </a>
          ) : (
            <button className="btn-primary" disabled style={{opacity: 0.7, cursor: 'wait'}}>
              <div className="loader" style={{width:16, height:16, border: '2px solid white', borderRightColor:'transparent'}}></div> Processing
            </button>
          )}
        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
