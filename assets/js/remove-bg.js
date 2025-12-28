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

const bgCanvas = document.getElementById('bgCanvas');
const tolerance = document.getElementById('tolerance');
const toleranceValue = document.getElementById('toleranceValue');

let currentImage = null;
let bgCtx = null;

tolerance.addEventListener('input', (e) => {
    toleranceValue.textContent = e.target.value;
});

processBtn.addEventListener('click', () => {
    if (selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
        img.onload = () => {
            currentImage = img;
            const maxWidth = settingsSection.offsetWidth - 50;
            const scale = Math.min(maxWidth / img.width, 1);

            bgCanvas.width = img.width * scale;
            bgCanvas.height = img.height * scale;

            bgCtx = bgCanvas.getContext('2d');
            bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);

            setupRemoveBg();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

function setupRemoveBg() {
    bgCanvas.addEventListener('click', (e) => {
        const rect = bgCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        removeBackground(x, y);
    });

    const finishBtn = document.createElement('button');
    finishBtn.textContent = 'Finish & Download';
    finishBtn.className = 'primary-btn';
    finishBtn.style.marginTop = '1rem';
    finishBtn.onclick = finishRemoveBg;
    settingsSection.appendChild(finishBtn);
}

function removeBackground(x, y) {
    const imageData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height);
    const targetColor = bgCtx.getImageData(x, y, 1, 1).data;
    const tol = parseInt(tolerance.value);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        if (Math.abs(r - targetColor[0]) < tol &&
            Math.abs(g - targetColor[1]) < tol &&
            Math.abs(b - targetColor[2]) < tol) {
            imageData.data[i + 3] = 0;
        }
    }

    bgCtx.putImageData(imageData, 0, 0);
}

function finishRemoveBg() {
    bgCanvas.toBlob((blob) => {
        const file = new File([blob], 'no-bg_' + selectedFiles[0].name, { type: 'image/png' });
        processedImages = [{
            original: selectedFiles[0],
            processed: file,
            originalSize: selectedFiles[0].size,
            processedSize: file.size
        }];

        displayResults('no-bg');
        settingsSection.style.display = 'none';
        resultsSection.style.display = 'block';
    }, 'image/png');
}
