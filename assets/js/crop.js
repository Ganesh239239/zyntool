let selectedFiles = [];
let processedImages = [];

const imageInput = document.getElementById('imageInput');
const uploadSection = document.getElementById('uploadSection');
const uploadBox = document.getElementById('uploadBox');
const settingsSection = document.getElementById('settingsSection');
const resultsSection = document.getElementById('resultsSection');
const processBtn = document.getElementById('processBtn');
const resultsContainer = document.getElementById('resultsContainer');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const resetBtn = document.getElementById('resetBtn');

imageInput.addEventListener('change', (e) => {
    handleFiles(Array.from(e.target.files));
});

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleFiles(files);
});

function handleFiles(files) {
    if (files.length > 0) {
        selectedFiles = files;
        settingsSection.style.display = 'block';
        uploadSection.style.display = 'none';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function downloadSingle(index) {
    const item = processedImages[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.processed);
    link.download = item.processed.name;
    link.click();
}

downloadAllBtn.addEventListener('click', async () => {
    if (processedImages.length === 1) {
        downloadSingle(0);
    } else {
        const zip = new JSZip();
        processedImages.forEach((item) => {
            zip.file(item.processed.name, item.processed);
        });
        const content = await zip.generateAsync({type: 'blob'});
        saveAs(content, 'processed_images.zip');
    }
});

resetBtn.addEventListener('click', () => {
    selectedFiles = [];
    processedImages = [];
    imageInput.value = '';
    resultsSection.style.display = 'none';
    uploadSection.style.display = 'block';
});

function displayResults(prefix = 'processed') {
    resultsContainer.innerHTML = '';

    processedImages.forEach((item, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';

        const imgURL = URL.createObjectURL(item.processed);

        resultDiv.innerHTML = `
            <div class="result-preview">
                <img src="${imgURL}" alt="Result">
            </div>
            <div class="result-info">
                <h4>${item.processed.name}</h4>
                <div class="size-comparison">
                    <span class="size-badge original">Original: ${formatFileSize(item.originalSize)}</span>
                    <span class="size-badge processed">Processed: ${formatFileSize(item.processedSize)}</span>
                </div>
                <button class="primary-btn download-single" data-index="${index}">Download</button>
            </div>
        `;

        resultsContainer.appendChild(resultDiv);
    });

    document.querySelectorAll('.download-single').forEach(btn => {
        btn.addEventListener('click', (e) => {
            downloadSingle(e.target.dataset.index);
        });
    });
}

const aspectRatio = document.getElementById('aspectRatio');
const cropCanvas = document.getElementById('cropCanvas');
let currentImage = null;
let cropData = { x: 0, y: 0, width: 0, height: 0 };

processBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    // Show canvas for first image
    const file = selectedFiles[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
        img.onload = () => {
            currentImage = img;
            const maxWidth = settingsSection.offsetWidth - 50;
            const scale = maxWidth / img.width;

            cropCanvas.width = img.width * scale;
            cropCanvas.height = img.height * scale;

            const ctx = cropCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0, cropCanvas.width, cropCanvas.height);

            setupCropSelection();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

function setupCropSelection() {
    // Simple crop: click to start, drag to define area
    let isDrawing = false;
    let startX, startY;

    cropCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = cropCanvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    });

    cropCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = cropCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Redraw image
        const ctx = cropCanvas.getContext('2d');
        ctx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
        ctx.drawImage(currentImage, 0, 0, cropCanvas.width, cropCanvas.height);

        // Draw selection
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, x - startX, y - startY);
    });

    cropCanvas.addEventListener('mouseup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;

        const rect = cropCanvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const scale = currentImage.width / cropCanvas.width;
        cropData = {
            x: Math.min(startX, endX) * scale,
            y: Math.min(startY, endY) * scale,
            width: Math.abs(endX - startX) * scale,
            height: Math.abs(endY - startY) * scale
        };

        processCrop();
    });
}

async function processCrop() {
    processedImages = [];

    for (let file of selectedFiles) {
        try {
            const processed = await cropImage(file);
            processedImages.push({
                original: file,
                processed: processed,
                originalSize: file.size,
                processedSize: processed.size
            });
        } catch (error) {
            console.error('Crop error:', error);
        }
    }

    displayResults('cropped');
    settingsSection.style.display = 'none';
    resultsSection.style.display = 'block';
}

function cropImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = cropData.width;
                canvas.height = cropData.height;

                ctx.drawImage(img, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, cropData.width, cropData.height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], 'cropped_' + file.name, { type: file.type }));
                }, file.type, 0.95);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
