const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const downloadBtn = document.getElementById('download-btn');

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

    const angle = prompt('Enter rotation angle (90, 180, or 270):', '90');

    if (!angle || !['90', '180', '270'].includes(angle)) {
        alert('Please enter 90, 180, or 270');
        return;
    }

    uploadArea.style.display = 'none';
    loading.classList.add('active');

    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('angle', angle);

        const response = await fetch('/api/rotate', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Rotation failed');
        }

        processedBlob = await response.blob();
        const url = URL.createObjectURL(processedBlob);
        previewImage.src = url;

        loading.classList.remove('active');
        previewSection.classList.add('active');

    } catch (error) {
        alert('Error: ' + error.message);
        location.reload();
    }
}

downloadBtn.addEventListener('click', () => {
    if (processedBlob) {
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rotated-image.webp';
        a.click();
        URL.revokeObjectURL(url);
    }
});
