import React, { useState } from 'react';
import { encode as encodeJpeg } from '@jsquash/jpeg';
import { encode as encodeWebp } from '@jsquash/webp';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); 
  const [strength, setStrength] = useState(0.7); // High default compression
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
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

  const executeCompression = async () => {
    setStatus('working');
    const zip = new JSZip();
    let totalOld = 0; let totalNew = 0;

    try {
      for (const item of files) {
        totalOld += item.file.size;
        const imageData = await getImgData(item.file);
        
        // AGGRESSIVE WASM ENCODING (Google Squoosh Logic)
        const quality = Math.round((1 - strength) * 100);
        let buffer;

        if (item.file.type === 'image/webp') {
          buffer = await encodeWebp(imageData, { quality });
        } else {
          buffer = await encodeJpeg(imageData, { quality });
        }

        const blob = new Blob([buffer], { type: item.file.type });
        totalNew += blob.size;
        zip.file(`optimized-${item.name}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setSummary({
        url: URL.createObjectURL(zipBlob),
        saved: Math.max(0, Math.round(((totalOld - totalNew) / totalOld) * 100)),
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
        <div className="portal-stage" onClick={() => document.getElementById('studio-in').click()}>
          <div className="portal-card">
            <div className="portal-inner">
              <div className="liquid-cloud-engine" style={{ backgroundColor: color, width: '100px', height: '100px', borderRadius: '30px', margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
              </div>
              <h2 style={{ fontWeight: 900, fontSize: '2.5rem', color: '#0f172a' }}>Open Studio</h2>
              <p style={{ color: '#94a3b8', fontWeight: 600 }}>Drag and drop images for AI-guided batch compression</p>
              <input type="file" id="studio-in" hidden multiple onChange={handleUpload} />
            </div>
          </div>
        </div>
      )}

      {(status === 'lab' || status === 'working') && (
        <div className="lab-layout">
          <div className="lab-stage">
            {status === 'working' && <div className="laser"></div>}
            
            {/* PRO VIEWPORT WITH METADATA OVERLAYS */}
            <div className="viewport-canvas">
                <div className="meta-tag top-left">{files[activeIdx].name}</div>
                <div className="meta-tag bottom-right">INPUT: {(files[activeIdx].size / 1024).toFixed(1)} KB</div>
                
                <img 
                    src={files[activeIdx].url} 
                    alt="preview" 
                    style={{ 
                        transform: `scale(${zoom})`,
                        cursor: zoom > 1 ? 'grab' : 'zoom-in' 
                    }}
                    onClick={() => setZoom(zoom === 1 ? 2 : 1)}
                />
            </div>

            {/* BATCH BAR */}
            <div style={{ display: 'flex', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {files.map((f, i) => (
                    <img key={i} src={f.url} onClick={() => {setActiveIdx(i); setZoom(1);}} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer', opacity: activeIdx === i ? 1 : 0.4, border: activeIdx === i ? `2px solid ${color}` : 'none' }} />
                ))}
            </div>
          </div>

          <aside className="lab-sidebar">
            <h4 className="inspector-header">Studio Inspector</h4>
            
            <div style={{ marginBottom: '40px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#cbd5e1', textTransform: 'uppercase', display: 'block', marginBottom: '15px', letterSpacing: '2px' }}>Compression Power</span>
                <div style={{ fontSize: '4rem', fontWeight: 950, color: '#0f172a', letterSpacing: '-4px', lineHeight: 1 }}>{Math.round(strength * 100)}%</div>
                <input 
                  type="range" min="0.1" max="0.9" step="0.1" 
                  value={strength} onChange={(e) => setStrength(parseFloat(e.target.value))} 
                  style={{ width: '100%', accentColor: color, marginTop: '20px' }} 
                />
            </div>

            <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', fontSize: '12px', color: '#64748b', fontWeight: 700, lineHeight: 1.6, border: '1px solid #f1f5f9' }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: color, marginRight: '10px' }}></i>
                ZynEngine uses Perceptual Lossless Encoding. We target unnecessary pixel data to maximize savings while preserving high visual clarity.
            </div>
            
            <button className="btn-initialize-batch" onClick={executeCompression} disabled={status === 'working'}>
               {status === 'working' ? 'ENCODING PIXELS...' : 'INITIALIZE STUDIO'}
            </button>
          </aside>
        </div>
      )}

      {status === 'result' && (
        <div className="result-card-v8">
          <div className="massive-stat">{summary.saved}%</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: color, marginBottom: '10px' }}>Studio Optimization Successful</div>
          <p style={{ color: '#94a3b8', fontSize: '1.4rem', marginBottom: '60px', fontWeight: '700' }}>
            Batch: {summary.oldS} KB reduced to {summary.newS} KB
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
