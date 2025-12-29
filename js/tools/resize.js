// Global variables
let originalImage = null;
let aspectRatioLocked = false;
let originalAspectRatio = 1;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const originalPreview = document.getElementById('originalPreview');
const resizedCanvas = document.getElementById('resizedCanvas');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const lockAspectRatio = document.getElementById('lockAspectRatio');
const resizeMethod = document.getElementById('resizeMethod');
const dimensionsGroup = document.getElementById('dimensionsGroup');
const percentageGroup = document.getElementById('percentageGroup');
const presetGroup = document.getElementById('presetGroup');
const percentSlider = document.getElementById('percentSlider');
const percentValue = document.getElementById('percentValue');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('formatSelect');
const resizeBtn = document.getElementById('resizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');
const originalInfo = document.getElementById('originalInfo');
const resizedInfo = document.getElementById('resizedInfo');

// Upload area events
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
});

// Handle image upload
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            originalPreview.src = e.target.result;
            widthInput.value = originalImage.width;
            heightInput.value = originalImage.height;
            originalAspectRatio = originalImage.width / originalImage.height;
            
            controls.style.display = 'block';
            
            displayImageInfo(originalImage, originalInfo, file.size);
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Aspect ratio lock
lockAspectRatio.addEventListener('click', () => {
    aspectRatioLocked = !aspectRatioLocked;
    lockAspectRatio.textContent = aspectRatioLocked ? '🔒' : '🔓';
    lockAspectRatio.classList.toggle('active');
});

// Width/Height input with aspect ratio
widthInput.addEventListener('input', () => {
    if (aspectRatioLocked && originalImage) {
        heightInput.value = Math.round(widthInput.value / originalAspectRatio);
    }
});

heightInput.addEventListener('input', () => {
    if (aspectRatioLocked && originalImage) {
        widthInput.value = Math.round(heightInput.value * originalAspectRatio);
    }
});

// Resize method change
resizeMethod.addEventListener('change', (e) => {
    dimensionsGroup.style.display = 'none';
    percentageGroup.style.display = 'none';
    presetGroup.style.display = 'none';
    
    if (e.target.value === 'dimensions') {
        dimensionsGroup.style.display = 'block';
    } else if (e.target.value === 'percentage') {
        percentageGroup.style.display = 'block';
    } else if (e.target.value === 'preset') {
        presetGroup.style.display = 'block';
    }
});

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        widthInput.value = btn.dataset.width;
        heightInput.value = btn.dataset.height;
        resizeMethod.value = 'dimensions';
        dimensionsGroup.style.display = 'block';
        presetGroup.style.display = 'none';
    });
});

// Sliders
percentSlider.addEventListener('input', (e) => {
    percentValue.textContent = e.target.value + '%';
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value + '%';
});

// Resize image
resizeBtn.addEventListener('click', () => {
    if (!originalImage) return;

    let targetWidth, targetHeight;

    if (resizeMethod.value === 'percentage') {
        const scale = percentSlider.value / 100;
        targetWidth = Math.round(originalImage.width * scale);
        targetHeight = Math.round(originalImage.height * scale);
    } else {
        targetWidth = parseInt(widthInput.value) || originalImage.width;
        targetHeight = parseInt(heightInput.value) || originalImage.height;
    }

    // Set canvas size for better quality
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;

    const ctx = resizedCanvas.getContext('2d');
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw resized image
    ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

    previewArea.style.display = 'block';
    
    // Calculate approximate file size
    const quality = qualitySlider.value / 100;
    const approximateSize = (targetWidth * targetHeight * 4 * quality).toFixed(0);
    
    displayResizedInfo(targetWidth, targetHeight, approximateSize);
});

// Download image
downloadBtn.addEventListener('click', () => {
    const format = formatSelect.value;
    const quality = qualitySlider.value / 100;
    
    let mimeType = 'image/png';
    let extension = 'png';
    
    if (format === 'jpeg') {
        mimeType = 'image/jpeg';
        extension = 'jpg';
    } else if (format === 'webp') {
        mimeType = 'image/webp';
        extension = 'webp';
    }

    resizedCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resized-image-${Date.now()}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    }, mimeType, quality);
});

// Reset
resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    controls.style.display = 'none';
    previewArea.style.display = 'none';
    originalImage = null;
    aspectRatioLocked = false;
    lockAspectRatio.textContent = '🔓';
    lockAspectRatio.classList.remove('active');
});

// Display image info
function displayImageInfo(img, element, fileSize) {
    element.innerHTML = `
        <p><strong>Dimensions:</strong> ${img.width} × ${img.height} px</p>
        <p><strong>File Size:</strong> ${(fileSize / 1024).toFixed(2)} KB</p>
        <p><strong>Aspect Ratio:</strong> ${(img.width / img.height).toFixed(2)}</p>
    `;
}

function displayResizedInfo(width, height, size) {
    resizedInfo.innerHTML = `
        <p><strong>Dimensions:</strong> ${width} × ${height} px</p>
        <p><strong>Est. Size:</strong> ${(size / 1024).toFixed(2)} KB</p>
        <p><strong>Aspect Ratio:</strong> ${(width / height).toFixed(2)}</p>
    `;
}
