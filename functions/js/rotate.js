let originalImage = null;
let originalFile = null;
let currentRotation = 0;
let flipH = false;
let flipV = false;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('canvas');
const downloadBtn = document.getElementById('downloadBtn');

setupDragAndDrop(uploadArea, fileInput, handleFileSelect);

function handleFileSelect(file) {
    if (!validateImage(file)) return;

    originalFile = file;

    loadImageToCanvas(file, canvas, (img) => {
        originalImage = img;
        currentRotation = 0;
        flipH = false;
        flipV = false;

        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = false;
    });
}

function rotate(degrees) {
    if (!originalImage) return;

    currentRotation = (currentRotation + degrees) % 360;
    applyTransform();
}

function flipHorizontal() {
    if (!originalImage) return;
    flipH = !flipH;
    applyTransform();
}

function flipVertical() {
    if (!originalImage) return;
    flipV = !flipV;
    applyTransform();
}

function applyTransform() {
    const ctx = canvas.getContext('2d');

    if (currentRotation === 90 || currentRotation === 270) {
        canvas.width = originalImage.height;
        canvas.height = originalImage.width;
    } else {
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(currentRotation * Math.PI / 180);

    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
    ctx.restore();
}

downloadBtn.addEventListener('click', () => {
    const filename = 'rotated-' + (originalFile.name || 'image.png');
    downloadImage(canvas, filename);
});