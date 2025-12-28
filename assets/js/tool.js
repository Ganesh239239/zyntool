// Universal Tool Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Tool.js loaded');

    // Get elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectBtn = document.getElementById('select-btn');
    const previewSection = document.getElementById('preview-section');
    const imagePreview = document.getElementById('image-preview');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');
    const loading = document.getElementById('loading');

    if (!uploadArea || !fileInput) {
        console.error('❌ Upload elements not found');
        return;
    }

    console.log('✅ All elements found');

    // Select button click
    if (selectBtn) {
        selectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📁 Select button clicked');
            fileInput.click();
        });
    }

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        console.log('📄 File selected:', file?.name);
        if (file && file.type.startsWith('image/')) {
            displayImage(file);
        } else {
            alert('Please select a valid image file (JPG, PNG, GIF, etc.)');
        }
    });

    // Drag and drop
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
        console.log('📂 File dropped:', file?.name);
        if (file && file.type.startsWith('image/')) {
            displayImage(file);
        } else {
            alert('Please drop a valid image file (JPG, PNG, GIF, etc.)');
        }
    });

    // Display image
    function displayImage(file) {
        console.log('🖼️ Displaying image:', file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            if (imagePreview) {
                imagePreview.src = e.target.result;
            }
            uploadArea.style.display = 'none';
            if (previewSection) {
                previewSection.classList.add('active');
            }
            console.log('✅ Image displayed');
        };
        reader.readAsDataURL(file);
    }

    // Process button
    if (processBtn) {
        processBtn.addEventListener('click', function() {
            console.log('⚙️ Processing image...');
            if (previewSection) {
                previewSection.style.display = 'none';
            }
            if (loading) {
                loading.classList.add('active');
            }

            // Simulate processing (2 seconds)
            setTimeout(() => {
                console.log('✅ Processing complete');
                if (loading) {
                    loading.classList.remove('active');
                }
                if (previewSection) {
                    previewSection.style.display = 'block';
                }
                processBtn.style.display = 'none';
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-block';
                }
            }, 2000);
        });
    }

    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            console.log('💾 Downloading image...');
            if (imagePreview && imagePreview.src) {
                // Create download link
                const link = document.createElement('a');
                link.href = imagePreview.src;
                link.download = 'processed-image-' + Date.now() + '.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('✅ Download started');
            }
        });
    }
});