let originalFile = null;
let originalSize = 0;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('canvas');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');
const infoText = document.getElementById('infoText');

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
});

setupDragAndDrop(uploadArea, fileInput, handleFileSelect);

function handleFileSelect(file) {
    if (!validateImage(file)) return;

    originalFile = file;
    originalSize = file.size;

    loadImageToCanvas(file, canvas, () => {
        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = true;
        infoText.textContent = `Original size: ${formatFileSize(originalSize)}`;
    });
}

compressBtn.addEventListener('click', () => {
    const quality = qualitySlider.value / 100;

    canvas.toBlob((blob) => {
        const compressedSize = blob.size;
        const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        infoText.textContent = `Original: ${formatFileSize(originalSize)} → Compressed: ${formatFileSize(compressedSize)} (${reduction}% reduction)`;
        downloadBtn.disabled = false;
    }, 'image/jpeg', quality);
});

downloadBtn.addEventListener('click', () => {
    const quality = qualitySlider.value / 100;
    const filename = 'compressed-' + (originalFile.name.replace(/\.[^/.]+$/, '') || 'image') + '.jpg';
    downloadImage(canvas, filename, 'image/jpeg', quality);
});