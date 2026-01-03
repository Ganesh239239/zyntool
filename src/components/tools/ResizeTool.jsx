import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export default function ResizeTool({ color = '#10b981' }) { // Emerald Green
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace, finished
  const [targetW, setTargetW] = useState('');
  const [targetH, setTargetH] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [format, setFormat] = useState('original');
  const [quality, setQuality] = useState(0.9);
  
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- RELATED TOOLS (SEO Internal Linking) ---
  const relatedTools = [
    { name: 'Compress Image', icon: 'fa-solid fa-compress', link: '/tools/compress-image' },
    { name: 'Crop Image', icon: 'fa-solid fa-crop-simple', link: '/tools/crop-image' },
    { name: 'Convert to JPG', icon: 'fa-solid fa-image', link: '/tools/convert-to-jpg' },
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

    // Detect first image dimensions for defaults
    const img = new Image();
    img.onload = () => {
      setTargetW(img.width);
      setTargetH(img.height);
      setAspectRatio(img.width / img.height);
      
      const newEntries = valid.map(f => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        origSize: f.size,
        dims: `${img.width}x${img.height}`,
        status: 'pending'
      }));
      setFiles(prev => [...prev, ...newEntries]);
      setViewState('workspace');
    };
    img.src = URL.createObjectURL(valid[0]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) setViewState('upload');
  };

  const handleWidthChange = (e) => {
    const val = Number(e.target.value);
    setTargetW(val);
    if (lockAspect && val > 0) setTargetH(Math.round(val / aspectRatio));
  };

  const handleHeightChange = (e) => {
    const val = Number(e.target.value);
    setTargetH(val);
    if (lockAspect && val > 0) setTargetW(Math.round(val * aspectRatio));
  };

  const processResize = async () => {
    setProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    let completed = 0;

    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      try {
        const blob = await resizeImageCanvas(item.file, targetW, targetH, format, quality);
        
        // Handle extension change
        let newName = item.name;
        if (format !== 'original') {
          const ext = format.split('/')[1];
          newName = item.name.substring(0, item.name.lastIndexOf('.')) + '.' + ext;
        }

        zip.file(newName, blob);
        processedFiles[i].status = 'done';
        processedFiles[i].newSize = blob.size;
        setFiles([...processedFiles]); // Update UI
        
        completed++;
        setProgress(Math.round((completed / files.length) * 100));
      } catch (err) { console.error(err); }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setResult({
      url: URL.createObjectURL(content),
      count: files.length,
      finalW: targetW,
      finalH: targetH,
      size: (content.size / 1024 / 1024).toFixed(2)
    });

    setTimeout(() => { setProcessing(false); setViewState('finished'); }, 500);
  };

  const resizeImageCanvas = (file, w, h, fmt, q) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const mime = fmt === 'original' ? file.type : fmt;
        canvas.toBlob(resolve, mime, q);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); setProgress(0); };

  return (
    <div className="resize-tool" style={{'--theme': color}}>
      <style>{`
        .resize-tool {
          font-family: 'Inter', system-ui, sans-serif;
          max-width: 1100px; margin: 0 auto; color: #0f172a;
        }

        /* --- 1. LIQUID UPLOAD BOX (Consistent Style) --- */
        .upload-box {
          position: relative; height: 320px;
          border-radius: 24px; border: 2px dashed rgba(16, 185, 129, 0.3);
          background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden; transition: all 0.3s ease;
        }
        .upload-box:hover, .upload-box.drag {
          border-color: var(--theme); transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.15);
        }
        .liquid-icon {
          width: 100px; height: 100px; background: white; border-radius: 50%;
          position: relative; overflow: hidden; margin-bottom: 24px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          display: flex; align-items: center; justify-content: center; z-index: 2;
        }
        .liquid-icon i { font-size: 40px; color: var(--theme); z-index: 5; }
        .wave {
          position: absolute; bottom: 0; left: 0; width: 200%; height: 200%;
          background: var(--theme); opacity: 0.1; border-radius: 40%;
          animation: spin 6s linear infinite; margin-left: -50%; margin-bottom: -60%;
        }
        .wave:nth-child(2) { opacity: 0.2; animation-duration: 8s; margin-bottom: -65%; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .up-title { font-size: 1.4rem; font-weight: 700; color: #064e3b; margin-bottom: 8px; }
        .up-sub { color: #64748b; font-weight: 500; }

        /* --- 2. WORKSPACE (Professional Split Layout) --- */
        .workspace {
          display: flex; gap: 0; border: 1px solid #e2e8f0; border-radius: 16px; 
          background: white; overflow: hidden; min-height: 500px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        
        /* LEFT: Canvas */
        .stage-area {
          flex: 1; background: #f1f5f9; padding: 40px;
          display: flex; flex-direction: column; align-items: center;
          border-right: 1px solid #e2e8f0; position: relative;
        }
        .preview-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 16px; width: 100%; max-width: 800px;
        }
        .img-card {
          background: white; padding: 10px; border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05); position: relative;
          transition: transform 0.2s;
        }
        .img-card:hover { transform: translateY(-2px); }
        .img-card img { width: 100%; height: 100px; object-fit: contain; background: #eee; border-radius: 4px; }
        .img-card p { font-size: 0.75rem; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .del-btn {
          position: absolute; top: -6px; right: -6px; width: 22px; height: 22px;
          background: #ef4444; color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 10px; opacity: 0; transition: 0.2s;
        }
        .img-card:hover .del-btn { opacity: 1; }

        /* RIGHT: Sidebar */
        .sidebar { width: 320px; display: flex; flex-direction: column; background: white; }
        .sidebar-header {
          padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
          font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px;
        }
        .sidebar-body { padding: 24px; flex: 1; }
        
        .control-block { margin-bottom: 24px; }
        .lbl { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
        
        .dim-input-group { display: flex; align-items: center; gap: 8px; }
        .dim-box { flex: 1; }
        .dim-input { 
          width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;
          font-family: monospace; font-size: 1rem; color: #0f172a;
        }
        .dim-input:focus { outline: none; border-color: var(--theme); }
        .sub-lbl { font-size: 0.7rem; color: #94a3b8; margin-top: 4px; }

        .link-btn {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #cbd5e1; background: #f8fafc;
        }
        .link-btn.active { background: #d1fae5; color: #059669; border-color: #059669; }

        .select-box {
          width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;
          background: white; font-size: 0.9rem;
        }

        .sidebar-footer { padding: 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
        .action-btn {
          width: 100%; padding: 16px; border-radius: 8px; border: none;
          background: #0f172a; color: white; font-weight: 700; font-size: 1rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.2s;
        }
        .action-btn:hover { background: black; }
        .action-btn:disabled { opacity: 0.7; cursor: wait; }

        /* --- 3. RESULT CARD (Developer Style) --- */
        .result-overlay {
          padding: 60px 20px; display: flex; flex-direction: column; align-items: center;
          text-align: center; animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
        
        .result-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 40px; width: 100%; max-width: 500px;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }
        .success-icon {
          width: 64px; height: 64px; background: #d1fae5; color: #059669;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 30px; margin: 0 auto 20px;
        }
        .stat-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0;
          background: #f8fafc; padding: 20px; border-radius: 12px;
        }
        .stat-item h4 { font-size: 0.75rem; color: #64748b; margin: 0; text-transform: uppercase; }
        .stat-item p { font-size: 1.2rem; color: #0f172a; font-weight: 700; margin: 5px 0 0; }
        
        .dl-hero-btn {
          display: block; width: 100%; padding: 16px; background: var(--theme);
          color: white; text-decoration: none; font-weight: 700; border-radius: 10px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: transform 0.2s;
        }
        .dl-hero-btn:hover { transform: translateY(-2px); filter: brightness(105%); }
        
        .restart-btn {
          margin-top: 20px; background: none; border: none; color: #64748b;
          font-weight: 600; cursor: pointer; font-size: 0.9rem;
        }
        .restart-btn:hover { color: var(--theme); }

        /* RELATED TOOLS */
        .related-section { margin-top: 60px; padding-top: 40px; border-top: 1px solid #e2e8f0; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
        .tool-link {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          text-decoration: none; color: #475569; transition: all 0.2s;
        }
        .tool-link:hover { transform: translateY(-3px); border-color: var(--theme); color: var(--theme); }

        @media(max-width: 800px) {
          .workspace { flex-direction: column; }
          .sidebar { width: 100%; border-left: none; border-top: 1px solid #e2e8f0; }
          .stage-area { min-height: 300px; }
        }
      `}</style>

      {/* VIEW 1: UPLOAD (Consistent Liquid Style) */}
      {viewState === 'upload' && (
        <div 
          className={`upload-box ${isDragging ? 'drag' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="liquid-icon">
            <div className="wave"></div>
            <div className="wave"></div>
            <i className="fa-solid fa-expand"></i>
          </div>
          <div className="up-title">Resize Images</div>
          <div className="up-sub">Batch resize JPG, PNG, WebP</div>
        </div>
      )}

      {/* VIEW 2: WORKSPACE (Split Layout) */}
      {(viewState === 'workspace' || processing) && (
        <div className="workspace">
          {/* LEFT: Canvas */}
          <div className="stage-area">
            <div className="preview-grid">
              {files.map(f => (
                <div key={f.id} className="img-card">
                  <div className="del-btn" onClick={() => removeFile(f.id)}>×</div>
                  <img src={f.preview} alt="" />
                  <p>{f.name}</p>
                  <p style={{color:'#64748b', fontSize:'10px'}}>{f.dims}</p>
                  {f.status==='done' && <div style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontSize:'20px'}}><i className="fa-solid fa-check-circle"></i></div>}
                </div>
              ))}
              <div 
                className="img-card" 
                style={{display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px dashed #cbd5e1', boxShadow:'none'}}
                onClick={() => fileInputRef.current.click()}
              >
                <i className="fa-solid fa-plus" style={{color:'#cbd5e1', fontSize:'24px'}}></i>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar Controls */}
          <div className="sidebar">
            <div className="sidebar-header">
              <i className="fa-solid fa-sliders"></i> Settings
            </div>
            
            <div className="sidebar-body">
              <div className="control-block">
                <span className="lbl">Dimensions (px)</span>
                <div className="dim-input-group">
                  <div className="dim-box">
                    <input type="number" className="dim-input" placeholder="W" value={targetW} onChange={handleWidthChange} />
                    <div className="sub-lbl">Width</div>
                  </div>
                  <div style={{paddingBottom:'16px'}}>
                    <button className={`link-btn ${lockAspect ? 'active' : ''}`} onClick={() => setLockAspect(!lockAspect)} title="Lock Aspect Ratio">
                      <i className={`fa-solid ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
                    </button>
                  </div>
                  <div className="dim-box">
                    <input type="number" className="dim-input" placeholder="H" value={targetH} onChange={handleHeightChange} />
                    <div className="sub-lbl">Height</div>
                  </div>
                </div>
              </div>

              <div className="control-block">
                <span className="lbl">Output Format</span>
                <select className="select-box" value={format} onChange={e => setFormat(e.target.value)}>
                  <option value="original">Keep Original</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>

            <div className="sidebar-footer">
              <button className="action-btn" onClick={processResize} disabled={processing || !targetW || !targetH}>
                {processing ? 'Processing...' : 'Resize Images'} <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: RESULT (Developer Card) */}
      {viewState === 'finished' && result && (
        <div className="result-overlay">
          <div className="result-card">
            <div className="success-icon">
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 style={{color: '#0f172a', marginBottom: '10px'}}>Job Completed!</h2>
            <p style={{color: '#64748b'}}>Your images have been successfully resized.</p>
            
            <div className="stat-grid">
              <div className="stat-item">
                <h4>Count</h4>
                <p>{result.count} Files</p>
              </div>
              <div className="stat-item">
                <h4>Target Size</h4>
                <p>{result.finalW} x {result.finalH}</p>
              </div>
            </div>

            <a href={result.url} download="resized-assets.zip" className="dl-hero-btn">
              Download All (ZIP)
            </a>
            
            <button className="restart-btn" onClick={reset}>
              <i className="fa-solid fa-rotate-left"></i> Resize New Batch
            </button>
          </div>
        </div>
      )}

      {/* RELATED TOOLS FOOTER */}
      <div className="related-section">
        <h3 style={{textAlign:'center', marginBottom:'24px', color:'#1e293b'}}>Related Tools</h3>
        <div className="tools-grid">
          {relatedTools.map((tool, index) => (
            <a key={index} href={tool.link} className="tool-link">
              <i className={`${tool.icon} tool-icon`}></i>
              <span className="tool-name">{tool.name}</span>
            </a>
          ))}
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden multiple onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
