import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#4f46e5' }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('upload'); // upload, processing, done
  const [quality, setQuality] = useState(0.75);
  const [zipUrl, setZipUrl] = useState(null);
  const [stats, setStats] = useState({ savedMB: 0, percent: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- ENGINE ---
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
      newSize: null,
      status: 'queued', 
      saved: 0
    }));

    setFiles(prev => [...prev, ...newEntries]);
    setStatus('processing');
    
    // Auto-start queue
    processQueue([...files, ...newEntries], quality);
  };

  const processQueue = async (queue, q) => {
    const zip = new JSZip();
    let totalOrig = 0;
    let totalNew = 0;
    const processed = [...queue];

    // Mark queued as working
    processed.forEach(f => { if(f.status === 'queued') f.status = 'working'; });
    setFiles([...processed]);

    for (let i = 0; i < processed.length; i++) {
      if (processed[i].status !== 'working') {
        if (processed[i].status === 'done') {
           totalOrig += processed[i].origSize;
           totalNew += processed[i].newSize;
           zip.file(processed[i].name, processed[i].blob);
        }
        continue;
      }

      try {
        const opts = { maxSizeMB: 2, maxWidthOrHeight: 2048, useWebWorker: true, initialQuality: q };
        const blob = await imageCompression(processed[i].file, opts);
        
        processed[i].newSize = blob.size;
        processed[i].saved = Math.round(((processed[i].origSize - blob.size) / processed[i].origSize) * 100);
        processed[i].status = 'done';
        processed[i].blob = blob;
        
        totalOrig += processed[i].origSize;
        totalNew += blob.size;
        zip.file(processed[i].name, blob);
        
        // Immediate UI update per file
        setFiles([...processed]);
      } catch (e) {
        processed[i].status = 'error';
      }
    }

    if (totalOrig > 0) {
      const content = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(content));
      setStats({
        savedMB: ((totalOrig - totalNew) / 1024 / 1024).toFixed(2),
        percent: Math.round(((totalOrig - totalNew) / totalOrig) * 100)
      });
      setStatus('done');
    }
  };

  const reset = () => {
    setFiles([]); setStatus('upload'); setZipUrl(null);
  };

  const formatSize = (b) => {
    if (!b) return '...';
    const s = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return parseFloat((b / Math.pow(1024, i)).toFixed(1)) + ' ' + s[i];
  };

  return (
    <div className="pro-tool-wrapper" style={{'--brand': color}}>
      <style>{`
        /* --- DESIGN SYSTEM --- */
        .pro-tool-wrapper {
          --bg: #ffffff;
          --surface: #f8fafc;
          --border: #e2e8f0;
          --text: #0f172a;
          --text-muted: #64748b;
          --brand-glow: rgba(79, 70, 229, 0.15);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          max-width: 960px; margin: 0 auto;
          color: var(--text);
        }

        /* --- ANIMATIONS --- */
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 var(--brand-glow); } 70% { box-shadow: 0 0 0 10px transparent; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* --- 1. UPLOAD HERO (The "Portal") --- */
        .upload-portal {
          background: var(--bg);
          border: 1px dashed var(--border);
          border-radius: 24px;
          height: 380px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .upload-portal:hover, .upload-portal.drag {
          border-color: var(--brand);
          box-shadow: 0 20px 40px -10px var(--brand-glow);
          transform: translateY(-2px);
        }
        
        /* Background Grid */
        .grid-pattern {
          position: absolute; inset: 0; opacity: 0.4;
          background-image: radial-gradient(var(--border) 1px, transparent 1px);
          background-size: 24px 24px; pointer-events: none;
        }

        .liquid-orb {
          width: 100px; height: 100px; background: linear-gradient(135deg, #eff6ff, #e0e7ff);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 32px; color: var(--brand); margin-bottom: 24px;
          box-shadow: 0 10px 30px -10px var(--brand-glow);
          position: relative; z-index: 2;
        }
        .liquid-orb::after {
          content: ''; position: absolute; inset: -5px; border-radius: 50%;
          border: 1px solid var(--brand); opacity: 0.2; animation: pulse 2s infinite;
        }

        .portal-title { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; position: relative; z-index: 2; }
        .portal-sub { color: var(--text-muted); font-size: 1.1rem; position: relative; z-index: 2; }
        .portal-btn {
          margin-top: 30px; background: var(--text); color: white;
          padding: 14px 32px; border-radius: 12px; font-weight: 600;
          position: relative; z-index: 2; transition: 0.2s;
        }
        .portal-btn:hover { background: var(--brand); transform: scale(1.05); }

        /* --- 2. WORKSPACE (The "Dashboard") --- */
        .dashboard {
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 20px; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
          overflow: hidden; animation: slideUp 0.4s ease-out;
        }

        /* HEADER / TOOLBAR */
        .dash-header {
          padding: 20px 30px; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 10;
        }
        
        .stat-badge {
          display: flex; align-items: center; gap: 10px;
          background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 16px;
          border-radius: 10px; color: #166534; font-weight: 700; font-size: 0.9rem;
        }

        .download-trigger {
          background: var(--brand); color: white; text-decoration: none;
          padding: 12px 24px; border-radius: 10px; font-weight: 600;
          display: flex; align-items: center; gap: 8px; transition: 0.2s;
          box-shadow: 0 4px 12px var(--brand-glow);
        }
        .download-trigger:hover { filter: brightness(110%); transform: translateY(-1px); }

        /* SLIDER */
        .quality-control {
          display: flex; align-items: center; gap: 12px;
          background: var(--surface); padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border);
        }
        .q-txt { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        input[type=range] { width: 120px; accent-color: var(--brand); cursor: pointer; }

        /* FILE LIST (Table-ish) */
        .file-stack { padding: 0; list-style: none; margin: 0; }
        
        .file-item {
          display: grid; grid-template-columns: 60px 2fr 1fr 1fr 50px;
          align-items: center; padding: 16px 30px;
          border-bottom: 1px solid var(--surface);
          transition: background 0.1s;
        }
        .file-item:hover { background: #fafafa; }
        .file-item:last-child { border-bottom: none; }

        .f-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; background: #eee; border: 1px solid var(--border); }
        .f-name { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 20px; }
        
        .f-stat { font-family: 'SF Mono', 'Menlo', monospace; font-size: 0.85rem; color: var(--text-muted); }
        .f-stat.new { color: var(--text); font-weight: 600; }
        
        .f-badge {
          display: inline-block; padding: 4px 8px; border-radius: 6px;
          font-size: 0.75rem; font-weight: 700;
        }
        .f-badge.saved { background: #dcfce7; color: #15803d; }
        .f-badge.working { background: #eff6ff; color: var(--brand); }

        .spinner { width: 16px; height: 16px; border: 2px solid #e2e8f0; border-top-color: var(--brand); border-radius: 50%; animation: spin 1s linear infinite; }

        .icon-btn { 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 6px; cursor: pointer; color: var(--text-muted); transition: 0.2s;
        }
        .icon-btn:hover { background: #fee2e2; color: #ef4444; }

        /* ADD MORE BAR */
        .add-bar {
          padding: 16px; background: var(--surface); text-align: center;
          border-top: 1px solid var(--border); cursor: pointer;
          color: var(--text-muted); font-weight: 600; font-size: 0.9rem;
          transition: 0.2s;
        }
        .add-bar:hover { background: #f1f5f9; color: var(--brand); }

        @media(max-width: 640px) {
          .file-item { grid-template-columns: 50px 1fr 50px; }
          .f-stat { display: none; } /* Hide stats on mobile, keep name and status */
          .dash-header { flex-direction: column; gap: 15px; align-items: stretch; }
          .quality-control { justify-content: space-between; }
        }
      `}</style>

      {/* --- VIEW 1: UPLOAD --- */}
      {status === 'upload' && (
        <div 
          className={`upload-portal ${isDragging ? 'drag' : ''}`}
          onDragOver={e => { e.preventDefault(); handleDrag(e, true); }}
          onDragLeave={e => { e.preventDefault(); handleDrag(e, false); }}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="grid-pattern"></div>
          <div className="liquid-orb">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <h2 className="portal-title">Smart Image Compressor</h2>
          <p className="portal-sub">Drag files here to optimize instantly</p>
          <button className="portal-btn">Browse Files</button>
        </div>
      )}

      {/* --- VIEW 2: DASHBOARD --- */}
      {(status === 'processing' || status === 'done') && (
        <div className="dashboard">
          
          {/* STICKY HEADER */}
          <div className="dash-header">
            
            {/* Left: Quality */}
            <div className="quality-control">
              <span className="q-txt">Quality</span>
              <input 
                type="range" min="0.1" max="1.0" step="0.05" 
                value={quality} onChange={e => setQuality(parseFloat(e.target.value))}
              />
              <span style={{fontWeight:'700', fontSize:'0.9rem', width:'35px', textAlign:'right'}}>
                {Math.round(quality*100)}%
              </span>
            </div>

            {/* Right: Actions */}
            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
              {status === 'done' && (
                <div className="stat-badge">
                  <i className="fa-solid fa-leaf"></i> Saved {stats.savedMB}MB
                </div>
              )}
              
              {status === 'done' ? (
                <a href={zipUrl} download="optimized.zip" className="download-trigger">
                  Download All <i className="fa-solid fa-arrow-down"></i>
                </a>
              ) : (
                <div style={{color: color, fontWeight:'600', fontSize:'0.9rem', display:'flex', gap:'8px', alignItems:'center'}}>
                  <div className="spinner"></div> Processing...
                </div>
              )}
            </div>
          </div>

          {/* FILE STACK */}
          <div className="file-stack">
            {files.map(f => (
              <div key={f.id} className="file-item">
                <img src={f.preview} className="f-thumb" alt="" />
                
                <div className="f-name" title={f.name}>{f.name}</div>
                
                <div className="f-stat">
                  {formatSize(f.origSize)}
                  {f.status === 'done' && <i className="fa-solid fa-arrow-right" style={{margin:'0 8px', fontSize:'10px', opacity:0.4}}></i>}
                </div>
                
                <div className="f-stat new">
                  {f.status === 'done' ? formatSize(f.newSize) : ''}
                </div>
                
                <div style={{textAlign:'right'}}>
                   {f.status === 'working' && <div className="spinner"></div>}
                   {f.status === 'done' && <span className="f-badge saved">-{f.saved}%</span>}
                   {f.status === 'error' && <span style={{color:'red'}}>Error</span>}
                </div>
              </div>
            ))}
          </div>

          {/* ADD MORE FOOTER */}
          <div className="add-bar" onClick={() => fileInputRef.current.click()}>
            <i className="fa-solid fa-plus"></i> Add more images
          </div>
          
          {status === 'done' && (
            <div style={{textAlign:'center', padding:'20px'}}>
               <button onClick={reset} style={{background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:'0.85rem'}}>
                 Start New Batch
               </button>
            </div>
          )}

        </div>
      )}

      <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={e => handleFiles(e.target.files)} style={{display:'none'}} />
    </div>
  );
}
