import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export default function ResizeToolIloveStyle({ color = '#2563eb' }) { 
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace, finished
  const [targetW, setTargetW] = useState('');
  const [targetH, setTargetH] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);

  // --- LOGIC (Same as before) ---
  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;

    // Use first image for aspect ratio defaults
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
    // ... (Simulation of processing logic same as previous) ...
    await new Promise(r => setTimeout(r, 1500)); // Fake delay for demo
    setResult({ url: '#', count: files.length }); // Mock result
    setViewState('finished');
    setProcessing(false);
  };

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); };

  return (
    <div className="ilove-wrapper" style={{'--brand': color}}>
      <style>{`
        .ilove-wrapper {
          font-family: 'Inter', sans-serif;
          max-width: 1200px; margin: 0 auto;
          min-height: 600px;
          background: #fff;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
          border-radius: 12px; overflow: hidden;
          display: flex; flex-direction: column;
        }

        /* --- 1. HERO UPLOAD (Centered & Big) --- */
        .upload-hero {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #f8fafc; padding: 40px; min-height: 500px;
        }
        .big-btn {
          background: var(--brand); color: white;
          padding: 20px 50px; border-radius: 12px;
          font-size: 1.5rem; font-weight: 700; cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
          transition: transform 0.2s; border: none;
          display: flex; align-items: center; gap: 15px;
        }
        .big-btn:hover { transform: scale(1.02); }
        .drop-hint { margin-top: 20px; color: #64748b; font-weight: 500; }

        /* --- 2. WORKSPACE (Split Layout) --- */
        .workspace-split {
          display: flex; flex: 1; height: 600px;
        }

        /* LEFT SIDE: Canvas */
        .canvas-area {
          flex: 1; background: #e2e8f0; /* Darker gray background like Photoshop */
          display: flex; align-items: center; justify-content: center;
          padding: 40px; overflow-y: auto; position: relative;
        }
        
        .image-stack {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; max-width: 800px;
        }
        .img-preview-card {
          background: white; padding: 10px; border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          width: 150px; text-align: center; position: relative;
        }
        .img-preview-card img { width: 100%; height: 100px; object-fit: contain; background: #eee; }
        .img-name { font-size: 0.8rem; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #333; }
        .img-badge {
          position: absolute; top: -8px; right: -8px; 
          background: #ef4444; color: white; width: 24px; height: 24px; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 12px;
        }

        /* RIGHT SIDE: Sidebar Controls */
        .sidebar {
          width: 320px; background: white; border-left: 1px solid #cbd5e1;
          display: flex; flex-direction: column;
          z-index: 10;
        }
        .sidebar-header {
          padding: 20px; border-bottom: 1px solid #e2e8f0;
          font-weight: 700; color: #334155; font-size: 1.1rem;
          display: flex; align-items: center; gap: 10px;
        }
        .sidebar-content { padding: 24px; flex: 1; }
        
        .control-group { margin-bottom: 24px; }
        .control-label { display: block; font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
        
        .input-row { display: flex; gap: 10px; align-items: center; }
        .nice-input {
          width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;
          font-size: 1rem; font-weight: 600; color: #333; transition: 0.2s;
        }
        .nice-input:focus { border-color: var(--brand); outline: none; }
        
        .aspect-btn {
          background: #f1f5f9; border: none; padding: 10px; border-radius: 6px; cursor: pointer; color: #94a3b8;
        }
        .aspect-btn.active { color: var(--brand); background: #dbeafe; }

        .sidebar-footer {
          padding: 24px; border-top: 1px solid #e2e8f0; background: #f8fafc;
        }
        .action-btn {
          width: 100%; padding: 18px; border-radius: 8px;
          background: var(--brand); color: white; font-weight: 700; font-size: 1.1rem;
          border: none; cursor: pointer; transition: 0.2s;
          display: flex; justify-content: center; align-items: center; gap: 10px;
        }
        .action-btn:hover { filter: brightness(110%); }
        .action-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* --- 3. FINISHED STATE --- */
        .result-screen {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #f0fdf4; text-align: center; padding: 40px;
        }
        .check-circle {
          width: 80px; height: 80px; background: #22c55e; color: white;
          border-radius: 50%; font-size: 40px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pop { from{transform:scale(0)} to{transform:scale(1)} }

        /* RESPONSIVE */
        @media(max-width: 768px) {
          .workspace-split { flex-direction: column; height: auto; }
          .sidebar { width: 100%; height: auto; }
          .canvas-area { min-height: 300px; }
        }
      `}</style>

      {/* VIEW 1: LANDING */}
      {viewState === 'upload' && (
        <div className="upload-hero">
          <button className="big-btn" onClick={() => fileInputRef.current.click()}>
            Select Images
          </button>
          <div className="drop-hint">or drop images here</div>
        </div>
      )}

      {/* VIEW 2: SPLIT WORKSPACE (The iLoveIMG Magic) */}
      {(viewState === 'workspace' || processing) && (
        <div className="workspace-split">
          
          {/* LEFT: CANVAS */}
          <div className="canvas-area">
            <div className="image-stack">
              {files.map(f => (
                <div key={f.id} className="img-preview-card">
                   <div className="img-badge" onClick={()=>{/*remove logic*/}}>×</div>
                   <img src={f.preview} alt="" />
                   <div className="img-name">{f.name}</div>
                   <div style={{fontSize:'10px', color:'#999'}}>{f.dims}</div>
                </div>
              ))}
              <div 
                className="img-preview-card" 
                style={{display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'2px dashed #ccc'}}
                onClick={() => fileInputRef.current.click()}
              >
                <span style={{fontSize:'30px', color:'#ccc'}}>+</span>
              </div>
            </div>
          </div>

          {/* RIGHT: SIDEBAR CONTROLS */}
          <div className="sidebar">
            <div className="sidebar-header">
              <i className="fa-solid fa-sliders"></i> Resize Options
            </div>
            
            <div className="sidebar-content">
              <div className="control-group">
                <label className="control-label">By Pixels</label>
                <div className="input-row">
                  <div style={{flex:1}}>
                    <input type="number" className="nice-input" placeholder="Width" value={targetW} onChange={handleWidthChange} />
                    <div style={{fontSize:'10px', color:'#999', marginTop:'4px'}}>Width</div>
                  </div>
                  
                  <button className={`aspect-btn ${lockAspect ? 'active' : ''}`} onClick={() => setLockAspect(!lockAspect)}>
                    <i className={`fa-solid ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
                  </button>

                  <div style={{flex:1}}>
                    <input type="number" className="nice-input" placeholder="Height" value={targetH} onChange={handleHeightChange} />
                    <div style={{fontSize:'10px', color:'#999', marginTop:'4px'}}>Height</div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label className="control-label">Format</label>
                <select className="nice-input">
                  <option>Keep Original</option>
                  <option>JPG</option>
                  <option>PNG</option>
                </select>
              </div>
            </div>

            <div className="sidebar-footer">
              <button className="action-btn" onClick={processResize} disabled={processing}>
                {processing ? 'Processing...' : 'Resize IMAGES'} <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FINISHED */}
      {viewState === 'finished' && (
        <div className="result-screen">
          <div className="check-circle"><i className="fa-solid fa-check"></i></div>
          <h2 style={{fontSize:'2rem', color:'#1e293b', marginBottom:'10px'}}>Images have been resized!</h2>
          <button className="big-btn" style={{backgroundColor:'#22c55e', fontSize:'1.2rem', padding:'15px 40px'}}>
            Download Resized Images
          </button>
          <div style={{marginTop:'30px'}}>
            <button onClick={reset} style={{background:'none', border:'none', color:'#64748b', cursor:'pointer', fontWeight:'600'}}>
              Resize More
            </button>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
