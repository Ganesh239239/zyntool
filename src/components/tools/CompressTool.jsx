import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing, studio, result
  const [quality, setQuality] = useState(0.4);
  const [summary, setSummary] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f), name: f.name,
      size: (f.size / 1024).toFixed(1)
    })));
    setStatus('studio');
  };

  const startBatch = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    await Promise.all(files.map(async (item) => {
      oldT += item.file.size;
      const options = { maxSizeMB: 0.2, initialQuality: quality, useWebWorker: true, maxIteration: 15 };
      const blob = await imageCompression(item.file, options);
      newT += blob.size;
      zip.file(`zyn-optimized-${item.name}`, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setSummary({
      url: URL.createObjectURL(zipBlob),
      saved: Math.round(((oldT - newT) / oldT) * 100),
      oldS: (oldT / 1024).toFixed(0),
      newS: (newT / 1024).toFixed(0)
    });
    setStatus('result');
  };

  return (
    <div className="zyn-studio-root">
      {status === 'landing' && (
        <div className="portal-container" onClick={() => document.getElementById('fIn').click()}>
          <div className="portal-inner">
            <div className="liquid-cloud" style={{ background: color }}>
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2 style={{fontWeight: 900, fontSize: '2.5rem', color: '#0f172a'}}>Choose Images</h2>
            <p style={{color: '#94a3b8', fontWeight: 600, fontSize: '1.1rem'}}>Drag and drop images for high-speed batch compression</p>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {(status === 'studio' || status === 'working') && (
        <div className="studio-workbench">
          <div className="asset-gallery">
            {files.map((f, i) => (
              <div key={i} className="asset-card">
                <img src={f.url} alt="asset" />
                <span className="label">{f.size} KB</span>
                {status === 'working' && (
                  <div style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <aside className="inspector-panel">
            <span style={{fontSize:'11px', fontWeight:900, color:'#cbd5e1', textTransform:'uppercase', letterSpacing:'1px', display:'block', marginBottom:'15px'}}>Power</span>
            <div style={{fontSize:'3rem', fontWeight:950, color:'#0f172a', letterSpacing:'-2px', marginBottom:'20px'}}>{Math.round((1 - quality) * 100)}%</div>
            <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{width:'100%', marginBottom:'40px', accentColor: color}} />
            
            <button className="btn-run-studio" onClick={startBatch} disabled={status === 'working'}>
              {status === 'working' ? 'OPTIMIZING...' : 'RUN BATCH'}
            </button>
          </aside>
        </div>
      )}

      {status === 'result' && (
        <div className="result-stage">
          <div className="massive-stat">{summary.saved}%</div>
          <h2 style={{fontWeight: 900, fontSize: '2.5rem', color: color, margin: '20px 0 40px'}}>Lighter!</h2>
          <p style={{color: '#94a3b8', fontSize: '1.2rem', marginBottom: '50px', fontWeight: '700'}}>{summary.oldS} KB reduced to {summary.newS} KB</p>
          <a href={summary.url} download="zyntool-optimized.zip" className="btn-download-studio" style={{ background: color }}>
             DOWNLOAD ZIP
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{marginTop: '40px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase'}}>
             ← Start New Batch
          </button>
        </div>
      )}
    </div>
  );
}
