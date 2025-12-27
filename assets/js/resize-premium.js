// Premium Resize Tool
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const resizeBtn = document.getElementById('resize-btn');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const widthSlider = document.getElementById('width-slider');
const heightSlider = document.getElementById('height-slider');
const widthValue = document.getElementById('width-value');
const heightValue = document.getElementById('height-value');
const maintainRatio = document.getElementById('maintain-ratio');
const uploadPrompt = document.getElementById('upload-prompt');
const loading = document.getElementById('loading');
const stats = document.getElementById('stats');
const canvasWrapper = document.querySelector('.canvas-wrapper');

let currentImage = null;
let aspectRatio = 1;
let processedBlob = null;

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

canvasWrapper.addEventListener('click', () => {
    if (!currentImage) fileInput.click();
});

widthSlider.addEventListener('input', (e) => {
    widthValue.textContent = e.target.value;
    if (maintainRatio.checked && currentImage) {
        const newHeight = Math.round(e.target.value / aspectRatio);
        heightSlider.value = newHeight;
        heightValue.textContent = newHeight;
    }
    updatePreview();
});

heightSlider.addEventListener('input', (e) => {
    heightValue.textContent = e.target.value;
    if (maintainRatio.checked && currentImage) {
        const newWidth = Math.round(e.target.value * aspectRatio);
        widthSlider.value = newWidth;
        widthValue.textContent = newWidth;
    }
    updatePreview();
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
        aspectRatio = img.width / img.height;

        widthSlider.max = img.width * 3;
        widthSlider.value = img.width;
        widthValue.textContent = img.width;

        heightSlider.max = img.height * 3;
        heightSlider.value = img.height;
        heightValue.textContent = img.height;

        document.getElementById('original-dims').textContent = `${img.width} x ${img.height}`;
        document.getElementById('new-dims').textContent = `${img.width} x ${img.height}`;

        updatePreview();

        loading.classList.remove('active');
        canvas.classList.add('active');
        resizeBtn.disabled = false;
        stats.style.display = 'grid';

        showToast('Image loaded! Adjust dimensions', 'success');

    } catch (error) {
        loading.classList.remove('active');
        showToast('Error: ' + error.message, 'error');
    }
}

function updatePreview() {
    if (!currentImage) return;

    const newWidth = parseInt(widthSlider.value);
    const newHeight = parseInt(heightSlider.value);

    document.getElementById('new-dims').textContent = `${newWidth} x ${newHeight}`;

    // Preview with max dimensions
    const maxW = 800, maxH = 600;
    let previewW = newWidth, previewH = newHeight;
    if (newWidth > maxW || newHeight > maxH) {
        const ratio = Math.min(maxW / newWidth, maxH / newHeight);
        previewW = newWidth * ratio;
        previewH = newHeight * ratio;
    }

    canvas.width = previewW;
    canvas.height = previewH;
    ctx.drawImage(currentImage, 0, 0, previewW, previewH);
}

resizeBtn.addEventListener('click', () => {
    if (!currentImage) return;

    loading.classList.add('active');
    resizeBtn.disabled = true;

    setTimeout(() => {
        const newWidth = parseInt(widthSlider.value);
        const newHeight = parseInt(heightSlider.value);

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        tempCtx.drawImage(currentImage, 0, 0, newWidth, newHeight);

        tempCanvas.toBlob((blob) => {
            processedBlob = blob;
            loading.classList.remove('active');
            downloadBtn.style.display = 'block';
            resetBtn.style.display = 'block';
            resizeBtn.textContent = '✅ Resized!';
            showToast(`Resized to ${newWidth}x${newHeight}!`, 'success');
        }, 'image/png');
    }, 500);
});

downloadBtn.addEventListener('click', () => {
    if (!processedBlob) return;
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resized-image.png';
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
