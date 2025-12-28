let originalImage = null;
let originalFile = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('canvas');
const toleranceSlider = document.getElementById('tolerance');
const toleranceValue = document.getElementById('toleranceValue');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

setupDragAndDrop(uploadArea, fileInput, handleFileSelect);

toleranceSlider.addEventListener('input', (e) => {
    toleranceValue.textContent = e.target.value;
});

function handleFileSelect(file) {
    if (!validateImage(file)) return;

    originalFile = file;

    loadImageToCanvas(file, canvas, (img) => {
        originalImage = img;
        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = true;

        canvas.addEventListener('click', removeBackground);
    });
}

function removeBackground(e) {
    if (!originalImage) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const index = (y * canvas.width + x) * 4;
    const targetR = data[index];
    const targetG = data[index + 1];
    const targetB = data[index + 2];

    const tolerance = parseInt(toleranceSlider.value);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diff = Math.sqrt(
            Math.pow(r - targetR, 2) +
            Math.pow(g - targetG, 2) +
            Math.pow(b - targetB, 2)
        );

        if (diff <= tolerance) {
            data[i + 3] = 0; // Make transparent
        }
    }

    ctx.putImageData(imageData, 0, 0);
    downloadBtn.disabled = false;
}

resetBtn.addEventListener('click', () => {
    if (!originalImage) return;

    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    downloadBtn.disabled = true;
});

downloadBtn.addEventListener('click', () => {
    const filename = 'no-background-' + (originalFile.name.replace(/\.[^/.]+$/, '') || 'image') + '.png';
    downloadImage(canvas, filename, 'image/png');
});