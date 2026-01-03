import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color }) {
  const [queue, setQueue] = useState([]);
  const [view, setView] = useState('landing'); // landing | studio | result
  const [quality, setQuality] = useState(0.4); // Aggressive optimization
  const [summary, setSummary] = useState(null);

  // --- ACTIONS ---
  const handleFileEntry = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setQueue(files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      size: (f.size / 1024).toFixed(1),
      status: 'idle'
    })));
    setView('studio');
  };

  const processBatch = async () => {
    setView('processing');
    const zip = new JSZip();
    let totalIn = 0; let totalOut = 0;

    await Promise.all(queue.map(async (item) => {
      totalIn += item.file.size;
      const options = { maxSizeMB: 0.2, initialQuality: quality, useWebWorker: true };
      const blob = await imageCompression(item.file, options);
      totalOut += blob.size;
      zip.file(item.name, blob);
    }));

    const blob = await zip.generateAsync({ type: 'blob' });
    setSummary({
      url: URL.createObjectURL(blob),
      saved: Math.round(((totalIn - totalOut) / totalIn) * 100),
      in: (totalIn / 1024).toFixed(0),
      out: (totalOut / 1024).toFixed(0)
    });
    setView('result');
  };

  return (
    <div className="w-full">
      {/* STATE 1: LANDING (The Entry Portal) */}
      {view === 'landing' && (
        <div className="max-w-4xl mx-auto text-center space-y-12 py-10">
          <header className="space-y-4">
             <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                Better quality. <br/>
                <span className="text-indigo-600">Fraction of the size.</span>
             </h1>
             <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">
                Batch compress JPG, PNG, and WebP images locally in your browser. No server uploads. 100% Private.
             </p>
          </header>

          <div 
            onClick={() => document.getElementById('fileIn').click()}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[44px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-100 rounded-[40px] p-2">
                <div className="border-2 border-dashed border-slate-100 group-hover:border-indigo-500 transition-all rounded-[32px] py-24 bg-slate-50/50">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-2xl shadow-indigo-200">
                        <i className="fa-solid fa-plus"></i>
                    </div>
                    <span className="text-2xl font-black text-slate-800">Add Images</span>
                    <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Max 20 files • Up to 50MB</p>
                </div>
            </div>
            <input type="file" id="fileIn" hidden multiple onChange={handleFileEntry} />
          </div>
        </div>
      )}

      {/* STATE 2: STUDIO (The Workbench) */}
      {(view === 'studio' || view === 'processing') && (
        <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex-1 bg-slate-50/80 backdrop-blur rounded-[48px] border border-slate-100 p-8 min-h-[600px] shadow-inner">
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {queue.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                    <div className="h-32 w-full flex items-center justify-center mb-4">
                      <img src={item.preview} className="max-h-full max-w-full object-contain rounded-lg shadow-md" />
                    </div>
                    <h6 className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate w-full text-center">{item.name}</h6>
                    <span className="text-[10px] font-bold text-slate-400">{item.size} KB</span>
                  </div>
                ))}
             </div>
          </div>

          <aside className="w-full lg:w-96 space-y-6 sticky top-24">
             <div className="bg-white rounded-[40px] p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-50">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-indigo-600"></i> Settings
                </h3>

                <div className="space-y-8 mb-12">
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</label>
                        <span className="text-2xl font-black text-slate-900">{Math.round((1-quality)*100)}%</span>
                      </div>
                      <input 
                        type="range" min="0.1" max="0.9" step="0.1" value={quality} 
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                      />
                   </div>
                </div>

                <button 
                  onClick={processBatch}
                  disabled={view === 'processing'}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-full shadow-2xl hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {view === 'processing' ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                  {view === 'processing' ? 'PROCESSING...' : 'RUN STUDIO'}
                </button>
             </div>
          </aside>
        </div>
      )}

      {/* STATE 3: RESULT (The Performance Scorecard) */}
      {view === 'result' && (
        <div className="max-w-3xl mx-auto text-center animate-in zoom-in-95 duration-1000">
           <div className="bg-white rounded-[60px] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-50">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <i className="fa-solid fa-check text-2xl"></i>
              </div>
              <h1 className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter mb-4">
                {summary.saved}%
              </h1>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Efficiency Rating</h2>
              <p className="text-slate-400 font-bold mb-12 text-lg">{summary.in} KB → {summary.out} KB</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <a href={summary.url} download="zyntool-studio.zip" className="px-12 py-6 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all text-xl no-underline">
                   Download ZIP
                 </a>
                 <button onClick={() => location.reload()} className="px-10 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all uppercase tracking-widest text-sm">
                   New Batch
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
