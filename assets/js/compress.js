let img = new Image();
let canvas, ctx;
let quality = 0.8;
let format = 'image/jpeg';
let originalSize = 0;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const uploadArea = document.getElementById('uploadArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    initializeFileUpload('fileInput', 'uploadArea');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            originalSize = file.size;
            const reader = new FileReader();
            reader.onload = (event) => {
                img.src = event.target.result;
                img.onload = () => {
                    uploadArea.style.display = 'none';
                    previewArea.classList.add('active');
                    createControls();
                    drawImage();
                    updateCompression();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    function createControls() {
        document.getElementById('controls').innerHTML = `
            <div class="control-group">
                <label>Quality: <span id="qualityValue">${Math.round(quality * 100)}%</span></label>
                <input type="range" id="qualitySlider" min="0.1" max="1" step="0.01" value="${quality}" 
                       oninput="updateQuality(this.value)">
            </div>
            <div class="control-group">
                <label>Format</label>
                <select id="formatSelect" onchange="updateFormat(this.value)">
                    <option value="image/jpeg" selected>JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                </select>
            </div>
            <div class="control-group">
                <label>Original Size: <span id="originalSize">${formatBytes(originalSize)}</span></label>
                <label>Compressed Size: <span id="compressedSize">-</span></label>
                <label>Reduction: <span id="reduction">-</span></label>
            </div>
        `;
    }

    resetBtn.addEventListener('click', () => {
        quality = 0.8;
        format = 'image/jpeg';
        document.getElementById('qualitySlider').value = quality;
        document.getElementById('formatSelect').value = format;
        drawImage();
        updateCompression();
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
        link.download = 'compressed-image.' + ext;
        link.href = canvas.toDataURL(format, quality);
        link.click();
    });
});

function drawImage() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
}

function updateQuality(value) {
    quality = parseFloat(value);
    document.getElementById('qualityValue').textContent = Math.round(quality * 100) + '%';
    updateCompression();
}

function updateFormat(value) {
    format = value;
    updateCompression();
}

function updateCompression() {
    canvas.toBlob((blob) => {
        const compressedSize = blob.size;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        document.getElementById('compressedSize').textContent = formatBytes(compressedSize);
        document.getElementById('reduction').textContent = reduction + '%';
    }, format, quality);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}