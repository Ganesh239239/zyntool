// Photo editor - Premium Features
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ photo-editor.js loaded');

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

        
        // Photo filters
        const filterGroup = document.createElement('div');
        filterGroup.className = 'control-group';
        filterGroup.innerHTML = `
            <label for="filter">Filter:</label>
            <select id="filter">
                <option value="none">None</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
                <option value="vintage">Vintage</option>
                <option value="warm">Warm</option>
                <option value="cool">Cool</option>
            </select>
            <label for="brightness">Brightness: <span id="brightness-value">100</span>%</label>
            <input type="range" id="brightness" min="0" max="200" value="100">
            <label for="contrast">Contrast: <span id="contrast-value">100</span>%</label>
            <input type="range" id="contrast" min="0" max="200" value="100">
        `;
        controlsDiv.appendChild(filterGroup);

        document.getElementById('brightness').addEventListener('input', function() {
            document.getElementById('brightness-value').textContent = this.value;
        });
        document.getElementById('contrast').addEventListener('input', function() {
            document.getElementById('contrast-value').textContent = this.value;
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
            link.download = 'photo-editor_' + Date.now() + '.jpg';
            link.click();
        });
    }
});