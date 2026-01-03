import React, { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export default function CompressTool() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('upload'); // upload, processing, done
  const [quality, setQuality] = useState(0.7);
  const [totalSaved, setTotalSaved] = useState(0);
  const [zipUrl, setZipUrl] = useState(null);
  
  const fileInputRef = useRef(null);

  // --- LOGIC ---
  const handleFiles = (e) => {
    const selected = e.target.files || e.dataTransfer.files;
    if (!selected.length) return;

    const newFiles = Array.from(selected)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        origSize: f.size,
        newSize: null,
        status: 'pending' // pending, done
      }));

    setFiles(prev => [...prev, ...newFiles]);
    setStatus('processing'); // Immediately go to workspace
  };

  const removeFile = (id) => {
    const next = files.filter(f => f.id !== id);
    setFiles(next);
    if (next.length === 0) setStatus('upload');
  };

  const startCompression = async () => {
    setStatus('working');
    const zip = new JSZip();
    let savedAccumulator = 0;
    let oldTotal = 0;
    let newTotal = 0;

    const processed = [...files];

    for (let i = 0; i < processed.length; i++) {
      const item = processed[i];
      oldTotal += item.origSize;
      
      try {
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: quality };
        const compressedBlob = await imageCompression(item.file, options);
        
        processed[i].newSize = compressedBlob.size;
        processed[i].status = 'done';
        
        newTotal += compressedBlob.size;
        zip.file(item.name, compressedBlob);
        
        // Update UI immediately per file
        setFiles([...processed]); 
      } catch (err) { console.error(err); }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    setZipUrl(URL.createObjectURL(content));
    setTotalSaved(Math.round(((oldTotal - newTotal) / oldTotal) * 100));
    setStatus('done');
  };

  const reset = () => {
    setFiles([]);
    setStatus('upload');
    setZipUrl(null);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800">
      
      {/* --- STEP 1: UPLOAD HERO --- */}
      {status === 'upload' && (
        <div 
          className="relative group cursor-pointer"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e); }}
          onClick={() => fileInputRef.current.click()}
        >
          {/* Animated Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center hover:border-blue-500 hover:bg-slate-50 transition-all duration-300">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Upload Images to Compress</h2>
            <p className="text-slate-500 text-lg mb-8">Support for PNG, JPG, WEBP, and GIF</p>
            <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-slate-900/20 hover:bg-blue-600 hover:shadow-blue-600/30 transition-all">
              Select Images
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 2 & 3: WORKSPACE & RESULTS --- */}
      {(status === 'processing' || status === 'working' || status === 'done') && (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="font-bold text-slate-700 whitespace-nowrap">Compression Level</span>
              <div className="flex-1 md:w-64">
                <input 
                  type="range" min="0.1" max="1.0" step="0.05" 
                  value={quality} 
                  onChange={e => setQuality(parseFloat(e.target.value))}
                  disabled={status !== 'processing'}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <span className="bg-white px-3 py-1 rounded-md border border-slate-200 font-mono text-sm font-bold text-blue-600">
                {Math.round(quality * 100)}%
              </span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {status === 'done' ? (
                <>
                  <button onClick={reset} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">
                    New Batch
                  </button>
                  <a 
                    href={zipUrl} 
                    download="compressed-images.zip"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-105 transition-all"
                  >
                    <i className="fa-solid fa-download"></i> Download All
                  </a>
                </>
              ) : (
                <>
                  <button onClick={() => fileInputRef.current.click()} className="px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">
                    + Add More
                  </button>
                  <button 
                    onClick={startCompression}
                    disabled={status === 'working'}
                    className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-wait"
                  >
                    {status === 'working' ? <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Compressing...</> : 'Compress Images'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {status === 'done' && (
            <div className="bg-green-50 border-b border-green-100 p-4 text-center animate-fade-in">
              <p className="text-green-800 font-medium text-lg">
                <i className="fa-solid fa-party-horn mr-2"></i>
                Awesome! You saved <span className="font-bold">{totalSaved}%</span> file size.
              </p>
            </div>
          )}

          {/* FILE LIST */}
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {files.map((f) => (
              <div key={f.id} className="group p-4 flex items-center gap-4 hover:bg-slate-50 transition">
                {/* Image Preview */}
                <div className="relative w-16 h-16 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  {f.status === 'done' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        <i className="fa-solid fa-check"></i>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-700 truncate">{f.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="font-mono bg-slate-100 px-2 rounded">{formatSize(f.origSize)}</span>
                    {f.status === 'done' && (
                      <>
                        <i className="fa-solid fa-arrow-right text-xs text-slate-300"></i>
                        <span className="font-mono bg-green-100 text-green-700 px-2 rounded font-bold">{formatSize(f.newSize)}</span>
                        <span className="text-green-600 font-bold ml-2">
                          (-{Math.round((1 - f.newSize/f.origSize)*100)}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0">
                  {f.status === 'done' ? (
                     // Download individual file if needed (not implemented here for zip focus, but placeholder icon)
                     <span className="text-green-500 text-xl"><i className="fa-solid fa-circle-check"></i></span>
                  ) : (
                     status !== 'working' && (
                       <button 
                         onClick={() => removeFile(f.id)}
                         className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                       >
                         <i className="fa-solid fa-xmark"></i>
                       </button>
                     )
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer Stat */}
          <div className="bg-slate-50 p-3 text-center text-xs text-slate-400 font-medium uppercase tracking-wider">
            Client-side Processing • Secure & Private
          </div>

        </div>
      )}

      {/* Hidden Input */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFiles} 
        className="hidden" 
      />

      {/* SEO CONTENT SECTION - Critical for Google Ranking */}
      <article className="mt-20 prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why use this Image Compressor?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-xl"><i className="fa-solid fa-bolt"></i></div>
            <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
            <p className="text-slate-600">Compression happens directly in your browser. No files are uploaded to any server, ensuring maximum speed.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 text-xl"><i className="fa-solid fa-shield-halved"></i></div>
            <h3 className="font-bold text-lg mb-2">100% Secure</h3>
            <p className="text-slate-600">Your photos never leave your device. We use advanced client-side technology to ensure your privacy.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 text-xl"><i className="fa-solid fa-layer-group"></i></div>
            <h3 className="font-bold text-lg mb-2">Batch Processing</h3>
            <p className="text-slate-600">Select up to 50 images at once. Our tool automatically optimizes them and lets you download a single ZIP file.</p>
          </div>
        </div>
      </article>

    </div>
  );
}
