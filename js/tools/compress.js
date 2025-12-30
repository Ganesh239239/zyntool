const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const settingsArea = document.getElementById('settingsArea');
const qualityInput = document.getElementById('quality');
const qualVal = document.getElementById('qualVal');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');
const origInfo = document.getElementById('origInfo');
const newInfo = document.getElementById('newInfo');

let originalFile = null;

// Trigger file input
dropZone.onclick = () => fileInput.click();

// Handle file selection
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        originalFile = file;
        settingsArea.style.display = 'block';
        origInfo.innerText = (file.size / 1024).toFixed(2) + " KB";
        downloadBtn.style.display = 'none';
        compressBtn.style.display = 'inline-block';
    }
};

// Update quality label
qualityInput.oninput = () => {
    qualVal.innerText = qualityInput.value;
};

// Compression Logic
compressBtn.onclick = () => {
    const reader = new FileReader();
    reader.readAsDataURL(originalFile);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Convert to blob
            const quality = qualityInput.value / 100;
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                newInfo.innerText = (blob.size / 1024).toFixed(2) + " KB";
                
                downloadBtn.href = url;
                downloadBtn.download = `compressed_${originalFile.name}`;
                downloadBtn.style.display = 'inline-block';
                compressBtn.style.display = 'none';
            }, 'image/jpeg', quality);
        };
    };
};
