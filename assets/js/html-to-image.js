// Tool functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-btn');
    const previewSection = document.getElementById('preview-section');
    const imagePreview = document.getElementById('image-preview');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');
    const loading = document.getElementById('loading');

    // Select button click
    selectBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            displayImage(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f9f9ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#d0d0d0';
        uploadArea.style.background = 'white';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#d0d0d0';
        uploadArea.style.background = 'white';

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            displayImage(file);
        }
    });

    // Display image
    function displayImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewSection.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    // Process button
    processBtn.addEventListener('click', function() {
        previewSection.style.display = 'none';
        loading.classList.add('active');

        // Simulate processing
        setTimeout(() => {
            loading.classList.remove('active');
            previewSection.style.display = 'block';
            processBtn.style.display = 'none';
            downloadBtn.style.display = 'inline-block';
        }, 2000);
    });

    // Download button
    downloadBtn.addEventListener('click', function() {
        // Create download link
        const link = document.createElement('a');
        link.href = imagePreview.src;
        link.download = 'processed-image.jpg';
        link.click();
    });
});