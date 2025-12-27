// Compress Tool - Client-Side
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const downloadBtn = document.getElementById('download-btn');

let processedBlob = null;
let originalFileName = '';

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
        const img = await loadImage(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            processedBlob = blob;
            const url = URL.createObjectURL(blob);
            previewImage.src = url;

            loading.classList.remove('active');
            previewSection.classList.add('active');

            const originalSize = (file.size / 1024).toFixed(2);
            const compressedSize = (blob.size / 1024).toFixed(2);
            const reduction = ((1 - blob.size / file.size) * 100).toFixed(0);

            alert(`Compressed!\nOriginal: ${originalSize} KB\nCompressed: ${compressedSize} KB\nReduction: ${reduction}%`);
        }, 'image/jpeg', 0.7);

    } catch (error) {
        alert('Error: ' + error.message);
        location.reload();
    }
}

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
        a.download = originalFileName + '-compressed.jpg';
        a.click();
        URL.revokeObjectURL(url);
    }
});
