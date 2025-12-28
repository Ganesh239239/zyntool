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

const pixelRadio = document.querySelector('input[value="pixels"]');
const percentageRadio = document.querySelector('input[value="percentage"]');
const pixelsOptions = document.getElementById('pixelsOptions');
const percentageOptions = document.getElementById('percentageOptions');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const maintainRatio = document.getElementById('maintainRatio');
const percentageSlider = document.getElementById('percentageSlider');
const percentageValue = document.getElementById('percentageValue');

// Mode switching
pixelRadio.addEventListener('change', () => {
    pixelsOptions.style.display = 'block';
    percentageOptions.style.display = 'none';
});

percentageRadio.addEventListener('change', () => {
    pixelsOptions.style.display = 'none';
    percentageOptions.style.display = 'block';
});

percentageSlider.addEventListener('input', (e) => {
    percentageValue.textContent = e.target.value;
});

// File handling
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

// Process images
processBtn.addEventListener('click', async () => {
    processBtn.disabled = true;
    processBtn.innerHTML = '<span class="loading"></span> Resizing...';
    processedImages = [];

    const mode = document.querySelector('input[name="resizeMode"]:checked').value;

    for (let file of selectedFiles) {
        try {
            const resized = await resizeImage(file, mode);
            processedImages.push({
                original: file,
                processed: resized,
                originalSize: file.size,
                processedSize: resized.size
            });
        } catch (error) {
            console.error('Resize error:', error);
        }
    }

    displayResults();
    settingsSection.style.display = 'none';
    resultsSection.style.display = 'block';
    processBtn.disabled = false;
    processBtn.textContent = 'Process Images';
});

function resizeImage(file, mode) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let newWidth, newHeight;

                if (mode === 'pixels') {
                    const targetWidth = parseInt(widthInput.value) || img.width;
                    const targetHeight = parseInt(heightInput.value) || img.height;

                    if (maintainRatio.checked) {
                        const ratio = Math.min(targetWidth / img.width, targetHeight / img.height);
                        newWidth = img.width * ratio;
                        newHeight = img.height * ratio;
                    } else {
                        newWidth = targetWidth;
                        newHeight = targetHeight;
                    }
                } else {
                    const scale = percentageSlider.value / 100;
                    newWidth = img.width * scale;
                    newHeight = img.height * scale;
                }

                canvas.width = newWidth;
                canvas.height = newHeight;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: file.type }));
                }, file.type, 0.95);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function displayResults() {
    resultsContainer.innerHTML = '';

    processedImages.forEach((item, index) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';

        const imgURL = URL.createObjectURL(item.processed);

        resultDiv.innerHTML = `
            <div class="result-preview">
                <img src="${imgURL}" alt="Resized">
            </div>
            <div class="result-info">
                <h4>${item.original.name}</h4>
                <div class="size-comparison">
                    <span class="size-badge original">Original: ${formatFileSize(item.originalSize)}</span>
                    <span class="size-badge processed">Resized: ${formatFileSize(item.processedSize)}</span>
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
    link.download = 'resized_' + item.original.name;
    link.click();
}

downloadAllBtn.addEventListener('click', async () => {
    if (processedImages.length === 1) {
        downloadSingle(0);
    } else {
        const zip = new JSZip();
        processedImages.forEach((item) => {
            zip.file('resized_' + item.original.name, item.processed);
        });
        const content = await zip.generateAsync({type: 'blob'});
        saveAs(content, 'resized_images.zip');
    }
});

resetBtn.addEventListener('click', () => {
    selectedFiles = [];
    processedImages = [];
    imageInput.value = '';
    resultsSection.style.display = 'none';
    uploadSection.style.display = 'block';
});