// Resize IMAGE - Client-Side Processing
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const controls = document.getElementById('controls');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const downloadBtn = document.getElementById('download-btn');

let currentImage = null;
let originalFileName = '';
let processedBlob = null;

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    originalFileName = file.name.replace(/\.[^/.]+$/, '');
    uploadArea.style.display = 'none';
    loading.classList.add('active');

    try {
        currentImage = await loadImage(file);

        loading.classList.remove('active');
        controls.style.display = 'block';

        // Create controls
        controls.innerHTML = `
            <h3 style="margin-bottom: 15px;">Resize Options</h3>
            <div class="control-group">
                <label>Width (px): <span id="current-width">${currentImage.width}</span></label>
                <input type="range" id="width-slider" min="50" max="${currentImage.width * 2}" value="${currentImage.width}">
            </div>
            <div class="control-group">
                <label>Height (px): <span id="current-height">${currentImage.height}</span></label>
                <input type="range" id="height-slider" min="50" max="${currentImage.height * 2}" value="${currentImage.height}">
            </div>
            <div class="control-group">
                <label><input type="checkbox" id="maintain-ratio" checked> Maintain aspect ratio</label>
            </div>
            <button class="btn" onclick="resizeImage()" style="width: 100%; margin-top: 10px;">Resize Image</button>
        `;

        // Add event listeners
        const widthSlider = document.getElementById('width-slider');
        const heightSlider = document.getElementById('height-slider');
        const maintainRatio = document.getElementById('maintain-ratio');
        const currentWidthSpan = document.getElementById('current-width');
        const currentHeightSpan = document.getElementById('current-height');

        const aspectRatio = currentImage.width / currentImage.height;

        widthSlider.addEventListener('input', (e) => {
            currentWidthSpan.textContent = e.target.value;
            if (maintainRatio.checked) {
                const newHeight = Math.round(e.target.value / aspectRatio);
                heightSlider.value = newHeight;
                currentHeightSpan.textContent = newHeight;
            }
        });

        heightSlider.addEventListener('input', (e) => {
            currentHeightSpan.textContent = e.target.value;
            if (maintainRatio.checked) {
                const newWidth = Math.round(e.target.value * aspectRatio);
                widthSlider.value = newWidth;
                currentWidthSpan.textContent = newWidth;
            }
        });

    } catch (error) {
        alert('Error: ' + error.message);
        location.reload();
    }
}

window.resizeImage = function() {
    const width = parseInt(document.getElementById('width-slider').value);
    const height = parseInt(document.getElementById('height-slider').value);

    loading.classList.add('active');
    controls.style.display = 'none';

    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(currentImage, 0, 0, width, height);

        canvas.toBlob((blob) => {
            processedBlob = blob;
            const url = URL.createObjectURL(blob);
            previewImage.src = url;

            loading.classList.remove('active');
            previewSection.classList.add('active');
        }, 'image/png');
    }, 500);
};

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

downloadBtn.addEventListener('click', () => {
    if (processedBlob) {
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName + '-resized.png';
        a.click();
        URL.revokeObjectURL(url);
    }
});
