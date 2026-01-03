import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import './CompressTool.css'; // This imports our new stylesheet

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing');
  const [quality, setQuality] = useState(0.4);
  const [results, setResults] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f), name: f.name,
      size: (f.size / 1024).toFixed(1)
    })));
    setStatus('processing');
  };

  const startBatch = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    await Promise.all(files.map(async (item) => {
      oldT += item.file.size;
      const options = { maxSizeMB: 0.1, initialQuality: quality, useWebWorker: true, maxIteration: 20 };
      const blob = await imageCompression(item.file, options);
      newT += blob.size;
      zip.file(`optimized-${item.name}`, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setResults({
      url: URL.createObjectURL(zipBlob),
      saved: Math.round(((oldT - newT) / oldT) * 100),
      oldS: (oldT / 1024).toFixed(0),
      newS: (newT / 1024).toFixed(0)
    });
    setStatus('result');
  };

  return (
    <div className="studio-root">
      {status === 'landing' && (
        <div className="landing-portal" onClick={() => document.getElementById('fIn').click()}>
          <div className="portal-inner">
            <div className="liquid-icon" style={{ backgroundColor: color }}>
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2 style={{fontWeight: 950, fontSize: '2.5rem', color: '#0f172a', marginBottom: '10px'}}>Optimize Images</h2>
            <p style={{color: '#94a3b8', fontWeight: 600, fontSize: '1.2rem'}}>Drag and drop up to 20 images for batch compression</p>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {(status === 'processing' || status === 'working') && (
        <div className="workbench">
          <div className="gallery">
            {files.map((f, i) => (
              <div key={i} className="asset-card">
                <img src={f.url} alt="preview" />
                <span>{f.size} KB</span>
                {status === 'working' && (
                  <div style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <aside className="inspector">
            <span className="ctrl-label">Engine Strength</span>
            <div className="stat-massive">{Math.round((1 - quality) * 100)}%</div>
            <input 
                type="range" min="0.1" max="0.9" step="0.1" 
                value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} 
                style={{width: '100%', accentColor: color, marginBottom: '40px'}} 
            />
            
            <button className="btn-run" onClick={startBatch} disabled={status === 'working'}>
              {status === 'working' ? 'OPTIMIZING...' : 'START PROCESSING'}
            </button>
          </aside>
        </div>
      )}

      {status === 'result' && (
        <div className="scorecard">
          <div className="score-pct">{results.saved}%</div>
          <div className="score-msg" style={{ color: color }}>Lighter than original!</div>
          <p style={{color: '#94a3b8', fontSize: '1.3rem', marginBottom: '60px', fontWeight: '700'}}>
            {results.oldS} KB reduced to {results.newS} KB
          </p>
          
          <a href={results.url} download="zyntool-optimized.zip" className="btn-dl" style={{ backgroundColor: color }}>
             DOWNLOAD ZIP
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{marginTop: '50px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase'}}>
             ← Process New Batch
          </button>
        </div>
      )}
    </div>
  );
}
