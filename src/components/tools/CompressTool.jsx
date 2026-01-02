import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool({ entry, relatedTools }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, done
  const [quality, setQuality] = useState(0.7);
  const [savings, setSavings] = useState({ old: 0, new: 0, pct: 0, zipUrl: null });

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected.map(file => ({ file, name: file.name, size: file.size })));
    setStatus('ready');
  };

  const startCompression = async () => {
    setStatus('processing');
    const zip = new JSZip();
    let totalOld = 0;
    let totalNew = 0;

    try {
      await Promise.all(files.map(async (item) => {
        totalOld += item.file.size;
        const options = { maxSizeMB: 0.5, initialQuality: quality, useWebWorker: true };
        const blob = await imageCompression(item.file, options);
        totalNew += blob.size;
        zip.file(`compressed-${item.name}`, blob);
      }));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setSavings({
        old: (totalOld / 1024).toFixed(1),
        new: (totalNew / 1024).toFixed(1),
        pct: Math.round(((totalOld - totalNew) / totalOld) * 100),
        zipUrl: URL.createObjectURL(zipBlob)
      });
      setStatus('done');
    } catch (err) {
      alert("Error processing");
      setStatus('ready');
    }
  };

  return (
    <div className="w-full font-sans">
      {status === 'idle' && (
        <div onClick={() => document.getElementById('fileIn').click()} className="group max-w-2xl mx-auto cursor-pointer">
          <div className="rounded-[40px] bg-white p-4 shadow-xl transition-all hover:shadow-2xl border border-slate-100">
            <div className="rounded-[32px] border-2 border-dashed border-slate-200 py-16 text-center group-hover:border-indigo-500 transition-colors">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg" style={{ background: entry.data.color }}>
                <i className={`fa-solid ${entry.data.icon} text-3xl`}></i>
              </div>
              <h2 class="text-3xl font-black text-slate-800">Select images</h2>
              <p class="text-slate-400 mt-2">or drop them here</p>
              <input type="file" id="fileIn" hidden multiple onChange={handleUpload} />
            </div>
          </div>
        </div>
      )}

      {(status === 'ready' || status === 'processing') && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
            {files.map((f, i) => (
              <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="h-20 flex items-center justify-center text-slate-300"><i class="fa-solid fa-image fa-2x"></i></div>
                <p className="text-[10px] font-bold text-slate-500 truncate mt-2">{f.name}</p>
              </div>
            ))}
          </div>

          <aside className="w-full lg:w-80 bg-white p-8 rounded-[32px] shadow-xl border border-slate-50">
            <h4 className="font-black text-slate-900 mb-6">Compress Options</h4>
            <div className="mb-8">
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase mb-3">
                <span>Quality</span>
                <span className="text-indigo-600">{Math.round(quality * 100)}%</span>
              </div>
              <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
            <button onClick={startCompression} disabled={status === 'processing'} className="w-full py-4 bg-indigo-600 text-white font-black rounded-full shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
              {status === 'processing' ? <i class="fa-solid fa-spinner fa-spin mr-2"></i> : <i class="fa-solid fa-bolt mr-2"></i>}
              Compress All
            </button>
          </aside>
        </div>
      )}

      {status === 'done' && (
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-[48px] shadow-2xl border border-slate-50 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
            <i class="fa-solid fa-check"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">Saved {savings.pct}% space!</h2>
          <p className="text-slate-500 mb-8">{savings.old} KB → {savings.new} KB</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={savings.zipUrl} download="zyntool-images.zip" className="px-10 py-4 bg-slate-900 text-white font-black rounded-full shadow-xl hover:bg-black transition-all no-underline text-lg">
              Download ZIP
            </a>
            <button onClick={() => location.reload()} className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-100 font-bold rounded-full hover:bg-slate-50 transition-all">
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
