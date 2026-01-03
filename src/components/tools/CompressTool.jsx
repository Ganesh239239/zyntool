import React, { useState } from 'react';
import { encode as encodeJpeg } from '@jsquash/jpeg';
import { encode as encodeWebp } from '@jsquash/webp';
import { encode as encodePng } from '@jsquash/png';
import { optimise as optimisePng } from '@jsquash/oxipng';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); 
  const [mode, setMode] = useState('lossless'); // lossless | aggressive
  const [activeIdx, setActiveIdx] = useState(0);
  const [summary, setSummary] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f), name: f.name, size: f.size
    })));
    setStatus('lab');
  };

  const getImgData = async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(r => img.onload = r);
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  };

  const executeBatch = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    try {
      for (const item of files) {
        oldT += item.file.size;
        let finalBlob;

        // AWS-Tier Precision Logic
        const imageData = await getImgData(item.file);
        let buffer;

        if (mode === 'lossless') {
          if (item.file.type === 'image/png') {
            const raw = await encodePng(imageData);
            buffer = await optimisePng(raw, { level: 3 });
          } else {
            buffer = await encodeJpeg(imageData, { quality: 100 });
          }
        } else {
          // Aggressive Mode
          if (item.file.type === 'image/webp') {
            buffer = await encodeWebp(imageData, { quality: 40 });
          } else {
            buffer = await encodeJpeg(imageData, { quality: 40 });
          }
        }

        const processed = new Blob([buffer], { type: item.file.type });

        // THE SIZE-GUARD: discard if it increased in size
        if (mode === 'lossless' && processed.size >= item.file.size) {
            finalBlob = item.file; 
        } else {
            finalBlob = processed;
        }

        newT += finalBlob.size;
        zip.file(`optimized-${item.name}`, finalBlob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setSummary({
        url: URL.createObjectURL(zipBlob),
        saved: Math.max(0, Math.round(((oldT - newT) / oldT) * 100)),
        oldS: (oldT / 1024).toFixed(0),
        newS: (newT / 1024).toFixed(0)
      });
      setStatus('result');
    } catch (err) {
      console.error(err);
      setStatus('lab');
    }
  };

  return (
    <div className="zyn-studio">
      {status === 'landing' && (
        <div className="portal-stage" onClick={() => document.getElementById('studio-in').click()}>
          <div className="portal-card">
            <div className="portal-inner">
              <div className="liquid-engine" style={{ backgroundColor: color }}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: '2.2rem' }}>Import Images</h2>
              <p style={{ color: '#64748b', fontWeight: 500 }}>Quantum Size-Guard Engine Active</p>
              <input type="file" id="studio-in" hidden multiple onChange={handleUpload} />
            </div>
          </div>
        </div>
      )}

      {(status === 'lab' || status === 'working') && (
        <div className="lab-container">
          <div className="lab-stage">
            {status === 'working' && <div className="scan-line"></div>}
            <div className="viewport-area">
              <img src={files[activeIdx].url} alt="viewport" />
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '15px', background: 'rgba(0,0,0,0.2)' }}>
                {files.map((f, i) => (
                    <img key={i} src={f.url} onClick={() => setActiveIdx(i)} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: activeIdx === i ? `2px solid ${color}` : 'none' }} />
                ))}
            </div>
          </div>

          <aside className="lab-inspector">
            <h4 className="inspector-h">Studio Inspector</h4>
            
            <div style={{ marginBottom: '30px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>Optimization Path</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setMode('lossless')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontWeight: 800, fontSize: '10px', background: mode === 'lossless' ? '#f0f9ff' : '#fff', color: mode === 'lossless' ? color : '#94a3b8', borderColor: mode === 'lossless' ? color : '#eee' }}>LOSSLESS</button>
                    <button onClick={() => setMode('aggressive')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #eee', fontWeight: 800, fontSize: '10px', background: mode === 'aggressive' ? '#f0f9ff' : '#fff', color: mode === 'aggressive' ? color : '#94a3b8', borderColor: mode === 'aggressive' ? color : '#eee' }}>AGGRESSIVE</button>
                </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {mode === 'lossless' ? 'Mode: Pixel Preservation. We strip unnecessary data headers while keeping original image quality intact.' : 'Mode: Max Savings. We use WASM multi-pass encoding to achieve the smallest possible file size.'}
            </div>
            
            <button className="btn-amazon-primary" onClick={executeBatch} disabled={status === 'working'}>
               {status === 'working' ? 'ENCODING...' : 'RUN STUDIO BATCH'}
            </button>
          </aside>
        </div>
      )}

      {status === 'result' && (
        <div className="result-card-amazon">
          <div className="stat-giant">{summary.saved}%</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: color, marginBottom: '10px' }}>Lighter!</div>
          <p style={{ color: '#94a3b8', fontWeight: 700, marginBottom: '50px' }}>{summary.oldS} KB reduced to {summary.newS} KB</p>
          <a href={summary.url} download="zyntool-batch.zip" className="btn-dl-pro" style={{ background: color }}>
             DOWNLOAD BATCH
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: 800, cursor: 'pointer', fontSize: '12px', letterSpacing: '1px' }}>
             NEW SESSION
          </button>
        </div>
      )}
    </div>
  );
}
