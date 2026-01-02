import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing | processing | result
  const [quality, setQuality] = useState(0.4);
  const [summary, setSummary] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(1),
      status: 'ready'
    })));
    setStatus('processing');
  };

  const runCompression = async () => {
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
    setSummary({
      url: URL.createObjectURL(zipBlob),
      saved: Math.round(((oldT - newT) / oldT) * 100),
      oldS: (oldT / 1024).toFixed(0),
      newS: (newT / 1024).toFixed(0)
    });
    setStatus('result');
  };

  return (
    <div className="zyn-studio">
      <style>{`
        .zyn-studio { font-family: -apple-system, system-ui, sans-serif; color: #111; }
        
        /* 1. LANDING DESIGN */
        .dropzone-realistic {
            max-width: 800px; margin: 40px auto; background: #fff;
            border-radius: 40px; padding: 12px; border: 1px solid #eee;
            box-shadow: 0 30px 60px rgba(0,0,0,0.05); cursor: pointer; transition: 0.4s;
        }
        .dropzone-realistic:hover { transform: translateY(-5px); box-shadow: 0 40px 80px rgba(79, 70, 229, 0.1); }
        .inner-dash { border: 3px dashed #e2e8f0; border-radius: 32px; padding: 100px 20px; text-align: center; }
        .icon-studio { 
            width: 80px; height: 80px; background: #4b8df8; color: white; 
            border-radius: 24px; margin: 0 auto 25px; display: flex; 
            align-items: center; justify-content: center; font-size: 2rem;
            box-shadow: 0 10px 20px rgba(75, 141, 248, 0.3);
        }

        /* 2. WORKSPACE DESIGN (THE WORKBENCH) */
        .workspace-grid { display: flex; gap: 30px; padding: 0 20px; }
        .bench-area { 
            flex: 1; background: #f3f3f7; border-radius: 32px; padding: 30px;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px; align-content: flex-start; min-height: 550px; border: 1px solid #eef0f2;
        }
        
        /* YOUR 198x244 CARD */
        .realistic-card {
            width: 198px; height: 244px; background: #fff; border-radius: 12px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.05); position: relative; border: 2px solid transparent; transition: 0.3s;
        }
        .realistic-card img { max-width: 150px; max-height: 150px; object-fit: contain; border-radius: 4px; }
        .realistic-card .meta { font-size: 10px; font-weight: 800; color: #999; margin-top: 15px; text-transform: uppercase; }

        .inspector-panel { width: 340px; background: #fff; border-radius: 32px; padding: 35px; border: 1px solid #eee; position: sticky; top: 20px; }
        .control-group { margin-bottom: 40px; }
        .control-label { font-size: 11px; font-weight: 900; color: #bbb; text-transform: uppercase; margin-bottom: 15px; display: block; }
        
        .btn-black-pro { 
            width: 100%; padding: 20px; background: #111; color: #fff; border: none; 
            border-radius: 50px; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: 0.2s;
        }
        .btn-black-pro:hover { background: #000; transform: scale(1.02); }

        /* 3. RESULT DESIGN */
        .result-stage { max-width: 700px; margin: 0 auto; text-align: center; padding: 60px 20px; }
        .stat-circle { width: 150px; height: 150px; border-radius: 50%; background: #f0f7ff; color: #4b8df8; display: flex; align-items: center; justify-content: center; font-size: 4rem; font-weight: 900; margin: 0 auto 30px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05); }
        .btn-download-pro { background: #4b8df8; color: white; padding: 22px 60px; font-size: 1.8rem; font-weight: 800; border-radius: 20px; border: none; cursor: pointer; text-decoration: none; display: inline-block; box-shadow: 0 15px 30px rgba(75, 141, 248, 0.3); }

        /* RESPONSIVE */
        @media (max-width: 991px) {
            .workspace-grid { flex-direction: column; }
            .inspector-panel { width: 100%; order: -1; }
            .dropzone-realistic { border-radius: 20px; }
            .realistic-card { width: 100%; height: auto; padding: 20px; flex-direction: row; gap: 20px; }
            .realistic-card img { width: 60px; height: 60px; }
        }
      `}</style>

      {/* STAGE 1: LANDING */}
      {status === 'landing' && (
        <div className="dropzone-realistic" onClick={() => document.getElementById('fIn').click()}>
          <div className="inner-dash">
            <div className="icon-studio">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2 style={{fontWeight: 900, fontSize: '2rem'}}>Choose Photos</h2>
            <p style={{color: '#888', fontWeight: 500}}>Drag and drop up to 20 files to optimize</p>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {/* STAGE 2: PROCESSING */}
      {(status === 'processing' || status === 'working') && (
        <div className="workspace-grid">
          <div className="bench-area">
            {files.map((f, i) => (
              <div key={i} className="realistic-card">
                <img src={f.url} />
                <div className="meta">{f.size} KB</div>
              </div>
            ))}
          </div>

          <aside className="inspector-panel">
            <div className="control-group">
                <span className="control-label">Compression Power</span>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <span style={{fontWeight: 900, fontSize: '2rem'}}>{Math.round((1 - quality) * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{width: '100%'}} />
            </div>
            
            <button className="btn-black-pro" onClick={runCompression} disabled={status === 'working'}>
              {status === 'working' ? 'OPTIMIZING...' : 'START BATCH'}
            </button>
          </aside>
        </div>
      )}

      {/* STAGE 3: RESULT */}
      {status === 'result' && (
        <div className="result-stage">
          <div className="stat-circle">{summary.saved}%</div>
          <h2 style={{fontWeight: 900, fontSize: '2.5rem', marginBottom: '10px'}}>Lighter Images!</h2>
          <p style={{color: '#999', fontSize: '1.2rem', marginBottom: '50px'}}>{summary.oldS} KB reduced to {summary.newS} KB</p>
          
          <a href={summary.url} download="zyntool-batch.zip" className="btn-download-pro">
             DOWNLOAD ZIP
          </a>
          <br/>
          <button onClick={() => location.reload()} style={{marginTop: '40px', background: 'none', border: 'none', color: '#4b8df8', fontWeight: '800', cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'}}>
             NEW BATCH
          </button>
        </div>
      )}
    </div>
  );
}
