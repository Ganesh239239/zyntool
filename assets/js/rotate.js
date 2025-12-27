// Rotate IMAGE - Client-Side Processing
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
let currentRotation = 0;

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
            <h3 style="margin-bottom: 15px;">Rotate Options</h3>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn" onclick="rotateImage(90)" style="flex: 1;">Rotate 90°</button>
                <button class="btn" onclick="rotateImage(180)" style="flex: 1;">Rotate 180°</button>
                <button class="btn" onclick="rotateImage(270)" style="flex: 1;">Rotate 270°</button>
            </div>
            <div style="margin-top: 15px; text-align: center;">
                <p style="color: #666;">Current rotation: <span id="rotation-display">0°</span></p>
            </div>
            <button class="btn" onclick="applyRotation()" style="width: 100%; margin-top: 15px; background: #4caf50;">Apply & Download</button>
        `;

        // Show preview
        previewImage.src = URL.createObjectURL(file);
        previewSection.classList.add('active');

    } catch (error) {
        alert('Error: ' + error.message);
        location.reload();
    }
}

window.rotateImage = function(degrees) {
    currentRotation = (currentRotation + degrees) % 360;
    document.getElementById('rotation-display').textContent = currentRotation + '°';
    previewImage.style.transform = `rotate(${currentRotation}deg)`;
    previewImage.style.transition = 'transform 0.3s ease';
};

window.applyRotation = function() {
    loading.classList.add('active');
    controls.style.display = 'none';
    previewSection.classList.remove('active');

    setTimeout(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const radians = (currentRotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(radians));
        const sin = Math.abs(Math.sin(radians));

        canvas.width = currentImage.width * cos + currentImage.height * sin;
        canvas.height = currentImage.width * sin + currentImage.height * cos;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(currentImage, -currentImage.width / 2, -currentImage.height / 2);

        canvas.toBlob((blob) => {
            processedBlob = blob;
            const url = URL.createObjectURL(blob);
            previewImage.src = url;
            previewImage.style.transform = 'none';

            loading.classList.remove('active');
            previewSection.classList.add('active');
            controls.style.display = 'none';
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
        a.download = originalFileName + '-rotated.png';
        a.click();
        URL.revokeObjectURL(url);
    } else {
        alert('Please apply rotation first!');
    }
});
