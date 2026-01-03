import React, { useState, useRef, useMemo } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

// --- FIXED ICONS (All used icons are now defined) ---
const Icon = {
  Plus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12"/></svg>,
  File: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  Close: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Download: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  // These were missing causing the crash:
  Settings: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Wasm: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
};

export default function CompressTool() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  
  // Settings
  const [quality, setQuality] = useState(0.75);
  const [useWebP, setUseWebP] = useState(true);

  const fileInputRef = useRef(null);

  // --- STATS ---
  const stats = useMemo(() => {
    const totalOrig = files.reduce((acc, f) => acc + f.origSize, 0);
    const totalNew = files.reduce((acc, f) => acc + (f.newSize || f.origSize), 0);
    const processedCount = files.filter(f => f.status === 'done').length;
    const isDone = files.length > 0 && processedCount === files.length;
    const savings = totalOrig - totalNew;
    return { totalOrig, totalNew, savings, isDone };
  }, [files]);

  // --- ENGINE ---
  const handleFiles = (e) => {
    const incoming = e.target.files || e.dataTransfer?.files;
    if (!incoming?.length) return;

    const newQueue = Array.from(incoming)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        name: f.name,
        origSize: f.size,
        status: 'pending', 
        preview: URL.createObjectURL(f)
      }));

    setFiles(prev => [...prev, ...newQueue]);
  };

  const runBatch = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    const queue = [...files];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'done') {
        zip.file(item.finalName, item.blob);
        continue;
      }

      item.status = 'working';
      setFiles([...queue]);

      try {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: quality,
          fileType: useWebP ? "image/webp" : undefined
        };

        const blob = await imageCompression(item.file, options);
        
        item.blob = blob;
        item.newSize = blob.size;
        item.status = 'done';
        
        const ext = useWebP ? 'webp' : item.name.split('.').pop();
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        item.finalName = `${baseName}.${ext}`;

        zip.file(item.finalName, blob);
      } catch (err) {
        console.error(err);
        item.status = 'error';
      }
      setFiles([...queue]); 
    }

    if (queue.some(f => f.status === 'done')) {
      const content = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(content));
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (files.length === 1 && files[0].blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(files[0].blob);
      link.download = files[0].finalName;
      link.click();
    } else if (zipUrl) {
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = "optimized_assets.zip";
      link.click();
    }
  };

  const formatSize = (b) => {
    if (!b) return '-';
    if (b < 1024) return b + ' B';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + sizes[i-1];
  };

  return (
    <div className="studio-interface">
      <style>{`
        :root {
          --bg: #ffffff;
          --panel: #f9fafb;
          --border: #e5e7eb;
          --text: #0f172a;
          --text-dim: #64748b;
          --accent: #000000;
          --accent-hover: #333333;
          --green: #10b981;
          --mono: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
        }

        .studio-interface {
          display: flex;
          height: 80vh;
          max-height: 800px;
          border: 1px solid var(--border);
          background: var(--bg);
          font-family: 'Inter', -apple-system, sans-serif;
          color: var(--text);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        /* LEFT: ASSET PANE */
        .asset-pane {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          background: #fff;
        }

        .pane-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          background: #fff;
        }
        .pane-title { font-weight: 600; font-size: 0.9rem; letter-spacing: -0.01em; }
        
        .file-table-container { flex: 1; overflow-y: auto; position: relative; }
        
        .empty-drop {
          position: absolute; inset: 20px;
          border: 1px dashed var(--border);
          border-radius: 8px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          color: var(--text-dim);
          background: var(--panel);
          cursor: pointer;
          transition: background 0.2s;
        }
        .empty-drop:hover { background: #f3f4f6; border-color: #d1d5db; }

        .file-row {
          display: grid; 
          grid-template-columns: 40px 2fr 1fr 1fr 40px; 
          align-items: center;
          padding: 12px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
          transition: background 0.1s;
        }
        .file-row:hover { background: #f8fafc; }
        
        .f-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; background: #eee; border: 1px solid var(--border); }
        .f-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 15px; }
        .f-meta { font-family: var(--mono); color: var(--text-dim); font-size: 0.75rem; }
        .f-badge { 
          font-family: var(--mono); color: var(--green); background: #ecfdf5; 
          padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;
        }
        
        .icon-btn { 
          background: none; border: none; cursor: pointer; color: var(--text-dim); 
          display: flex; align-items: center; justify-content: center; padding: 4px;
          border-radius: 4px;
        }
        .icon-btn:hover { background: #fee2e2; color: #ef4444; }

        /* RIGHT: INSPECTOR PANE */
        .inspector-pane {
          width: 320px;
          background: var(--panel);
          display: flex; flex-direction: column;
        }

        .inspector-group {
          padding: 24px;
          border-bottom: 1px solid var(--border);
        }
        
        .group-label {
          font-size: 0.75rem; text-transform: uppercase; font-weight: 700; 
          color: var(--text-dim); letter-spacing: 0.05em; margin-bottom: 16px;
          display: flex; align-items: center; gap: 6px;
        }

        .control-row { margin-bottom: 16px; }
        .label-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; font-weight: 500; }
        
        input[type="range"] {
          width: 100%; -webkit-appearance: none; background: transparent; cursor: pointer;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          width: 100%; height: 4px; background: var(--border); border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%;
          background: var(--accent); margin-top: -6px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .check-label {
          display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; user-select: none;
        }
        
        .stat-box {
          background: white; border: 1px solid var(--border); border-radius: 6px; padding: 12px;
        }
        .stat-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.8rem; color: var(--text-dim); }
        .stat-row.total { margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border); font-weight: 600; color: var(--text); }

        .inspector-footer {
          margin-top: auto; padding: 24px; border-top: 1px solid var(--border);
        }
        
        .primary-btn {
          width: 100%; background: var(--accent); color: white; border: none;
          padding: 12px; border-radius: 6px; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.1s;
        }
        .primary-btn:hover { background: var(--accent-hover); }
        .primary-btn:disabled { opacity: 0.5; cursor: wait; }

        .secondary-btn {
          width: 100%; background: white; border: 1px solid var(--border); color: var(--text);
          padding: 10px; border-radius: 6px; font-weight: 500; font-size: 0.85rem;
          cursor: pointer; margin-bottom: 12px; text-align: center;
        }
        .secondary-btn:hover { background: #f9fafb; border-color: #d1d5db; }

        @media (max-width: 800px) {
          .studio-interface { flex-direction: column; height: auto; max-height: none; border: none; }
          .asset-pane { height: 400px; border-right: none; border-bottom: 1px solid var(--border); }
          .inspector-pane { width: 100%; }
          .file-row { grid-template-columns: 40px 1fr 60px; }
          .file-row > :nth-child(3), .file-row > :nth-child(4) { display: none; }
        }
      `}</style>

      {/* LEFT PANE: ASSETS */}
      <div className="asset-pane">
        <div className="pane-header">
          <span className="pane-title">Assets ({files.length})</span>
          <button className="icon-btn" onClick={() => setFiles([])} title="Clear All" style={{width:'auto', padding:'4px 8px', fontSize:'0.75rem'}}>
            Clear
          </button>
        </div>

        <div className="file-table-container">
          {files.length === 0 ? (
            <div 
              className="empty-drop"
              onClick={() => fileInputRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e); }}
            >
              <div style={{marginBottom:'16px', color:'#9ca3af'}}><Icon.Upload /></div>
              <span style={{fontWeight:600, marginBottom:'4px'}}>Drop files here</span>
              <span style={{fontSize:'0.8rem', opacity:0.6}}>JPG, PNG, WebP</span>
            </div>
          ) : (
            <div>
              {files.map(f => (
                <div key={f.id} className="file-row">
                  <img src={f.preview} className="f-thumb" alt="" />
                  <div className="f-name" title={f.name}>{f.name}</div>
                  <div className="f-meta">
                    {formatSize(f.origSize)} <span style={{margin:'0 4px'}}>→</span> {f.status === 'done' ? formatSize(f.newSize) : '...'}
                  </div>
                  <div style={{textAlign:'right'}}>
                    {f.status === 'done' && <span className="f-badge">-{Math.round(((f.origSize - f.newSize)/f.origSize)*100)}%</span>}
                    {f.status === 'working' && <span style={{fontSize:'0.7rem', color:'#3b82f6'}}>Processing</span>}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <button className="icon-btn" onClick={() => setFiles(files.filter(x => x.id !== f.id))}>
                      <Icon.Close />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: CONTROLS */}
      <div className="inspector-pane">
        
        <div className="inspector-group">
          <span className="group-label"><Icon.Settings /> Compression</span>
          
          <div className="control-row">
            <div className="label-row">
              <span>Quality</span>
              <span style={{fontFamily:'var(--mono)'}}>{Math.round(quality*100)}%</span>
            </div>
            <input 
              type="range" min="0.1" max="1.0" step="0.05" 
              value={quality} onChange={e => setQuality(parseFloat(e.target.value))}
              disabled={isProcessing}
            />
          </div>

          <div className="control-row">
            <div className="label-row">
              <span>Format</span>
            </div>
            <label className="check-label">
              <input type="checkbox" checked={useWebP} onChange={e => setUseWebP(e.target.checked)} disabled={isProcessing} />
              <span>Convert to WebP (Recommended)</span>
            </label>
          </div>
        </div>

        <div className="inspector-group">
          <span className="group-label"><Icon.File /> Summary</span>
          <div className="stat-box">
            <div className="stat-row">
              <span>Original</span>
              <span style={{fontFamily:'var(--mono)'}}>{formatSize(stats.totalOrig)}</span>
            </div>
            <div className="stat-row">
              <span>Compressed</span>
              <span style={{fontFamily:'var(--mono)'}}>{stats.totalNew > 0 ? formatSize(stats.totalNew) : '-'}</span>
            </div>
            <div className="stat-row total">
              <span>Savings</span>
              <span style={{color: stats.savings > 0 ? 'var(--green)' : 'inherit'}}>
                {stats.savings > 0 ? `-${formatSize(stats.savings)}` : '0 B'}
              </span>
            </div>
          </div>
        </div>

        <div className="inspector-footer">
          <button className="secondary-btn" onClick={() => fileInputRef.current.click()}>
            <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}>
              <Icon.Plus /> Add Images
            </span>
          </button>

          {stats.isDone ? (
            <button className="primary-btn" style={{backgroundColor: '#10b981'}} onClick={handleDownload}>
              Download {files.length > 1 ? 'ZIP' : 'File'} <Icon.Download />
            </button>
          ) : (
            <button className="primary-btn" onClick={runBatch} disabled={isProcessing || files.length === 0}>
              {isProcessing ? 'Processing...' : 'Compress All'}
            </button>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFiles} />
    </div>
  );
}
