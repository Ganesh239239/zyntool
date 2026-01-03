import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import './CompressTool.css';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing, studio, result
  const [settings, setSettings] = useState({ quality: 0.5, format: 'image/webp', preserveMeta: false });
  const [results, setResults] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const onUpload = (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    setFiles(selected.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(1),
      compressed: null
    })));
    setStatus('studio');
  };

  const runEngine = async () => {
    setStatus('processing');
    const zip = new JSZip();
    let oldT = 0; let newT = 0;

    await Promise.all(files.map(async (item) => {
      oldT += item.file.size;
      const options = { 
        maxSizeMB: 0.1, 
        initialQuality: settings.quality, 
        fileType: settings.format === 'original' ? item.file.type : settings.format,
        useWebWorker: true,
        maxIteration: 20 
      };
      
      const blob = await imageCompression(item.file, options);
      newT += blob.size;
      zip.file(`zyn-optimized-${item.name.split('.')[0]}.${blob.type.split('/')[1]}`, blob);
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setResults({
      url: URL.createObjectURL(zipBlob),
      pct: Math.round(((oldT - newT) / oldT) * 100),
      oldS: (oldT / 1024).toFixed(0),
      newS: (newT / 1024).toFixed(0)
    });
    setStatus('result');
  };

  return (
    <div className="studio-container">
      {/* 1. LANDING STATE */}
      {status === 'landing' && (
        <div className="landing-stage animate-fade">
          <div className="glass-dropzone" onClick={() => document.getElementById('fIn').click()}>
            <div className="dropzone-inner">
              <div class="badge-new">NEW ENGINE v4</div>
              <div className="icon-morph" style={{background: color}}>
                <i className="fa-solid fa-bolt-lightning"></i>
              </div>
              <h2 className="title-huge">Optimize Images</h2>
              <p className="subtitle">Drag and drop up to 20 files for extreme compression.</p>
              <button className="btn-main-pro">Choose Photos</button>
              <input type="file" id="fIn" hidden multiple onChange={onUpload} />
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDIO STATE */}
      {(status === 'studio' || status === 'processing') && (
        <div className="app-layout animate-slide-up">
          <div className="main-content">
             <div class="workbench-header">
                <span class="file-name-pill">{files[activeIdx].name}</span>
                <span class="file-size-pill">{files[activeIdx].size} KB</span>
             </div>
             <div className="stage-area">
                <img src={files[activeIdx].preview} className="stage-image" />
                {status === 'processing' && (
                  <div className="stage-loader">
                    <div className="spinner-pro"></div>
                    <span>Optimizing Pixels...</span>
                  </div>
                )}
             </div>
             <div className="gallery-tray">
                {files.map((f, i) => (
                  <div key={i} className={`tray-item ${activeIdx === i ? 'active' : ''}`} onClick={() => setActiveIdx(i)}>
                    <img src={f.preview} />
                  </div>
                ))}
             </div>
          </div>

          <aside className="inspector-sidebar">
            <h4 className="sidebar-title">Inspector</h4>
            
            <div className="control-group">
                <label className="label-pro">Compression Strength</label>
                <div className="quality-display">{Math.round((1 - settings.quality) * 100)}%</div>
                <input type="range" className="pro-range" min="0.1" max="0.9" step="0.1" value={settings.quality} onChange={(e) => setSettings({...settings, quality: parseFloat(e.target.value)})} />
            </div>

            <div className="control-group">
                <label className="label-pro">Output Format</label>
                <select className="pro-select" value={settings.format} onChange={(e) => setSettings({...settings, format: e.target.value})}>
                    <option value="original">Original Format</option>
                    <option value="image/webp">WebP (Optimized)</option>
                    <option value="image/jpeg">JPEG (Standard)</option>
                </select>
            </div>

            <button className="btn-execute" onClick={runEngine} disabled={status === 'processing'}>
                {status === 'processing' ? 'PROCESSING...' : 'RUN BATCH'}
            </button>
          </aside>
        </div>
      )}

      {/* 3. RESULT STATE */}
      {status === 'result' && (
        <div className="result-stage animate-zoom">
          <div className="result-glass shadow-2xl">
            <div class="success-check"><i class="fa-solid fa-check"></i></div>
            <div className="massive-pct">{results.pct}%</div>
            <h3 className="lighter-text">Lighter & Faster</h3>
            <div className="kb-details">{results.oldS} KB <i className="fa-solid fa-arrow-right"></i> {results.newS} KB</div>
            
            <a href={results.url} download="zyntool-batch.zip" className="btn-download-pro">
               Download optimized images
            </a>
            
            <button onClick={() => location.reload()} className="btn-restart-pro">
               ← New Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
