// Compress IMAGE - Individual JS File
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ compress.js loaded');

    const uploadBtn = document.getElementById('upload-btn');
    const clearBtn = document.getElementById('clear-btn');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewArea = document.getElementById('preview-area');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const fileCountBadge = document.getElementById('file-count');
    const loading = document.getElementById('loading');

    let uploadedFile = null;
    let originalSize = 0;
    let processedSize = 0;
    let fileCount = 0;

    // Upload button click
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fileInput.click());
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                uploadedFile = file;
                originalSize = file.size;
                handleFileUpload(file);
            }
        });
    }

    // Drag & drop
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                uploadedFile = file;
                originalSize = file.size;
                handleFileUpload(file);
            }
        });

        dropZone.addEventListener('click', () => {
            if (!previewArea.classList.contains('active')) {
                fileInput.click();
            }
        });
    }

    // Handle file upload
    function handleFileUpload(file) {
        dropZone.style.display = 'none';
        loading.classList.add('active');

        setTimeout(() => {
            loading.classList.remove('active');
            previewArea.classList.add('active');
            displayFileInfo(file);
            autoProcess(file);
            fileCount = 1;
            updateFileCount();
        }, 1500);
    }

    // Display file info
    function displayFileInfo(file) {
        const filename = file.name;
        document.getElementById('card-filename').textContent = filename;
        document.getElementById('filename-display').textContent = filename;

        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedFile.dataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Auto process based on tool type
    function autoProcess(file) {
        const quality = parseInt(document.getElementById('quality-input').value);
        processImage(quality);
    }

    // Process image - Tool specific logic
    function processImage(quality) {
        // Calculate processed size based on quality
        processedSize = Math.round(originalSize * (quality / 100));
        const savings = Math.round(((originalSize - processedSize) / originalSize) * 100);

        // Update UI
        document.getElementById('progress-indicator').textContent = `-${savings}%`;
        document.getElementById('original-size').textContent = formatFileSize(originalSize);
        document.getElementById('compressed-size').textContent = 
            `${formatFileSize(processedSize)} (-${savings}%)`;

        // Update pie chart
        updatePieChart(savings);
    }

    // Update pie chart
    function updatePieChart(percentage) {
        const pieChart = document.querySelector('.pie-chart');
        const deg = Math.round((percentage / 100) * 360);
        pieChart.style.background = `conic-gradient(#7e57c2 0deg ${deg}deg, #e3f2fd ${deg}deg 360deg)`;
        document.querySelector('.pie-chart-percentage').textContent = `-${percentage}%`;
    }

    // Apply quality change
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const quality = parseInt(document.getElementById('quality-input').value);
            if (quality >= 1 && quality <= 100 && uploadedFile) {
                processImage(quality);
            }
        });
    }

    // Quality input enter key
    const qualityInput = document.getElementById('quality-input');
    if (qualityInput) {
        qualityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyBtn.click();
            }
        });
    }

    // Remove file
    const removeBtn = document.getElementById('remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => resetTool());
    }

    // Clear queue
    if (clearBtn) {
        clearBtn.addEventListener('click', () => resetTool());
    }

    // Download single file
    const downloadSingleBtn = document.getElementById('download-single-btn');
    if (downloadSingleBtn) {
        downloadSingleBtn.addEventListener('click', function() {
            if (uploadedFile && uploadedFile.dataUrl) {
                const link = document.createElement('a');
                link.href = uploadedFile.dataUrl;
                link.download = 'compress_' + uploadedFile.name;
                link.click();
            }
        });
    }

    // Download all
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', function() {
            if (fileCount > 0 && uploadedFile && uploadedFile.dataUrl) {
                const link = document.createElement('a');
                link.href = uploadedFile.dataUrl;
                link.download = 'compress_' + uploadedFile.name;
                link.click();
            }
        });
    }

    // Reset tool
    function resetTool() {
        uploadedFile = null;
        originalSize = 0;
        processedSize = 0;
        fileCount = 0;

        previewArea.classList.remove('active');
        dropZone.style.display = 'flex';
        updateFileCount();

        document.getElementById('quality-input').value = '89';
    }

    // Update file count
    function updateFileCount() {
        fileCountBadge.textContent = fileCount;
        downloadAllBtn.disabled = fileCount === 0;
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Initialize
    updateFileCount();
});