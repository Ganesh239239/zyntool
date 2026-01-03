import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#3b82f6' }) {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace, finished
  const [quality, setQuality] = useState(0.7);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // --- LOGIC ---

  const handleDrag = (e, active) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(active);
  };

  const onDrop = (e) => {
    handleDrag(e, false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;

    const newEntries = valid.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      origSize: f.size,
      status: 'pending' 
    }));

    setFiles(prev => [...prev, ...newEntries]);
    setViewState('workspace');
  };

  const removeFile = (id) => {
    const next = files.filter(f => f.id !== id);
    setFiles(next);
    if (next.length === 0) setViewState('upload');
  };

  const runCompression = async () => {
    setProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    let oldTotal = 0; let newTotal = 0;
    const processedFiles = [...files];

    for (let i = 0; i < processedFiles.length; i++) {
      const item = processedFiles[i];
      oldTotal += item.origSize;
      
      try {
        const opts = { maxSizeMB: 2, maxWidthOrHeight: 2048, useWebWorker: true, initialQuality: quality };
        const compressed = await imageCompression(item.file, opts);
        newTotal += compressed.size;
        
        zip.file(item.name, compressed);
        processedFiles[i].status = 'done';
        processedFiles[i].newSize = compressed.size;
        setFiles([...processedFiles]); 
        
        setProgress(Math.round(((i + 1) / processedFiles.length) * 100));
      } catch (e) { console.error(e); }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    setResult({
      url: URL.createObjectURL(blob),
      saved: Math.round(((oldTotal - newTotal) / oldTotal) * 100),
      oldMB: (oldTotal / 1024 / 1024).toFixed(2),
      newMB: (newTotal / 1024 / 1024).toFixed(2)
    });

    setTimeout(() => {
      setProcessing(false);
      setViewState('finished');
    }, 500);
  };

  const reset = () => {
    setFiles([]); setViewState('upload'); setResult(null); setProgress(0);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="compress-root" style={{'--theme': color}}>
      <style>{`
        .compress-root {
          font-family: -apple-system, system-ui, sans-serif;
          max-width: 900px; margin: 0 auto; color: #1e293b;
        }

        /* --- 1. LIQUID UPLOAD BOX --- */
        .upload-box {
          position: relative;
          height: 320px;
          border-radius: 24px;
          border: 2px dashed rgba(59, 130, 246, 0.3);
          background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden;
          transition: all 0.3s ease;
        }
        .upload-box:hover, .upload-box.drag {
          border-color: var(--theme);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.15);
        }
        
        /* The Liquid Animation Circle */
        .liquid-icon {
          width: 100px; height: 100px;
          background: white; border-radius: 50%;
          position: relative; overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          display: flex; align-items: center; justify-content: center;
          z-index: 2;
        }
        .liquid-icon i { font-size: 40px; color: var(--theme); z-index: 5; position: relative; }
        
        /* The Waves */
        .wave {
          position: absolute; bottom: 0; left: 0; width: 200%; height: 200%;
          background: var(--theme); opacity: 0.1;
          border-radius: 40%;
          transform-origin: 50% 50%;
          animation: wave-spin 6s linear infinite;
          margin-left: -50%; margin-bottom: -60%;
        }
        .wave:nth-child(2) { opacity: 0.2; animation-duration: 8s; margin-bottom: -65%; }
        
        @keyframes wave-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .up-title { font-size: 1.4rem; font-weight: 700; color: #1e3a8a; margin-bottom: 8px; }
        .up-sub { color: #64748b; font-weight: 500; }

        /* --- 2. WORKSPACE --- */
        .workspace { animation: fade-in 0.4s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* SUCCESS BANNER (TOP) */
        .success-top {
          background: #ecfdf5; border: 1px solid #d1fae5;
          padding: 24px; border-radius: 16px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          margin-bottom: 24px;
          animation: slide-down 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @keyframes slide-down { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .success-stats { display: flex; gap: 30px; margin-bottom: 20px; }
        .stat-box h4 { margin: 0; font-size: 0.8rem; text-transform: uppercase; color: #059669; }
        .stat-box p { margin: 0; font-size: 1.4rem; font-weight: 800; color: #064e3b; }
        
        .dl-btn {
          background: #059669; color: white; padding: 14px 40px;
          border-radius: 50px; font-weight: 700; font-size: 1.1rem;
          text-decoration: none; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
          transition: transform 0.2s;
        }
        .dl-btn:hover { transform: scale(1.05); }

        /* TOOLBAR */
        .toolbar {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 20px; margin-bottom: 20px;
          display: flex; align-items: flex-end; justify-content: space-between; gap: 20px;
        }
        .range-wrap { flex: 1; max-width: 300px; }
        .range-info { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 10px; }
        
        input[type=range] { width: 100%; accent-color: var(--theme); cursor: pointer; }

        .btn {
          padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; font-size: 0.95rem;
        }
        .btn-primary { background: #1e293b; color: white; transition: 0.2s; }
        .btn-primary:hover { background: black; }
        .btn-ghost { background: transparent; color: #64748b; }
        
        /* TABLE LIST */
        .file-table {
          width: 100%; border-collapse: collapse; font-size: 0.9rem;
        }
        .file-table th { text-align: left; padding: 12px; color: #64748b; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .file-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; background: #eee; }
        .fname { font-weight: 500; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* MOBILE RESPONSIVE */
        @media (max-width: 600px) {
          .toolbar { flex-direction: column; align-items: stretch; }
          .range-wrap { max-width: 100%; }
          .file-table th:nth-child(3), .file-table td:nth-child(3) { display: none; } /* Hide Original Size on mobile */
        }
      `}</style>

      {/* --- VIEW 1: LIQUID UPLOAD BOX --- */ }
      {viewState === 'upload' && (
        <div 
          className={`upload-box ${isDragging ? 'drag' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          {/* Animated Liquid Icon */}
          <div className="liquid-icon">
            <div className="wave"></div>
            <div className="wave"></div>
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          
          <div className="up-title">Drop your images here</div>
          <div className="up-sub">We'll make them smaller, faster.</div>
        </div>
      )}

      {/* --- VIEW 2: WORKSPACE --- */ }
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* 1. SUCCESS BANNER (TOP) */}
          {viewState === 'finished' && result && (
            <div className="success-top">
              <div className="success-stats">
                <div className="stat-box">
                  <h4>Saved</h4>
                  <p>{result.saved}%</p>
                </div>
                <div className="stat-box">
                  <h4>New Size</h4>
                  <p>{result.newMB} MB</p>
                </div>
              </div>
              <a href={result.url} download="optimized-images.zip" className="dl-btn">
                <i className="fa-solid fa-download"></i> Download ZIP
              </a>
              <button onClick={reset} style={{marginTop:'15px', background:'none', border:'none', color:'#64748b', cursor:'pointer'}}>Start Over</button>
            </div>
          )}

          {/* 2. TOOLBAR */}
          <div className="toolbar">
            <div className="range-wrap">
              <div className="range-info">
                <span>Quality</span>
                <span>{Math.round(quality * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.05" 
                value={quality} onChange={e => setQuality(parseFloat(e.target.value))}
                disabled={processing || viewState === 'finished'} 
              />
            </div>
            
            {viewState !== 'finished' && (
              <div style={{display:'flex', gap:'10px'}}>
                <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()}>+ Add</button>
                <button className="btn btn-primary" onClick={runCompression} disabled={processing}>
                  {processing ? `Compressing ${progress}%` : 'Compress Now'}
                </button>
              </div>
            )}
          </div>

          {/* 3. FILE LIST (TABLE) */}
          <div style={{background:'white', borderRadius:'12px', border:'1px solid #e2e8f0', overflow:'hidden'}}>
            <table className="file-table">
              <thead>
                <tr>
                  <th width="50">Img</th>
                  <th>Name</th>
                  <th>Original</th>
                  <th>Result</th>
                  <th width="40"></th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.id}>
                    <td><img src={f.preview} className="thumb" alt="" /></td>
                    <td><div className="fname">{f.name}</div></td>
                    <td>{formatBytes(f.origSize)}</td>
                    <td style={{color: '#059669', fontWeight:'600'}}>
                      {f.newSize ? formatBytes(f.newSize) : '—'}
                    </td>
                    <td>
                      {f.status === 'done' ? (
                         <i className="fa-solid fa-check" style={{color:'#059669'}}></i>
                      ) : (
                         !processing && <i className="fa-solid fa-xmark" style={{cursor:'pointer', color:'#94a3b8'}} onClick={()=>removeFile(f.id)}></i>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
