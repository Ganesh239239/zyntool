let originalImage = null;
let originalFile = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('canvas');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const aspectRatioCheckbox = document.getElementById('aspectRatio');
const resizeBtn = document.getElementById('resizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const infoText = document.getElementById('infoText');

setupDragAndDrop(uploadArea, fileInput, handleFileSelect);

function handleFileSelect(file) {
    if (!validateImage(file)) return;

    originalFile = file;

    loadImageToCanvas(file, canvas, (img) => {
        originalImage = img;
        widthInput.value = img.width;
        heightInput.value = img.height;

        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = true;
        infoText.textContent = `Original size: ${img.width} × ${img.height}px`;
    });
}

widthInput.addEventListener('input', () => {
    if (aspectRatioCheckbox.checked && originalImage) {
        const ratio = originalImage.height / originalImage.width;
        heightInput.value = Math.round(widthInput.value * ratio);
    }
});

heightInput.addEventListener('input', () => {
    if (aspectRatioCheckbox.checked && originalImage) {
        const ratio = originalImage.width / originalImage.height;
        widthInput.value = Math.round(heightInput.value * ratio);
    }
});

resizeBtn.addEventListener('click', () => {
    if (!originalImage) return;

    const newWidth = parseInt(widthInput.value);
    const newHeight = parseInt(heightInput.value);

    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

    infoText.textContent = `Resized to: ${newWidth} × ${newHeight}px`;
    downloadBtn.disabled = false;
});

downloadBtn.addEventListener('click', () => {
    const filename = 'resized-' + (originalFile.name || 'image.png');
    downloadImage(canvas, filename);
});