let originalImage = null;
let originalFile = null;
let cropArea = { x: 0, y: 0, width: 0, height: 0 };
let isSelecting = false;
let startX, startY;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const canvas = document.getElementById('canvas');
const cropBtn = document.getElementById('cropBtn');
const downloadBtn = document.getElementById('downloadBtn');

setupDragAndDrop(uploadArea, fileInput, handleFileSelect);

function handleFileSelect(file) {
    if (!validateImage(file)) return;

    originalFile = file;

    loadImageToCanvas(file, canvas, (img) => {
        originalImage = img;
        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = true;
        cropBtn.disabled = true;
        setupCropSelection();
    });
}

function setupCropSelection() {
    const ctx = canvas.getContext('2d');

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        isSelecting = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isSelecting) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        cropArea = {
            x: Math.min(startX, currentX),
            y: Math.min(startY, currentY),
            width: Math.abs(currentX - startX),
            height: Math.abs(currentY - startY)
        };

        drawCropOverlay();
    });

    canvas.addEventListener('mouseup', () => {
        isSelecting = false;
        if (cropArea.width > 10 && cropArea.height > 10) {
            cropBtn.disabled = false;
        }
    });
}

function drawCropOverlay() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.drawImage(originalImage, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 
                  cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
}

function setAspectRatio(ratio) {
    alert('Select crop area with ' + ratio + ' aspect ratio');
}

cropBtn.addEventListener('click', () => {
    if (cropArea.width === 0 || cropArea.height === 0) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(canvas, cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                      0, 0, cropArea.width, cropArea.height);

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(tempCanvas, 0, 0);

    downloadBtn.disabled = false;
    cropBtn.disabled = true;
});

downloadBtn.addEventListener('click', () => {
    const filename = 'cropped-' + (originalFile.name || 'image.png');
    downloadImage(canvas, filename);
});