// Compress IMAGE Tool - Professional iLoveIMG Style
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const workArea = document.getElementById('work-area');
const loadingOverlay = document.getElementById('loading-overlay');

const thumbnailImg = document.getElementById('thumbnail-img');
const imageName = document.getElementById('image-name');
const originalSizeEl = document.getElementById('original-size');
const compressedSizeEl = document.getElementById('compressed-size');
const reductionBadge = document.getElementById('reduction-badge');
const reductionText = document.getElementById('reduction-text');

const qualitySlider = document.getElementById('quality-slider');
const qualityDisplay = document.getElementById('quality-display');
const formatSelect = document.getElementById('format-select');
const compressBtn = document.getElementById('compress-btn');
const downloadBtn = document.getElementById('download-btn');

let currentImage = null;
let originalFile = null;
let processedBlob = null;

// Drag and Drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

uploadZone.addEventListener('click', () => {
    fileInput.click();
});

// File Input Change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Quality Slider
qualitySlider.addEventListener('input', (e) => {
    qualityDisplay.textContent = e.target.value + '%';
});

// Handle File Upload
async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    originalFile = file;

    loadingOverlay.style.display = 'flex';

    try {
        // Load image
        const img = await loadImage(file);
        currentImage = img;

        // Create thumbnail (max 300px)
        const thumbnail = await createThumbnail(img, 300);
        thumbnailImg.src = thumbnail;

        // Display file info
        imageName.textContent = file.name;
        const sizeKB = (file.size / 1024).toFixed(2);
        originalSizeEl.textContent = sizeKB + ' KB';

        // Hide upload zone, show work area
        uploadZone.style.display = 'none';
        workArea.style.display = 'grid';
        loadingOverlay.style.display = 'none';

    } catch (error) {
        alert('Error loading image: ' + error.message);
        loadingOverlay.style.display = 'none';
    }
}

// Create Thumbnail
function createThumbnail(img, maxSize) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // Calculate thumbnail size
        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
}

// Compress Image
window.compressImage = async function() {
    const quality = qualitySlider.value / 100;
    const format = formatSelect.value;

    compressBtn.disabled = true;
    compressBtn.textContent = 'Compressing...';
    loadingOverlay.style.display = 'flex';

    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = currentImage.width;
        canvas.height = currentImage.height;
        ctx.drawImage(currentImage, 0, 0);

        let mimeType = 'image/jpeg';
        if (format === 'png') mimeType = 'image/png';
        else if (format === 'webp') mimeType = 'image/webp';

        canvas.toBlob((blob) => {
            processedBlob = blob;

            // Calculate sizes
            const originalSize = (originalFile.size / 1024).toFixed(2);
            const compressedSize = (blob.size / 1024).toFixed(2);
            const reduction = ((1 - blob.size / originalFile.size) * 100).toFixed(0);

            // Update UI
            compressedSizeEl.textContent = compressedSize + ' KB';
            reductionText.textContent = '-' + reduction + '%';
            reductionBadge.style.display = 'block';

            // Show download button
            downloadBtn.style.display = 'block';
            compressBtn.textContent = 'Compress IMAGE';
            compressBtn.disabled = false;

            loadingOverlay.style.display = 'none';
        }, mimeType, quality);
    }, 800);
};

// Download Image
window.downloadImage = function() {
    if (processedBlob) {
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        const format = formatSelect.value;
        const ext = format === 'jpeg' ? 'jpg' : format;
        a.download = `compressed-${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// Load Image Helper
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
