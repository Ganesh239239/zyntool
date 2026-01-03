import React, { useState } from 'react';
import encodeJpeg from '@jsquash/jpeg/encode';
import encodeWebp from '@jsquash/webp/encode';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); 
  const [power, setPower] = useState(0.7); 
  const [activeIdx, setActiveIdx] = useState(0);
  const [summary, setSummary] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f), name: f.name,
      size: (f.size / 1024).toFixed(0)
    })));
    setStatus('lab');
  };

  // Helper: Convert File to ImageData (Required for WASM Encoders)
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

  const executeWasmBatch = async () => {
    setStatus('working');
    const zip = new JSZip();
    let totalOld = 0; let totalNew = 0;

    try {
      for (const item of files) {
        totalOld += item.file.size;
        const imageData = await getImgData(item.file);
        const quality = Math.round((1 - power) * 100);
        
        let compressedBuffer;
        if (item.file.type === 'image/webp') {
          compressedBuffer = await encodeWebp(imageData, { quality });
        } else {
          compressedBuffer = await encodeJpeg(imageData, { quality });
        }

        const blob = new Blob([compressedBuffer], { type: item.file.type });
        totalNew += blob.size;
        zip.file(`zyntool-${item.name}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setSummary({
        url: URL.createObjectURL(zipBlob),
        saved: Math.round(((totalOld - totalNew) / totalOld) * 100),
        oldS: (totalOld / 1024).toFixed(0),
        newS: (totalNew / 1024).toFixed(0)
      });
      setStatus('result');
    } catch (err) {
      console.error(err);
      alert("WASM Engine Error. Please try again.");
      setStatus('lab');
    }
  };

  return (
    <div className="zyn-studio">
      {status === 'landing' && (
        <div className="studio-portal" onClick={() => document.getElementById('studio-in').click()}>
          <div className="portal-inner">
            <div className="liquid-cloud-engine" style={{ backgroundColor: color }}>
              <i className="fa-solid fa-microchip"></i>
            </div>
            <h2 style={{ fontWeight: 950, fontSize: '2.5rem', color: '#0f172a', letterSpacing: '-2px' }}>Initialize WASM</h2>
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>Extreme browser-based compression using high-performance C++ engines</p>
            <input type="file" id="studio-in" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {(status === 'lab' || status === 'working') && (
        <div className="lab-layout">
          <div className="lab-stage">
            {status === 'working' && <div className="laser"></div>}
            <div className="viewport">
              <img src={files[activeIdx].url} alt="studio-viewport" />
            </div>
            <div className="batch-tray" style={{display: 'flex', gap: '15px', padding: '20px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)'}}>
                {files.map((f, i) => (
                    <div key={i} onClick={() => setActiveIdx(i)} style={{width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: activeIdx === i ? `2px solid ${color}` : '2px solid transparent', opacity: activeIdx === i ? 1 : 0.5, position: 'relative'}}>
                        <img src={f.url} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                ))}
            </div>
          </div>

          <aside className="lab-inspector">
            <span className="hud-label">WASM Strength</span>
            <div className="hud-value">{Math.round(power * 100)}%</div>
            <input 
              type="range" min="0.1" max="0.9" step="0.1" 
              value={power} onChange={(e) => setPower(parseFloat(e.target.value))} 
              style={{ width: '100%', accentColor: color, marginBottom: '40px' }} 
            />
            
            <button className="btn-initialize" onClick={executeWasmBatch} disabled={status === 'working'}>
               {status === 'working' ? 'PIXEL ENCODING...' : 'INITIALIZE BATCH'}
            </button>
          </aside>
        </div>
      )}

      {status === 'result' && (
        <div className="result-card-elite">
          <div className="massive-stat">{summary.saved}%</div>
          <div className="stat-msg" style={{ color: color }}>Lighter than original!</div>
          <p style={{ color: '#94a3b8', fontSize: '1.4rem', marginBottom: '60px', fontWeight: '700' }}>
            {summary.oldS} KB reduced to {summary.newS} KB
          </p>
          <a href={summary.url} download="zyntool-wasm-batch.zip" className="btn-download-studio" style={{ background: color }}>
             DOWNLOAD BATCH
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{ marginTop: '50px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
             ← START NEW SESSION
          </button>
        </div>
      )}
    </div>
  );
}
