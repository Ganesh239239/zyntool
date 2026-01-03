import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#4f46e5' }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing, idle, working, result
  const [quality, setQuality] = useState(0.6);
  const [resultZip, setResultZip] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- LOGIC HANDLERS ---
  const handleDrag = (e, active) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(active);
  };

  const handleDrop = (e) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        file: f,
        id: Math.random().toString(36).substr(2, 9),
        preview: URL.createObjectURL(f),
        size: f.size
      }));
    if (newFiles.length === 0) return;
    setFiles(prev => [...prev, ...newFiles]);
    setStatus('idle');
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length - 1 === 0) setStatus('landing');
  };

  const startCompression = async () => {
    setStatus('working');
    setProgress(0);
    const zip = new JSZip();
    let totalOld = 0;
    let totalNew = 0;

    // Artificial delay for smooth UI start
    await new Promise(r => setTimeout(r, 300));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      totalOld += file.size;
      try {
        const options = { maxSizeMB: 1, initialQuality: quality, useWebWorker: true };
        const blob = await imageCompression(file.file, options);
        totalNew += blob.size;
        zip.file(file.file.name, blob);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) { console.error(err); }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setResultZip({
      url: URL.createObjectURL(content),
      oldSize: (totalOld / 1024 / 1024).toFixed(2),
      newSize: (totalNew / 1024 / 1024).toFixed(2),
      saved: Math.round(((totalOld - totalNew) / totalOld) * 100)
    });
    
    // Slight delay before showing result to let progress bar finish
    setTimeout(() => setStatus('result'), 500);
  };

  const reset = () => {
    setFiles([]); setStatus('landing'); setResultZip(null); setProgress(0);
  };

  return (
    <div className="modern-compressor" style={{ '--primary': color }}>
      <style>{`
        /* --- VARIABLES & BASE --- */
        .modern-compressor {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          max-width: 900px; margin: 0 auto;
          color: #1e293b;
        }

        /* --- ANIMATIONS --- */
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes confettiDrop { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        
        /* --- 1. LANDING (GLASS CARD) --- */
        .upload-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          border-radius: 30px;
          padding: 60px 20px;
          text-align: center;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.5);
          cursor: pointer;
          transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .upload-card:hover, .upload-card.drag-active {
          transform: translateY(-5px);
          box-shadow: 0 30px 60px -15px rgba(var(--primary), 0.15);
          border-color: var(--primary);
        }
        .upload-icon-3d {
          width: 80px; height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, var(--primary), #818cf8);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 32px;
          box-shadow: 0 15px 30px -8px rgba(79, 70, 229, 0.4);
          animation: float 4s ease-in-out infinite;
          transform: rotate(-5deg);
        }
        
        /* --- 2. GRID GALLERY (MAC OS STYLE) --- */
        .gallery-container {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
          padding: 24px;
          animation: popIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .grid-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px; padding-bottom: 15px;
          border-bottom: 1px solid #f1f5f9;
        }
        .images-scroll {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px; max-height: 350px; overflow-y: auto; padding: 4px;
        }
        .thumb-card {
          position: relative; aspect-ratio: 1; border-radius: 12px;
          overflow: hidden; border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          transition: 0.2s;
        }
        .thumb-card img { width: 100%; height: 100%; object-fit: cover; }
        .thumb-card:hover { transform: scale(1.05); z-index: 2; }
        .del-btn {
          position: absolute; top: 4px; right: 4px;
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(0,0,0,0.6); color: white;
          border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 10px;
        }

        /* --- 3. CONTROLS & PROGRESS --- */
        .controls-wrapper {
          margin-top: 24px;
          background: #f8fafc; padding: 20px; border-radius: 16px;
        }
        .compress-btn {
          width: 100%;
          background: var(--primary);
          color: white; border: none;
          padding: 18px; border-radius: 14px;
          font-size: 1.1rem; font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3);
          transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .compress-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(110%); }
        .compress-btn:disabled { opacity: 0.8; cursor: wait; }

        .progress-track {
          height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; margin-top: 15px;
        }
        .progress-fill {
          height: 100%; background: #22c55e; transition: width 0.3s ease;
        }

        /* --- 4. REALISTIC RESULT CARD --- */
        .result-modal {
          background: white;
          border-radius: 32px;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.15);
          padding: 50px 40px;
          text-align: center;
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 600px; margin: 0 auto;
          position: relative; overflow: hidden;
        }
        
        /* Celebration Confetti Background */
        .confetti-piece {
          position: absolute; width: 10px; height: 10px; background: #ffd700;
          animation: confettiDrop 3s linear infinite; top: -20px; z-index: 0;
        }
        .confetti-piece:nth-child(2n) { background: #ff4757; animation-duration: 2.5s; left: 20%; }
        .confetti-piece:nth-child(3n) { background: #2ed573; animation-duration: 3.2s; left: 80%; }
        .confetti-piece:nth-child(4n) { background: #1e90ff; animation-duration: 2.8s; left: 50%; }

        .result-content { position: relative; z-index: 2; }

        .success-seal {
          width: 90px; height: 90px;
          background: #dcfce7; color: #16a34a;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; margin: 0 auto 25px;
          box-shadow: 0 0 0 10px #f0fdf4;
        }

        /* Visual Comparison Bar */
        .comparison-viz {
          background: #f1f5f9;
          border-radius: 16px;
          padding: 24px;
          margin: 30px 0;
          display: flex; flex-direction: column; gap: 15px;
        }
        .viz-row { display: flex; align-items: center; gap: 15px; }
        .viz-label { width: 80px; text-align: right; font-weight: 600; font-size: 0.9rem; color: #64748b; }
        .viz-bar-track { flex: 1; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
        .viz-bar-fill { height: 100%; border-radius: 6px; width: 0; animation: fillBar 1s ease forwards; }
        .viz-val { width: 80px; text-align: left; font-weight: 700; color: #1e293b; }
        
        @keyframes fillBar { from { width: 0; } to { width: var(--w); } }

        .download-btn-primary {
          display: inline-flex; align-items: center; gap: 12px;
          background: #1e293b; color: white;
          padding: 18px 40px; border-radius: 50px;
          text-decoration: none; font-weight: 700; font-size: 1.1rem;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
          transition: all 0.3s;
        }
        .download-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 35px -5px rgba(0,0,0,0.4);
          background: black;
        }
        
        .savings-badge {
          display: inline-block;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white; padding: 6px 16px; border-radius: 20px;
          font-weight: 800; font-size: 0.9rem; margin-top: 10px;
          box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3);
        }

      `}</style>

      {/* 1. LANDING STATE */}
      {status === 'landing' && (
        <div 
          className={`upload-card ${isDragging ? 'drag-active' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="upload-icon-3d">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h2 style={{fontSize: '2rem', fontWeight: '800', marginBottom:'10px'}}>Drag Images Here</h2>
          <p style={{color: '#64748b', fontSize:'1.1rem'}}>Support for high-res JPG, PNG</p>
        </div>
      )}

      {/* 2. WORKBENCH STATE */}
      {(status === 'idle' || status === 'working') && (
        <div className="gallery-container">
          <div className="grid-header">
            <h3 style={{margin:0, fontSize:'1.2rem'}}>{files.length} Images Selected</h3>
            {status === 'idle' && (
              <button onClick={() => fileInputRef.current.click()} style={{background:'none', border:'none', color:color, fontWeight:'700', cursor:'pointer'}}>
                + Add More
              </button>
            )}
          </div>

          <div className="images-scroll">
            {files.map(f => (
              <div key={f.id} className="thumb-card">
                <img src={f.preview} alt="" />
                {status === 'idle' && (
                  <button className="del-btn" onClick={() => removeFile(f.id)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="controls-wrapper">
            {status === 'idle' && (
              <>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'0.9rem', fontWeight:'600'}}>
                  <span>Quality</span>
                  <span>{Math.round(quality * 10)} / 10</span>
                </div>
                <input 
                  type="range" min="0.1" max="0.9" step="0.1" 
                  value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} 
                  style={{width: '100%', marginBottom: '20px', accentColor: color}}
                />
              </>
            )}

            <button className="compress-btn" onClick={startCompression} disabled={status === 'working'}>
              {status === 'working' ? (
                <>Processing... {progress}%</>
              ) : (
                <>Compress Files <i className="fa-solid fa-bolt"></i></>
              )}
            </button>
            
            {status === 'working' && (
              <div className="progress-track">
                <div className="progress-fill" style={{width: `${progress}%`}}></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. REALISTIC RESULT STATE */}
      {status === 'result' && resultZip && (
        <div className="result-modal">
          {/* Confetti Elements */}
          {[...Array(10)].map((_, i) => <div key={i} className="confetti-piece" style={{left: `${Math.random()*100}%`, animationDelay: `${Math.random()}s`}}></div>)}

          <div className="result-content">
            <div className="success-seal">
              <i className="fa-solid fa-check"></i>
            </div>
            
            <h2 style={{fontSize:'2.2rem', fontWeight:'800', margin:'0 0 5px 0'}}>Amazing!</h2>
            <div className="savings-badge">SAVED {resultZip.saved}% STORAGE</div>

            {/* Comparison Visualization */}
            <div className="comparison-viz">
              {/* Original Bar */}
              <div className="viz-row">
                <span className="viz-label">Before</span>
                <div className="viz-bar-track">
                  <div className="viz-bar-fill" style={{width: '100%', background: '#94a3b8', '--w': '100%'}}></div>
                </div>
                <span className="viz-val">{resultZip.oldSize} MB</span>
              </div>
              
              {/* Compressed Bar */}
              <div className="viz-row">
                <span className="viz-label" style={{color: '#16a34a'}}>After</span>
                <div className="viz-bar-track">
                  <div className="viz-bar-fill" style={{background: '#16a34a', width: 0, '--w': `${100 - resultZip.saved}%`, transitionDelay: '0.5s'}}></div>
                </div>
                <span className="viz-val" style={{color: '#16a34a'}}>{resultZip.newSize} MB</span>
              </div>
            </div>

            <a href={resultZip.url} download="optimized_images.zip" className="download-btn-primary">
              <i className="fa-solid fa-download"></i> Download All Images
            </a>

            <div style={{marginTop: '25px'}}>
              <button onClick={reset} style={{background:'transparent', border:'none', color:'#94a3b8', fontSize:'0.9rem', cursor:'pointer', fontWeight:'600'}}>
                Start New Compression
              </button>
            </div>
          </div>
        </div>
      )}

      <input type="file" multiple accept="image/*" hidden ref={fileInputRef} onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}
