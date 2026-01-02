import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('landing'); // landing, processing, result
  const [quality, setQuality] = useState(0.4); // Aggressive default
  const [summary, setSummary] = useState(null);

  const onUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(f),
      name: f.name,
      oldSize: (f.size / 1024).toFixed(1),
      newSize: null,
      progress: 0
    })));
    setStatus('processing');
  };

  const startEngine = async () => {
    const zip = new JSZip();
    let totalOld = 0; let totalNew = 0;

    await Promise.all(files.map(async (item) => {
      totalOld += item.file.size;
      const options = { 
        maxSizeMB: 0.1, // Target 100KB for maximum compression
        initialQuality: quality, 
        useWebWorker: true,
        maxIteration: 20 
      };
      
      const blob = await imageCompression(item.file, options);
      totalNew += blob.size;
      zip.file(`zyn-${item.name}`, blob);
      
      // Update item UI
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, newSize: (blob.size / 1024).toFixed(1), progress: 100 } : f));
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    setSummary({
      url: URL.createObjectURL(zipBlob),
      saved: Math.round(((totalOld - totalNew) / totalOld) * 100),
      oldS: (totalOld / 1024).toFixed(0),
      newS: (totalNew / 1024).toFixed(0)
    });
    setStatus('result');
  };

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* 1. LANDING STATE */}
      {status === 'landing' && (
        <div 
          onClick={() => document.getElementById('fIn').click()}
          className="max-w-3xl mx-auto group cursor-pointer bg-white p-6 rounded-[48px] shadow-[0_30px_100px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_100px_rgba(79,70,229,0.1)] transition-all border border-slate-100"
        >
          <div className="border-2 border-dashed border-slate-100 group-hover:border-indigo-500 rounded-[40px] py-24 text-center transition-colors bg-slate-50/30">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Choose Images</h2>
            <p className="text-slate-400 font-semibold tracking-wide">Drag & drop up to 20 files for batch optimization</p>
            <input type="file" id="fIn" hidden multiple onChange={onUpload} />
          </div>
        </div>
      )}

      {/* 2. PROCESSING/WORKSPACE STATE */}
      {status === 'processing' && (
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* THE WORKBENCH */}
          <div className="flex-1 w-full bg-slate-100/50 p-8 rounded-[40px] border border-slate-200 shadow-inner min-h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {files.map(f => (
                <div key={f.id} className="asset-card-refined shadow-xl">
                  <div className="asset-preview">
                    <img src={f.url} />
                    {f.progress === 100 && <div className="status-badge"><i className="fa-solid fa-check"></i></div>}
                  </div>
                  <div className="asset-details">
                    <span class="name">{f.name}</span>
                    <span class="size">{f.newSize ? `${f.newSize} KB` : `${f.oldSize} KB`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* THE CONTROL HUB */}
          <aside className="w-full lg:w-96 bg-white p-10 rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-slate-50 sticky top-36">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                    <i className="fa-solid fa-sliders"></i>
                </div>
                <h4 className="font-black text-slate-900 m-0">Settings</h4>
            </div>

            <div className="mb-12">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</label>
                <span className="text-2xl font-black text-indigo-600">{Math.round((1 - quality) * 100)}%</span>
              </div>
              <input type="range" min="0.1" max="0.9" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase">
                <span>Best Quality</span>
                <span>Smallest Size</span>
              </div>
            </div>

            <button onClick={startEngine} className="w-full py-5 bg-slate-900 text-white font-black rounded-full shadow-2xl hover:bg-black transition-all hover:-translate-y-1 active:scale-95">
                OPTIMIZE BATCH
            </button>
          </aside>
        </div>
      )}

      {/* 3. RESULT STATE */}
      {status === 'result' && (
        <div className="max-w-4xl mx-auto bg-white p-16 rounded-[60px] shadow-[0_50px_120px_rgba(0,0,0,0.1)] border border-slate-50 text-center animate-in zoom-in-95 duration-700">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner rotate-12">
            <i class="fa-solid fa-check-double"></i>
          </div>
          <h1 className="text-8xl font-black text-slate-900 tracking-tighter mb-2">{summary.saved}%</h1>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Lighter than original!</h2>
          <p class="text-slate-400 font-bold mb-12 text-lg">{summary.oldS} KB reduced to {summary.newS} KB</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={summary.url} download="zyntool-batch.zip" className="flex-1 max-w-sm no-underline py-6 bg-indigo-600 text-white font-black rounded-[28px] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all text-xl">
              <i className="fa-solid fa-download mr-2"></i> DOWNLOAD ZIP
            </a>
            <button onClick={() => location.reload()} className="px-10 py-6 bg-slate-100 text-slate-600 font-black rounded-[28px] hover:bg-slate-200 transition-all text-xl uppercase tracking-widest">
              NEW BATCH
            </button>
          </div>
        </div>
      )}

      <style>{`
        .asset-card-refined {
            width: 198px; height: 244px; background: #fff; border-radius: 20px;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            border: 1px solid #f1f5f9; position: relative; transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .asset-card-refined:hover { transform: translateY(-8px) rotate(1deg); border-color: #4f46e5; }
        .asset-preview { width: 140px; height: 140px; position: relative; display: flex; align-items: center; justify-content: center; }
        .asset-preview img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; filter: drop-shadow(0 8px 15px rgba(0,0,0,0.1)); }
        .status-badge { position: absolute; top: -5px; right: -5px; width: 24px; height: 24px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .asset-details { margin-top: 25px; width: 85%; text-align: center; }
        .asset-details .name { font-size: 10px; font-weight: 900; color: #1e293b; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; }
        .asset-details .size { font-size: 10px; font-weight: 700; color: #94a3b8; }
        
        @media (max-width: 768px) {
          .asset-card-refined { width: 100%; height: auto; padding: 20px; flex-direction: row; gap: 20px; }
          .asset-preview { width: 60px; height: 60px; }
          .asset-details { text-align: left; margin: 0; }
        }
      `}</style>
    </div>
  );
}
