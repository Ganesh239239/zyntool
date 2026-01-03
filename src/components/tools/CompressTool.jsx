import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#000000' }) {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); 
  const [quality, setQuality] = useState(0.75);
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
    }, 200);
  };

  const reset = () => { setFiles([]); setViewState('upload'); setResult(null); setProgress(0); };
  
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  return (
    <div className="dev-tool-root" style={{'--accent': color}}>
      <style>{`
        .dev-tool-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          max-width: 900px; margin: 0 auto; color: #111;
        }

        /* --- 1. UPLOAD AREA: Technical & Clean --- */
        .upload-area {
          border: 1px dashed #ccc;
          background-color: #fafafa;
          /* Technical Grid Pattern */
          background-image: linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
          background-size: 20px 20px;
          height: 250px;
          border-radius: 6px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .upload-area:hover, .upload-area.drag {
          background-color: #fff;
          border-color: #333;
        }
        .icon-box {
          width: 48px; height: 48px; 
          background: #fff; border: 1px solid #ddd; 
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .upload-title { font-size: 16px; font-weight: 600; color: #111; margin-bottom: 4px; }
        .upload-hint { font-size: 13px; color: #666; }

        /* --- 2. WORKSPACE: Utility Bar --- */
        .workspace { border: 1px solid #e5e5e5; border-radius: 8px; background: #fff; overflow: hidden; }
        
        .toolbar {
          padding: 16px; 
          border-bottom: 1px solid #e5e5e5;
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
          background: #fff;
        }
        
        .slider-group { flex: 1; display: flex; flex-direction: column; gap: 8px; max-width: 300px; }
        .slider-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #666; letter-spacing: 0.5px; display: flex; justify-content: space-between; }
        
        /* Native-feeling slider */
        input[type=range] {
          width: 100%; -webkit-appearance: none; background: transparent; cursor: pointer;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; height: 4px; background: #e5e5e5; border-radius: 2px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%;
          background: #111; margin-top: -6px; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .actions { display: flex; align-items: center; gap: 12px; }
        
        .btn {
          height: 36px; padding: 0 16px;
          border-radius: 6px; font-size: 13px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: all 0.15s ease;
        }
        .btn-sec { background: #fff; border: 1px solid #e5e5e5; color: #333; }
        .btn-sec:hover { background: #f9f9f9; border-color: #ccc; }
        
        .btn-pri { background: #000; color: #fff; border: 1px solid #000; }
        .btn-pri:hover { background: #222; }
        .btn-pri:disabled { opacity: 0.5; cursor: default; }

        .btn-success { background: #16a34a; color: white; border: 1px solid #16a34a; }
        .btn-success:hover { background: #15803d; }

        /* --- 3. DATA TABLE: Dense & Precise --- */
        .table-container { max-height: 500px; overflow-y: auto; }
        .file-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .file-table th {
          text-align: left; padding: 10px 16px; 
          background: #fafafa; border-bottom: 1px solid #e5e5e5;
          color: #666; font-weight: 500; font-size: 11px; text-transform: uppercase;
        }
        .file-table td {
          padding: 10px 16px; border-bottom: 1px solid #f0f0f0;
          color: #333; vertical-align: middle;
        }
        .file-table tr:last-child td { border-bottom: none; }
        
        /* Monospace numbers for alignment */
        .mono { font-family: "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace; font-variant-numeric: tabular-nums; }
        
        .thumb { width: 32px; height: 32px; border-radius: 4px; border: 1px solid #eee; object-fit: cover; display: block; }
        .status-tag { 
          display: inline-flex; align-items: center; padding: 2px 8px; 
          border-radius: 99px; font-size: 11px; font-weight: 500;
        }
        .tag-saved { background: #dcfce7; color: #166534; }
        
        /* Mobile adjustment */
        @media(max-width: 600px) {
          .toolbar { flex-direction: column; align-items: stretch; gap: 16px; }
          .file-table th:nth-child(3), .file-table td:nth-child(3) { display: none; } /* Hide old size */
        }
      `}</style>

      {/* VIEW 1: TECH UPLOAD */}
      {viewState === 'upload' && (
        <div 
          className={`upload-area ${isDragging ? 'drag' : ''}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="icon-box">
            <i className="fa-solid fa-arrow-up" style={{fontSize:'18px', color:'#333'}}></i>
          </div>
          <div className="upload-title">Drop images to compress</div>
          <div className="upload-hint">Support for JPG, PNG, WEBP</div>
        </div>
      )}

      {/* VIEW 2: WORKSPACE */}
      {(viewState === 'workspace' || viewState === 'finished') && (
        <div className="workspace">
          
          {/* UTILITY BAR */}
          <div className="toolbar">
            
            {/* Left: Quality Slider */}
            <div className="slider-group">
              <div className="slider-label">
                <span>Quality</span>
                <span className="mono">{Math.round(quality * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1.0" step="0.05"
                value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))}
                disabled={processing || viewState === 'finished'}
              />
            </div>

            {/* Right: Actions */}
            <div className="actions">
              {viewState === 'finished' ? (
                /* Success State Actions */
                <>
                  <button className="btn btn-sec" onClick={reset}>New</button>
                  <a href={result.url} download="compressed.zip" className="btn btn-success" style={{textDecoration:'none'}}>
                    <i className="fa-solid fa-download"></i> Download All
                  </a>
                </>
              ) : (
                /* Normal Actions */
                <>
                  <button className="btn btn-sec" onClick={() => fileInputRef.current.click()}>Add</button>
                  <button className="btn btn-pri" onClick={runCompression} disabled={processing}>
                    {processing ? 'Processing...' : 'Compress'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="table-container">
            <table className="file-table">
              <thead>
                <tr>
                  <th width="50"></th>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Result</th>
                  <th style={{textAlign:'right'}}>Status</th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.id}>
                    <td><img src={f.preview} className="thumb" alt="" /></td>
                    <td style={{fontWeight:'500'}}>{f.name}</td>
                    <td className="mono" style={{color:'#666'}}>{formatBytes(f.origSize)}</td>
                    <td className="mono">
                      {f.newSize ? (
                        <span style={{color:'#111'}}>{formatBytes(f.newSize)}</span>
                      ) : '—'}
                    </td>
                    <td style={{textAlign:'right'}}>
                      {f.status === 'done' ? (
                        <span className="status-tag tag-saved">
                          Saved {Math.round((1 - f.newSize/f.origSize)*100)}%
                        </span>
                      ) : (
                        !processing && (
                          <i className="fa-solid fa-xmark" 
                             style={{cursor:'pointer', color:'#ccc', padding:'8px'}} 
                             onClick={() => removeFile(f.id)}
                          ></i>
                        )
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
