import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color, icon }) {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.7);
  const [results, setResults] = useState(null);

  // Handle File Upload
  const onFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file)
    })));
  };

  // The Aggressive Compression Engine
  const processImages = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    let totalOldSize = 0;
    let totalNewSize = 0;

    const processed = await Promise.all(files.map(async (item) => {
      totalOldSize += item.file.size;
      const options = { maxSizeMB: 1, initialQuality: quality, useWebWorker: true };
      const blob = await imageCompression(item.file, options);
      totalNewSize += blob.size;
      zip.file(`compressed-${item.file.name}`, blob);
      return blob;
    }));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const saved = Math.round(((totalOldSize - totalNewSize) / totalOldSize) * 100);

    setResults({
      url: URL.createObjectURL(zipBlob),
      savings: saved,
      oldSize: (totalOldSize / 1024).toFixed(1),
      newSize: (totalNewSize / 1024).toFixed(1)
    });
    setIsProcessing(false);
  };

  return (
    <div className="w-full">
      {!files.length ? (
        /* --- TAILWIND UPLOADER --- */
        <div 
          onClick={() => document.getElementById('hidden-input').click()}
          className="max-w-3xl mx-auto cursor-pointer group bg-white p-4 rounded-[32px] shadow-xl hover:shadow-2xl transition-all border border-slate-100"
        >
          <div className="border-2 border-dashed border-slate-200 group-hover:border-indigo-500 rounded-[24px] py-20 text-center transition-colors">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{background: `${color}15`, color: color}}>
              <i className={`fa-solid ${icon} text-3xl`}></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Select Images</h2>
            <p className="text-slate-500">or drop them here for instant compression</p>
            <input type="file" id="hidden-input" hidden multiple onChange={onFileChange} />
          </div>
        </div>
      ) : !results ? (
        /* --- TAILWIND WORKSPACE --- */
        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex-1 bg-slate-100 p-6 rounded-[24px] border border-slate-200 min-h-[400px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {files.map(item => (
                <div key={item.id} className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                  <img src={item.preview} className="h-24 w-full object-contain mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 truncate">{item.file.name}</p>
                </div>
              ))}
            </div>
          </div>
          
          <aside className="w-full lg:w-80 bg-white p-6 rounded-[24px] shadow-lg border border-slate-100 h-fit sticky top-24">
            <h5 className="font-bold text-slate-800 mb-6">Settings</h5>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">Quality: {Math.round(quality * 100)}%</label>
            <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-8" />
            
            <button 
              onClick={processImages}
              disabled={isProcessing}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isProcessing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-bolt mr-2"></i>}
              Compress All
            </button>
          </aside>
        </div>
      ) : (
        /* --- TAILWIND SUCCESS --- */
        <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-[40px] shadow-2xl border border-slate-50 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fa-solid fa-check"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">Great Success!</h2>
          <p className="text-slate-500 mb-8 text-lg">Your images are now <span className="text-emerald-500 font-black">{results.savings}%</span> lighter.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={results.url} download="zyntool-batch.zip" className="px-10 py-4 bg-slate-900 text-white font-bold rounded-full shadow-xl hover:bg-black transition-all no-underline">
               Download ZIP
            </a>
            <button onClick={() => location.reload()} className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-200 font-bold rounded-full hover:bg-slate-50 transition-all">
               Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
