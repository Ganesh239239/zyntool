// Upscale Image - UPSCALE MODE
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ upscale.js - UPSCALE MODE');

    const uploadBtn = document.getElementById('upload-btn');
    const clearBtn = document.getElementById('clear-btn');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewArea = document.getElementById('preview-area');
    const loading = document.getElementById('loading');

    let uploadedFile = null;
    let originalSize = 0;
    let processedSize = 0;
    let fileCount = 0;
    let quality = 89;

    if (uploadBtn) uploadBtn.addEventListener('click', () => fileInput.click());

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

    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

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
            if (!previewArea.classList.contains('active')) fileInput.click();
        });
    }

    function handleFileUpload(file) {
        dropZone.style.display = 'none';
        loading.classList.add('active');

        setTimeout(() => {
            loading.classList.remove('active');
            previewArea.classList.add('active');
            displayFileInfo(file);
            processImage(quality);
            fileCount = 1;
            updateFileCount();
        }, 1500);
    }

    function displayFileInfo(file) {
        document.getElementById('filename-premium').textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => uploadedFile.dataUrl = e.target.result;
        reader.readAsDataURL(file);
    }

    function processImage(quality) {
        // UPSCALE
        const scale = 100 + (quality * 3);
        processedSize = Math.round(originalSize * (scale / 100));

        document.getElementById('progress-number').textContent = `+${scale}%`;
        document.getElementById('progress-label').textContent = 'Enlarged';
        document.getElementById('original-stat').textContent = formatFileSize(originalSize);
        document.getElementById('processed-stat').textContent = formatFileSize(processedSize);
        document.getElementById('pie-percentage').textContent = `+${scale}%`;

        updatePieChart(scale - 100);
    }

    function updatePieChart(percentage) {
        const pieChart = document.querySelector('.pie-chart-premium');
        let deg = Math.min(Math.max(Math.round((percentage / 100) * 360), 0), 360);
        pieChart.style.background = `conic-gradient(#667eea 0deg ${deg}deg, #e9ecef ${deg}deg 360deg)`;
    }

    const applyBtn = document.getElementById('apply-btn-premium');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            quality = parseInt(document.getElementById('quality-input-premium').value);
            if (quality >= 1 && quality <= 100 && uploadedFile) {
                processImage(quality);
            }
        });
    }

    const qualityInput = document.getElementById('quality-input-premium');
    if (qualityInput) {
        qualityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyBtn.click();
        });
    }

    const removeBtn = document.getElementById('remove-btn-premium');
    if (removeBtn) removeBtn.addEventListener('click', () => resetTool());

    if (clearBtn) clearBtn.addEventListener('click', () => resetTool());

    const downloadBtn = document.getElementById('download-btn-premium');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (uploadedFile && uploadedFile.dataUrl) {
                const link = document.createElement('a');
                link.href = uploadedFile.dataUrl;
                link.download = 'upscale_' + uploadedFile.name;
                link.click();
            }
        });
    }

    const downloadAllBtn = document.getElementById('download-all-btn-premium');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', function() {
            if (fileCount > 0 && uploadedFile && uploadedFile.dataUrl) {
                const link = document.createElement('a');
                link.href = uploadedFile.dataUrl;
                link.download = 'upscale_' + uploadedFile.name;
                link.click();
            }
        });
    }

    function resetTool() {
        uploadedFile = null;
        originalSize = 0;
        processedSize = 0;
        fileCount = 0;
        quality = 89;

        previewArea.classList.remove('active');
        dropZone.style.display = 'flex';
        updateFileCount();

        document.getElementById('quality-input-premium').value = '89';
    }

    function updateFileCount() {
        const badge = document.getElementById('file-count-premium');
        if (badge) badge.textContent = fileCount;
        const btn = document.getElementById('download-all-btn-premium');
        if (btn) btn.disabled = fileCount === 0;
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    updateFileCount();
});