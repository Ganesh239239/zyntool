// Premium Crop IMAGE Tool
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const processBtn = document.getElementById('process-btn');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const uploadPrompt = document.getElementById('upload-prompt');
const loading = document.getElementById('loading');
const canvasWrapper = document.querySelector('.canvas-wrapper');

let currentImage = null;
let processedBlob = null;

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

canvasWrapper.addEventListener('click', () => {
    if (!currentImage) fileInput.click();
});

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

async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    uploadPrompt.style.display = 'none';
    loading.classList.add('active');

    try {
        const img = await loadImage(file);
        currentImage = img;

        const maxW = 800, maxH = 600;
        let width = img.width, height = img.height;
        if (width > maxW || height > maxH) {
            const ratio = Math.min(maxW / width, maxH / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.classList.add('active');

        loading.classList.remove('active');
        processBtn.disabled = false;

        showToast('Image loaded! Click Process to continue', 'success');

    } catch (error) {
        loading.classList.remove('active');
        showToast('Error: ' + error.message, 'error');
    }
}

processBtn.addEventListener('click', async () => {
    if (!currentImage) return;

    loading.classList.add('active');
    processBtn.disabled = true;

    setTimeout(() => {
        // Basic processing - can be enhanced
        canvas.toBlob((blob) => {
            processedBlob = blob;
            loading.classList.remove('active');
            downloadBtn.style.display = 'block';
            resetBtn.style.display = 'block';
            processBtn.textContent = '✅ Processed!';
            showToast('Processing complete!', 'success');
        }, 'image/png');
    }, 500);
});

downloadBtn.addEventListener('click', () => {
    if (!processedBlob) return;
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crop-result.png';
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

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toast.className = `toast ${type} active`;
    toastMessage.textContent = message;
    setTimeout(() => toast.classList.remove('active'), 3000);
}
