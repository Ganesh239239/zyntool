import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); 
  const [quality, setQuality] = useState(0.4);
  const [results, setResults] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(1)
    })));
    setStatus('processing');
  };

  const executeCompression = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    await Promise.all(files.map(async (item) => {
      oldT += item.file.size;
      const options = { maxSizeMB: 0.2, initialQuality: quality, useWebWorker: true };
      const blob = await imageCompression(item.file, options);
      newT += blob.size;
      zip.file(item.name, blob);
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
    <div className="zyn-app-shell">
      <style>{`
        /* 1. LANDING: REALISTIC DROPZONE */
        .landing-zone {
            max-width: 700px; margin: 0 auto;
            background: #ffffff; border-radius: 32px;
            padding: 10px; border: 1px solid #f1f5f9;
            box-shadow: 0 30px 60px -12px rgba(0,0,0,0.08);
            cursor: pointer; transition: all 0.4s ease;
        }
        .landing-zone:hover { transform: translateY(-5px); box-shadow: 0 40px 80px -12px rgba(0,0,0,0.12); }
        .zone-inner { border: 3px dashed #e2e8f0; border-radius: 26px; padding: 100px 20px; text-align: center; background: #fafafa; }
        .icon-realistic { 
            width: 80px; height: 80px; background: #111; color: white; border-radius: 20px; 
            margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; font-size: 2rem;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .btn-select { background: #111; color: #fff; border: none; padding: 15px 40px; border-radius: 50px; font-weight: 800; font-size: 1rem; margin-top: 20px; cursor: pointer; }

        /* 2. PROCESSING: WORKBENCH LAYOUT */
        .workbench { display: flex; gap: 30px; }
        .assets-area { 
            flex: 1; background: #f8fafc; border-radius: 32px; padding: 30px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px; align-content: flex-start; min-height: 550px; border: 1px solid #f1f5f9;
        }
        
        .asset-card {
            width: 198px; height: 244px; background: #fff; border-radius: 12px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.05); border: 2px solid transparent; transition: 0.3s;
        }
        .asset-card img { max-width: 150px; max-height: 150px; object-fit: contain; border-radius: 4px; }
        .asset-card span { font-size: 10px; font-weight: 800; color: #999; margin-top: 15px; text-transform: uppercase; }

        .inspector-sidebar { width: 340px; background: #fff; border-radius: 32px; padding: 35px; border: 1px solid #f1f5f9; position: sticky; top: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .control-label { font-size: 11px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-bottom: 15px; display: block; }
        .quality-val { font-size: 2.5rem; font-weight: 900; color: #111; letter-spacing: -2px; }
        
        .btn-primary-action { 
            width: 100%; padding: 22px; background: #111; color: #fff; border: none; 
            border-radius: 20px; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: 0.3s;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .btn-primary-action:hover { background: #000; transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.15); }

        /* 3. RESULT: SUCCESS DASHBOARD */
        .result-stage { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 50px; padding: 80px 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.05); text-align: center; border: 1px solid #f1f5f9; }
        .big-stats { font-size: 7rem; font-weight: 900; color: #10b981; letter-spacing: -5px; line-height: 1; }
        .btn-download { background: #10b981; color: white; padding: 25px 80px; font-size: 1.5rem; font-weight: 800; border-radius: 24px; border: none; cursor: pointer; text-decoration: none; display: inline-block; box-shadow: 0 20px 40px rgba(16, 185, 129, 0.2); margin-bottom: 20px; }

        @media (max-width: 991px) {
            .workbench { flex-direction: column; }
            .inspector-sidebar { width: 100%; position: static; padding: 25px; }
            .result-stage { padding: 40px 20px; border-radius: 30px; }
            .big-stats { font-size: 4rem; }
            .asset-card { width: 100%; height: auto; flex-direction: row; padding: 15px; justify-content: flex-start; gap: 20px; }
            .asset-card img { width: 60px; height: 60px; }
            .asset-card span { margin: 0; }
        }
      `}</style>

      {/* --- STAGE 1: LANDING --- */}
      {status === 'landing' && (
        <div className="landing-zone" onClick={() => document.getElementById('fIn').click()}>
          <div className="zone-inner">
            <div className="icon-realistic">
              <i className="fa-solid fa-plus"></i>
            </div>
            <h2 style={{fontWeight: 900, marginBottom: '10px'}}>Add Images</h2>
            <p style={{color: '#94a3b8', fontWeight: 600}}>Upload up to 20 files for batch processing</p>
            <button className="btn-select">Browse Device</button>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {/* --- STAGE 2: WORKSPACE --- */}
      {(status === 'processing' || status === 'working') && (
        <div className="workbench">
          <div className="assets-area">
            {files.map((f, i) => (
              <div key={i} className="asset-card">
                <img src={f.url} />
                <span>{f.size} KB</span>
              </div>
            ))}
          </div>

          <aside className="inspector-sidebar">
            <div style={{marginBottom: '40px'}}>
                <span className="control-label">Target Quality</span>
                <div className="quality-val">{Math.round((1 - quality) * 100)}%</div>
                <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{width: '100%', marginTop: '15px'}} />
            </div>
            
            <button className="btn-primary-action" onClick={executeCompression} disabled={status === 'working'}>
              {status === 'working' ? 'OPTIMIZING...' : 'START PROCESSING'}
            </button>
          </aside>
        </div>
      )}

      {/* --- STAGE 3: RESULT --- */}
      {status === 'result' && (
        <div className="result-stage">
          <div className="big-stats">{results.saved}%</div>
          <h2 style={{fontWeight: 900, fontSize: '2rem', marginBottom: '10px'}}>Lighter & Faster</h2>
          <p style={{color: '#94a3b8', fontSize: '1.1rem', marginBottom: '50px', fontWeight: '600'}}>{results.oldS} KB reduced to {results.newS} KB</p>
          
          <a href={results.url} download="zyntool-batch.zip" className="btn-download">
             DOWNLOAD ZIP
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{marginTop: '30px', background: 'none', border: 'none', color: '#111', fontWeight: '900', cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px'}}>
             ← START NEW BATCH
          </button>
        </div>
      )}
    </div>
  );
}
