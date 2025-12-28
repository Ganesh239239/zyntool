// Meme generator - Unique Logic
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ meme-generator.js loaded - MEME MODE');

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
        document.getElementById('card-filename').textContent = file.name;
        document.getElementById('filename-display').textContent = file.name;

        const reader = new FileReader();
        reader.onload = (e) => uploadedFile.dataUrl = e.target.result;
        reader.readAsDataURL(file);
    }

    function processImage(quality) {
        // MEME: Shows emoji
        processedSize = Math.round(originalSize * 1.05);

        document.getElementById('progress-indicator').textContent = '😂 Meme';
        document.getElementById('original-size').textContent = formatFileSize(originalSize);
        document.getElementById('compressed-size').textContent = 
            `${formatFileSize(processedSize)}`;

        updatePieChart(100, 'meme');
    }

    function updatePieChart(percentage, type) {
        const pieChart = document.querySelector('.pie-chart');
        let deg = Math.min(Math.max(Math.round((percentage / 100) * 360), 0), 360);

        pieChart.style.background = `conic-gradient(#7e57c2 0deg ${deg}deg, #e3f2fd ${deg}deg 360deg)`;

        const percentageElement = document.querySelector('.pie-chart-percentage');

        if (type === 'compress') {
            percentageElement.textContent = `-${percentage}%`;
        } else if (type === 'upscale') {
            percentageElement.textContent = `+${percentage}%`;
        } else if (type === 'rotate') {
            percentageElement.textContent = `${Math.round(quality * 3.6)}°`;
        } else if (type === 'removebg' || type === 'convert' || type === 'meme') {
            percentageElement.textContent = '✓';
        } else {
            percentageElement.textContent = `${percentage}%`;
        }
    }

    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            quality = parseInt(document.getElementById('quality-input').value);
            if (quality >= 1 && quality <= 100 && uploadedFile) {
                processImage(quality);
            }
        });
    }

    const qualityInput = document.getElementById('quality-input');
    if (qualityInput) {
        qualityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyBtn.click();
        });
    }

    const removeBtn = document.getElementById('remove-btn');
    if (removeBtn) removeBtn.addEventListener('click', () => resetTool());

    if (clearBtn) clearBtn.addEventListener('click', () => resetTool());

    const downloadSingleBtn = document.getElementById('download-single-btn');
    if (downloadSingleBtn) {
        downloadSingleBtn.addEventListener('click', function() {
            if (uploadedFile && uploadedFile.dataUrl) {
                const link = document.createElement('a');
                link.href = uploadedFile.dataUrl;
                link.download = 'meme-generator_' + uploadedFile.name;
                link.click();
            }
        });
    }

    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', function() {
            if (fileCount > 0 && uploadedFile && uploadedFile.dataUrl) {
                const link = document.createElement('a');
                link.href = uploadedFile.dataUrl;
                link.download = 'meme-generator_' + uploadedFile.name;
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

        document.getElementById('quality-input').value = '89';
    }

    function updateFileCount() {
        fileCountBadge.textContent = fileCount;
        downloadAllBtn.disabled = fileCount === 0;
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    updateFileCount();
});