// Crop - Basic UI (Full implementation coming soon)
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const loading = document.getElementById('loading');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const downloadBtn = document.getElementById('download-btn');

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

    uploadArea.style.display = 'none';
    loading.classList.add('active');

    setTimeout(() => {
        const url = URL.createObjectURL(file);
        previewImage.src = url;

        loading.classList.remove('active');
        previewSection.classList.add('active');

        downloadBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
        });
    }, 1000);
}
