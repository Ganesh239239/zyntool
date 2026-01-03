import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('upload'); // upload, processing, done
  const [quality, setQuality] = useState(0.7);
  const [totalSaved, setTotalSaved] = useState(0);
  const [zipUrl, setZipUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- LOGIC ---
  const handleDrag = (e, active) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(active);
  };

  const onDrop = (e) => {
    handleDrag(e, false);
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0) handleFiles({ target: { files: dt.files } });
  };

  const handleFiles = (e) => {
    const selected = e.target.files;
    if (!selected || !selected.length) return;

    const newFiles = Array.from(selected)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        origSize: f.size,
        newSize: null,
        status: 'pending' 
      }));

    setFiles(prev => [...prev, ...newFiles]);
    setStatus('processing'); 
  };

  const removeFile = (id) => {
    const next = files.filter(f => f.id !== id);
    setFiles(next);
    if (next.length === 0) setStatus('upload');
  };

  const startCompression = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldTotal = 0;
    let newTotal = 0;
    const processed = [...files];

    for (let i = 0; i < processed.length; i++) {
      const item = processed[i];
      oldTotal += item.origSize;
      
      try {
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: quality };
        const compressedBlob = await imageCompression(item.file, options);
        
        processed[i].newSize = compressedBlob.size;
        processed[i].status = 'done';
        newTotal += compressedBlob.size;
        zip.file(item.name, compressedBlob);
        setFiles([...processed]); 
      } catch (err) { console.error(err); }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setZipUrl(URL.createObjectURL(content));
    setTotalSaved(Math.round(((oldTotal - newTotal) / oldTotal) * 100));
    setStatus('done');
  };

  const reset = () => {
    setFiles([]); setStatus('upload'); setZipUrl(null);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="compress-tool-container">
      <style>{`
        /* --- CSS RESET & BASE --- */
        .compress-tool-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 1000px; margin: 0 auto; color: #1e293b;
        }

        /* --- 1. UPLOAD HERO --- */
        .upload-box {
          background: #ffffff;
          border-radius: 24px;
          border: 2px dashed #e2e8f0;
          padding: 80px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 40px;
        }
        .upload-box:hover, .upload-box.drag {
          border-color: #3b82f6;
          background: #f8fafc;
          transform: translateY(-4px);
          box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.15);
        }
        .icon-wrapper {
          width: 80px; height: 80px; background: #eff6ff; color: #3b82f6;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin: 0 auto 24px;
        }
        .hero-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        .hero-sub { color: #64748b; font-size: 1.1rem; margin-bottom: 30px; }
        .hero-btn {
          background: #0f172a; color: white; padding: 16px 40px;
          border-radius: 50px; font-weight: 700; font-size: 1rem;
          border: none; cursor: pointer; transition: 0.2s;
        }
        .hero-btn:hover { background: #3b82f6; }

        /* --- 2. WORKSPACE --- */
        .workspace-card {
          background: white; border-radius: 20px; border: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); overflow: hidden;
        }

        /* Toolbar */
        .toolbar {
          padding: 20px 30px; border-bottom: 1px solid #f1f5f9; background: #f8fafc;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;
        }
        .slider-group { flex: 1; min-width: 250px; max-width: 400px; display: flex; align-items: center; gap: 15px; }
        .range-input { flex: 1; cursor: pointer; accent-color: #3b82f6; height: 6px; }
        .quality-badge {
          background: white; border: 1px solid #e2e8f0; padding: 4px 10px;
          border-radius: 6px; font-weight: 700; color: #3b82f6; font-size: 0.9rem; font-family: monospace;
        }
        
        .action-group { display: flex; gap: 10px; }
        .btn { padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; font-size: 0.95rem; }
        .btn-ghost { background: white; border: 1px solid #e2e8f0; color: #64748b; }
        .btn-ghost:hover { background: #f1f5f9; color: #0f172a; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        .btn-primary:disabled { opacity: 0.7; cursor: wait; }
        .btn-download { background: #22c55e; color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .btn-download:hover { background: #16a34a; }

        /* Success Message */
        .success-bar {
          background: #f0fdf4; border-bottom: 1px solid #dcfce7;
          padding: 15px; text-align: center; color: #15803d; font-weight: 500;
        }

        /* File List */
        .file-list { max-height: 500px; overflow-y: auto; }
        .file-row {
          display: flex; align-items: center; padding: 15px 30px;
          border-bottom: 1px solid #f8fafc; transition: 0.2s;
        }
        .file-row:hover { background: #f8fafc; }
        .thumb {
          width: 50px; height: 50px; border-radius: 8px; object-fit: cover;
          background: #eee; border: 1px solid #e2e8f0; margin-right: 20px;
        }
        .f-info { flex: 1; }
        .f-name { font-weight: 600; color: #334155; margin-bottom: 4px; }
        .f-meta { font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 10px; }
        
        .badge-old { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .badge-new { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; }
        .badge-save { color: #16a34a; font-weight: 700; }

        .action-icon {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border-radius: 50%; color: #cbd5e1; cursor: pointer; transition: 0.2s;
        }
        .action-icon:hover { background: #fee2e2; color: #ef4444; }

        /* SEO Section */
        .seo-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px; margin-top: 60px;
        }
        .seo-card {
          background: white; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0;
        }
        .seo-icon {
          width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin-bottom: 20px;
        }
        .seo-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; color: #0f172a; }
        .seo-card p { color: #64748b; line-height: 1.6; }

        /* Colors for icons */
        .blue-icon { background: #eff6ff; color: #3b82f6; }
        .green-icon { background: #f0fdf4; color: #22c55e; }
        .purple-icon { background: #faf5ff; color: #a855f7; }

        /* Mobile */
        @media (max-width: 600px) {
          .toolbar { flex-direction: column; align-items: stretch; }
          .file-row { padding: 15px; }
        }
      `}</style>

      {/* --- STEP 1: UPLOAD HERO --- */}
      {status === 'upload' && (
        <div 
          className={`upload-box ${isDragging ? 'drag' : ''}`}
          onDragOver={e => { e.preventDefault(); handleDrag(e, true); }}
          onDragLeave={e => { e.preventDefault(); handleDrag(e, false); }}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="icon-wrapper">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h2 className="hero-title">Upload Images to Compress</h2>
          <p className="hero-sub">Drag & Drop or Select files (JPG, PNG, WEBP)</p>
          <button className="hero-btn">Select Images</button>
        </div>
      )}

      {/* --- STEP 2: WORKSPACE --- */}
      {(status === 'processing' || status === 'working' || status === 'done') && (
        <div className="workspace-card">
          
          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="slider-group">
              <span style={{fontWeight:'600', color:'#475569'}}>Quality:</span>
              <input 
                type="range" min="0.1" max="1.0" step="0.05" 
                value={quality} 
                onChange={e => setQuality(parseFloat(e.target.value))}
                disabled={status !== 'processing'}
                className="range-input"
              />
              <span className="quality-badge">{Math.round(quality * 100)}%</span>
            </div>

            <div className="action-group">
              {status === 'done' ? (
                <>
                  <button onClick={reset} className="btn btn-ghost">New Batch</button>
                  <a href={zipUrl} download="compressed.zip" className="btn btn-download">
                    <i className="fa-solid fa-download"></i> Download All
                  </a>
                </>
              ) : (
                <>
                  <button onClick={() => fileInputRef.current.click()} className="btn btn-ghost">+ Add</button>
                  <button className="btn btn-primary" onClick={startCompression} disabled={status === 'working'}>
                    {status === 'working' ? 'Compressing...' : 'Compress Images'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {status === 'done' && (
            <div className="success-bar">
              <i className="fa-solid fa-check-circle"></i> Awesome! You saved <b>{totalSaved}%</b> file size.
            </div>
          )}

          {/* FILE LIST */}
          <div className="file-list">
            {files.map((f) => (
              <div key={f.id} className="file-row">
                <img src={f.preview} alt="" className="thumb" />
                <div className="f-info">
                  <div className="f-name">{f.name}</div>
                  <div className="f-meta">
                    <span className="badge-old">{formatSize(f.origSize)}</span>
                    {f.status === 'done' && (
                      <>
                        <i className="fa-solid fa-arrow-right" style={{fontSize:'12px', margin:'0 8px'}}></i>
                        <span className="badge-new">{formatSize(f.newSize)}</span>
                        <span className="badge-save" style={{marginLeft:'10px'}}>
                          -{Math.round((1 - f.newSize/f.origSize)*100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Actions */}
                {f.status !== 'done' && status !== 'working' && (
                  <div className="action-icon" onClick={() => removeFile(f.id)}>
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                )}
                {f.status === 'done' && (
                  <div style={{color:'#22c55e', fontSize:'20px'}}><i className="fa-solid fa-check"></i></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Input */}
      <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFiles} style={{display:'none'}} />

      {/* --- SEO SECTION --- */}
      <div className="seo-grid">
        <div className="seo-card">
          <div className="seo-icon blue-icon"><i className="fa-solid fa-bolt"></i></div>
          <h3>Lightning Fast</h3>
          <p>Compression happens directly in your browser. No files are uploaded to any server, ensuring maximum speed.</p>
        </div>
        <div className="seo-card">
          <div className="seo-icon green-icon"><i className="fa-solid fa-shield-halved"></i></div>
          <h3>100% Secure</h3>
          <p>Your photos never leave your device. We use advanced client-side technology to ensure absolute privacy.</p>
        </div>
        <div className="seo-card">
          <div className="seo-icon purple-icon"><i className="fa-solid fa-layer-group"></i></div>
          <h3>Batch Processing</h3>
          <p>Select up to 50 images at once. Our tool automatically optimizes them and lets you download a single ZIP file.</p>
        </div>
      </div>

    </div>
  );
}
