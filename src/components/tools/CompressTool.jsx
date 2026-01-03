import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing | studio | result
  const [quality, setQuality] = useState(0.4);
  const [activeIdx, setActiveIdx] = useState(0);
  const [results, setResults] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f), name: f.name,
      size: (f.size / 1024).toFixed(1)
    })));
    setStatus('studio');
  };

  const processBatch = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    await Promise.all(files.map(async (item) => {
      oldT += item.file.size;
      const options = { maxSizeMB: 0.15, initialQuality: quality, useWebWorker: true, maxIteration: 15 };
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
    <div className="zyn-studio-root">
      {/* 1. LANDING */}
      {status === 'landing' && (
        <div className="studio-portal" onClick={() => document.getElementById('fIn').click()}>
          <div className="portal-inner">
            <div className="liquid-cloud-engine" style={{ backgroundColor: color }}>
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2 style={{ fontWeight: 950, fontSize: '2.8rem', letterSpacing: '-2px', color: '#0f172a' }}>Optimize Images</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600 }}>Drag and drop images for high-speed batch studio compression</p>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {/* 2. STUDIO WORKSPACE */}
      {(status === 'studio' || status === 'working') && (
        <div className="studio-workspace">
          <div className="main-stage">
            <div className="viewport">
              <img src={files[activeIdx].url} alt="viewport" />
            </div>
            {/* Batch Tray */}
            <div className="batch-tray">
              {files.map((f, i) => (
                <div key={i} className={`tray-card ${activeIdx === i ? 'active' : ''}`} onClick={() => setActiveIdx(i)}>
                  <img src={f.url} />
                  {status === 'working' && <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', borderRadius:'9px', display:'flex', alignItems:'center', justifyCenter:'center'}}><i className="fa-solid fa-circle-notch fa-spin text-white"></i></div>}
                </div>
              ))}
            </div>
          </div>

          <aside className="inspector-sidebar">
            <h4 className="inspector-title">Inspector</h4>
            <div className="ctrl-row">
                <span className="ctrl-label">Engine Intensity</span>
                <div className="val-huge">{Math.round((1 - quality) * 100)}%</div>
                <input 
                  type="range" min="0.1" max="0.9" step="0.1" 
                  value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} 
                  style={{ width: '100%', accentColor: color }} 
                />
            </div>
            
            <button className="btn-studio-cta" onClick={processBatch} disabled={status === 'working'}>
               {status === 'working' ? 'PROCESSING...' : 'RUN STUDIO BATCH'}
            </button>
          </aside>
        </div>
      )}

      {/* 3. RESULT SCORECARD */}
      {status === 'result' && (
        <div className="scorecard-view">
          <div className="savings-number">{results.saved}%</div>
          <div className="savings-label" style={{ color: color }}>Lighter than original!</div>
          <p style={{ color: '#94a3b8', fontSize: '1.4rem', marginBottom: '60px', fontWeight: '700' }}>
            {results.oldS} KB reduced to {results.newS} KB
          </p>
          <a href={results.url} download="zyntool-optimized.zip" className="btn-download-pro" style={{ background: color }}>
             DOWNLOAD ZIP
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{ marginTop: '50px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
             ← New Batch
          </button>
        </div>
      )}
    </div>
  );
}
