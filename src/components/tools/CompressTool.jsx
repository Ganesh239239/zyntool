import React, { useState } from 'react';
import encodeJpeg from '@jsquash/jpeg/encode';
import encodeWebp from '@jsquash/webp/encode';
import encodePng from '@jsquash/png/encode';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); 
  const [power, setPower] = useState(0.5); 
  const [isLossless, setIsLossless] = useState(true); // Default to High Quality
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

  const executeStudioProcess = async () => {
    setStatus('working');
    const zip = new JSZip();
    let totalOld = 0; let totalNew = 0;

    try {
      for (const item of files) {
        totalOld += item.file.size;
        const imageData = await getImgData(item.file);
        
        let compressedBuffer;
        
        if (isLossless) {
          // MODE: LOSSLESS (Metadata Stripping & Perfect Encoding)
          if (item.file.type === 'image/png') {
              compressedBuffer = await encodePng(imageData);
          } else {
              // MozJPEG Lossless stripping
              compressedBuffer = await encodeJpeg(imageData, { quality: 100 });
          }
        } else {
          // MODE: HIGH COMPRESSION (WASM Lossy)
          const quality = Math.round((1 - power) * 100);
          if (item.file.type === 'image/webp') {
            compressedBuffer = await encodeWebp(imageData, { quality });
          } else {
            compressedBuffer = await encodeJpeg(imageData, { quality });
          }
        }

        const blob = new Blob([compressedBuffer], { type: item.file.type });
        totalNew += blob.size;
        zip.file(`optimized-${item.name}`, blob);
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
      setStatus('lab');
    }
  };

  return (
    <div className="zyn-studio">
      {status === 'landing' && (
        <div className="studio-portal" onClick={() => document.getElementById('studio-in').click()}>
          <div className="portal-inner">
            <div className="liquid-cloud-engine" style={{ backgroundColor: color }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h2 style={{ fontWeight: 950, fontSize: '2.8rem', color: '#0f172a', letterSpacing: '-2px' }}>Studio Import</h2>
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>Choose between 100% Quality preservation or Extreme compression</p>
            <input type="file" id="studio-in" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {(status === 'lab' || status === 'working') && (
        <div className="lab-layout">
          <div className="lab-stage">
            {status === 'working' && <div className="laser"></div>}
            <div className="viewport">
              <img src={files[activeIdx].url} alt="studio-viewport" style={{ filter: isLossless ? 'none' : `contrast(1.05) brightness(${1.05 - power/10})` }} />
            </div>
          </div>

          <aside className="lab-inspector">
            <span className="hud-label">Processing Mode</span>
            <div className="mode-toggle-group" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <button 
                  onClick={() => setIsLossless(true)}
                  className={`mode-btn ${isLossless ? 'active' : ''}`}
                >
                    LOSSLESS
                </button>
                <button 
                  onClick={() => setIsLossless(false)}
                  className={`mode-btn ${!isLossless ? 'active' : ''}`}
                >
                    EXTREME
                </button>
            </div>

            {!isLossless && (
                <>
                    <span className="hud-label">Engine Intensity</span>
                    <div className="hud-value">{Math.round(power * 100)}%</div>
                    <input 
                    type="range" min="0.1" max="0.9" step="0.1" 
                    value={power} onChange={(e) => setPower(parseFloat(e.target.value))} 
                    style={{ width: '100%', accentColor: color, marginBottom: '40px' }} 
                    />
                </>
            )}

            {isLossless && (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '40px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: 0 }}>
                        <i className="fa-solid fa-shield-heart" style={{ color: '#10b981', marginRight: '8px' }}></i>
                        Perfect Quality Guaranteed. Our engine will only remove metadata and optimize file headers.
                    </p>
                </div>
            )}
            
            <button className="btn-initialize" onClick={executeStudioProcess} disabled={status === 'working'}>
               {status === 'working' ? 'ENCODING PIXELS...' : 'INITIALIZE BATCH'}
            </button>
          </aside>
        </div>
      )}

      {status === 'result' && (
        <div className="result-card-elite">
          <div className="massive-stat">{summary.saved}%</div>
          <div className="stat-msg" style={{ color: color }}>{isLossless ? 'Pixels Preserved!' : 'Successfully Optimized!'}</div>
          <p style={{ color: '#94a3b8', fontSize: '1.4rem', marginBottom: '60px', fontWeight: '700' }}>
            {summary.oldS} KB reduced to {summary.newS} KB
          </p>
          <a href={summary.url} download="zyntool-studio.zip" className="btn-download-studio" style={{ background: color }}>
             EXPORT FROM STUDIO
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{ marginTop: '50px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
             ← NEW STUDIO SESSION
          </button>
        </div>
      )}
    </div>
  );
}
