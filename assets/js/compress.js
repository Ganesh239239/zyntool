// Compress Image Frontend Logic
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const downloadBtn = document.getElementById('download-btn');

let processedBlob = null;

// Drag and drop handlers
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

// File input handler
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Handle file upload and processing
async function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Show loading
    uploadArea.style.display = 'none';
    loading.classList.add('active');

    try {
        // Create form data
        const formData = new FormData();
        formData.append('image', file);
        formData.append('quality', '80'); // Default quality

        // Send to API
        const response = await fetch('/api/compress', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Compression failed');
        }

        // Get compressed image
        processedBlob = await response.blob();

        // Show preview
        const url = URL.createObjectURL(processedBlob);
        previewImage.src = url;

        loading.classList.remove('active');
        previewSection.classList.add('active');

    } catch (error) {
        alert('Error: ' + error.message);
        location.reload();
    }
}

// Download handler
downloadBtn.addEventListener('click', () => {
    if (processedBlob) {
        const url = URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed-image.jpg';
        a.click();
        URL.revokeObjectURL(url);
    }
});
