import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing | processing | result
  const [quality, setQuality] = useState(0.4); // Pro default for high savings
  const [results, setResults] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f, id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f), name: f.name,
      size: (f.size / 1024).toFixed(1)
    })));
    setStatus('processing');
  };

  const startBatch = async () => {
    setStatus('working');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    await Promise.all(files.map(async (item) => {
      oldT += item.file.size;
      // THE AGGRESSIVE ENGINE: Multi-pass compression
      const options = { maxSizeMB: 0.1, initialQuality: quality, useWebWorker: true, maxIteration: 20 };
      const blob = await imageCompression(item.file, options);
      newT += blob.size;
      zip.file(`optimized-${item.name}`, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setResults({
      url: URL.createObjectURL(zipBlob),
      saved: Math.round(((oldT - newT) / oldT) * 100),
      oldKB: (oldT / 1024).toFixed(0),
      newKB: (newT / 1024).toFixed(0)
    });
    setStatus('result');
  };

  return (
    <div className="studio-root">
      <style>{`
        /* --- NATIVE STUDIO CSS --- */
        .landing-portal {
            max-width: 800px; margin: 0 auto; background: #fff; border-radius: 48px;
            padding: 12px; border: 1px solid #f1f5f9; box-shadow: 0 40px 100px rgba(0,0,0,0.06);
            cursor: pointer; transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .landing-portal:hover { transform: translateY(-8px); box-shadow: 0 60px 120px rgba(0,0,0,0.1); }
        .portal-inner { border: 3px dashed #e2e8f0; border-radius: 40px; padding: 100px 20px; text-align: center; background: #fafafa; }
        
        /* LIQUID CLOUD ANIMATION */
        .liquid-icon {
            width: 110px; height: 110px; background: ${color}; color: white;
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
            margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;
            font-size: 2.8rem; animation: morph 6s infinite ease-in-out;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        @keyframes morph {
            0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
            50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        /* WORKBENCH LAYOUT */
        .workbench { display: flex; gap: 30px; }
        .gallery { 
            flex: 1; background: #f3f3f7; border-radius: 32px; padding: 30px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px; min-height: 550px; border: 1px solid #eef0f2;
        }
        
        /* THE 198x244 CARD */
        .asset-card {
            width: 198px; height: 244px; background: #fff; border-radius: 12px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.04); position: relative; transition: 0.3s;
        }
        .asset-card:hover { transform: scale(1.03); border: 2px solid ${color}; }
        .asset-card img { max-width: 150px; max-height: 150px; object-fit: contain; }
        .asset-card span { font-size: 10px; font-weight: 800; color: #94a3b8; margin-top: 15px; text-transform: uppercase; }

        .inspector { width: 340px; background: #fff; border-radius: 32px; padding: 40px; border: 1px solid #f1f5f9; position: sticky; top: 100px; box-shadow: 0 20px 40px rgba(0,0,0,0.02); }
        .ctrl-label { font-size: 11px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; margin-bottom: 20px; display: block; letter-spacing: 2px; }
        .stat-massive { font-size: 4rem; font-weight: 950; color: #0f172a; letter-spacing: -4px; line-height: 1; margin-bottom: 10px; }
        
        .btn-run { 
            width: 100%; padding: 22px; background: #0f172a; color: #fff; border: none; 
            border-radius: 100px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: 0.3s;
        }
        .btn-run:hover { background: #000; transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }

        /* SUCCESS SCORECARD */
        .scorecard { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 60px; padding: 80px 40px; box-shadow: 0 50px 120px rgba(0,0,0,0.08); text-align: center; }
        .score-pct { font-size: 10rem; font-weight: 950; color: #0f172a; letter-spacing: -10px; line-height: 0.8; }
        .score-msg { font-size: 2.5rem; font-weight: 900; color: ${color}; margin: 20px 0 40px; }
        .btn-dl { background: ${color}; color: white; padding: 25px 80px; font-size: 1.8rem; font-weight: 900; border-radius: 24px; text-decoration: none; display: inline-block; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

        @media (max-width: 991px) {
            .workbench { flex-direction: column; }
            .inspector { width: 100%; position: static; }
            .score-pct { font-size: 6rem; letter-spacing: -5px; }
            .asset-card { width: 100%; height: auto; flex-direction: row; padding: 20px; gap: 20px; justify-content: flex-start; }
            .asset-card img { width: 60px; height: 60px; }
            .asset-card span { margin: 0; }
        }
      `}</style>

      {/* STAGE 1: LANDING */}
      {status === 'landing' && (
        <div className="landing-portal" onClick={() => document.getElementById('fIn').click()}>
          <div className="portal-inner">
            <div className="liquid-icon">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2 style={{fontWeight: 950, fontSize: '2.5rem', color: '#0f172a', marginBottom: '10px'}}>Optimize Batch</h2>
            <p style={{color: '#94a3b8', fontWeight: 600, fontSize: '1.2rem'}}>Upload up to 20 images for extreme compression</p>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {/* STAGE 2: WORKSPACE */}
      {(status === 'processing' || status === 'working') && (
        <div className="workbench">
          <div className="gallery">
            {files.map((f, i) => (
              <div key={i} className="asset-card">
                <img src={f.url} />
                <span>{f.size} KB</span>
                {status === 'working' && <div style={{position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', borderRadius:'12px', display:'flex', alignItems:'center', justify-content:center}}><i className="fa-solid fa-circle-notch fa-spin"></i></div>}
              </div>
            ))}
          </div>

          <aside className="inspector">
            <span className="ctrl-label">Engine Strength</span>
            <div className="stat-massive">{Math.round((1 - quality) * 100)}%</div>
            <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{width: '100%', accentColor: color, marginBottom: '40px'}} />
            
            <button className="btn-run" onClick={startBatch} disabled={status === 'working'}>
              {status === 'working' ? 'OPTIMIZING...' : 'START PROCESSING'}
            </button>
          </aside>
        </div>
      )}

      {/* STAGE 3: RESULT */}
      {status === 'result' && (
        <div className="scorecard">
          <div className="score-pct">{results.saved}%</div>
          <div className="score-msg">Lighter than original!</div>
          <p style={{color: '#94a3b8', fontSize: '1.3rem', marginBottom: '60px', fontWeight: '700'}}>{results.oldS} KB reduced to {results.newS} KB</p>
          
          <a href={results.url} download="zyntool-optimized.zip" className="btn-dl">
             DOWNLOAD ZIP
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{marginTop: '50px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '900', cursor: 'pointer', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase'}}>
             ← Process New Batch
          </button>
        </div>
      )}
    </div>
  );
}
