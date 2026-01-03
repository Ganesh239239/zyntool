import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export default function ResizeTool({ color = '#22c55e' }) { // Green theme default
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace, finished
  const [targetW, setTargetW] = useState('');
  const [targetH, setTargetH] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [format, setFormat] = useState('original'); // original, image/jpeg, image/png, image/webp
  
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- RELATED TOOLS LINKS ---
  const relatedTools = [
    { name: 'Compress Image', icon: 'fa-solid fa-compress', link: '/tools/compress-image' },
    { name: 'Crop Image', icon: 'fa-solid fa-crop-simple', link: '/tools/crop-image' },
    { name: 'Convert to JPG', icon: 'fa-solid fa-image', link: '/tools/convert-to-jpg' },
    { name: 'Watermark', icon: 'fa-solid fa-stamp', link: '/tools/watermark-image' },
  ];

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

    // We use the first image to set default dimensions and aspect ratio
    const firstUrl = URL.createObjectURL(valid[0]);
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
        origW: 0, // Will fill later if needed, but for now we trust the flow
        status: 'pending'
      }));
      setFiles(prev => [...prev, ...newEntries]);
      setViewState('workspace');
    };
    img.src = firstUrl;
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) setViewState('upload');
  };

  // --- RESIZE LOGIC ---

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
    let completedCount = 0;

    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      
      try {
        const resizedBlob = await resizeImageCanvas(item.file, targetW, targetH, format);
        
        // Handle Filename (e.g., add -resized)
        let newName = item.name;
        if (format !== 'original') {
            const ext = format.split('/')[1];
            newName = item.name.substring(0, item.name.lastIndexOf('.')) + '.' + ext;
        }
        
        zip.file(newName, resizedBlob);
        
        processedFiles[i].status = 'done';
        processedFiles[i].newSize = resizedBlob.size;
        setFiles([...processedFiles]);

        completedCount++;
        setProgress(Math.round((completedCount / files.length) * 100));

      } catch (err) {
        console.error(err);
        processedFiles[i].status = 'error';
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setResult({
      url: URL.createObjectURL(content),
      count: files.length
    });
    
    setTimeout(() => { setProcessing(false); setViewState('finished'); }, 500);
  };

  // Helper: Canvas Resize
  const resizeImageCanvas = (file, w, h, targetFormat) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const mime = targetFormat === 'original' ? file.type : targetFormat;
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas blob failed'));
        }, mime, 0.9);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); setProgress(0); };

  return (
    <div className="resize-tool-root" style={{'--accent': color}}>
      <style>{`
        .resize-tool-root {
          font-family: -apple-system, system-ui, sans-serif;
          max-width: 900px; margin: 0 auto; color: #1e293b;
        }

        /* 1. UPLOAD ZONE (Consistent with CompressTool) */
        .upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          height: 300px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: all 0.2s; background: #f8fafc; cursor: pointer;
        }
        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--accent); background: #f0fdf4;
        }
        .upload-zone i { 
          font-size: 56px; color: var(--accent); margin-bottom: 20px; transition: 0.2s; 
          filter: drop-shadow(0 4px 6px rgba(34, 197, 94, 0.2));
        }
        .upload-zone:hover i { transform: scale(1.1); }
        .upload-text { font-size: 1.4rem; font-weight: 700; color: #334155; }
        .upload-sub { font-size: 0.95rem; color: #64748b; margin-top: 8px; }

        /* 2. WORKSPACE */
        .workspace { margin-top: 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }

        /* SUCCESS BANNER */
        .success-banner {
          background: #f0fdf4; border-bottom: 1px solid #dcfce7;
          padding: 24px; text-align: center; animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .dl-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--accent); color: white; padding: 12px 30px;
          border-radius: 6px; text-decoration: none; font-weight: 700;
          transition: 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .dl-btn:hover { background: #16a34a; transform: translateY(-1px); }

        /* CONTROL TOOLBAR (Different from CompressTool) */
        .toolbar {
          padding: 20px; border-bottom: 1px solid #e2e8f0; background: #fff;
          display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end;
        }
        
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-group label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; }
        .num-input {
          padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;
          width: 100px; font-size: 0.95rem; font-family: monospace;
        }
        .num-input:focus { outline: none; border-color: var(--accent); }
        
        .lock-btn {
          height: 40px; width: 40px; display: flex; align-items: center; justify-content: center;
          border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; color: #64748b;
          background: #f8fafc; transition: 0.2s;
        }
        .lock-btn.active { background: #dcfce7; color: var(--accent); border-color: var(--accent); }

        .select-input {
          padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;
          background: white; font-size: 0.9rem;
        }

        .action-area { margin-left: auto; display: flex; gap: 10px; }
        .btn { padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; }
        .btn-ghost { background: transparent; color: #475569; border: 1px solid #e2e8f0; }
        .btn-primary { background: #0f172a; color: white; }
        .btn-primary:disabled { opacity: 0.6; cursor: wait; }

        /* LIST */
        .list-header {
          display: grid; grid-template-columns: 60px 1fr 100px 100px 40px;
          background: #f8fafc; padding: 12px 16px;
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .list-row {
          display: grid; grid-template-columns: 60px 1fr 100px 100px 40px;
          align-items: center; padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9; background: white; font-size: 0.9rem;
        }
        .preview-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; background: #eee; }
        .fname { font-weight: 500; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .progress-line { height: 4px; background: #e2e8f0; width: 100%; position: relative; overflow: hidden; }
        .progress-active { height: 100%; background: var(--accent); transition: width 0.2s; }

        /* LINKS GRID */
        .related-section { margin-top: 60px; padding-top: 40px; border-top: 1px solid #e2e8f0; }
        .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
        .tool-link {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          text-decoration: none; color: #475569; transition: all 0.2s;
        }
        .tool-link:hover { transform: translateY(-3px); border-color: var(--accent); color: var(--accent); }
        .tool-icon { font-size: 28px; margin-bottom: 12px; }
        .tool-name { font-weight: 600; font-size: 0.9rem; }

        @media (max-width: 700px) {
          .toolbar { flex-direction: column; align-items: stretch; }
          .action-area { margin-left: 0; margin-top: 10px; }
          .list-header, .list-row { grid-template-columns: 50px 1fr 40px; }
          .list-header > :nth-child(3), .list-header > :nth-child(4),
          .list-row > :nth-child(3), .list-row > :nth-child(4) { display: none; }
        }
      `}</style>

      {/* VIEW 1: UPLOAD */}
      {viewState === 'upload' && (
        <div 
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
          <div className="upload-text">Resize Images</div>
          <div className="upload-sub">Batch resize JPG, PNG, WEBP instantly</div>
        </div>
      )}

      {/* VIEW 2: WORKSPACE */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* SUCCESS BANNER */}
          {viewState === 'finished' && result && (
            <div className="success-banner">
              <h2 style={{fontSize: '1.5rem', marginBottom:'10px', color:'#15803d'}}>Images Resized!</h2>
              <a href={result.url} download="resized-images.zip" className="dl-btn">
                <i className="fa-solid fa-download"></i> Download ZIP
              </a>
            </div>
          )}

          {/* CONTROL TOOLBAR */}
          <div className="toolbar">
            <div className="input-group">
              <label>Width (px)</label>
              <input 
                type="number" className="num-input" placeholder="Width"
                value={targetW} onChange={handleWidthChange}
                disabled={processing || viewState === 'finished'}
              />
            </div>

            <div style={{paddingBottom:'4px'}}>
              <button 
                className={`lock-btn ${lockAspect ? 'active' : ''}`} 
                onClick={() => setLockAspect(!lockAspect)}
                title="Lock Aspect Ratio"
              >
                <i className={`fa-solid ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
              </button>
            </div>

            <div className="input-group">
              <label>Height (px)</label>
              <input 
                type="number" className="num-input" placeholder="Height"
                value={targetH} onChange={handleHeightChange}
                disabled={processing || viewState === 'finished'}
              />
            </div>

            <div className="input-group">
               <label>Format</label>
               <select className="select-input" value={format} onChange={(e) => setFormat(e.target.value)}>
                 <option value="original">Original</option>
                 <option value="image/jpeg">JPG</option>
                 <option value="image/png">PNG</option>
                 <option value="image/webp">WEBP</option>
               </select>
            </div>

            <div className="action-area">
              {viewState === 'finished' ? (
                 <button className="btn btn-ghost" onClick={reset}>New Batch</button>
              ) : (
                 <>
                   <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()}>+ Add</button>
                   <button className="btn btn-primary" onClick={processResize} disabled={processing || !targetW || !targetH}>
                     {processing ? 'Resizing...' : 'Resize Images'}
                   </button>
                 </>
              )}
            </div>
          </div>

          {/* PROGRESS */}
          {processing && (
            <div className="progress-line"><div className="progress-active" style={{width: `${progress}%`}}></div></div>
          )}

          {/* LIST */}
          <div className="file-list">
             <div className="list-header">
               <span>Img</span><span>Name</span><span>Original</span><span>Target</span><span></span>
             </div>
             <div style={{maxHeight:'400px', overflowY:'auto'}}>
               {files.map(f => (
                 <div key={f.id} className="list-row">
                   <img src={f.preview} className="preview-thumb" alt="" />
                   <div className="fname" title={f.name}>{f.name}</div>
                   <div style={{color:'#64748b', fontSize:'0.8rem'}}>{(f.origSize/1024).toFixed(0)} KB</div>
                   <div style={{color: f.status==='done'?'#16a34a':'#334155', fontWeight:'600', fontSize:'0.8rem'}}>
                     {f.status === 'done' ? `${targetW}x${targetH}` : '—'}
                   </div>
                   <div style={{textAlign:'center'}}>
                      {f.status === 'done' ? (
                        <i className="fa-solid fa-check" style={{color:'#16a34a'}}></i>
                      ) : (
                        !processing && <button onClick={()=>removeFile(f.id)} style={{border:'none',background:'none',cursor:'pointer',color:'#94a3b8'}}><i className="fa-solid fa-xmark"></i></button>
                      )}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* RELATED TOOLS */}
      <div className="related-section">
        <h3 style={{textAlign:'center', marginBottom:'24px', color:'#1e293b'}}>More Image Tools</h3>
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
