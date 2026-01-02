import React, { useState, useRef, useEffect } from 'react';
import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

export default function CropTool({ entry, relatedTools }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, ready, processing, done
  const [aspectRatio, setAspectRatio] = useState(NaN);
  const [resultUrl, setResultUrl] = useState(null);
  
  const imageRef = useRef(null);
  const cropperRef = useRef(null);

  // Handle File Upload
  const onFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile({
        obj: selected,
        url: URL.createObjectURL(selected),
        name: selected.name
      });
      setStatus('ready');
    }
  };

  // Initialize Cropper when image enters the DOM
  useEffect(() => {
    if (status === 'ready' && imageRef.current) {
      cropperRef.current = new Cropper(imageRef.current, {
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 0.8,
        aspectRatio: aspectRatio,
        responsive: true,
        background: false, // Cleaner look on light gray
      });
    }
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }
    };
  }, [status, aspectRatio]);

  const handleCrop = () => {
    setStatus('processing');
    const canvas = cropperRef.current.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    canvas.toBlob((blob) => {
      setResultUrl(URL.createObjectURL(blob));
      setStatus('done');
    }, 'image/png');
  };

  return (
    <div className="w-full font-sans">
      {status === 'idle' && (
        /* --- PREMIUM TAILWIND UPLOADER --- */
        <div 
          onClick={() => document.getElementById('fileIn').click()}
          className="max-w-2xl mx-auto cursor-pointer group bg-white p-4 rounded-[40px] shadow-xl hover:shadow-2xl transition-all border border-slate-100"
        >
          <div className="rounded-[32px] border-2 border-dashed border-slate-200 group-hover:border-indigo-500 py-16 text-center transition-colors">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-white shadow-lg" style={{background: entry.data.color}}>
              <i className={`fa-solid ${entry.data.icon} text-3xl`}></i>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Select Image</h2>
            <p class="text-slate-400 mt-2">or drop a photo here to crop</p>
            <input type="file" id="fileIn" hidden onChange={onFileChange} accept="image/*" />
          </div>
        </div>
      )}

      {(status === 'ready' || status === 'processing') && (
        /* --- PREMIUM WORKSPACE --- */
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex-1 bg-slate-100 p-2 sm:p-6 rounded-[32px] border border-slate-200 overflow-hidden">
            <div className="relative w-full h-[400px] sm:h-[550px] bg-slate-200 rounded-[24px] overflow-hidden shadow-inner">
              <img ref={imageRef} src={file.url} className="max-w-full block" />
              
              {status === 'processing' && (
                <div className="absolute inset-0 z-50 flex flex-column items-center justify-center bg-slate-900/60 backdrop-blur-sm text-white">
                    <i className="fa-solid fa-circle-notch fa-spin fa-3x mb-3 text-indigo-400"></i>
                    <span className="font-black uppercase tracking-widest">Processing Crop...</span>
                </div>
              )}
            </div>
          </div>

          <aside className="w-full lg:w-80 bg-white p-8 rounded-[32px] shadow-xl border border-slate-50 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
                <h5 className="font-black text-slate-800 m-0">Crop Options</h5>
            </div>

            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Aspect Ratio</label>
            <div className="grid grid-cols-1 gap-2 mb-8">
              {[
                { label: 'Free Selection', val: NaN, icon: 'fa-vector-square' },
                { label: 'Square (1:1)', val: 1, icon: 'fa-square' },
                { label: 'Wide (16:9)', val: 16/9, icon: 'fa-tv' }
              ].map((opt) => (
                <button 
                  key={opt.label}
                  onClick={() => setAspectRatio(opt.val)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${isNaN(aspectRatio) && isNaN(opt.val) || aspectRatio === opt.val ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                >
                  <i className={`fa-solid ${opt.icon} opacity-50`}></i>
                  {opt.label}
                </button>
              ))}
            </div>

            <button 
              onClick={handleCrop}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
            >
              Crop & Download
            </button>
          </aside>
        </div>
      )}

      {status === 'done' && (
        /* --- SUCCESS STATE --- */
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-[48px] shadow-2xl border border-slate-50 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            <i class="fa-solid fa-check"></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">Image Cropped!</h2>
          <p class="text-slate-400 mb-10">Your custom selection has been extracted with original quality.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={resultUrl} download={`cropped-${file.name}`} className="px-12 py-4 bg-slate-900 text-white font-black rounded-full shadow-xl hover:bg-black transition-all no-underline text-lg">
              Download PNG
            </a>
            <button onClick={() => location.reload()} className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-100 font-bold rounded-full hover:bg-slate-50 transition-all">
              Crop Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
