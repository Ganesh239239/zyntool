let originalFile = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('canvas');
const formatSelect = document.getElementById('format');
const qualityGroup = document.getElementById('qualityGroup');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const infoText = document.getElementById('infoText');

setupDragAndDrop(uploadArea, fileInput, handleFileSelect);

formatSelect.addEventListener('change', () => {
    const format = formatSelect.value;
    if (format === 'image/jpeg' || format === 'image/webp') {
        qualityGroup.style.display = 'block';
    } else {
        qualityGroup.style.display = 'none';
    }
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
});

function handleFileSelect(file) {
    if (!validateImage(file)) return;

    originalFile = file;

    loadImageToCanvas(file, canvas, () => {
        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = true;

        const ext = file.name.split('.').pop().toUpperCase();
        infoText.textContent = `Original format: ${ext} (${formatFileSize(file.size)})`;
    });
}

convertBtn.addEventListener('click', () => {
    const format = formatSelect.value;
    const quality = qualitySlider.value / 100;

    canvas.toBlob((blob) => {
        const newFormat = format.split('/')[1].toUpperCase();
        infoText.textContent = `Converted to ${newFormat} (${formatFileSize(blob.size)})`;
        downloadBtn.disabled = false;
    }, format, quality);
});

downloadBtn.addEventListener('click', () => {
    const format = formatSelect.value;
    const quality = qualitySlider.value / 100;
    const ext = format.split('/')[1];
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '') || 'image';
    const filename = `converted-${baseName}.${ext}`;

    downloadImage(canvas, filename, format, quality);
});