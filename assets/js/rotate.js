// Rotate IMAGE Tool - Full Functionality
// This keeps your design and adds rotation features

let img = new Image();
let canvas, ctx;
let currentRotation = 0;
let flipHorizontal = false;
let flipVertical = false;
let originalImageData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const loading = document.getElementById('loading');
    const controls = document.getElementById('controls');
    const previewSection = document.getElementById('preview-section');

    // Rotation controls
    const rotate90Btn = document.getElementById('rotate-90');
    const rotate180Btn = document.getElementById('rotate-180');
    const rotate270Btn = document.getElementById('rotate-270');
    const flipHBtn = document.getElementById('flip-horizontal');
    const flipVBtn = document.getElementById('flip-vertical');
    const rotationSlider = document.getElementById('rotation-slider');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f0f4ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#fff';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = '#fff';

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            fileInput.files = files;
            handleFileSelect({ target: fileInput });
        }
    });

    // Rotation buttons
    rotate90Btn.addEventListener('click', () => rotateImage(90));
    rotate180Btn.addEventListener('click', () => rotateImage(180));
    rotate270Btn.addEventListener('click', () => rotateImage(270));

    // Flip buttons
    flipHBtn.addEventListener('click', () => {
        flipHorizontal = !flipHorizontal;
        flipHBtn.style.background = flipHorizontal ? '#667eea' : '#f0f4ff';
        flipHBtn.style.color = flipHorizontal ? '#fff' : '#333';
        drawImage();
    });

    flipVBtn.addEventListener('click', () => {
        flipVertical = !flipVertical;
        flipVBtn.style.background = flipVertical ? '#667eea' : '#f0f4ff';
        flipVBtn.style.color = flipVertical ? '#fff' : '#333';
        drawImage();
    });

    // Rotation slider
    rotationSlider.addEventListener('input', (e) => {
        currentRotation = parseInt(e.target.value);
        updateRotationDisplay();
        drawImage();
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        currentRotation = 0;
        flipHorizontal = false;
        flipVertical = false;
        rotationSlider.value = 0;
        flipHBtn.style.background = '#f0f4ff';
        flipHBtn.style.color = '#333';
        flipVBtn.style.background = '#f0f4ff';
        flipVBtn.style.color = '#333';
        updateRotationDisplay();
        drawImage();
    });

    // Download button
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'rotated-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        // Show loading
        uploadArea.style.display = 'none';
        loading.style.display = 'block';

        // Read file
        const reader = new FileReader();
        reader.onload = function(event) {
            img.src = event.target.result;
            img.onload = function() {
                // Hide loading, show controls and preview
                setTimeout(() => {
                    loading.style.display = 'none';
                    controls.style.display = 'block';
                    previewSection.style.display = 'block';

                    // Reset rotation
                    currentRotation = 0;
                    flipHorizontal = false;
                    flipVertical = false;
                    rotationSlider.value = 0;
                    updateRotationDisplay();

                    // Draw image
                    drawImage();
                }, 500);
            };
        };
        reader.readAsDataURL(file);
    }

    function rotateImage(degrees) {
        currentRotation = (currentRotation + degrees) % 360;
        rotationSlider.value = currentRotation;
        updateRotationDisplay();
        drawImage();
    }

    function updateRotationDisplay() {
        document.getElementById('rotation-value').textContent = currentRotation;
        document.getElementById('slider-value').textContent = currentRotation;
    }

    function drawImage() {
        if (!img.src) return;

        const rotation = currentRotation * Math.PI / 180;

        // Calculate new canvas size based on rotation
        let width = img.width;
        let height = img.height;

        if (currentRotation % 180 !== 0) {
            // Swap dimensions for 90° and 270°
            canvas.width = height;
            canvas.height = width;
        } else {
            canvas.width = width;
            canvas.height = height;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save context
        ctx.save();

        // Move to center
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Apply rotation
        ctx.rotate(rotation);

        // Apply flips
        ctx.scale(
            flipHorizontal ? -1 : 1,
            flipVertical ? -1 : 1
        );

        // Draw image centered
        ctx.drawImage(img, -width / 2, -height / 2, width, height);

        // Restore context
        ctx.restore();
    }
});