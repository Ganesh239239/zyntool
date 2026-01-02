import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ entry }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, working, done
  const [quality, setQuality] = useState(0.5);
  const [stats, setStats] = useState(null);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1),
      compressedSize: null,
      status: 'waiting'
    })));
    setStatus('ready');
  };

  const runEngine = async () => {
    setStatus('working');
    const zip = new JSZip();
    let totalOld = 0;
    let totalNew = 0;

    const results = await Promise.all(files.map(async (item, index) => {
      totalOld += item.file.size;
      const options = { maxSizeMB: 0.5, initialQuality: quality, useWebWorker: true };
      
      const blob = await imageCompression(item.file, options);
      
      totalNew += blob.size;
      zip.file(`optimized-${item.name}`, blob);
      
      // Update individual file status
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done', compressedSize: (blob.size / 1024).toFixed(1) } : f));
      
      return blob;
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setStats({
      url: URL.createObjectURL(zipBlob),
      pct: Math.round(((totalOld - totalNew) / totalOld) * 100),
      oldKB: (totalOld / 1024).toFixed(0),
      newKB: (totalNew / 1024).toFixed(0)
    });
    setStatus('done');
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {status === 'idle' && (
        <div 
          onClick={() => document.getElementById('fIn').click()}
          className="max-w-2xl mx-auto cursor-pointer group bg-white p-4 rounded-[40px] shadow-2xl hover:shadow-indigo-100 transition-all border border-slate-100"
        >
          <div className="border-2 border-dashed border-slate-200 group-hover:border-indigo-500 rounded-[32px] py-20 text-center transition-colors">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce" style={{background: '#4b8df8'}}>
              <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-800">Choose Files</h2>
            <p className="text-slate-400 font-medium">Drag & drop or click to start batch compression</p>
            <input type="file" id="fIn" hidden multiple onChange={handleUpload} />
          </div>
        </div>
      )}

      {(status === 'ready' || status === 'working') && (
        <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* THE WORKBENCH: Gray gallery */}
          <div className="flex-1 bg-slate-50 p-6 rounded-[32px] border border-slate-200 min-h-[500px]">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {files.map(f => (
                <div key={f.id} className="asset-card">
                  <div className="asset-img-wrap">
                    <img src={f.url} alt="preview" />
                    {f.status === 'done' && <div className="asset-success-badge"><i className="fa-solid fa-check"></i></div>}
                  </div>
                  <div className="asset-info">
                    <span className="name">{f.name}</span>
                    <span className="size">{f.compressedSize ? `${f.compressedSize} KB` : `${f.size} KB`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* THE CONTROL CENTER: Sidebar */}
          <aside className="w-full lg:w-80 bg-white p-8 rounded-[32px] shadow-2xl border border-slate-50 sticky top-32">
            <h5 className="font-black text-slate-800 mb-2">Optimize</h5>
            <p className="text-xs font-bold text-slate-400 uppercase mb-8">Batch: {files.length} Files</p>
            
            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Quality</label>
                <span className="text-lg font-black text-indigo-600">{Math.round(quality * 100)}%</span>
              </div>
              <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>

            <button 
              onClick={runEngine} 
              disabled={status === 'working'}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {status === 'working' ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-bolt-lightning mr-2"></i>}
              {status === 'working' ? 'COMPRESSING...' : 'START BATCH'}
            </button>
          </aside>
        </div>
      )}

      {status === 'done' && (
        /* --- THE REALISTIC DOWNLOAD PAGE --- */
        <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-50 overflow-hidden">
            <div className="p-12 text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-emerald-100">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{stats.pct}%</h1>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Lighter!</h2>
                <p className="text-slate-400 font-bold mb-10">{stats.oldKB} KB reduced to {stats.newKB} KB</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href={stats.url} download="zyntool-optimized.zip" className="flex-1 max-w-xs no-underline py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl hover:bg-indigo-700 transition-all text-xl">
                       <i className="fa-solid fa-download mr-2"></i> Download ZIP
                    </a>
                </div>
                
                <button onClick={() => location.reload()} className="mt-8 text-slate-400 font-black tracking-widest text-[10px] uppercase hover:text-indigo-600 transition-colors">
                   <i className="fa-solid fa-rotate-left mr-2"></i> Start New Batch
                </button>
            </div>
            
            {/* Realistic "What's Next" Footer */}
            <div className="bg-slate-50 p-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-sm font-bold text-slate-500">Need to do more?</span>
                <div className="flex gap-2">
                    <a href="/resize-image" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 no-underline hover:border-indigo-400">Resize Now</a>
                    <a href="/crop-image" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 no-underline hover:border-indigo-400">Crop Now</a>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NATIVE CSS FOR CARDS --- */}
      <style>{`
        .asset-card {
            margin: 4px; width: 198px; height: 244px; display: flex; flex-direction: column; 
            align-items: center; justify-content: center; position: relative;
            background: #fdfdfd; border-radius: 12px; box-shadow: 0 0 8px 0 rgba(0, 0, 0, .08);
            transition: 0.3s; border: 2px solid transparent;
        }
        .asset-card:hover { border-color: #4f46e5; transform: translateY(-5px); }
        .asset-img-wrap { position: relative; width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; }
        .asset-card img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; }
        .asset-success-badge { position: absolute; top: -10px; right: -10px; background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .asset-info { margin-top: 20px; width: 85%; text-align: center; }
        .asset-info .name { font-size: 10px; font-weight: 800; color: #1e293b; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: uppercase; }
        .asset-info .size { font-size: 10px; font-weight: 700; color: #94a3b8; }
      `}</style>
    </div>
  );
}
