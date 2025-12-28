let originalImage = null;
let originalFile = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('canvas');
const watermarkText = document.getElementById('watermarkText');
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const opacitySlider = document.getElementById('opacity');
const opacityValue = document.getElementById('opacityValue');
const positionSelect = document.getElementById('position');
const applyBtn = document.getElementById('applyBtn');
const downloadBtn = document.getElementById('downloadBtn');

setupDragAndDrop(uploadArea, fileInput, handleFileSelect);

fontSizeSlider.addEventListener('input', (e) => {
    fontSizeValue.textContent = e.target.value;
});

opacitySlider.addEventListener('input', (e) => {
    opacityValue.textContent = e.target.value;
});

function handleFileSelect(file) {
    if (!validateImage(file)) return;

    originalFile = file;

    loadImageToCanvas(file, canvas, (img) => {
        originalImage = img;
        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = true;
    });
}

applyBtn.addEventListener('click', () => {
    if (!originalImage) return;

    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    ctx.drawImage(originalImage, 0, 0);

    const text = watermarkText.value;
    const fontSize = parseInt(fontSizeSlider.value);
    const opacity = parseInt(opacitySlider.value) / 100;
    const position = positionSelect.value;

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
    ctx.lineWidth = 2;

    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    let x, y;
    const padding = 20;

    switch(position) {
        case 'center':
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
            break;
        case 'top-left':
            x = padding;
            y = textHeight + padding;
            break;
        case 'top-right':
            x = canvas.width - textWidth - padding;
            y = textHeight + padding;
            break;
        case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            break;
        case 'bottom-right':
            x = canvas.width - textWidth - padding;
            y = canvas.height - padding;
            break;
    }

    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);

    downloadBtn.disabled = false;
});

downloadBtn.addEventListener('click', () => {
    const filename = 'watermarked-' + (originalFile.name || 'image.png');
    downloadImage(canvas, filename);
});