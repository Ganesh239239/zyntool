import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, done
  const [quality, setQuality] = useState(0.6);
  const [results, setResults] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    })));
    setStatus('ready');
  };

  const executeCompression = async () => {
    setStatus('processing');
    const zip = new JSZip();
    let totalOld = 0;
    let totalNew = 0;

    await Promise.all(files.map(async (item) => {
      totalOld += item.file.size;
      const options = { maxSizeMB: 0.5, initialQuality: quality, useWebWorker: true };
      const blob = await imageCompression(item.file, options);
      totalNew += blob.size;
      zip.file(`compressed-${item.name}`, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setResults({
      url: URL.createObjectURL(zipBlob),
      pct: Math.round(((totalOld - totalNew) / totalOld) * 100),
      oldS: (totalOld / 1024).toFixed(0),
      newS: (totalNew / 1024).toFixed(0)
    });
    setStatus('done');
  };

  return (
    <div className="zyn-app-container">
      <style>{`
        /* --- NATIVE CSS ARCHITECTURE --- */
        .zyn-app-container { width: 100%; max-width: 1200px; margin: 0 auto; }
        
        /* State 1: Select */
        .select-hero { padding: 40px 0; text-align: center; }
        .btn-huge { 
            background: #4b8df8; color: #fff; border: none; padding: 25px 80px; 
            font-size: 2.2rem; font-weight: 800; border-radius: 16px; cursor: pointer;
            box-shadow: 0 20px 40px rgba(75, 141, 248, 0.2); transition: 0.3s;
        }
        .btn-huge:hover { background: #3b7dec; transform: translateY(-3px); }

        /* State 2: Workspace */
        .app-workspace { display: flex; gap: 20px; }
        .asset-stage { 
            flex: 1; background: #f3f3f7; border-radius: 24px; padding: 20px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px; align-content: flex-start; min-height: 500px;
        }

        /* YOUR 198x244 CARD FIX */
        .asset-card {
            width: 198px; height: 244px; background: #fff; border-radius: 12px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin: 0 auto;
        }
        .asset-card img { max-width: 160px; max-height: 160px; object-fit: contain; border-radius: 4px; }
        .asset-card span { font-size: 11px; font-weight: 700; color: #999; margin-top: 15px; width: 80%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; text-align: center; }

        .app-sidebar { width: 320px; background: #fff; border: 1px solid #eee; border-radius: 24px; padding: 30px; position: sticky; top: 100px; }
        .side-title { font-weight: 800; margin-bottom: 20px; font-size: 1.2rem; color: #111; }
        
        /* Pro Range Slider */
        .range-wrap { margin-bottom: 30px; }
        input[type=range] { width: 100%; height: 6px; background: #eee; border-radius: 10px; appearance: none; }
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 20px; height: 20px; background: #4b8df8; border-radius: 50%; cursor: pointer; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }

        .btn-action { 
            width: 100%; padding: 18px; background: #111; color: #fff; border: none; 
            border-radius: 50px; font-weight: 800; font-size: 1.1rem; cursor: pointer;
            transition: 0.2s;
        }
        .btn-action:hover { background: #000; letter-spacing: 1px; }

        /* State 3: Success */
        .success-card { max-width: 600px; margin: 40px auto; text-align: center; background: #fff; padding: 60px; border-radius: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.05); }
        .savings-badge { font-size: 5rem; font-weight: 900; color: #4b8df8; line-height: 1; margin-bottom: 10px; }
        
        /* RESPONSIVE ENGINE */
        @media (max-width: 991px) {
            .app-workspace { flex-direction: column; }
            .app-sidebar { width: 100%; position: static; order: 1; }
            .asset-stage { order: 2; }
            .btn-huge { width: 100%; padding: 20px; font-size: 1.5rem; }
        }
      `}</style>

      {status === 'idle' && (
        <div className="select-hero">
          <button className="btn-huge shadow-lg" onClick={() => document.getElementById('fIn').click()}>
            Select images
          </button>
          <p style={{marginTop: '20px', color: '#888', fontWeight: '500'}}>or drop images here</p>
          <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
        </div>
      )}

      {(status === 'ready' || status === 'processing') && (
        <div className="app-workspace">
          <div className="asset-stage">
            {files.map((f, i) => (
              <div key={i} className="asset-card">
                <img src={f.url} alt="preview" />
                <span>{f.name}</span>
              </div>
            ))}
          </div>

          <aside className="app-sidebar shadow-sm">
            <div className="side-title">Compression</div>
            <div className="range-wrap">
                <label style={{fontSize: '11px', fontWeight: '900', color: '#bbb', display: 'block', marginBottom: '10px'}}>STRENGTH: {Math.round(quality*100)}%</label>
                <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(e.target.value)} />
            </div>
            
            <button className="btn-action" onClick={executeCompression} disabled={status === 'processing'}>
              {status === 'processing' ? 'OPTIMIZING...' : 'COMPRESS ALL'}
            </button>
          </aside>
        </div>
      )}

      {status === 'done' && (
        <div className="success-card">
          <div className="savings-badge">{results.pct}%</div>
          <h2 style={{fontWeight: 900, marginBottom: '10px'}}>Lighter!</h2>
          <p style={{color: '#888', marginBottom: '40px'}}>{results.oldS} KB reduced to {results.newS} KB</p>
          
          <a href={results.url} download="zyntool-batch.zip" className="btn-huge" style={{textDecoration: 'none', display: 'block'}}>
             Download ZIP
          </a>
          <button onClick={() => location.reload()} style={{marginTop: '30px', background: 'none', border: 'none', color: '#4b8df8', fontWeight: '800', cursor: 'pointer'}}>
             START NEW BATCH
          </button>
        </div>
      )}
    </div>
  );
}
