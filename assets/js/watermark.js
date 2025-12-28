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

const watermarkText = document.getElementById('watermarkText');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const opacity = document.getElementById('opacity');
const opacityValue = document.getElementById('opacityValue');
const position = document.getElementById('position');
const textColor = document.getElementById('textColor');

fontSize.addEventListener('input', (e) => {
    fontSizeValue.textContent = e.target.value;
});

opacity.addEventListener('input', (e) => {
    opacityValue.textContent = e.target.value;
});

processBtn.addEventListener('click', async () => {
    processBtn.disabled = true;
    processBtn.innerHTML = '<span class="loading"></span> Adding Watermark...';
    processedImages = [];

    for (let file of selectedFiles) {
        try {
            const processed = await addWatermark(file);
            processedImages.push({
                original: file,
                processed: processed,
                originalSize: file.size,
                processedSize: processed.size
            });
        } catch (error) {
            console.error('Watermark error:', error);
        }
    }

    displayResults('watermarked');
    settingsSection.style.display = 'none';
    resultsSection.style.display = 'block';
    processBtn.disabled = false;
    processBtn.textContent = 'Process Images';
});

function addWatermark(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                // Set watermark style
                const size = parseInt(fontSize.value);
                ctx.font = `bold ${size}px Arial`;
                ctx.fillStyle = textColor.value;
                ctx.globalAlpha = opacity.value / 100;

                const text = watermarkText.value;
                const metrics = ctx.measureText(text);

                // Position calculation
                let x, y;
                const padding = 20;

                switch(position.value) {
                    case 'top-left':
                        x = padding;
                        y = size + padding;
                        break;
                    case 'top-right':
                        x = canvas.width - metrics.width - padding;
                        y = size + padding;
                        break;
                    case 'bottom-left':
                        x = padding;
                        y = canvas.height - padding;
                        break;
                    case 'bottom-right':
                        x = canvas.width - metrics.width - padding;
                        y = canvas.height - padding;
                        break;
                    default: // center
                        x = (canvas.width - metrics.width) / 2;
                        y = canvas.height / 2;
                }

                ctx.fillText(text, x, y);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], 'watermarked_' + file.name, { type: file.type }));
                }, file.type, 0.95);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
