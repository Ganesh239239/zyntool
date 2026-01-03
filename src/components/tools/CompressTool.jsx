import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#3b82f6' }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState(0.75);
  const [isCompressing, setIsCompressing] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  const [totalSaved, setTotalSaved] = useState(0);

  const fileInputRef = useRef(null);

  // --- HANDLERS ---
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
      status: 'queued', // queued, working, done
      saved: 0
    }));

    setFiles(prev => [...prev, ...newEntries]);
    // Auto start compression for smoother UX (Like TinyPNG)
    compressQueue([...files, ...newEntries], quality);
  };

  // Re-run compression if quality changes
  const handleQualityChange = (newQ) => {
    setQuality(newQ);
    // Only re-compress if we have files
    if (files.length > 0) {
      compressQueue(files, newQ);
    }
  };

  const compressQueue = async (fileList, q) => {
    setIsCompressing(true);
    let processed = [...fileList];
    let oldTotal = 0;
    let newTotal = 0;
    const zip = new JSZip();

    for (let i = 0; i < processed.length; i++) {
      const item = processed[i];
      oldTotal += item.origSize;
      
      // Update UI to show working
      processed[i].status = 'working';
      setFiles([...processed]);

      try {
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: q };
        const blob = await imageCompression(item.file, options);
        
        processed[i].newSize = blob.size;
        processed[i].saved = Math.round(((item.origSize - blob.size) / item.origSize) * 100);
        processed[i].status = 'done';
        processed[i].blob = blob;
        
        newTotal += blob.size;
        zip.file(item.name, blob);
      } catch (e) {
        console.error(e);
        processed[i].status = 'error';
      }
      setFiles([...processed]);
    }

    if (processed.length > 0) {
      const content = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(content));
      setTotalSaved(Math.round(((oldTotal - newTotal) / oldTotal) * 100));
    }
    setIsCompressing(false);
  };

  const removeFile = (id) => {
    const next = files.filter(f => f.id !== id);
    setFiles(next);
    if (next.length === 0) setZipUrl(null);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  return (
    <div className="compress-master">
      <style>{`
        .compress-master {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 900px; margin: 0 auto; color: #334155;
        }

        /* --- 1. UPLOAD HEADER (The "TinyPNG" Style) --- */
        .upload-header {
          border: 2px dashed #cbd5e1;
          border-radius: 20px;
          background: #f8fafc;
          padding: 60px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .upload-header:hover, .upload-header.drag {
          background: #eff6ff; border-color: var(--brand);
          transform: translateY(-2px);
        }
        .brand-icon {
          width: 70px; height: 70px; background: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; color: var(--brand); margin: 0 auto 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .main-title { font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .sub-title { color: #64748b; font-size: 1.1rem; }
        .upload-btn {
          margin-top: 25px; background: var(--brand); color: white;
          padding: 14px 36px; border-radius: 50px; font-weight: 700; border: none; font-size: 1rem;
          cursor: pointer; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3); transition: 0.2s;
        }
        .upload-btn:hover { transform: scale(1.05); }

        /* --- 2. SETTINGS BAR (Sticky) --- */
        .settings-bar {
          display: flex; justify-content: space-between; align-items: center;
          background: white; padding: 20px; border-radius: 12px;
          box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;
          margin: 30px 0; flex-wrap: wrap; gap: 20px;
        }
        .range-wrap { flex: 1; min-width: 250px; display: flex; align-items: center; gap: 15px; }
        .q-label { font-weight: 700; font-size: 0.9rem; text-transform: uppercase; color: #94a3b8; }
        
        input[type=range] { flex: 1; accent-color: var(--brand); cursor: pointer; }
        
        .download-all-btn {
          background: #10b981; color: white; text-decoration: none;
          padding: 12px 24px; border-radius: 8px; font-weight: 700;
          display: flex; align-items: center; gap: 8px; transition: 0.2s;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
        }
        .download-all-btn:hover { background: #059669; transform: translateY(-2px); }
        .download-all-btn.disabled { background: #cbd5e1; pointer-events: none; box-shadow: none; }

        /* --- 3. THE FILE LIST (Row based like competitors) --- */
        .file-list { display: flex; flex-direction: column; gap: 12px; }
        
        .file-row {
          display: flex; align-items: center; background: white;
          padding: 12px 20px; border-radius: 12px; border: 1px solid #f1f5f9;
          transition: transform 0.2s;
        }
        .file-row:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        
        .thumb { width: 48px; height: 48px; border-radius: 6px; object-fit: cover; background: #eee; margin-right: 20px; }
        
        .info-col { flex: 1; min-width: 0; }
        .fname { font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fmeta { font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        
        /* The Magic "Green" Text */
        .saved-tag { 
          color: #10b981; font-weight: 800; font-size: 0.9rem; 
          background: #d1fae5; padding: 2px 8px; border-radius: 4px;
        }
        
        .status-col { width: 150px; text-align: right; }
        .working-bar {
          height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; width: 100%;
        }
        .bar-fill {
          height: 100%; background: var(--brand); width: 60%;
          animation: progress 1s infinite linear;
        }
        @keyframes progress { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        .action-col { margin-left: 20px; display: flex; gap: 10px; }
        .icon-btn {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; cursor: pointer; color: #94a3b8; transition: 0.2s;
        }
        .icon-btn:hover { background: #f1f5f9; color: #334155; }
        .icon-btn.del:hover { background: #fee2e2; color: #ef4444; }

        /* Mobile */
        @media(max-width: 600px) {
          .file-row { flex-wrap: wrap; }
          .status-col { display: none; } /* Hide loading bar on mobile to save space */
          .info-col { width: 100%; margin-bottom: 10px; }
          .action-col { margin-left: auto; }
        }
      `}</style>

      {/* --- SECTION 1: UPLOAD AREA --- */}
      <div 
        className={`upload-header ${isDragging ? 'drag' : ''}`} style={{'--brand': color}}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="brand-icon"><i className="fa-solid fa-compress"></i></div>
        <h1 className="main-title">Compress JPG, PNG & WebP</h1>
        <p className="sub-title">Reduce file size while maintaining the best quality.</p>
        <button className="upload-btn">Select Images</button>
      </div>

      {/* --- SECTION 2: SETTINGS & DOWNLOAD --- */}
      {files.length > 0 && (
        <div className="settings-bar" style={{'--brand': color}}>
          <div className="range-wrap">
            <span className="q-label">Quality: {Math.round(quality * 100)}%</span>
            <input 
              type="range" min="0.1" max="1.0" step="0.05" 
              value={quality} onChange={e => handleQualityChange(parseFloat(e.target.value))}
              disabled={isCompressing}
            />
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            {totalSaved > 0 && (
              <span style={{color:'#10b981', fontWeight:'bold'}}>
                Saved {totalSaved}% Total
              </span>
            )}
            <a 
              href={zipUrl} 
              download="optimized-images.zip" 
              className={`download-all-btn ${(!zipUrl || isCompressing) ? 'disabled' : ''}`}
            >
              <i className="fa-solid fa-download"></i> Download All
            </a>
          </div>
        </div>
      )}

      {/* --- SECTION 3: THE LIST --- */}
      <div className="file-list" style={{'--brand': color}}>
        {files.map(f => (
          <div key={f.id} className="file-row">
            <img src={f.preview} className="thumb" alt="" />
            
            <div className="info-col">
              <div className="fname" title={f.name}>{f.name}</div>
              <div className="fmeta">
                <span>{formatSize(f.origSize)}</span>
                
                {f.status === 'done' && (
                  <>
                    <i className="fa-solid fa-arrow-right" style={{fontSize:'10px', opacity:0.5}}></i>
                    <span style={{fontWeight:'700', color:'#334155'}}>{formatSize(f.newSize)}</span>
                    <span className="saved-tag">-{f.saved}%</span>
                  </>
                )}
                
                {f.status === 'working' && <span style={{color:color, fontWeight:'600'}}>Compressing...</span>}
                {f.status === 'queued' && <span style={{color:'#94a3b8'}}>Queued...</span>}
              </div>
            </div>

            {/* Desktop Status Bar */}
            <div className="status-col">
              {f.status === 'working' && (
                <div className="working-bar"><div className="bar-fill"></div></div>
              )}
            </div>

            <div className="action-col">
              {f.status === 'done' && (
                <a 
                  href={URL.createObjectURL(f.blob)} 
                  download={`min-${f.name}`} 
                  className="icon-btn" 
                  title="Download Single"
                >
                  <i className="fa-solid fa-download"></i>
                </a>
              )}
              <div className="icon-btn del" onClick={() => removeFile(f.id)}>
                <i className="fa-solid fa-xmark"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
