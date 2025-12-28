let selectedFiles = [];
let compressedImages = [];

const imageInput = document.getElementById('imageInput');
const uploadSection = document.getElementById('uploadSection');
const uploadBox = document.getElementById('uploadBox');
const settingsSection = document.getElementById('settingsSection');
const resultsSection = document.getElementById('resultsSection');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const maxWidthInput = document.getElementById('maxWidth');
const compressBtn = document.getElementById('compressBtn');
const resultsContainer = document.getElementById('resultsContainer');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const resetBtn = document.getElementById('resetBtn');

// Quality slider update
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value;
});

// File input change
imageInput.addEventListener('change', (e) => {
    handleFiles(Array.from(e.target.files));
});

// Drag and drop
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

// Compress images
compressBtn.addEventListener('click', async () => {
    compressBtn.disabled = true;
    compressBtn.innerHTML = '<span class="loading"></span> Compressing...';
    compressedImages = [];

    const quality = qualitySlider.value / 100;
    const maxWidth = maxWidthInput.value ? parseInt(maxWidthInput.value) : null;

    for (let file of selectedFiles) {
        try {
            const compressed = await compressImage(file, quality, maxWidth);
            compressedImages.push({
                original: file,
                compressed: compressed,
                originalSize: file.size,
                compressedSize: compressed.size
            });
        } catch (error) {
            console.error('Compression error:', error);
        }
    }

    displayResults();
    settingsSection.style.display = 'none';
    resultsSection.style.display = 'block';
    compressBtn.disabled = false;
    compressBtn.textContent = 'Compress Images';
});

function compressImage(file, quality, maxWidth) {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: quality,
            maxWidth: maxWidth,
            mimeType: file.type,
            success(result) {
                resolve(result);
            },
            error(err) {
                reject(err);
            },
        });
    });
}

function displayResults() {
    resultsContainer.innerHTML = '';

    compressedImages.forEach((item, index) => {
        const savings = ((1 - item.compressedSize / item.originalSize) * 100).toFixed(1);
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';

        const imgURL = URL.createObjectURL(item.compressed);

        resultDiv.innerHTML = `
            <div class="result-preview">
                <img src="${imgURL}" alt="Compressed">
            </div>
            <div class="result-info">
                <h4>${item.original.name}</h4>
                <div class="size-comparison">
                    <span class="size-badge original">Original: ${formatFileSize(item.originalSize)}</span>
                    <span class="size-badge compressed">Compressed: ${formatFileSize(item.compressedSize)}</span>
                </div>
                <p class="savings">✓ Saved ${savings}% (${formatFileSize(item.originalSize - item.compressedSize)} reduced)</p>
                <button class="primary-btn download-single" data-index="${index}">Download</button>
            </div>
        `;

        resultsContainer.appendChild(resultDiv);
    });

    // Add download event listeners
    document.querySelectorAll('.download-single').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            downloadSingle(index);
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
    const item = compressedImages[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.compressed);
    link.download = 'compressed_' + item.original.name;
    link.click();
}

downloadAllBtn.addEventListener('click', async () => {
    if (compressedImages.length === 1) {
        downloadSingle(0);
    } else {
        downloadAllBtn.disabled = true;
        downloadAllBtn.innerHTML = '<span class="loading"></span> Creating ZIP...';

        const zip = new JSZip();
        compressedImages.forEach((item, index) => {
            zip.file('compressed_' + item.original.name, item.compressed);
        });
        const content = await zip.generateAsync({type: 'blob'});
        saveAs(content, 'compressed_images.zip');

        downloadAllBtn.disabled = false;
        downloadAllBtn.textContent = 'Download All';
    }
});

resetBtn.addEventListener('click', () => {
    selectedFiles = [];
    compressedImages = [];
    imageInput.value = '';
    resultsSection.style.display = 'none';
    uploadSection.style.display = 'block';
});