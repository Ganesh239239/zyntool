// Compress IMAGE - Reference Design
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ compress.js (Reference Design) loaded');

    const uploadBtn = document.getElementById('upload-btn');
    const clearBtn = document.getElementById('clear-btn');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewArea = document.getElementById('preview-area');
    const imageCard = document.getElementById('image-card');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const fileCountBadge = document.getElementById('file-count');
    const loading = document.getElementById('loading');

    let uploadedFile = null;
    let originalSize = 0;
    let compressedSize = 0;
    let fileCount = 0;

    // Upload button click
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadedFile = file;
            originalSize = file.size;
            handleFileUpload(file);
        }
    });

    // Drag & drop
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

    // Click on drop zone
    dropZone.addEventListener('click', () => {
        if (!previewArea.classList.contains('active')) {
            fileInput.click();
        }
    });

    // Handle file upload
    function handleFileUpload(file) {
        // Hide drop zone, show loading
        dropZone.style.display = 'none';
        loading.classList.add('active');

        // Simulate processing
        setTimeout(() => {
            loading.classList.remove('active');
            previewArea.classList.add('active');

            // Show file info
            displayFileInfo(file);

            // Auto-compress
            autoCompress(file);

            // Update file count
            fileCount = 1;
            updateFileCount();
        }, 1500);
    }

    // Display file info
    function displayFileInfo(file) {
        const filename = file.name;

        document.getElementById('card-filename').textContent = filename;
        document.getElementById('filename-display').textContent = filename;

        // Show image preview (optional - can add img element)
        const reader = new FileReader();
        reader.onload = function(e) {
            // Store for download
            uploadedFile.dataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Auto compress
    function autoCompress(file) {
        const quality = parseInt(document.getElementById('quality-input').value);
        compressImage(quality);
    }

    // Compress image
    function compressImage(quality) {
        // Calculate compressed size (simulated)
        compressedSize = Math.round(originalSize * (quality / 100));
        const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);

        // Update progress indicator
        document.getElementById('progress-indicator').textContent = `-${savings}%`;

        // Update stats
        document.getElementById('original-size').textContent = formatFileSize(originalSize);
        document.getElementById('compressed-size').textContent = 
            `${formatFileSize(compressedSize)} (-${savings}%)`;

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
    document.getElementById('apply-btn').addEventListener('click', function() {
        const quality = parseInt(document.getElementById('quality-input').value);
        if (quality >= 1 && quality <= 100 && uploadedFile) {
            compressImage(quality);
        }
    });

    // Quality input enter key
    document.getElementById('quality-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('apply-btn').click();
        }
    });

    // Remove file
    document.getElementById('remove-btn').addEventListener('click', function() {
        resetTool();
    });

    // Clear queue
    clearBtn.addEventListener('click', function() {
        resetTool();
    });

    // Download single file
    document.getElementById('download-single-btn').addEventListener('click', function() {
        if (uploadedFile && uploadedFile.dataUrl) {
            const link = document.createElement('a');
            link.href = uploadedFile.dataUrl;
            link.download = 'compressed_' + uploadedFile.name;
            link.click();
        }
    });

    // Download all
    downloadAllBtn.addEventListener('click', function() {
        if (fileCount > 0 && uploadedFile && uploadedFile.dataUrl) {
            const link = document.createElement('a');
            link.href = uploadedFile.dataUrl;
            link.download = 'compressed_' + uploadedFile.name;
            link.click();
        }
    });

    // Reset tool
    function resetTool() {
        uploadedFile = null;
        originalSize = 0;
        compressedSize = 0;
        fileCount = 0;

        previewArea.classList.remove('active');
        dropZone.style.display = 'flex';
        updateFileCount();

        // Reset quality input
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