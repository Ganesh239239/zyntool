import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, done
  const [quality, setQuality] = useState(0.7);
  const [savings, setSavings] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    })));
    setStatus('ready');
  };

  const execute = async () => {
    setStatus('processing');
    const zip = new JSZip();
    let totalOld = 0; let totalNew = 0;

    await Promise.all(files.map(async (item) => {
      totalOld += item.file.size;
      const options = { maxSizeMB: 1, initialQuality: quality, useWebWorker: true };
      const blob = await imageCompression(item.file, options);
      totalNew += blob.size;
      zip.file(`compressed-${item.name}`, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setSavings({
      url: URL.createObjectURL(zipBlob),
      pct: Math.round(((totalOld - totalNew) / totalOld) * 100),
      oldS: (totalOld / 1024).toFixed(1),
      newS: (totalNew / 1024).toFixed(1)
    });
    setStatus('done');
  };

  return (
    <div className="zyn-tool-wrapper">
      <style>{`
        /* NATIVE TOOL CSS */
        .btn-main-select { background: #4b8df8; color: white; border: none; padding: 22px 80px; font-size: 2rem; font-weight: 700; border-radius: 12px; cursor: pointer; transition: 0.2s; }
        .btn-main-select:hover { background: #3b7dec; transform: scale(1.02); }
        
        .workspace-flex { display: flex; gap: 30px; align-items: flex-start; }
        .gallery-box { flex-grow: 1; background: #f3f3f7; padding: 20px; border-radius: 16px; display: flex; flex-wrap: wrap; min-height: 400px; align-content: flex-start; }
        
        /* YOUR SPECIFIC 198x244 CARD */
        .image-preview-card {
            margin: 4px; width: 198px; height: 244px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;
            background: #fdfdfd; border-radius: 8px; box-shadow: 0 0 8px 0 rgba(0, 0, 0, .08);
        }
        .image-preview-card img { max-width: 160px; max-height: 160px; object-fit: contain; }
        .image-preview-card span { font-size: 11px; font-weight: 700; color: #888; margin-top: 15px; width: 80%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; text-align: center; }

        .sidebar-ctrl { width: 320px; background: white; border: 1px solid #eee; border-radius: 16px; padding: 25px; position: sticky; top: 100px; }
        .btn-execute { width: 100%; padding: 18px; border: none; border-radius: 50px; color: white; font-weight: 800; font-size: 1.2rem; cursor: pointer; margin-top: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        
        .success-box { text-align: center; padding: 40px; }
        .stat-pill { display: inline-block; padding: 10px 25px; background: #4f46e5; color: white; border-radius: 50px; font-weight: 900; font-size: 1.5rem; margin: 20px 0; }
      `}</style>

      {status === 'idle' && (
        <div className="select-view" style={{textAlign: 'center', padding: '40px 0'}}>
          <button className="btn-main-select" onClick={() => document.getElementById('fIn').click()}>Select images</button>
          <p style={{marginTop: '15px', color: '#888'}}>or drop images here</p>
          <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
        </div>
      )}

      {(status === 'ready' || status === 'processing') && (
        <div className="workspace-flex">
          <div className="gallery-box">
            {files.map((f, i) => (
              <div key={i} className="image-preview-card">
                <img src={f.url} alt="preview" />
                <span>{f.name}</span>
              </div>
            ))}
          </div>
          <aside className="sidebar-ctrl">
            <h5 style={{fontWeight: 800, marginBottom: '20px'}}>Settings</h5>
            <label style={{fontSize: '12px', fontWeight: 800, color: '#aaa', display: 'block', marginBottom: '10px'}}>QUALITY: {Math.round(quality*100)}%</label>
            <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(e.target.value)} style={{width: '100%'}} />
            <button className="btn-execute" style={{background: color}} onClick={execute} disabled={status === 'processing'}>
              {status === 'processing' ? 'Processing...' : 'Compress Now'}
            </button>
          </aside>
        </div>
      )}

      {status === 'done' && (
        <div className="success-box">
          <i className="fa-solid fa-circle-check" style={{fontSize: '4rem', color: '#10b981', marginBottom: '20px'}}></i>
          <h2 style={{fontWeight: 900}}>Images Compressed!</h2>
          <div className="stat-pill">Saved {savings.pct}%</div>
          <p style={{color: '#666'}}>{savings.oldS} KB reduced to {savings.newS} KB</p>
          <a href={savings.url} download="zyntool-batch.zip" className="btn-main-select" style={{textDecoration: 'none', display: 'inline-block', marginTop: '20px'}}>Download ZIP</a>
          <br/>
          <button onClick={() => location.reload()} style={{marginTop: '30px', background: 'none', border: 'none', color: '#888', fontWeight: 'bold', cursor: 'pointer'}}>Start New Batch</button>
        </div>
      )}
    </div>
  );
}
