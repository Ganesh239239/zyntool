import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color, title }) {
  const [files, setFiles] = useState([]);
  const [stage, setStage] = useState('landing'); // landing | lab | vault
  const [quality, setQuality] = useState(0.4);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState(null);

  const handleEntry = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, url: URL.createObjectURL(f), name: f.name, size: (f.size / 1024).toFixed(0)
    })));
    setStage('lab');
  };

  const runStudioProcess = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    let oldTotal = 0; let newTotal = 0;

    await Promise.all(files.map(async (item) => {
      oldTotal += item.file.size;
      const options = { maxSizeMB: 0.15, initialQuality: quality, useWebWorker: true, maxIteration: 20 };
      const blob = await imageCompression(item.file, options);
      newTotal += blob.size;
      zip.file(item.name, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setStats({
      url: URL.createObjectURL(zipBlob),
      saved: Math.round(((oldTotal - newTotal) / oldTotal) * 100),
      old: (oldTotal / 1024).toFixed(0),
      new: (newTotal / 1024).toFixed(0)
    });
    setIsProcessing(false);
    setStage('vault');
  };

  return (
    <div className="studio-container" style={{ '--brand-accent': color }}>
      
      {/* 1. LANDING: APERTURE PORTAL */}
      {stage === 'landing' && (
        <div className="aperture-portal" onClick={() => document.getElementById('studio-in').click()}>
          <div className="aperture-lens">
            <div className="liquid-cloud"></div>
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div className="aperture-text">
            <h1>{title}</h1>
            <p>Drag images into the aperture to start professional optimization</p>
          </div>
          <input type="file" id="studio-in" hidden multiple onChange={handleEntry} />
        </div>
      )}

      {/* 2. WORKSPACE: THE LAB */}
      {stage === 'lab' && (
        <div className="lab-interface">
          <div className="lab-preview">
            {isProcessing && <div className="laser-scanner"></div>}
            <div className="viewport">
               <img src={files[activeIdx].url} alt="studio-viewport" />
            </div>
          </div>

          <aside className="lab-sidebar">
             <span className="hud-label">Studio Intensity</span>
             <div className="hud-value">{Math.round((1 - quality) * 100)}%</div>
             <input 
                type="range" min="0.1" max="0.9" step="0.1" 
                value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} 
                style={{ width: '100%', accentColor: color, marginTop: '20px' }} 
             />
             
             <button className="btn-launch" onClick={runStudioProcess} disabled={isProcessing}>
                {isProcessing ? 'SCANNING PIXELS...' : 'INITIALIZE BATCH'}
             </button>
          </aside>
        </div>
      )}

      {/* 3. RESULT: THE VAULT */}
      {stage === 'vault' && (
        <div className="vault-scorecard">
          <div className="vault-stat">{stats.saved}%</div>
          <h2 style={{ fontWeight: 900, fontSize: '2rem', marginBottom: '40px' }}>Lighter & Better</h2>
          <p style={{ color: '#94a3b8', fontWeight: 700, marginBottom: '60px' }}>
            Batch: {stats.old} KB reduced to {stats.new} KB
          </p>
          
          <a href={stats.url} download="zyntool-studio.zip" className="btn-download-vault">
             EXPORT FROM STUDIO
          </a>
          <br/>
          <button onClick={() => setStage('landing')} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: 900, cursor: 'pointer', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
             ← New Batch
          </button>
        </div>
      )}
    </div>
  );
}
