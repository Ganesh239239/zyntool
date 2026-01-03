import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing, studio, result
  const [quality, setQuality] = useState(0.4);
  const [activeIdx, setActiveIdx] = useState(0);
  const [summary, setSummary] = useState(null);

  const onUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f), name: f.name,
      size: (f.size / 1024).toFixed(0)
    })));
    setStatus('studio');
  };

  const processBatch = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    await Promise.all(files.map(async (item) => {
      oldT += item.file.size;
      const options = { maxSizeMB: 0.1, initialQuality: quality, useWebWorker: true, maxIteration: 15 };
      const blob = await imageCompression(item.file, options);
      newT += blob.size;
      zip.file(`zyn-optimized-${item.name}`, blob);
    }));

    const blob = await zip.generateAsync({ type: 'blob' });
    setSummary({
      url: URL.createObjectURL(blob),
      saved: Math.round(((oldT - newT) / oldT) * 100),
      oldS: (oldT / 1024).toFixed(0),
      newS: (newT / 1024).toFixed(0)
    });
    setStatus('result');
  };

  return (
    <div className="zyn-studio">
      {/* LANDING PORTAL */}
      {status === 'landing' && (
        <div className="portal-stage" onClick={() => document.getElementById('studio-in').click()}>
          <div className="portal-glass">
            <div className="portal-inner">
              <div className="liquid-core" style={{ backgroundColor: color }}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <h2 style={{ fontWeight: 950, fontSize: '2.5rem', color: '#0f172a', letterSpacing: '-1.5px' }}>Studio Import</h2>
              <p style={{ color: '#94a3b8', fontWeight: 600 }}>Drag files into the portal to begin professional optimization</p>
              <input type="file" id="studio-in" hidden multiple onChange={onUpload} />
            </div>
          </div>
        </div>
      )}

      {/* STUDIO WORKSPACE */}
      {(status === 'studio' || status === 'working') && (
        <div className="workbench-shell">
          <div className="stage-area">
            <div className="viewport">
              <img src={files[activeIdx].url} alt="studio-viewport" />
            </div>
            <div className="asset-tray">
              {files.map((f, i) => (
                <div key={i} className={`tray-item ${activeIdx === i ? 'active' : ''}`} onClick={() => setActiveIdx(i)}>
                  <img src={f.url} />
                </div>
              ))}
            </div>
          </div>

          <aside className="inspector">
            <h4>Inspector</h4>
            <div className="control-block">
                <span className="label-tiny">Target Power</span>
                <div className="stat-value">{Math.round((1 - quality) * 100)}%</div>
                <input 
                  type="range" min="0.1" max="0.9" step="0.1" 
                  value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} 
                  style={{ width: '100%', accentColor: color }} 
                />
            </div>
            
            <button className="btn-studio-primary" onClick={processBatch} disabled={status === 'working'}>
               {status === 'working' ? 'COMPRESSING...' : 'RUN STUDIO ENGINE'}
            </button>
          </aside>
        </div>
      )}

      {/* RESULT SCORECARD */}
      {status === 'result' && (
        <div className="result-card-elite">
          <div className="big-pct">{summary.saved}%</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: color, marginBottom: '40px' }}>Lighter!</div>
          <p style={{ color: '#94a3b8', fontSize: '1.4rem', marginBottom: '60px', fontWeight: '700' }}>
            Batch: {summary.oldS} KB <i className="fa-solid fa-arrow-right mx-2"></i> {summary.newS} KB
          </p>
          <a href={summary.url} download="zyntool-studio.zip" className="download-btn-elite" style={{ background: color }}>
             DOWNLOAD BATCH
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{ marginTop: '50px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
             ← Start New Batch
          </button>
        </div>
      )}
    </div>
  );
}
