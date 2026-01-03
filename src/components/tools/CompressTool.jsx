import React, auseState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color = '#4f46e5' }) {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(0.75);
  const [status, setStatus] = useState('idle'); // idle, working, done
  const [zipUrl, setZipUrl] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // --- LOGIC ---
  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!valid.length) return;

    const newEntries = valid.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      origSize: f.size,
      newSize: null,
      status: 'pending' // pending, working, done
    }));

    setFiles(prev => [...prev, ...newEntries]);
    setStatus('idle');
  };

  const startCompression = async () => {
    setStatus('working');
    const zip = new JSZip();
    const processed = [...files];

    for (let i = 0; i < processed.length; i++) {
      processed[i].status = 'working';
      setFiles([...processed]);
      
      try {
        const options = { maxSizeMB: 2, useWebWorker: true, initialQuality: quality };
        const blob = await imageCompression(processed[i].file, options);
        
        processed[i].newSize = blob.size;
        processed[i].status = 'done';
        zip.file(processed[i].name, blob);
        
        setFiles([...processed]);
      } catch (err) {
        processed[i].status = 'error';
        setFiles([...processed]);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setZipUrl(URL.createObjectURL(content));
    setStatus('done');
  };

  const reset = () => {
    setFiles([]);
    setStatus('idle');
    setZipUrl(null);
  };
  
  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  return (
    <div className="pro-tool" style={{ '--accent': color }}>
      <style>{`
        /* --- FIGMA/LINEAR INSPIRED THEME --- */
        .pro-tool {
          --bg: #0A0A0A; --surface: #1A1A1A; --border: #2A2A2A;
          --text-primary: #F4F4F5; --text-secondary: #A1A1AA; --text-tertiary: #52525B;
          --success: #10B981;
          
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          min-height: 600px;
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }

        /* --- 1. FIXED TOOLBAR (The App Shell) --- */
        .tool-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        
        /* Left: Title */
        .app-title {
          font-weight: 600; font-size: 14px;
          display: flex; align-items: center; gap: 8px;
          color: var(--text-primary);
        }
        
        /* Middle: Controls */
        .controls-group { display: flex; align-items: center; gap: 12px; }
        .control-label {
          font-size: 13px; font-weight: 500; color: var(--text-secondary);
        }
        .quality-slider {
          -webkit-appearance: none; width: 150px; height: 4px;
          background: var(--border); border-radius: 2px;
          cursor: pointer;
        }
        .quality-slider::-webkit-slider-thumb {
          -webkit-appearance: none; height: 14px; width: 14px;
          background: var(--text-primary); border-radius: 50%;
          border: 2px solid var(--surface);
          box-shadow: 0 0 0 2px var(--accent);
        }
        
        /* Right: Actions */
        .actions-group { display: flex; align-items: center; gap: 10px; }
        .btn {
          height: 32px; padding: 0 12px; border-radius: 6px; font-size: 13px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.2s ease;
        }
        .btn-secondary {
          background: #27272A; border: 1px solid #3F3F46; color: var(--text-secondary);
        }
        .btn-secondary:hover { background: #3F3F46; color: var(--text-primary); }
        
        .btn-primary {
          background: var(--accent); color: white; border: none;
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-primary:disabled { background: #3F3F46; color: var(--text-tertiary); cursor: not-allowed; }
        
        .btn-success {
          background: var(--success); color: white; border: none;
        }
        
        /* --- 2. CANVAS AREA (The Workspace) --- */
        .canvas-area {
          flex: 1; overflow-y: auto;
          display: flex; flex-direction: column;
        }
        
        /* Empty State */
        .empty-state {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px; margin: 20px;
          border: 2px dashed var(--border); border-radius: 8px;
          text-align: center; color: var(--text-tertiary);
          cursor: pointer; transition: 0.2s;
        }
        .empty-state:hover {
          border-color: var(--accent); color: var(--accent);
        }
        
        /* File Table */
        .file-table {
          width: 100%; border-collapse: collapse;
          font-size: 13px;
        }
        .table-header {
          position: sticky; top: 0;
          background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(8px);
          z-index: 5;
        }
        .file-table th {
          text-align: left; padding: 12px 20px;
          font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
        }
        
        .file-row {
          transition: background 0.2s;
        }
        .file-row:hover { background: rgba(255,255,255,0.02); }
        .file-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        
        .f-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; background: var(--surface); }
        .f-name { font-weight: 500; color: var(--text-primary); }
        .f-size { font-family: monospace; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
        
        .status-indicator { display: flex; align-items: center; gap: 8px; font-weight: 500; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .dot-pending { background: #52525B; }
        .dot-working { background: var(--accent); animation: pulse 1.5s infinite; }
        .dot-done { background: var(--success); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        
        @media (max-width: 640px) {
          .controls-group { display: none; }
          .file-table th:nth-child(3), .file-table td:nth-child(3) { display: none; }
        }
      `}</style>
      
      {/* FIXED HEADER */}
      <div className="tool-header">
        <div className="app-title">
          <i className="fa-solid fa-compress" style={{color: color}}></i>
          <span>Image Compressor</span>
        </div>
        
        {files.length > 0 && (
          <div className="controls-group">
            <span className="control-label">Quality</span>
            <input 
              type="range" min="0.1" max="1.0" step="0.05"
              value={quality}
              onChange={e => setQuality(parseFloat(e.target.value))}
              disabled={status === 'working'}
              className="quality-slider"
            />
            <span className="control-label" style={{minWidth:'30px'}}>{Math.round(quality * 100)}%</span>
          </div>
        )}

        <div className="actions-group">
          {files.length > 0 && status !== 'done' && (
            <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>+ Add More</button>
          )}

          {status === 'done' ? (
            <>
              <button className="btn btn-secondary" onClick={reset}>Reset</button>
              <a href={zipUrl} download="compressed.zip" className="btn btn-success">
                <i className="fa-solid fa-download"></i> Download All
              </a>
            </>
          ) : (
             <button className="btn btn-primary" onClick={startCompression} disabled={status === 'working' || files.length === 0}>
              {status === 'working' ? 'Processing...' : 'Compress'}
            </button>
          )}
        </div>
      </div>

      {/* SCROLLING CANVAS */}
      <div className="canvas-area">
        {files.length === 0 ? (
          <div 
            className="empty-state"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current.click()}
          >
            <i className="fa-solid fa-photo-film" style={{fontSize: '32px', marginBottom: '16px'}}></i>
            <span style={{fontWeight: 600, fontSize:'16px'}}>Drop Images or Click to Upload</span>
            <span style={{fontSize:'13px', marginTop:'8px'}}>Batch compress up to 50 files</span>
          </div>
        ) : (
          <table className="file-table">
            <thead>
              <tr className="table-header">
                <th style={{width: '60px'}}></th>
                <th>Filename</th>
                <th>Original Size</th>
                <th>Compressed Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} className="file-row">
                  <td><img src={f.preview} className="f-thumb" alt="" /></td>
                  <td><div className="f-name">{f.name}</div></td>
                  <td><div className="f-size">{formatSize(f.origSize)}</div></td>
                  <td>
                    <div className="f-size" style={{color: f.status==='done' ? 'var(--success)' : ''}}>
                      {formatSize(f.newSize)}
                    </div>
                  </td>
                  <td>
                    <div className="status-indicator">
                      {f.status === 'pending' && <><div className="status-dot dot-pending"></div><span style={{color: 'var(--text-tertiary)'}}>Pending</span></>}
                      {f.status === 'working' && <><div className="status-dot dot-working"></div><span style={{color: 'var(--accent)'}}>Working...</span></>}
                      {f.status === 'done' && <><div className="status-dot dot-done"></div><span style={{color: 'var(--success)'}}>Done</span></>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
