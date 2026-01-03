import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';

export default function ResizeTool({ color = '#3b82f6' }) {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); 
  const [resizeMode, setResizeMode] = useState('pixels'); 
  
  // Settings
  const [targetW, setTargetW] = useState('');
  const [targetH, setTargetH] = useState('');
  const [percentage, setPercentage] = useState(50);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [format, setFormat] = useState('original');
  const [socialPreset, setSocialPreset] = useState('ig-post');

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- CONFIG ---
  const socialPresets = {
    'ig-post': { w: 1080, h: 1080, label: 'Instagram Post' },
    'ig-story': { w: 1080, h: 1920, label: 'Instagram Story' },
    'fb-cover': { w: 820, h: 312, label: 'Facebook Cover' },
    'yt-thumb': { w: 1280, h: 720, label: 'YouTube Thumbnail' },
    'twitter': { w: 1500, h: 500, label: 'Twitter Header' }
  };

  // --- LOGIC ---
  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;

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
        size: (f.size / 1024).toFixed(0) + ' KB'
      }));
      setFiles(prev => [...prev, ...newEntries]);
      setViewState('workspace');
    };
    img.src = URL.createObjectURL(valid[0]);
  };

  const handleDrag = (e, active) => { e.preventDefault(); e.stopPropagation(); setIsDragging(active); };
  const onDrop = (e) => { handleDrag(e, false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); };

  const handlePixelChange = (dim, val) => {
    const v = Number(val);
    if (dim === 'w') {
      setTargetW(v);
      if (lockAspect && v > 0) setTargetH(Math.round(v / aspectRatio));
    } else {
      setTargetH(v);
      if (lockAspect && v > 0) setTargetW(Math.round(v * aspectRatio));
    }
  };

  const processResize = async () => {
    setProcessing(true);
    const zip = new JSZip();
    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      let finalW, finalH;
      const img = await loadImage(item.file);
      const imgRatio = img.width / img.height;

      if (resizeMode === 'percentage') {
        finalW = Math.round(img.width * (percentage / 100));
        finalH = Math.round(img.height * (percentage / 100));
      } else if (resizeMode === 'social') {
        finalW = socialPresets[socialPreset].w;
        finalH = socialPresets[socialPreset].h;
      } else {
        finalW = targetW;
        finalH = lockAspect ? Math.round(targetW / imgRatio) : targetH;
      }

      try {
        const blob = await resizeCanvas(img, finalW, finalH, format);
        let newName = item.name;
        if (format !== 'original') {
          newName = newName.substring(0, newName.lastIndexOf('.')) + '.' + format.split('/')[1];
        }
        zip.file(newName, blob);
      } catch (e) { console.error(e); }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setResult({ url: URL.createObjectURL(content), count: files.length });
    setTimeout(() => { setProcessing(false); setViewState('finished'); }, 500);
  };

  const loadImage = (file) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });

  const resizeCanvas = (img, w, h, fmt) => new Promise(resolve => {
    const cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    let mime = fmt === 'original' ? 'image/jpeg' : fmt; 
    cvs.toBlob(resolve, mime, 0.9);
  });

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); };

  return (
    <div className="resize-studio" style={{'--primary': color}}>
      <style>{`
        .resize-studio {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          max-width: 1200px; margin: 0 auto;
          color: #1f2937;
        }

        /* --- 1. UPLOAD HERO --- */
        .upload-hero {
          background: #ffffff;
          border-radius: 24px;
          border: 2px dashed #e5e7eb;
          height: 400px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.3s ease;
        }
        .upload-hero:hover, .upload-hero.drag {
          border-color: var(--primary); background: #f9fafb;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        }
        .hero-icon {
          width: 80px; height: 80px; background: #eff6ff; color: var(--primary);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin-bottom: 20px;
        }
        .hero-btn {
          margin-top: 25px; background: #111827; color: white;
          padding: 12px 30px; border-radius: 50px; font-weight: 600;
        }

        /* --- 2. MAIN WORKSPACE --- */
        .workspace {
          display: flex;
          background: white; border-radius: 20px; border: 1px solid #e5e7eb;
          overflow: hidden; height: 750px;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
          position: relative;
        }

        /* LEFT: DESK STAGE */
        .desk-stage {
          flex: 1;
          background-color: #f8fafc; /* Lighter background like screenshot */
          padding: 40px;
          overflow-y: auto;
          position: relative;
        }

        /* Grid Layout matching Screenshot */
        .image-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Larger Cards */
          gap: 20px;
          align-content: start;
        }

        .img-item {
          background: white;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #e5e7eb;
          position: relative;
          transition: transform 0.2s;
          cursor: default;
          display: flex; flex-direction: column;
        }
        .img-item:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        
        .img-preview-box {
          width: 100%; height: 140px; 
          background: #f1f5f9; border-radius: 8px;
          margin-bottom: 12px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .img-preview-box img {
          max-width: 100%; max-height: 100%; object-fit: contain;
        }
        
        .img-info { font-size: 0.9rem; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .img-meta { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }

        .del-badge {
          position: absolute; top: -8px; right: -8px;
          width: 24px; height: 24px; background: #ef4444; color: white;
          border-radius: 50%; font-size: 12px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .img-item:hover .del-badge { opacity: 1; }
        
        /* Add Card */
        .add-card {
          min-height: 200px;
          border: 2px dashed #cbd5e1; border-radius: 12px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          color: #94a3b8; cursor: pointer; transition: 0.2s; background: white;
        }
        .add-card:hover { border-color: var(--primary); color: var(--primary); background: #eff6ff; }

        /* RIGHT: CONTROLS SIDEBAR */
        .controls {
          width: 320px;
          background: white; border-left: 1px solid #e5e7eb;
          display: flex; flex-direction: column;
          z-index: 10;
        }
        .controls-body { padding: 24px; flex: 1; overflow-y: auto; }
        .controls-footer { padding: 24px; border-top: 1px solid #e5e7eb; background: #f9fafb; }

        .tabs { display: flex; background: #f3f4f6; padding: 4px; border-radius: 10px; margin-bottom: 24px; }
        .tab { flex: 1; text-align: center; padding: 10px; font-size: 0.85rem; font-weight: 600; color: #6b7280; cursor: pointer; border-radius: 8px; transition: 0.2s; }
        .tab.active { background: white; color: #111827; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .section-label { font-size: 0.75rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; display: block; }
        .input-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .clean-input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e5e7eb; font-size: 1rem; font-weight: 600; color: #111; }
        .toggle-icon { width: 48px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer; color: #9ca3af; }
        .toggle-icon.active { background: #eff6ff; color: var(--primary); border-color: var(--primary); }

        .preset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .preset-card { padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; cursor: pointer; transition: 0.2s; }
        .preset-card.selected { border-color: var(--primary); background: #eff6ff; color: var(--primary); }
        .p-name { font-size: 0.8rem; font-weight: 600; }
        .p-dims { font-size: 0.7rem; opacity: 0.7; }

        .action-btn { width: 100%; padding: 18px; border-radius: 12px; background: #111827; color: white; font-weight: 700; font-size: 1.05rem; border: none; cursor: pointer; transition: 0.2s; }
        .action-btn:hover { background: black; }

        /* RESULT OVERLAY */
        .result-overlay {
          position: absolute; inset: 0; background: rgba(255,255,255,0.95);
          backdrop-filter: blur(5px); z-index: 20;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
        
        .result-box {
          background: white; border: 1px solid #e5e7eb; padding: 40px; border-radius: 20px;
          text-align: center; box-shadow: 0 20px 50px -10px rgba(0,0,0,0.1);
          max-width: 400px; width: 90%;
        }

        @media (max-width: 800px) {
          .workspace { flex-direction: column; height: auto; }
          .desk-stage { min-height: 400px; }
          .controls { width: 100%; border-left: none; border-top: 1px solid #e5e7eb; }
        }
      `}</style>

      {/* VIEW 1: UPLOAD */}
      {viewState === 'upload' && (
        <div 
          className={`upload-hero ${isDragging ? 'drag' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="hero-icon"><i className="fa-solid fa-expand"></i></div>
          <h2 style={{fontSize:'1.8rem', fontWeight:'800', marginBottom:'10px'}}>Resize Images</h2>
          <p style={{color:'#6b7280'}}>Batch resize for social media & web</p>
          <button className="hero-btn">Select Images</button>
        </div>
      )}

      {/* VIEW 2: WORKSPACE */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* RESULT OVERLAY */}
          {viewState === 'finished' && result && (
            <div className="result-overlay">
              <div className="result-box">
                <i className="fa-solid fa-circle-check" style={{fontSize:'50px', color:'#16a34a', marginBottom:'20px'}}></i>
                <h2 style={{marginBottom:'10px'}}>Resize Complete!</h2>
                <p style={{color:'#6b7280', marginBottom:'30px'}}>Processed {result.count} images successfully.</p>
                <a href={result.url} download="resized.zip" className="action-btn" style={{background:'#16a34a', textDecoration:'none', display:'block', marginBottom:'15px'}}>
                  Download ZIP
                </a>
                <button onClick={reset} style={{background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontWeight:'600'}}>Start Over</button>
              </div>
            </div>
          )}

          {/* LEFT: DESK STAGE */}
          <div className="desk-stage">
            <div className="image-grid">
              {files.map(f => (
                <div key={f.id} className="img-item">
                  <div className="img-preview-box">
                    <img src={f.preview} alt={f.name} />
                  </div>
                  <div className="img-info">{f.name}</div>
                  <div className="img-meta">{f.size}</div>
                  
                  <div className="del-badge" onClick={() => setFiles(files.filter(x => x.id !== f.id))}>
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                </div>
              ))}
              
              {/* Add More Card */}
              <div className="add-card" onClick={() => fileInputRef.current.click()}>
                <i className="fa-solid fa-plus" style={{fontSize:'32px', marginBottom:'10px'}}></i>
                <span style={{fontSize:'0.9rem', fontWeight:'600'}}>Add More</span>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTROLS */}
          <div className="controls">
            <div className="controls-body">
              <div className="tabs">
                <div className={`tab ${resizeMode === 'pixels' ? 'active' : ''}`} onClick={() => setResizeMode('pixels')}>Pixels</div>
                <div className={`tab ${resizeMode === 'percentage' ? 'active' : ''}`} onClick={() => setResizeMode('percentage')}>%</div>
                <div className={`tab ${resizeMode === 'social' ? 'active' : ''}`} onClick={() => setResizeMode('social')}>Social</div>
              </div>

              {resizeMode === 'pixels' && (
                <div>
                  <span className="section-label">Dimensions</span>
                  <div className="input-row">
                    <input type="number" className="clean-input" placeholder="W" value={targetW} onChange={e => handlePixelChange('w', e.target.value)} />
                    <div className={`toggle-icon ${lockAspect ? 'active' : ''}`} onClick={() => setLockAspect(!lockAspect)}>
                      <i className={`fa-solid ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
                    </div>
                    <input type="number" className="clean-input" placeholder="H" value={targetH} onChange={e => handlePixelChange('h', e.target.value)} />
                  </div>
                </div>
              )}

              {resizeMode === 'percentage' && (
                <div>
                  <span className="section-label">Scale By {percentage}%</span>
                  <input type="range" style={{width:'100%', accentColor:color, marginBottom:'20px'}} min="10" max="200" value={percentage} onChange={e => setPercentage(e.target.value)} />
                  <div className="preset-grid">
                    {[25, 50, 75].map(p => (
                      <div key={p} className="preset-card" onClick={() => setPercentage(p)} style={{textAlign:'center'}}>{p}%</div>
                    ))}
                  </div>
                </div>
              )}

              {resizeMode === 'social' && (
                <div>
                  <span className="section-label">Select Preset</span>
                  <div className="preset-grid">
                    {Object.entries(socialPresets).map(([key, val]) => (
                      <div key={key} className={`preset-card ${socialPreset === key ? 'selected' : ''}`} onClick={() => setSocialPreset(key)}>
                        <div className="p-name">{val.label}</div>
                        <div className="p-dims">{val.w} x {val.h}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{marginTop:'20px'}}>
                <span className="section-label">Format</span>
                <select className="clean-input" value={format} onChange={e => setFormat(e.target.value)}>
                  <option value="original">Keep Original</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WEBP</option>
                </select>
              </div>
            </div>

            <div className="controls-footer">
              <button className="action-btn" onClick={processResize} disabled={processing}>
                {processing ? 'Processing...' : 'Resize Images'}
              </button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
