// Compress IMAGE - Wizard Design
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ compress.js (Wizard) loaded');

    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-btn');
    const loading = document.getElementById('loading');

    let uploadedFile = null;
    let originalSize = 0;
    let currentStep = 1;

    // Step elements
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');

    const step1Content = document.getElementById('step1-content');
    const step2Content = document.getElementById('step2-content');
    const step3Content = document.getElementById('step3-content');

    const step1Summary = document.getElementById('step1-summary');

    // Buttons
    const continueBtn = document.getElementById('continue-btn');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');
    const startOverBtn = document.getElementById('start-over-btn');

    // Select button click
    if (selectBtn) {
        selectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });
    }

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadedFile = file;
            originalSize = file.size;
            goToStep2(file);
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
            uploadedFile = file;
            originalSize = file.size;
            goToStep2(file);
        }
    });

    // Go to Step 2: Adjust
    function goToStep2(file) {
        // Update steps
        step1.classList.add('completed');
        step1.classList.remove('active');
        step2.classList.add('active');

        // Hide step 1 content, show summary
        step1Content.classList.remove('active');
        step1Summary.classList.add('active');
        step1Summary.innerHTML = `
            <div class="step-summary-icon">✓</div>
            <div class="step-summary-text">
                <strong>File Uploaded</strong>
                <span>${file.name} (${formatFileSize(file.size)})</span>
            </div>
        `;

        // Show step 2 content
        step2Content.classList.add('active');

        // Display image
        const imagePreview = document.getElementById('image-preview');
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;

            // Update image stats
            updateImageStats(file);

            // Show premium controls
            showPremiumControls();
        };
        reader.readAsDataURL(file);
    }

    // Update image stats
    function updateImageStats(file) {
        const imageStats = document.getElementById('image-stats');
        const fileSize = formatFileSize(file.size);
        const fileType = file.type.split('/')[1].toUpperCase();

        imageStats.innerHTML = `
            <div class="stat-box">
                <div class="label">File Size</div>
                <div class="value">${fileSize}</div>
            </div>
            <div class="stat-box">
                <div class="label">Format</div>
                <div class="value">${fileType}</div>
            </div>
        `;
    }

    // Show premium controls
    function showPremiumControls() {
        const controlsDiv = document.getElementById('controls');
        controlsDiv.innerHTML = `
            <h3>⚙️ Compression Settings</h3>

            <div class="control-group">
                <label>
                    <span>Quality</span>
                    <span class="control-value" id="quality-display">80%</span>
                </label>
                <input type="range" id="quality-slider" min="1" max="100" value="80">
            </div>

            <div class="control-group">
                <label>Compression Mode</label>
                <select id="compression-mode">
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="maximum">Maximum Compression</option>
                    <option value="high-quality">High Quality</option>
                </select>
            </div>

            <div class="control-group">
                <label>
                    <input type="checkbox" id="preserve-metadata" checked>
                    Preserve metadata
                </label>
            </div>

            <div class="premium-badge">
                💎 Batch process up to 50 images at once!
            </div>
        `;

        // Quality slider interaction
        const qualitySlider = document.getElementById('quality-slider');
        const qualityDisplay = document.getElementById('quality-display');
        qualitySlider.addEventListener('input', function() {
            qualityDisplay.textContent = this.value + '%';
        });
    }

    // Continue to Step 3 (Process)
    if (processBtn) {
        processBtn.addEventListener('click', function() {
            step2Content.classList.remove('active');
            loading.classList.add('active');

            // Complete step 2
            step2.classList.add('completed');
            step2.classList.remove('active');
            step3.classList.add('active');

            // Simulate processing
            setTimeout(() => {
                loading.classList.remove('active');
                step3Content.classList.add('active');
                showFinalResults();
            }, 2500);
        });
    }

    // Show final results in Step 3
    function showFinalResults() {
        const finalStats = document.getElementById('final-stats');
        const quality = document.getElementById('quality-slider')?.value || 80;
        const estimatedSize = Math.round(originalSize * (quality / 100));
        const savings = Math.round(((originalSize - estimatedSize) / originalSize) * 100);

        finalStats.innerHTML = `
            <div class="final-stat">
                <div class="value">${formatFileSize(originalSize)}</div>
                <div class="label">Original Size</div>
            </div>
            <div class="final-stat">
                <div class="value">${formatFileSize(estimatedSize)}</div>
                <div class="label">New Size</div>
            </div>
            <div class="final-stat">
                <div class="value">${savings}%</div>
                <div class="label">Space Saved</div>
            </div>
        `;
    }

    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const imagePreview = document.getElementById('image-preview');
            const link = document.createElement('a');
            link.href = imagePreview.src;
            link.download = 'compressed_' + Date.now() + '.jpg';
            link.click();
        });
    }

    // Start Over button
    if (startOverBtn) {
        startOverBtn.addEventListener('click', function() {
            location.reload();
        });
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
});