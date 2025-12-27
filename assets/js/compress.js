// Compress IMAGE Tool - FULLY FUNCTIONAL
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const controls = document.getElementById('controls');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const downloadBtn = document.getElementById('download-btn');

let currentImage = null;
let originalFile = null;
let processedBlob = null;

// Drag and Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File Input
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Handle File Upload
async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    originalFile = file;
    uploadArea.style.display = 'none';
    loading.classList.add('active');

    try {
        const img = await loadImage(file);
        currentImage = img;

        previewImage.src = URL.createObjectURL(file);

        loading.classList.remove('active');
        previewSection.classList.add('active');
        controls.style.display = 'block';

        const originalSize = (file.size / 1024).toFixed(2);

        // Create Compression Controls
        controls.innerHTML = `
            <h3 style="margin-bottom: 15px;">Compression Settings</h3>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 13px;">
                    Original: <strong>${originalSize} KB</strong>
                </p>
                <p style="margin: 0; color: #4CAF50; font-size: 13px; font-weight: 600;">
                    Compressed: <span id="compressed-size">-</span>
                </p>
                <p style="margin: 10px 0 0 0; color: #FF9800; font-size: 14px; font-weight: 700;">
                    Reduction: <span id="reduction">-</span>
                </p>
            </div>

            <div class="control-group">
                <label>Quality: <span id="quality-value">70</span>%</label>
                <input type="range" id="quality-slider" min="10" max="100" value="70">
                <small style="color: #999;">Lower = smaller file, lower quality</small>
            </div>

            <div class="control-group">
                <label>Output Format</label>
                <select id="format-select">
                    <option value="jpeg">JPEG (best compression)</option>
                    <option value="png">PNG (lossless)</option>
                    <option value="webp">WebP (modern)</option>
                </select>
            </div>

            <button class="btn" onclick="compressImage()" style="width: 100%; background: #4CAF50;">
                🗜️ Compress Image
            </button>
        `;

        // Quality Slider Event
        document.getElementById('quality-slider').addEventListener('input', (e) => {
            document.getElementById('quality-value').textContent = e.target.value;
        });

    } catch (error) {
        alert('Error: ' + error.message);
        location.reload();
    }
}

// Compress Image Function
window.compressImage = function() {
    const quality = document.getElementById('quality-slider').value / 100;
    const format = document.getElementById('format-select').value;

    loading.classList.add('active');
    controls.style.display = 'none';

    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        ctx.drawImage(currentImage, 0, 0);

        let mimeType = 'image/jpeg';
        if (format === 'png') mimeType = 'image/png';
        else if (format === 'webp') mimeType = 'image/webp';

        canvas.toBlob((blob) => {
            processedBlob = blob;
            const url = URL.createObjectURL(blob);
            previewImage.src = url;

            const originalSize = (originalFile.size / 1024).toFixed(2);
            const compressedSize = (blob.size / 1024).toFixed(2);
            const reduction = ((1 - blob.size / originalFile.size) * 100).toFixed(1);

            document.getElementById('compressed-size').textContent = compressedSize + ' KB';
            document.getElementById('reduction').textContent = reduction + '%';

            loading.classList.remove('active');
            controls.style.display = 'block';
            downloadBtn.style.display = 'inline-block';
            downloadBtn.textContent = '⬇️ Download Compressed Image';
        }, mimeType, quality);
    }, 500);
};

// Download Button
downloadBtn.addEventListener('click', () => {
    if (processedBlob) {
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        const format = document.getElementById('format-select').value;
        a.download = `compressed-image.${format === 'jpeg' ? 'jpg' : format}`;
        a.click();
        URL.revokeObjectURL(url);
    }
});

// Load Image Helper
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
