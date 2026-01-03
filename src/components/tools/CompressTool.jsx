import React, { useState, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';

// Import Squoosh WASM modules
// Note: In Vite, workers/wasm load automatically, but we ensure dynamic import to avoid load lag
import * as squoshWebP from '@jsquash/webp';
import * as squoshJpeg from '@jsquash/jpeg';
import * as squoshPng from '@jsquash/png';

// --- ICONS ---
const Icon = {
  Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Wasm: () => <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M15.04 4.16l-3.3 15.68h-2.5l-2.6-10.4-2.6 10.4h-2.5l-3.3-15.68h2.6l1.9 11.2 2.6-10.6h2.4l2.6 10.6 1.9-11.2h2.9z"/></svg>, // Simple "W" icon
  Close: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 1L1 13M1 1l12 12"/></svg>,
  Download: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12"/></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="#10b981" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
};

export default function CompressTool() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  
  // Settings
  const [quality, setQuality] = useState(0.75);
  const [outputFormat, setOutputFormat] = useState('webp'); // webp, jpeg, png, original

  const fileInputRef = useRef(null);

  // --- STATS ---
  const stats = useMemo(() => {
    const totalOrig = files.reduce((acc, f) => acc + f.origSize, 0);
    const totalNew = files.reduce((acc, f) => acc + (f.newSize || f.origSize), 0);
    const processedCount = files.filter(f => f.status === 'done').length;
    const isDone = files.length > 0 && processedCount === files.length;
    const savings = totalOrig - totalNew;
    return { totalOrig, totalNew, savings, isDone };
  }, [files]);

  // --- HELPER: File -> ImageData ---
  const fileToImageData = async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => (img.onload = resolve));
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  };

  // --- ENGINE: WASM Processing ---
  const processImageWasm = async (file, q, format) => {
    // 1. Decode Image to raw pixels
    const imageData = await fileToImageData(file);
    
    let compressedBuffer;
    let ext;

    // 2. Encode using Squoosh WASM modules
    if (format === 'webp') {
      const module = await squoshWebP.default; // Dynamic import handling
      compressedBuffer = await squoshWebP.encode(imageData, { quality: q * 100 }); // Squoosh uses 0-100
      ext = 'webp';
    } else if (format === 'jpeg') {
      compressedBuffer = await squoshJpeg.encode(imageData, { quality: q * 100 });
      ext = 'jpg';
    } else if (format === 'png') {
      // PNG is lossless usually, but we can use OxiPNG via jsquash if installed, or just default png
      compressedBuffer = await squoshPng.encode(imageData);
      ext = 'png';
    } else {
      // Fallback/Original - assume WebP for modern web
      compressedBuffer = await squoshWebP.encode(imageData, { quality: q * 100 });
      ext = 'webp';
    }

    return new File([compressedBuffer], `image.${ext}`, { type: `image/${ext}` });
  };

  const handleFiles = (e) => {
    const incoming = e.target.files || e.dataTransfer?.files;
    if (!incoming?.length) return;

    const newQueue = Array.from(incoming)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        name: f.name,
        origSize: f.size,
        status: 'pending', 
        preview: URL.createObjectURL(f)
      }));

    setFiles(prev => [...prev, ...newQueue]);
  };

  const runBatch = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    const queue = [...files];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'done') {
        zip.file(item.finalName, item.blob);
        continue;
      }

      item.status = 'working';
      setFiles([...queue]);

      try {
        // CALL WASM FUNCTION
        const blob = await processImageWasm(item.file, quality, outputFormat);
        
        item.blob = blob;
        item.newSize = blob.size;
        item.status = 'done';
        
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        item.finalName = `${baseName}.${outputFormat}`;

        zip.file(item.finalName, blob);
      } catch (err) {
        console.error("WASM Error:", err);
        item.status = 'error';
      }
      setFiles([...queue]);
    }

    if (queue.some(f => f.status === 'done')) {
      const content = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(content));
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (files.length === 1 && files[0].blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(files[0].blob);
      link.download = files[0].finalName;
      link.click();
    } else if (zipUrl) {
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = "squoosh_optimized.zip";
      link.click();
    }
  };

  const formatSize = (b) => {
    if (!b) return '-';
    if (b < 1024) return b + ' B';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + sizes[i-1];
  };

  return (
    <div className="studio-interface">
      <style>{`
        /* --- PRO STYLE (Vercel-like) --- */
        :root {
          --bg: #ffffff;
          --panel: #f9fafb;
          --border: #e5e7eb;
          --text: #0f172a;
          --accent: #000;
          --green: #10b981;
          --mono: 'SF Mono', 'Menlo', monospace;
        }
        .studio-interface {
          display: flex; height: 80vh; max-height: 800px;
          border: 1px solid var(--border); background: var(--bg);
          font-family: 'Inter', sans-serif; color: var(--text);
          border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        /* LEFT: ASSETS */
        .asset-pane { flex: 1; display: flex; flex-direction: column; border-right: 1px solid var(--border); }
        .pane-header { padding: 16px 24px; border-bottom: 1px solid var(--border); font-weight: 600; display: flex; justify-content: space-between; }
        .file-scroller { flex: 1; overflow-y: auto; background: #fff; }
        .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer; }
        
        .file-row {
          display: grid; grid-template-columns: 40px 2fr 1fr 1fr 40px; align-items: center;
          padding: 12px 24px; border-bottom: 1px solid var(--border); transition: 0.1s;
        }
        .file-row:hover { background: #f8fafc; }
        .f-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; background: #eee; }
        .f-name { font-weight: 500; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 10px; }
        .f-meta { font-family: var(--mono); font-size: 0.75rem; color: #64748b; }
        .f-badge { font-family: var(--mono); color: var(--green); background: #ecfdf5; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
        
        /* RIGHT: INSPECTOR */
        .inspector-pane { width: 320px; background: var(--panel); display: flex; flex-direction: column; }
        .group { padding: 24px; border-bottom: 1px solid var(--border); }
        .lbl { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 12px; display: block; letter-spacing: 0.05em; }
        
        input[type=range] { width: 100%; accent-color: var(--accent); cursor: pointer; }
        .select-input { width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border); font-size: 0.9rem; }
        
        .stat-box { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 12px; }
        .stat-line { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; color: #64748b; }
        .stat-line.total { border-top: 1px dashed var(--border); padding-top: 8px; margin-top: 8px; font-weight: 700; color: var(--text); }
        
        .footer { margin-top: auto; padding: 24px; border-top: 1px solid var(--border); }
        .btn { width: 100%; padding: 12px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 0.9rem; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px; }
        .btn-pri { background: var(--accent); color: white; }
        .btn-pri:hover { background: #333; }
        .btn-sec { background: white; border: 1px solid var(--border); margin-bottom: 10px; }
        .btn-sec:hover { border-color: #999; }
        
        @media(max-width:800px) {
           .studio-interface { flex-direction: column; height: auto; border: none; }
           .asset-pane { height: 400px; border-right: none; border-bottom: 1px solid var(--border); }
           .inspector-pane { width: 100%; }
           .file-row { grid-template-columns: 40px 1fr 50px; }
           .f-meta, .f-badge { display: none; }
        }
      `}</style>

      {/* LEFT: FILES */}
      <div className="asset-pane">
        <div className="pane-header">
          <span>Assets ({files.length})</span>
          {files.length > 0 && <button onClick={()=>setFiles([])} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'0.8rem'}}>Clear</button>}
        </div>
        <div className="file-scroller">
          {files.length === 0 ? (
            <div className="empty-state" onClick={() => fileInputRef.current.click()}>
              <div style={{marginBottom:'10px', color:'#000'}}><Icon.Upload /></div>
              <span style={{fontWeight:600}}>Drop images here</span>
              <span style={{fontSize:'0.8rem'}}>JPG, PNG, WebP</span>
            </div>
          ) : (
            <div>
              {files.map(f => (
                <div key={f.id} className="file-row">
                  <img src={f.preview} className="f-thumb" alt="" />
                  <div className="f-name" title={f.name}>{f.name}</div>
                  <div className="f-meta">{formatSize(f.origSize)}</div>
                  <div style={{textAlign:'right'}}>
                    {f.status === 'done' ? <span className="f-badge">-{f.saved}%</span> : 
                     f.status === 'working' ? <span style={{fontSize:'0.7rem', color:'#3b82f6'}}>WASM...</span> : ''}
                  </div>
                  <div style={{textAlign:'right', cursor:'pointer', color:'#94a3b8'}} onClick={() => {
                    setFiles(files.filter(x => x.id !== f.id));
                  }}><Icon.Close /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: SETTINGS */}
      <div className="inspector-pane">
        <div className="group">
          <span className="lbl">WASM Settings <Icon.Wasm /></span>
          
          <div style={{marginBottom:'15px'}}>
            <div style={{display:'flex', justify:'space-between', marginBottom:'6px', fontSize:'0.85rem'}}>
              <span>Quality</span> <span style={{fontFamily:'monospace'}}>{Math.round(quality*100)}</span>
            </div>
            <input type="range" min="0.1" max="1.0" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} disabled={isProcessing} />
          </div>

          <div>
            <div style={{fontSize:'0.85rem', marginBottom:'6px'}}>Format</div>
            <select className="select-input" value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
              <option value="webp">WebP (Google Rec)</option>
              <option value="jpeg">MozJPEG</option>
              <option value="png">OxiPNG</option>
            </select>
          </div>
        </div>

        <div className="group">
          <span className="lbl">Summary</span>
          <div className="stat-box">
            <div className="stat-line"><span>Original</span> <span>{formatSize(stats.totalOrig)}</span></div>
            <div className="stat-line"><span>Compressed</span> <span>{formatSize(stats.totalNew || 0)}</span></div>
            <div className="stat-line total">
              <span>Savings</span> 
              <span style={{color: stats.savings > 0 ? '#10b981' : 'inherit'}}>
                {stats.savings > 0 ? `-${formatSize(stats.savings)}` : '0 B'}
              </span>
            </div>
          </div>
        </div>

        <div className="footer">
          <button className="btn btn-sec" onClick={() => fileInputRef.current.click()}>
            <Icon.Plus /> Add Images
          </button>
          {stats.isDone ? (
            <button className="btn btn-pri" style={{background:'#10b981'}} onClick={handleDownload}>
              Download <Icon.Download />
            </button>
          ) : (
            <button className="btn btn-pri" onClick={runBatch} disabled={isProcessing || files.length === 0}>
              {isProcessing ? 'Compressing...' : 'Compress All'}
            </button>
          )}
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFiles} />
    </div>
  );
}
