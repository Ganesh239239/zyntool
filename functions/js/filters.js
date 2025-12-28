let originalImage = null;
let originalFile = null;

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
        controls.classList.add('active');
        previewArea.classList.add('active');
        downloadBtn.disabled = false;
    });
}

function applyFilter(filterType) {
    if (!originalImage) return;

    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch(filterType) {
        case 'original':
            ctx.drawImage(originalImage, 0, 0);
            return;

        case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            break;

        case 'sepia':
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            }
            break;

        case 'invert':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;

        case 'brightness':
            const brightnessAmount = 50;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] + brightnessAmount);
                data[i + 1] = Math.min(255, data[i + 1] + brightnessAmount);
                data[i + 2] = Math.min(255, data[i + 2] + brightnessAmount);
            }
            break;

        case 'darken':
            const darkenAmount = 50;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.max(0, data[i] - darkenAmount);
                data[i + 1] = Math.max(0, data[i + 1] - darkenAmount);
                data[i + 2] = Math.max(0, data[i + 2] - darkenAmount);
            }
            break;

        case 'blur':
            ctx.filter = 'blur(5px)';
            ctx.drawImage(originalImage, 0, 0);
            ctx.filter = 'none';
            return;

        case 'sharpen':
            // Simple sharpen approximation
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.2);
                data[i + 1] = Math.min(255, data[i + 1] * 1.2);
                data[i + 2] = Math.min(255, data[i + 2] * 1.2);
            }
            break;
    }

    ctx.putImageData(imageData, 0, 0);
}

downloadBtn.addEventListener('click', () => {
    const filename = 'filtered-' + (originalFile.name || 'image.png');
    downloadImage(canvas, filename);
});