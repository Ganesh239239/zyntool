import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [appState, setAppState] = useState('idle'); // idle | working | success
  const [globalQuality, setGlobalQuality] = useState(0.6);
  const [batchStats, setBatchStats] = useState({ old: 0, new: 0, saved: 0 });

  // --- 1. HANDLING THE QUEUE ---
  const onFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    const newFiles = selected.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      oldSize: file.size,
      newSize: null,
      status: 'queued', // queued | compressing | done
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setAppState('working');
  };

  // --- 2. THE COMPRESSION ENGINE (Aggressive & Individual) ---
  const runBatchProcess = async () => {
    setAppState('working');
    const zip = new JSZip();
    let totalOld = 0;
    let totalNew = 0;

    // Process one by one for that "Realistic" loading feel
    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      if (item.status === 'done') continue;

      // Update UI to "Compressing"
      updateFileStatus(item.id, { status: 'compressing', progress: 30 });
      totalOld += item.oldSize;

      try {
        const options = {
          maxSizeMB: 0.5,
          initialQuality: globalQuality,
          useWebWorker: true,
          maxIteration: 10,
          onProgress: (p) => updateFileStatus(item.id, { progress: 30 + (p * 0.7) })
        };

        const result = await imageCompression(item.file, options);
        totalNew += result.size;
        
        const resultUrl = URL.createObjectURL(result);
        zip.file(`zyn-optimized-${item.name}`, result);

        updateFileStatus(item.id, { 
            status: 'done', 
            newSize: result.size, 
            progress: 100,
            url: resultUrl 
        });
      } catch (err) {
        updateFileStatus(item.id, { status: 'error' });
        totalNew += item.oldSize;
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setBatchStats({
      old: (totalOld / 1024).toFixed(0),
      new: (totalNew / 1024).toFixed(0),
      saved: Math.round(((totalOld - totalNew) / totalOld) * 100),
      url: URL.createObjectURL(zipBlob)
    });
    setAppState('success');
  };

  const updateFileStatus = (id, updates) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) setAppState('idle');
  };

  return (
    <div className="zyn-pro-wrapper">
      {/* LANDING STATE */}
      {appState === 'idle' && (
        <div className="hero-uploader" onClick={() => document.getElementById('f').click()}>
          <div class="glow-effect" style={{background: color}}></div>
          <div className="glass-card">
            <div className="icon-pulse">
               <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h2>Optimize Batch</h2>
            <p>Select up to 20 images for high-speed compression</p>
            <button className="btn-glass">Choose Files</button>
            <input type="file" id="f" hidden multiple onChange={onFileSelect} />
          </div>
        </div>
      )}

      {/* WORKSPACE STATE */}
      {appState === 'working' && (
        <div className="app-grid animate-in">
          <div className="workbench">
            <div className="workbench-header">
                <h3>Asset Queue <span className="count">{files.length}</span></h3>
                <button className="add-more" onClick={() => document.getElementById('f').click()}>+ Add More</button>
            </div>
            
            <div className="assets-container">
              {files.map(f => (
                <div key={f.id} className={`asset-card-v5 ${f.status}`}>
                  <div className="asset-preview">
                    <img src={f.url} />
                    {f.status === 'compressing' && <div className="loader-ring"></div>}
                    {f.status === 'done' && <div className="done-check"><i className="fa-solid fa-check"></i></div>}
                  </div>
                  <div className="asset-meta">
                    <span className="name">{f.name}</span>
                    <span className="status-text">
                        {f.status === 'done' ? `Reduced to ${(f.newSize/1024).toFixed(0)}KB` : `${(f.oldSize/1024).toFixed(0)}KB`}
                    </span>
                  </div>
                  <button className="remove-btn" onClick={() => removeFile(f.id)}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          <aside className="inspector">
            <div className="inspector-inner">
                <div className="section-title">Engine Config</div>
                <div className="control-group">
                    <div className="label-row">
                        <label>Strength</label>
                        <span>{Math.round((1 - globalQuality) * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="0.9" step="0.1" value={globalQuality} onChange={(e) => setGlobalQuality(e.target.value)} className="pro-slider" />
                </div>
                
                <div className="pro-features">
                    <div className="feature-item">
                        <i className="fa-solid fa-shield-check"></i>
                        <span>Browser-only Processing</span>
                    </div>
                </div>

                <button className="btn-execute" onClick={runBatchProcess}>
                    OPTIMIZE ALL
                </button>
            </div>
          </aside>
        </div>
      )}

      {/* SUCCESS STATE */}
      {appState === 'success' && (
        <div className="success-screen animate-zoom">
          <div className="success-glass">
            <div className="score-badge">{batchStats.saved}%</div>
            <h1>Lighter!</h1>
            <p className="summary-text">{batchStats.old}KB <i className="fa-solid fa-arrow-right"></i> {batchStats.new}KB</p>
            
            <div className="action-stack">
                <a href={batchStats.url} download="zyntool-optimized.zip" className="download-cta">
                    DOWNLOAD ZIP <i className="fa-solid fa-file-zipper ms-2"></i>
                </a>
                <button className="restart-btn" onClick={() => location.reload()}>Process New Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
