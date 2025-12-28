// Watermark IMAGE - Premium Features
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ watermark.js loaded');

    // Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-btn');
    const previewSection = document.getElementById('preview-section');
    const imagePreview = document.getElementById('image-preview');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');
    const loading = document.getElementById('loading');
    const controlsDiv = document.getElementById('controls');

    let uploadedImage = null;

    // Select button
    if (selectBtn) {
        selectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
    }

    // File input
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            displayImage(file);
        }
    });

    // Drag & drop
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
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            displayImage(file);
        }
    });

    // Display image
    function displayImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            imagePreview.src = uploadedImage;
            uploadArea.style.display = 'none';
            previewSection.classList.add('active');
            showPremiumControls();
        };
        reader.readAsDataURL(file);
    }

    // Show premium controls based on tool
    function showPremiumControls() {
        if (!controlsDiv) return;

        controlsDiv.innerHTML = '';

        
        // Watermark text
        const watermarkGroup = document.createElement('div');
        watermarkGroup.className = 'control-group';
        watermarkGroup.innerHTML = `
            <label for="watermark-text">Watermark Text:</label>
            <input type="text" id="watermark-text" placeholder="Enter watermark text">
            <label for="opacity">Opacity: <span id="opacity-value">50</span>%</label>
            <input type="range" id="opacity" min="0" max="100" value="50">
            <label for="position">Position:</label>
            <select id="position">
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
            </select>
        `;
        controlsDiv.appendChild(watermarkGroup);

        document.getElementById('opacity').addEventListener('input', function() {
            document.getElementById('opacity-value').textContent = this.value;
        });
    }

    // Process button
    if (processBtn) {
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
    }

    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const link = document.createElement('a');
            link.href = imagePreview.src;
            link.download = 'watermark_' + Date.now() + '.jpg';
            link.click();
        });
    }
});