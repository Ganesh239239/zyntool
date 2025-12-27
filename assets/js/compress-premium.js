// Premium Compress Tool
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const compressBtn = document.getElementById('compress-btn');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const formatSelect = document.getElementById('format-select');
const uploadPrompt = document.getElementById('upload-prompt');
const loading = document.getElementById('loading');
const stats = document.getElementById('stats');
const canvasWrapper = document.querySelector('.canvas-wrapper');

let currentImage = null;
let originalFile = null;
let processedBlob = null;

// Quality slider
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
});

// File input
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Drag and drop
canvasWrapper.addEventListener('dragover', (e) => {
    e.preventDefault();
    canvasWrapper.style.borderColor = '#667eea';
});

canvasWrapper.addEventListener('dragleave', () => {
    canvasWrapper.style.borderColor = '#ddd';
});

canvasWrapper.addEventListener('drop', (e) => {
    e.preventDefault();
    canvasWrapper.style.borderColor = '#ddd';
    if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
    }
});

canvasWrapper.addEventListener('click', () => {
    if (!currentImage) {
        fileInput.click();
    }
});

async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    originalFile = file;
    uploadPrompt.style.display = 'none';
    loading.classList.add('active');

    try {
        const img = await loadImage(file);
        currentImage = img;

        // Draw on canvas
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.classList.add('active');

        // Show original size
        document.getElementById('original-size').textContent = formatBytes(file.size);
        document.getElementById('format').textContent = formatSelect.value.toUpperCase();

        loading.classList.remove('active');
        compressBtn.disabled = false;
        stats.style.display = 'grid';

        showToast('Image loaded! Adjust settings and compress', 'success');

    } catch (error) {
        loading.classList.remove('active');
        showToast('Error loading image: ' + error.message, 'error');
    }
}

// Compress button
compressBtn.addEventListener('click', async () => {
    if (!currentImage) return;

    loading.classList.add('active');
    compressBtn.disabled = true;

    setTimeout(() => {
        const quality = qualitySlider.value / 100;
        const format = formatSelect.value;
        let mimeType = 'image/jpeg';

        if (format === 'png') mimeType = 'image/png';
        else if (format === 'webp') mimeType = 'image/webp';

        canvas.toBlob((blob) => {
            processedBlob = blob;

            // Update stats
            document.getElementById('compressed-size').textContent = formatBytes(blob.size);
            const reduction = ((1 - blob.size / originalFile.size) * 100).toFixed(1);
            document.getElementById('reduction').textContent = reduction + '%';
            document.getElementById('format').textContent = format.toUpperCase();

            loading.classList.remove('active');
            downloadBtn.style.display = 'block';
            resetBtn.style.display = 'block';
            compressBtn.textContent = '✅ Compressed!';

            showToast(`Compressed! Reduced by ${reduction}%`, 'success');

        }, mimeType, quality);
    }, 500);
});

// Download button
downloadBtn.addEventListener('click', () => {
    if (!processedBlob) return;

    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    const ext = formatSelect.value === 'jpeg' ? 'jpg' : formatSelect.value;
    a.download = `compressed-image.${ext}`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Download started!', 'success');
});

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toast.className = `toast ${type} active`;
    toastMessage.textContent = message;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}
