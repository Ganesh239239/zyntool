import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool() {
  const [files, setFiles] = useState([]);
  const [viewState, setViewState] = useState('upload'); // upload, workspace
  const [quality, setQuality] = useState(0.75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zipUrl, setZipUrl] = useState(null);
  
  const fileInputRef = useRef(null);

  // --- LOGIC ---

  const handleFiles = (incoming) => {
    const validFiles = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) return;

    const newEntries = validFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
      origSize: f.size,
      newSize: null,
      status: 'pending' // pending, working, done, error
    }));

    setFiles(prev => [...prev, ...newEntries]);
    setViewState('workspace');
  };

  const removeFile = (id) => {
    const nextFiles = files.filter(f => f.id !== id);
    setFiles(nextFiles);
    if (nextFiles.length === 0) setViewState('upload');
  };

  const startCompression = async () => {
    setIsProcessing(true);
    setZipUrl(null);
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

      } catch (err) {
        processed[i].status = 'error';
        console.error(err);
      }
      setFiles([...processed]);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setZipUrl(URL.createObjectURL(content));
    setIsProcessing(false);
  };

  const reset = () => {
    setFiles([]);
    setViewState('upload');
    setZipUrl(null);
  };

  const formatSize = (bytes) => {
    if (bytes === 0 || !bytes) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB'][i];
  };

  const totalSavings = () => {
    const oldTotal = files.reduce((acc, f) => acc + f.origSize, 0);
    const newTotal = files.reduce((acc, f) => acc + (f.newSize || 0), 0);
    if (oldTotal === 0 || newTotal === 0) return 0;
    return Math.round(((oldTotal - newTotal) / oldTotal) * 100);
  };

  // --- RENDER ---
  
  return (
    <div className="w-full max-w-5xl mx-auto font-sans bg-white">
      
      {/* VIEW 1: UPLOAD (Minimalist & Professional) */}
      {viewState === 'upload' && (
        <div 
          className="relative group cursor-pointer border-2 border-dashed border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-white rounded-2xl p-12 text-center transition-all duration-300"
          onClick={() => fileInputRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-6 text-slate-400 group-hover:text-slate-900 transition-colors">
            <i className="fa-solid fa-arrow-up-from-bracket text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Drop your images here</h2>
          <p className="text-slate-500">Or click to browse</p>
        </div>
      )}

      {/* VIEW 2: WORKSPACE (Data-Dense Dashboard) */}
      {viewState === 'workspace' && (
        <div className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <label htmlFor="quality" className="text-sm font-semibold text-slate-600">Quality</label>
              <input 
                id="quality" type="range" min="0.1" max="1.0" step="0.05" 
                value={quality} onChange={e => setQuality(parseFloat(e.target.value))}
                disabled={isProcessing}
                className="w-full md:w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <span className="font-mono text-sm font-bold bg-white px-2 py-1 rounded border border-slate-200">{Math.round(quality * 100)}</span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {zipUrl ? (
                <>
                  <span className="font-bold text-green-600 text-sm animate-pulse">
                    SAVED {totalSavings()}%
                  </span>
                  <button onClick={reset} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition">
                    New
                  </button>
                  <a href={zipUrl} download="compressed.zip" className="px-5 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 transition shadow-sm">
                    Download All
                  </a>
                </>
              ) : (
                <>
                  <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition">
                    Add
                  </button>
                  <button 
                    onClick={startCompression} disabled={isProcessing}
                    className="px-5 py-2 rounded-lg font-semibold bg-slate-900 text-white hover:bg-black transition shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Processing...</> : 'Compress All'}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* File Table */}
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white shadow-sm">
                <tr>
                  <th className="p-3 text-left font-medium text-slate-500 uppercase w-20">Preview</th>
                  <th className="p-3 text-left font-medium text-slate-500 uppercase">Details</th>
                  <th className="p-3 text-left font-medium text-slate-500 uppercase w-48 hidden md:table-cell">Original Size</th>
                  <th className="p-3 text-left font-medium text-slate-500 uppercase w-48 hidden md:table-cell">New Size</th>
                  <th className="p-3 text-right font-medium text-slate-500 uppercase w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <img src={f.preview} alt="" className="w-12 h-12 rounded-md object-cover bg-slate-100 border border-slate-200" />
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800 truncate">{f.name}</p>
                      {/* Mobile View of Sizes */}
                      <div className="font-mono text-xs text-slate-500 mt-1 md:hidden">
                        {formatSize(f.origSize)}
                        {f.newSize && <span className="text-green-600 font-bold"> → {formatSize(f.newSize)}</span>}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-500 hidden md:table-cell">{formatSize(f.origSize)}</td>
                    <td className="p-3 font-mono font-bold text-green-600 hidden md:table-cell">
                      {f.status === 'done' ? formatSize(f.newSize) : '—'}
                    </td>
                    <td className="p-3 text-right">
                      {f.status === 'pending' && <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-full">Queued</span>}
                      {f.status === 'working' && <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">Working</span>}
                      {f.status === 'error' && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">Error</span>}
                      {f.status === 'done' && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
