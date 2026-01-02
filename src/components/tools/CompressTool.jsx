import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ color, toolName }) {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.7);
  const [stats, setStats] = useState(null);

  // Handle File Input
  const onFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const newFiles = selected.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'ready'
    }));
    setFiles([...files, ...newFiles]);
  };

  // Aggressive Compression Engine
  const handleProcess = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    let totalOldSize = 0;
    let totalNewSize = 0;

    try {
      const processed = await Promise.all(files.map(async (item) => {
        totalOldSize += item.file.size;
        const options = { maxSizeMB: 0.5, initialQuality: quality, useWebWorker: true };
        const blob = await imageCompression(item.file, options);
        totalNewSize += blob.size;
        zip.file(`compressed-${item.file.name}`, blob);
        return blob;
      }));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const savingsPct = Math.max(0, Math.round(((totalOldSize - totalNewSize) / totalOldSize) * 100));

      setStats({
        zipUrl: URL.createObjectURL(zipBlob),
        old: (totalOldSize / 1024).toFixed(1),
        new: (totalNewSize / 1024).toFixed(1),
        saved: savingsPct
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="zyntool-react-root">
      {!files.length ? (
        /* --- SELECT STATE --- */
        <div 
          onClick={() => document.getElementById('react-file-in').click()}
          className="max-w-2xl mx-auto cursor-pointer bg-white p-4 rounded-[32px] shadow-xl hover:shadow-2xl transition-all border border-slate-100"
        >
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-[24px] py-16 text-center transition-colors">
             <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-2xl shadow-lg" style={{background: color}}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
             </div>
             <h2 className="text-2xl font-black text-slate-800">Select images</h2>
             <p className="text-slate-400 text-sm">or drop images here</p>
             <input type="file" id="react-file-in" hidden multiple onChange={onFileChange} />
          </div>
        </div>
      ) : !stats ? (
        /* --- WORKSPACE STATE (Asset Manager) --- */
        <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
          <div className="flex-grow bg-[#f3f3f7] p-4 rounded-[20px] min-h-[400px] relative">
            <div className="flex flex-wrap justify-start">
              {files.map(f => (
                /* --- YOUR 198x244 CARD DESIGN --- */
                <div key={f.id} className="m-1 w-[198px] h-[244px] flex flex-col items-center justify-center relative bg-[#fdfdfd] rounded-lg shadow-[0_0_8px_0_rgba(0,0,0,0.08)] border border-transparent hover:border-indigo-400 transition-all">
                  <img src={f.preview} className="max-h-[160px] max-w-[160px] object-contain rounded" />
                  <span className="text-[10px] font-bold text-slate-400 mt-4 px-3 truncate w-full text-center uppercase tracking-tighter">
                    {f.file.name}
                  </span>
                </div>
              ))}
            </div>
            {/* Add more button */}
            <button 
              onClick={() => document.getElementById('react-file-in').click()}
              className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:rotate-90 transition-all"
            >
              <i className="fa-solid fa-plus text-xl"></i>
            </button>
          </div>

          <aside className="w-full lg:w-80 bg-white p-6 rounded-[24px] shadow-xl border border-slate-50 flex flex-col h-fit sticky top-24">
             <h5 className="font-black text-slate-800 mb-6">{toolName}</h5>
             <div className="mb-8 p-4 bg-indigo-50 rounded-2xl text-indigo-700 text-xs font-bold leading-relaxed">
                Images will be processed with our high-performance local engine.
             </div>
             
             <div className="mb-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Quality: {Math.round(quality*100)}%</label>
                <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
             </div>

             <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
             >
                {isProcessing ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-bolt-lightning mr-2"></i>}
                Optimize All
             </button>
          </aside>
        </div>
      ) : (
        /* --- SUCCESS STATE --- */
        <div className="max-w-xl mx-auto bg-white p-10 rounded-[48px] shadow-2xl text-center border border-slate-50 animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
              <i className="fa-solid fa-check"></i>
           </div>
           <h2 className="text-3xl font-black text-slate-900 mb-2">Saved {stats.saved}% space!</h2>
           <p className="text-slate-400 mb-8 font-medium">{stats.old} KB reduced to {stats.new} KB</p>
           
           <div className="flex flex-col gap-3">
              <a href={stats.zipUrl} download="zyntool-batch.zip" className="py-4 bg-slate-900 text-white font-black rounded-full shadow-xl hover:bg-black transition-all no-underline text-lg">
                Download ZIP
              </a>
              <button onClick={() => location.reload()} className="py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                Compress another batch
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
