import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export default function ResizeToolUnique({ color = '#00f2ff' }) { // Cyan Neon Default
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace, finished
  const [targetW, setTargetW] = useState(0);
  const [targetH, setTargetH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [format, setFormat] = useState('original');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  
  const fileInputRef = useRef(null);

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

    // Detect first image dimensions
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
        size: f.size,
        origDims: `${img.width}x${img.height}`,
        status: 'ready'
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

  const handleWidthChange = (val) => {
    setTargetW(Number(val));
    if (lockAspect && val > 0) setTargetH(Math.round(val / aspectRatio));
  };

  const handleHeightChange = (val) => {
    setTargetH(Number(val));
    if (lockAspect && val > 0) setTargetW(Math.round(val * aspectRatio));
  };

  const runResize = async () => {
    setProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    let done = 0;

    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      try {
        const blob = await resizeCanvas(processedFiles[i].file, targetW, targetH, format);
        
        let newName = processedFiles[i].name;
        if (format !== 'original') {
          newName = newName.substring(0, newName.lastIndexOf('.')) + '.' + format.split('/')[1];
        }

        zip.file(newName, blob);
        processedFiles[i].status = 'done';
        processedFiles[i].newSize = blob.size;
        setFiles([...processedFiles]);
        
        done++;
        setProgress(Math.round((done / files.length) * 100));
      } catch (e) { console.error(e); }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setResult({
      url: URL.createObjectURL(content),
      count: files.length,
      size: (content.size/1024/1024).toFixed(2)
    });

    setTimeout(() => { setProcessing(false); setViewState('finished'); }, 600);
  };

  const resizeCanvas = (file, w, h, fmt) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = w; cvs.height = h;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        ctx.toBlob(resolve, fmt === 'original' ? file.type : fmt, 0.9);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); setProgress(0); };

  return (
    <div className="hud-interface" style={{'--neon': color}}>
      <style>{`
        /* --- THEME & BASE --- */
        .hud-interface {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background: #09090b; /* Void Black */
          color: #e4e4e7;
          min-height: 650px;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 0 1px #27272a, 0 20px 50px -10px rgba(0,0,0,0.5);
          display: flex; flex-direction: column;
        }

        /* Background Grid Noise */
        .hud-interface::before {
          content: ""; position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0; pointer-events: none;
        }

        /* --- STATE 1: THE PORTAL (Upload) --- */
        .portal-zone {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          position: relative; z-index: 2; transition: all 0.4s ease;
        }
        .portal-ring {
          width: 160px; height: 160px; border-radius: 50%;
          border: 2px dashed #3f3f46;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer; position: relative;
        }
        
        /* Interactive 3D Hover Effect */
        .portal-zone:hover .portal-ring, .portal-zone.drag .portal-ring {
          border-color: var(--neon);
          box-shadow: 0 0 40px var(--neon), inset 0 0 20px var(--neon);
          transform: scale(1.1) rotate(90deg);
          border-style: solid;
        }

        .portal-icon { font-size: 3rem; color: #52525b; transition: 0.3s; transform: rotate(0deg); }
        .portal-zone:hover .portal-icon { color: #fff; transform: rotate(-90deg); } /* Counter rotate to stay upright */

        .portal-text { 
          margin-top: 30px; font-size: 1.5rem; font-weight: 700; letter-spacing: -1px;
          background: linear-gradient(to right, #fff, #71717a); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* --- STATE 2: THE WORKBENCH --- */
        .workbench {
          flex: 1; display: flex; flex-direction: column; z-index: 2;
          padding: 20px; padding-bottom: 120px; /* Space for deck */
        }
        
        /* Data Grid */
        .data-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px; overflow-y: auto; max-height: 450px;
          padding-right: 10px;
        }
        
        /* Tech Card */
        .tech-card {
          background: rgba(24, 24, 27, 0.6);
          border: 1px solid #3f3f46;
          border-radius: 8px;
          padding: 8px;
          position: relative;
          transition: 0.2s;
          backdrop-filter: blur(5px);
        }
        .tech-card:hover { border-color: var(--neon); transform: translateY(-2px); }
        
        .card-preview { 
          width: 100%; height: 90px; object-fit: cover; border-radius: 4px; 
          background: #000; margin-bottom: 8px; filter: grayscale(40%);
        }
        .tech-card:hover .card-preview { filter: grayscale(0%); }
        
        .card-meta { font-size: 10px; color: #a1a1aa; display: flex; justify-content: space-between; }
        .card-name { color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
        
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #52525b;
          box-shadow: 0 0 5px #52525b;
        }
        .tech-card.done { border-color: #10b981; }
        .tech-card.done .status-dot { background: #10b981; box-shadow: 0 0 8px #10b981; }

        .del-x {
          position: absolute; top: -5px; right: -5px; width: 20px; height: 20px;
          background: #ef4444; color: black; display: flex; align-items: center; justify-content: center;
          font-weight: bold; border-radius: 2px; cursor: pointer; opacity: 0;
        }
        .tech-card:hover .del-x { opacity: 1; }

        /* --- CONTROL DECK (Floating Bottom Bar) --- */
        .control-deck {
          position: absolute; bottom: 20px; left: 20px; right: 20px;
          background: rgba(9, 9, 11, 0.85);
          border: 1px solid #3f3f46;
          border-radius: 16px;
          padding: 16px 24px;
          display: flex; align-items: center; gap: 30px;
          backdrop-filter: blur(12px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          animation: slideUp 0.4s ease-out;
          z-index: 10;
        }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .deck-group { display: flex; flex-direction: column; gap: 4px; }
        .deck-label { font-size: 10px; text-transform: uppercase; color: #71717a; letter-spacing: 1px; font-weight: 700; }
        
        .input-row { display: flex; align-items: center; gap: 10px; }
        
        .neon-input {
          background: #18181b; border: 1px solid #3f3f46; color: var(--neon);
          font-family: inherit; font-size: 16px; padding: 8px 12px; width: 90px;
          border-radius: 4px; text-align: center; font-weight: bold;
        }
        .neon-input:focus { outline: none; border-color: var(--neon); box-shadow: 0 0 10px rgba(0, 242, 255, 0.2); }

        .link-toggle {
          color: #52525b; cursor: pointer; font-size: 14px; padding: 8px; border: 1px solid transparent; border-radius: 4px;
        }
        .link-toggle.active { color: var(--neon); border-color: rgba(0, 242, 255, 0.2); background: rgba(0, 242, 255, 0.05); }

        .neon-select {
          background: #18181b; border: 1px solid #3f3f46; color: #fff;
          padding: 8px 12px; border-radius: 4px; font-family: inherit;
        }

        .deck-actions { margin-left: auto; display: flex; gap: 12px; }
        
        .cyber-btn {
          background: var(--neon); color: #000; border: none;
          padding: 10px 24px; font-family: inherit; font-weight: 800; font-size: 14px;
          text-transform: uppercase; cursor: pointer;
          clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
          transition: all 0.2s;
        }
        .cyber-btn:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0 rgba(255,255,255,0.2); }
        .cyber-btn:disabled { background: #3f3f46; color: #71717a; cursor: not-allowed; transform: none; box-shadow: none; }

        .ghost-btn {
          background: transparent; border: 1px solid #3f3f46; color: #a1a1aa;
          padding: 10px 20px; font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; border-radius: 4px; transition: 0.2s;
        }
        .ghost-btn:hover { border-color: #fff; color: #fff; }

        /* --- STATE 3: MISSION REPORT (Result) --- */
        .mission-report {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          z-index: 5; text-align: center;
        }
        .hologram-card {
          background: rgba(24, 24, 27, 0.8); border: 1px solid var(--neon);
          padding: 40px 60px; border-radius: 4px;
          box-shadow: 0 0 40px rgba(0, 242, 255, 0.1), inset 0 0 20px rgba(0, 242, 255, 0.05);
          position: relative;
        }
        .hologram-card::after {
          content: "SUCCESS"; position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: #09090b; padding: 0 10px; color: var(--neon); font-weight: bold; letter-spacing: 2px;
        }
        
        .stat-display { 
          font-size: 3rem; font-weight: 800; color: #fff; margin: 20px 0; text-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
        
        .dl-cyber-btn {
          display: inline-block; text-decoration: none;
          background: #fff; color: #000; padding: 15px 40px;
          font-weight: 900; letter-spacing: 1px;
          clip-path: polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%);
          transition: 0.2s;
        }
        .dl-cyber-btn:hover { background: var(--neon); }

        /* LOADING BAR */
        .scan-line {
          position: absolute; top: 0; left: 0; height: 2px; background: var(--neon);
          box-shadow: 0 0 10px var(--neon); z-index: 20; transition: width 0.1s linear;
        }

        @media (max-width: 768px) {
          .control-deck { 
            flex-direction: column; align-items: stretch; gap: 15px; 
            bottom: 0; left: 0; right: 0; border-radius: 20px 20px 0 0; border-bottom: none;
          }
          .input-row { justify-content: space-between; }
          .deck-actions { margin-left: 0; }
        }
      `}</style>

      {/* VIEW 1: PORTAL */}
      {viewState === 'upload' && (
        <div 
          className={`portal-zone ${isDragging ? 'drag' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="portal-ring">
            <i className="fa-solid fa-plus portal-icon"></i>
          </div>
          <div className="portal-text">INITIALIZE UPLOAD</div>
          <div style={{color: '#52525b', marginTop: '10px', fontSize: '12px', letterSpacing: '1px'}}>
            DRAG FILES OR CLICK TO ENGAGE
          </div>
        </div>
      )}

      {/* VIEW 2: WORKBENCH */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workbench">
          
          {/* SCAN LINE */}
          {processing && <div className="scan-line" style={{width: `${progress}%`}}></div>}

          {/* VIEW 3: MISSION REPORT (Overlay) */}
          {viewState === 'finished' && result && (
            <div className="mission-report">
              <div className="hologram-card">
                <div style={{color: '#71717a', fontSize:'12px', letterSpacing:'2px'}}>TOTAL REDUCTION</div>
                <div className="stat-display">{result.count} FILES</div>
                <div style={{marginBottom:'30px', color: '#a1a1aa'}}>OUTPUT SIZE: {result.size} MB</div>
                
                <a href={result.url} download="zyn-resized.zip" className="dl-cyber-btn">
                  DOWNLOAD ARTIFACTS
                </a>
                <div style={{marginTop:'20px'}}>
                  <button onClick={reset} style={{background:'none', border:'none', color:'#52525b', cursor:'pointer', letterSpacing:'1px'}}>
                    // REBOOT SYSTEM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* GRID OF CARDS (Only visible if not finished) */}
          {viewState === 'workspace' && (
            <div className="data-grid">
              {files.map(f => (
                <div key={f.id} className={`tech-card ${f.status === 'done' ? 'done' : ''}`}>
                  <div className="del-x" onClick={() => removeFile(f.id)}>×</div>
                  <img src={f.preview} className="card-preview" alt="" />
                  <div className="card-name">{f.name}</div>
                  <div className="card-meta">
                    <span>{f.origDims}</span>
                    <div className="status-dot"></div>
                  </div>
                </div>
              ))}
              <div 
                className="tech-card" 
                style={{display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', borderStyle:'dashed', minHeight:'130px'}}
                onClick={() => fileInputRef.current.click()}
              >
                <i className="fa-solid fa-plus" style={{color:'#3f3f46', fontSize:'24px'}}></i>
              </div>
            </div>
          )}

          {/* CONTROL DECK (Bottom Bar) */}
          {viewState === 'workspace' && (
            <div className="control-deck">
              <div className="deck-group">
                <div className="deck-label">Dimensions</div>
                <div className="input-row">
                  <input type="number" className="neon-input" placeholder="W" value={targetW} onChange={e => handleWidthChange(e.target.value)} />
                  <div 
                    className={`link-toggle ${lockAspect ? 'active' : ''}`} 
                    onClick={() => setLockAspect(!lockAspect)}
                  >
                    <i className={`fa-solid ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
                  </div>
                  <input type="number" className="neon-input" placeholder="H" value={targetH} onChange={e => handleHeightChange(e.target.value)} />
                </div>
              </div>

              <div className="deck-group">
                <div className="deck-label">Format</div>
                <select className="neon-select" value={format} onChange={e => setFormat(e.target.value)}>
                  <option value="original">Original</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WEBP</option>
                </select>
              </div>

              <div className="deck-actions">
                <button className="ghost-btn" onClick={() => setFiles([])}>CLEAR</button>
                <button className="cyber-btn" onClick={runResize} disabled={processing || !targetW || !targetH}>
                  {processing ? 'EXECUTING...' : 'INITIATE RESIZE'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
