import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); 
  const [quality, setQuality] = useState(0.4);
  const [results, setResults] = useState(null);

  const onUpload = (e) => {
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

  const handleCompress = async () => {
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
    <div className="studio-root">
      <style>{`
        /* 1. LANDING: REALISTIC DROPZONE */
        .dropzone-pro {
            max-width: 750px; margin: 0 auto; background: #fff; border-radius: 40px;
            padding: 12px; border: 1px solid #f1f5f9; box-shadow: 0 40px 100px rgba(0,0,0,0.06);
            cursor: pointer; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .dropzone-pro:hover { transform: translateY(-5px); box-shadow: 0 60px 120px rgba(0,0,0,0.1); border-color: ${color}; }
        .inner-dash { border: 3px dashed #e2e8f0; border-radius: 32px; padding: 80px 20px; text-align: center; }
        
        .liquid-icon {
            width: 100px; height: 100px; background: ${color}; color: white;
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;
            font-size: 2.5rem; animation: morph 8s infinite ease-in-out;
            box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }
        @keyframes morph {
            0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
            50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
        }

        /* 2. PROCESSING: WORKBENCH LAYOUT */
        .workbench { display: flex; gap: 30px; align-items: flex-start; }
        .asset-stage { 
            flex: 1; background: #f3f3f7; border-radius: 32px; padding: 30px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px; align-content: flex-start; min-height: 550px; border: 1px solid #eef0f2;
        }
        .asset-card {
            width: 198px; height: 244px; background: #fff; border-radius: 12px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.05); position: relative; border: 2px solid transparent; transition: 0.3s;
        }
        .asset-card:hover { border-color: ${color}; transform: translateY(-5px); }
        .asset-card img { max-width: 150px; max-height: 150px; object-fit: contain; border-radius: 4px; }
        .asset-card span { font-size: 10px; font-weight: 800; color: #999; margin-top: 15px; text-transform: uppercase; }

        .inspector { width: 340px; background: #fff; border-radius: 32px; padding: 40px; border: 1px solid #f1f5f9; position: sticky; top: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.02); }
        .control-label { font-size: 11px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-bottom: 15px; display: block; letter-spacing: 1px; }
        .quality-val { font-size: 3rem; font-weight: 950; color: #0f172a; letter-spacing: -3px; line-height: 1; margin-bottom: 20px; }
        
        .btn-pro { 
            width: 100%; padding: 22px; background: #0f172a; color: #fff; border: none; 
            border-radius: 50px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: 0.3s;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .btn-pro:hover { background: #000; transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0,0,0,0.2); }

        /* 3. RESULT: SCORECARD */
        .result-stage { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 60px; padding: 80px 40px; box-shadow: 0 40px 120px rgba(0,0,0,0.1); text-align: center; }
        .massive-stat { font-size: 8rem; font-weight: 950; color: #0f172a; letter-spacing: -8px; line-height: 1; margin-bottom: 10px; }
        .success-label { font-size: 2rem; font-weight: 900; color: ${color}; margin-bottom: 40px; }
        .btn-download { background: ${color}; color: white; padding: 25px 80px; font-size: 1.8rem; font-weight: 900; border-radius: 20px; text-decoration: none; display: inline-block; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }

        @media (max-width: 991px) {
            .workbench { flex-direction: column; }
            .inspector { width: 100%; position: static; margin-bottom: 20px; }
            .result-stage { border-radius: 30px; padding: 60px 20px; }
            .massive-stat { font-size: 5rem; letter-spacing: -4px; }
            .asset-card { width: 100%; height: auto; flex-direction: row; padding: 20px; gap: 20px; justify-content: flex-start; }
            .asset-card img { width: 60px; height: 60px; }
            .asset-card span { margin: 0; }
        }
      `}</style>

      {/* --- LANDING --- */}
      {status === 'landing' && (
        <div className="dropzone-pro" onClick={() => document.getElementById('fIn').click()}>
          <div className="inner-dash">
            <div className="liquid-icon">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2 style={{fontWeight: 950, fontSize: '2.2rem', color: '#0f172a'}}>Choose Images</h2>
            <p style={{color: '#94a3b8', fontWeight: 600, fontSize: '1.1rem'}}>Drag and drop up to 20 files to process batch</p>
            <input type="file" id="fIn" hidden multiple onChange={onUpload} />
          </div>
        </div>
      )}

      {/* --- PROCESSING --- */}
      {(status === 'processing' || status === 'working') && (
        <div className="workbench">
          <div className="asset-stage">
            {files.map((f, i) => (
              <div key={i} className="asset-card">
                <img src={f.url} />
                <span>{f.size} KB</span>
                {status === 'working' && <div style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}><i className="fa-solid fa-circle-notch fa-spin"></i></div>}
              </div>
            ))}
          </div>

          <aside className="inspector">
            <div style={{marginBottom: '40px'}}>
                <span className="control-label">Compression Power</span>
                <div className="quality-val">{Math.round((1 - quality) * 100)}%</div>
                <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{width: '100%', accentColor: color}} />
            </div>
            
            <button className="btn-pro" onClick={handleCompress} disabled={status === 'working'}>
              {status === 'working' ? 'OPTIMIZING...' : 'START BATCH'}
            </button>
          </aside>
        </div>
      )}

      {/* --- RESULT --- */}
      {status === 'result' && (
        <div className="result-stage">
          <div className="massive-stat">{results.saved}%</div>
          <div className="success-label">Lighter than original!</div>
          <p style={{color: '#94a3b8', fontSize: '1.2rem', marginBottom: '50px', fontWeight: '700'}}>{results.oldS} KB reduced to {results.newS} KB</p>
          
          <a href={results.url} download="zyntool-batch.zip" className="btn-download">
             DOWNLOAD ZIP
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{marginTop: '40px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase'}}>
             ← Process New Batch
          </button>
        </div>
      )}
    </div>
  );
}
