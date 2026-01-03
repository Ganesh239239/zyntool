import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#2563eb' }) {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace, finished
  const [quality, setQuality] = useState(0.7); 
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);

  // --- RELATED TOOLS CONFIG (Edit your links here) ---
  const relatedTools = [
    { name: 'Resize Image', icon: 'fa-solid fa-expand', link: '/tools/resize-image' },
    { name: 'Crop Image', icon: 'fa-solid fa-crop-simple', link: '/tools/crop-image' },
    { name: 'Convert to JPG', icon: 'fa-solid fa-image', link: '/tools/convert-to-jpg' },
    { name: 'Watermark', icon: 'fa-solid fa-stamp', link: '/tools/watermark-image' },
  ];

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
    let oldTotal = 0; 
    let newTotal = 0;

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

    setTimeout(() => { setProcessing(false); setViewState('finished'); }, 500);
  };

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); setProgress(0); };
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  return (
    <div className="dev-compressor-root" style={{'--accent': color}}>
      <style>{`
        .dev-compressor-root {
          font-family: -apple-system, system-ui, sans-serif;
          max-width: 900px; margin: 0 auto; color: #1e293b;
        }

        /* 1. UPLOAD ZONE */
        .upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          height: 300px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: all 0.2s; background: #f8fafc; cursor: pointer;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: #22c55e; background: #f0fdf4;
        }
        /* THE GREEN ICON STYLE */
        .upload-zone i { 
          font-size: 56px; 
          color: #22c55e; /* Green Color */
          margin-bottom: 20px; 
          transition: 0.2s; 
          filter: drop-shadow(0 4px 6px rgba(34, 197, 94, 0.2));
        }
        .upload-zone:hover i { transform: scale(1.1); }
        
        .upload-main-text { font-size: 1.4rem; font-weight: 700; color: #334155; }
        .upload-sub-text { font-size: 0.95rem; color: #64748b; margin-top: 8px; }

        /* 2. WORKSPACE */
        .workspace { margin-top: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        
        /* SUCCESS BANNER */
        .success-banner {
          background: #f0fdf4; border-bottom: 1px solid #dcfce7;
          padding: 24px; text-align: center; animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .stat-row { display: flex; justify-content: center; gap: 40px; margin: 16px 0 24px 0; }
        .stat h3 { font-size: 0.8rem; text-transform: uppercase; color: #15803d; margin: 0 0 4px 0; }
        .stat p { font-size: 1.5rem; font-weight: 800; color: #166534; margin: 0; }
        .dl-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #22c55e; color: white; padding: 12px 30px;
          border-radius: 6px; text-decoration: none; font-weight: 700;
          transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.3);
        }
        .dl-btn:hover { background: #16a34a; transform: translateY(-1px); }

        /* TOOLBAR */
        .toolbar {
          display: flex; gap: 24px; align-items: flex-end; justify-content: space-between;
          padding: 20px; border-bottom: 1px solid #e2e8f0; background: #fff;
        }
        .slider-group { flex: 1; max-width: 400px; }
        .slider-header { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: #64748b; margin-bottom: 12px; }
        
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer; }
        input[type=range]:focus { outline: none; }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 6px; border-radius: 4px;
          background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--fill-pct), #e2e8f0 var(--fill-pct), #e2e8f0 100%);
        }
        input[type=range]::-webkit-slider-thumb {
          height: 20px; width: 20px; border-radius: 50%;
          background: #ffffff; border: 2px solid var(--accent);
          -webkit-appearance: none; margin-top: -7px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.1s;
        }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.1); }
        
        .actions { display: flex; gap: 12px; }
        .btn { padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
        .btn-ghost { background: transparent; color: #475569; border-color: #cbd5e1; }
        .btn-ghost:hover { background: #f1f5f9; color: #0f172a; }
        .btn-primary { background: #0f172a; color: white; }
        .btn-primary:hover { background: #000; }
        .btn-primary:disabled { opacity: 0.6; cursor: wait; }

        /* FILE LIST */
        .list-header {
          display: grid; grid-template-columns: 60px 2fr 1fr 1fr 40px;
          background: #f8fafc; padding: 12px 16px;
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .list-row {
          display: grid; grid-template-columns: 60px 2fr 1fr 1fr 40px;
          align-items: center; padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9; background: white; font-size: 0.9rem;
        }
        .list-row:last-child { border-bottom: none; }
        .preview-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; background: #eee; }
        .fname { font-weight: 500; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px; }
        .fsize { color: #64748b; font-family: monospace; font-size: 0.85rem; }

        /* LOADING BAR */
        .progress-line { height: 4px; background: #e2e8f0; width: 100%; position: relative; overflow: hidden; }
        .progress-active { height: 100%; background: var(--accent); transition: width 0.2s; }

        /* 3. RELATED TOOLS GRID (iloveimg style) */
        .related-section {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid #e2e8f0;
        }
        .related-title { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 24px; text-align: center; }
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
        }
        .tool-link {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          text-decoration: none; color: #475569; transition: all 0.2s;
        }
        .tool-link:hover {
          transform: translateY(-3px); border-color: var(--accent); color: var(--accent);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
        }
        .tool-icon { font-size: 28px; margin-bottom: 12px; color: #94a3b8; transition: 0.2s; }
        .tool-link:hover .tool-icon { color: var(--accent); }
        .tool-name { font-weight: 600; font-size: 0.9rem; text-align: center; }

        @media (max-width: 600px) {
          .toolbar { flex-direction: column; align-items: stretch; }
          .list-header, .list-row { grid-template-columns: 50px 1fr 40px; }
          .list-header > :nth-child(3), .list-header > :nth-child(4),
          .list-row > :nth-child(3), .list-row > :nth-child(4) { display: none; }
          .tools-grid { grid-template-columns: repeat(2, 1fr); }
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
          {/* GREEN ICON HERE */}
          <i className="fa-solid fa-cloud-arrow-up"></i>
          
          <div className="upload-main-text">Click or Drop Images</div>
          <div className="upload-sub-text">Up to 50 files • JPG, PNG, WebP</div>
        </div>
      )}

      {/* --- VIEW 2: WORKSPACE --- */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* SUCCESS BANNER */}
          {viewState === 'finished' && result && (
            <div className="success-banner">
              <h2 style={{fontSize: '1.5rem', marginBottom:'10px', color: '#166534'}}>Optimization Complete</h2>
              <div className="stat-row">
                <div className="stat"><h3>Saved</h3><p>{result.saved}%</p></div>
                <div className="stat"><h3>Size</h3><p>{result.newMB} MB</p></div>
              </div>
              <a href={result.url} download="optimized-images.zip" className="dl-btn">
                <i className="fa-solid fa-download"></i> Download ZIP
              </a>
            </div>
          )}
          
          {/* TOOLBAR */}
          <div className="toolbar">
            <div className="slider-group">
              <div className="slider-header">
                <span>Quality</span>
                <span style={{color: color}}>{Math.round(quality * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.05"
                value={quality} onChange={e => setQuality(parseFloat(e.target.value))}
                style={{'--fill-pct': `${((quality - 0.1) / 0.9) * 100}%`}}
                disabled={processing || viewState === 'finished'}
              />
            </div>
            <div className="actions">
              {viewState === 'finished' ? (
                <button className="btn btn-ghost" onClick={reset}><i className="fa-solid fa-rotate-right"></i> New</button>
              ) : (
                <>
                  <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()}>+ Add</button>
                  <button className="btn btn-primary" onClick={runCompression} disabled={processing}>
                    {processing ? `Working...` : 'Compress'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PROGRESS BAR */}
          {processing && (
            <div className="progress-line"><div className="progress-active" style={{width: `${progress}%`}}></div></div>
          )}

          {/* FILE LIST */}
          <div className="file-list">
            <div className="list-header"><span>Preview</span><span>Filename</span><span>Original</span><span>New Size</span><span></span></div>
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {files.map(f => (
                <div key={f.id} className="list-row">
                  <img src={f.preview} className="preview-thumb" alt="" />
                  <div className="fname" title={f.name}>{f.name}</div>
                  <div className="fsize">{formatBytes(f.origSize)}</div>
                  <div className="fsize" style={{color: f.status==='done' ? '#16a34a' : ''}}>
                     {f.newSize ? formatBytes(f.newSize) : '—'}
                  </div>
                  <div style={{textAlign: 'center'}}>
                    {f.status === 'done' ? (
                      <i className="fa-solid fa-check" style={{color:'#16a34a'}}></i>
                    ) : (
                      !processing && <button onClick={() => removeFile(f.id)} style={{border:'none', background:'none', cursor:'pointer', color:'#94a3b8'}}><i className="fa-solid fa-xmark"></i></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SECTION 3: RELATED TOOLS (Internal Linking) --- */}
      <div className="related-section">
        <h3 className="related-title">More PDF & Image Tools</h3>
        <div className="tools-grid">
          {relatedTools.map((tool, index) => (
            <a key={index} href={tool.link} className="tool-link">
              <i className={`${tool.icon} tool-icon`}></i>
              <span className="tool-name">{tool.name}</span>
            </a>
          ))}
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
