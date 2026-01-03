import React, { useState, useRef, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

// --- ICONS ---
const Icon = {
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Wasm: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>,
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Close: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
};

export default function CompressTool({ color = '#3b82f6' }) {
  // --- STATE ---
  const [files, setFiles] = useState([]);
  const [view, setView] = useState('empty');
  const [quality, setQuality] = useState(0.75);
  const [useWebP, setUseWebP] = useState(false); // Default false to keep original format
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
      isDone: count === files.length && count > 0,
      count: count
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
      processQueue([...files, ...queue]);
    }
  };

  const processQueue = async (queue) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const zip = new JSZip();
    const workQueue = [...queue];

    workQueue.forEach(f => { if(f.status === 'queued') f.status = 'processing'; });
    setFiles([...workQueue]);

    for (let i = 0; i < workQueue.length; i++) {
      const item = workQueue[i];
      if (item.status === 'done') {
        // Re-add existing blobs to zip
        zip.file(item.newName || item.name, item.blob);
        continue; 
      }

      try {
        const options = { 
          maxSizeMB: 2, 
          maxWidthOrHeight: 2048, 
          useWebWorker: true,
          initialQuality: quality,
          fileType: useWebP ? "image/webp" : undefined // Keep original if false
        };
        
        const blob = await imageCompression(item.file, options);
        
        // Handle Filename Extension
        let finalName = item.name;
        if (useWebP) {
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
      setFiles([...workQueue]);
    }

    if (workQueue.some(f => f.status === 'done')) {
      const content = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(content));
    }
    setIsProcessing(false);
  };

  // --- SMART DOWNLOAD HANDLER ---
  const handleDownload = () => {
    if (files.length === 1) {
      // SINGLE FILE: Download directly (No ZIP)
      const f = files[0];
      if (f.blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(f.blob);
        link.download = f.newName || f.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // MULTIPLE FILES: Download ZIP
      if (zipUrl) {
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = "compressed_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
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

  return (
    <div className="zenith-engine" style={{'--accent': color}}>
      <style>{`
        .zenith-engine {
          --bg: #0f172a; --card: #1e293b; --border: #334155;
          --text: #f8fafc; --sub: #94a3b8; --active: var(--accent);
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 950px; margin: 0 auto; color: var(--text);
          min-height: 600px; display: flex; flex-direction: column;
        }

        /* UPLOAD PORTAL */
        .portal {
          flex: 1; background: var(--card); border: 2px dashed var(--border);
          border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.3s;
        }
        .portal:hover { border-color: var(--active); background: #1e293b; box-shadow: 0 0 40px -10px rgba(59, 130, 246, 0.2); }
        .orb {
          width: 80px; height: 80px; background: rgba(59, 130, 246, 0.1); border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: var(--active); margin-bottom: 24px;
        }
        
        /* WORKSPACE */
        .workspace {
          background: var(--bg); border-radius: 24px; border: 1px solid var(--border);
          overflow: hidden; box-shadow: 0 20px 50px -20px rgba(0,0,0,0.5); padding-bottom: 100px;
        }
        .ws-head {
          padding: 20px 30px; border-bottom: 1px solid var(--border); background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px); display: flex; justify-content: space-between; align-items: center;
        }
        .file-row {
          display: grid; grid-template-columns: 50px 2fr 1fr 1fr 40px; align-items: center;
          padding: 16px 30px; border-bottom: 1px solid var(--border);
        }
        .thumb { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; background: #334155; }
        .fname { font-weight: 500; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px; }
        .status-pill {
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;
        }
        .pill-done { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .pill-work { background: rgba(99, 102, 241, 0.2); color: #818cf8; }

        /* FLOATING DOCK */
        .dock-wrapper {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
          z-index: 100; width: 90%; max-width: 650px;
        }
        .dock {
          background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 12px 24px;
          display: flex; align-items: center; justify-content: space-between;
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
        }
        .slider-wrap { display: flex; align-items: center; gap: 10px; }
        .slider-wrap input { width: 100px; accent-color: var(--active); cursor: pointer; }
        
        .dl-btn {
          background: var(--text); color: #000; padding: 10px 24px; border-radius: 12px;
          font-weight: 700; font-size: 0.9rem; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: 0.2s;
        }
        .dl-btn:hover { transform: scale(1.05); background: white; }
        
        .loading-spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .dock { flex-direction: column; gap: 15px; padding: 20px; }
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
          <div className="orb"><Icon.Upload /></div>
          <h2 style={{fontSize:'1.5rem', fontWeight:'700'}}>Compress Images</h2>
          <p style={{color:'#94a3b8'}}>Support for JPG, PNG, WebP</p>
        </div>
      )}

      {/* VIEW 2: WORKSPACE */}
      {view === 'workspace' && (
        <>
          <div className="workspace">
            <div className="ws-head">
              <span style={{fontWeight:'700'}}>Queue ({files.length})</span>
              <button onClick={() => fileInputRef.current.click()} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontWeight:'600'}}>+ Add</button>
            </div>

            <div className="file-list">
              {files.map(f => (
                <div key={f.id} className="file-row">
                  <img src={f.preview} className="thumb" alt="" />
                  <div className="fname" title={f.name}>{f.name}</div>
                  <div className="fmeta" style={{color:'#94a3b8', fontSize:'0.8rem', fontFamily:'monospace'}}>{formatSize(f.origSize)}</div>
                  <div className="f-stat-col">
                    {f.status === 'done' ? (
                      <span className="status-pill pill-done"><Icon.Check /> -{f.saved}%</span>
                    ) : (
                      <span className="status-pill pill-work"><div className="loading-spin"></div> Working</span>
                    )}
                  </div>
                  <div style={{textAlign:'right', cursor:'pointer', color:'#334155'}} onClick={() => removeFile(f.id)}><Icon.Close /></div>
                </div>
              ))}
            </div>
          </div>

          {/* SMART FLOATING DOCK */}
          <div className="dock-wrapper">
            <div className="dock">
              <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                <div className="slider-wrap">
                  <span style={{fontWeight:'700', color:color}}>{Math.round(quality*100)}%</span>
                  <input type="range" min="0.1" max="1.0" step="0.05" value={quality} onChange={e => { setQuality(parseFloat(e.target.value)); if(!isProcessing) processQueue(files); }} disabled={isProcessing} />
                </div>
                <label style={{display:'flex', gap:'8px', cursor:'pointer', fontSize:'0.8rem', fontWeight:'600', color:'#94a3b8'}}>
                  <input type="checkbox" checked={useWebP} onChange={e => setUseWebP(e.target.checked)} disabled={isProcessing} />
                  Convert to WebP
                </label>
              </div>

              {stats.isDone ? (
                <button onClick={handleDownload} className="dl-btn">
                  {stats.count > 1 ? `Download All` : `Download Image`} <Icon.Download />
                </button>
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
