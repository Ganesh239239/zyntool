import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); 
  const [quality, setQuality] = useState(0.5);
  const [results, setResults] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    setFiles(selected.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
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
      const options = { 
        maxSizeMB: 0.2, // Aggressive target
        initialQuality: quality, 
        useWebWorker: true,
        maxIteration: 15 
      };
      const blob = await imageCompression(item.file, options);
      totalNew += blob.size;
      zip.file(`optimized-${item.name}`, blob);
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
    <div className="zyn-app-root">
      <style>{`
        .zyn-app-root { width: 100%; font-family: inherit; }
        
        /* --- STEP 1: DROPZONE DESIGN --- */
        .premium-uploader {
            max-width: 750px; margin: 0 auto; padding: 20px;
            background: #ffffff; border-radius: 40px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.05);
            transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer; border: 1px solid #f1f5f9;
        }
        .premium-uploader:hover { transform: scale(1.02); box-shadow: 0 30px 70px rgba(79, 70, 229, 0.15); }
        
        .uploader-dash {
            border: 3px dashed #e2e8f0; border-radius: 32px;
            padding: 80px 40px; text-align: center;
        }
        
        .floating-icon {
            width: 90px; height: 90px; background: #4b8df8; color: #fff;
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; /* Organic shape */
            margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;
            font-size: 2.5rem; animation: morphing 6s infinite ease-in-out;
            box-shadow: 0 15px 30px rgba(75, 141, 248, 0.3);
        }
        @keyframes morphing {
            0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
            50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
            100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        }

        .btn-premium-cta {
            background: #4b8df8; color: white; border: none;
            padding: 18px 50px; font-size: 1.5rem; font-weight: 800;
            border-radius: 18px; margin-top: 20px; cursor: pointer;
            box-shadow: 0 10px 25px rgba(75, 141, 248, 0.2);
        }

        /* --- STEP 2: ASSET MANAGER --- */
        .workspace-flex { display: flex; gap: 30px; align-items: flex-start; margin-top: 20px; }
        .gallery-grid { 
            flex: 1; background: #f3f3f7; padding: 25px; border-radius: 24px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px; min-height: 500px;
        }
        
        .asset-card-pro {
            width: 198px; height: 244px; background: #fff; border-radius: 12px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 0 8px 0 rgba(0, 0, 0, .08); transition: 0.3s;
        }
        .asset-card-pro:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .asset-card-pro img { max-width: 150px; max-height: 150px; object-fit: contain; border-radius: 6px; }
        .asset-card-pro span { font-size: 11px; font-weight: 700; color: #94a3b8; margin-top: 15px; width: 80%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; text-align: center; }

        .side-inspector { width: 340px; background: #fff; border-radius: 24px; padding: 30px; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgba(0,0,0,0.03); position: sticky; top: 100px; }
        .btn-execute { width: 100%; padding: 20px; background: #4b8df8; color: #fff; border: none; border-radius: 50px; font-weight: 800; font-size: 1.2rem; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(75,141,248,0.2); }

        /* --- STEP 3: SUCCESS (MATCHING YOUR IMAGE) --- */
        .success-wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 40px; padding: 60px; box-shadow: 0 40px 100px rgba(0,0,0,0.08); text-align: center; border: 1px solid #f8fafc; }
        .giant-pct { font-size: 6rem; font-weight: 900; color: #4b8df8; letter-spacing: -4px; line-height: 0.9; margin-bottom: 10px; }
        .lighter-text { font-size: 2.2rem; font-weight: 800; color: #1a202c; margin-bottom: 5px; }
        .kb-reduced { color: #94a3b8; font-weight: 600; margin-bottom: 40px; }
        .btn-zip { background: #4b8df8; color: #fff; text-decoration: none; padding: 22px 60px; font-size: 1.8rem; font-weight: 800; border-radius: 20px; display: block; transition: 0.3s; box-shadow: 0 15px 35px rgba(75, 141, 248, 0.3); }
        .btn-restart { margin-top: 30px; background: none; border: none; color: #4b8df8; font-weight: 800; letter-spacing: 1px; cursor: pointer; text-transform: uppercase; font-size: 0.9rem; }

        @media (max-width: 768px) {
            .workspace-flex { flex-direction: column; }
            .side-inspector { width: 100%; position: static; }
            .giant-pct { font-size: 4rem; }
            .btn-premium-cta { width: 100%; }
        }
      `}</style>

      {status === 'idle' && (
        <div className="premium-uploader" onClick={() => document.getElementById('fIn').click()}>
          <div className="uploader-dash">
            <div className="floating-icon">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-800">Choose Files</h2>
            <p className="text-slate-400 font-medium">Drag & drop or click to start optimization</p>
            <button className="btn-premium-cta">
              Get Started
            </button>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {(status === 'ready' || status === 'processing') && (
        <div className="workspace-flex">
          <div className="gallery-grid">
            {files.map((f, i) => (
              <div key={i} className="asset-card-pro">
                <img src={f.url} alt="preview" />
                <span>{f.name}</span>
              </div>
            ))}
          </div>

          <aside className="side-inspector">
            <h5 style={{fontWeight: 900, fontSize: '1.4rem', marginBottom: '10px'}}>Optimize</h5>
            <p style={{color: '#94a3b8', fontSize: '0.8rem', marginBottom: '30px', fontWeight: '600'}}>Settings will apply to all files in the batch.</p>
            
            <div className="range-wrap" style={{marginBottom: '40px'}}>
                <label style={{fontSize: '11px', fontWeight: '900', color: '#cbd5e1', display: 'block', marginBottom: '10px', textTransform: 'uppercase'}}>Compression Strength: {Math.round(quality*100)}%</label>
                <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(e.target.value)} />
            </div>
            
            <button className="btn-execute" onClick={executeCompression} disabled={status === 'processing'}>
              {status === 'processing' ? 'PROCESSING...' : 'COMPRESS BATCH'}
            </button>
          </aside>
        </div>
      )}

      {status === 'done' && (
        <div className="success-wrapper animate-in zoom-in-95 duration-500">
          <div className="giant-pct">{results.pct}%</div>
          <div className="lighter-text">Lighter!</div>
          <div className="kb-reduced">{results.oldS} KB reduced to {results.newS} KB</div>
          
          <a href={results.url} download="zyntool-optimized.zip" className="btn-zip">
             Download ZIP
          </a>
          
          <button onClick={() => location.reload()} className="btn-restart">
             START NEW BATCH
          </button>
        </div>
      )}
    </div>
  );
}
