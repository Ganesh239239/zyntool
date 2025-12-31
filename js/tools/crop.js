document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processingArea = document.getElementById('processingArea');
    const resultArea = document.getElementById('resultArea');
    const imagePreview = document.getElementById('imagePreview');
    const btnProcess = document.getElementById('btnProcess');
    const ratioBtns = document.querySelectorAll('.ratio-btn');
    
    // State
    let currentFile = null;
    let cropper = null;

    // --- Upload Handlers ---
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if(e.target.files[0]) handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#4B90FF';
        dropZone.style.backgroundColor = '#f0f7ff';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#e0e0e0';
        dropZone.style.backgroundColor = '#fafafa';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#e0e0e0';
        dropZone.style.backgroundColor = '#fafafa';
        if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    // --- Core Logic ---
    function handleFile(file) {
        if(!file.type.startsWith('image/')) {
            alert("Please upload a valid image file.");
            return;
        }
        currentFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            
            // Switch Views
            dropZone.style.display = 'none';
            processingArea.style.display = 'block';

            // Initialize Cropper (must happen after image source is set)
            initCropper();
        };
        reader.readAsDataURL(file);
    }

    function initCropper() {
        // Destroy existing cropper if any
        if(cropper) {
            cropper.destroy();
        }

        cropper = new Cropper(imagePreview, {
            viewMode: 1, // Restrict crop box to within the canvas
            dragMode: 'move', // Allow moving the image
            autoCropArea: 0.8, // 80% default selection
            responsive: true,
            background: false, // Hide grid background
        });
    }

    // --- Aspect Ratio Buttons ---
    ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            ratioBtns.forEach(b => b.classList.remove('active', 'btn-secondary'));
            ratioBtns.forEach(b => b.classList.add('btn-outline-secondary'));
            
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('active', 'btn-secondary');

            // Logic Update
            const ratio = parseFloat(btn.getAttribute('data-ratio'));
            cropper.setAspectRatio(ratio);
        });
    });

    // --- Process Crop ---
    btnProcess.addEventListener('click', () => {
        if(!cropper) return;

        const originalText = btnProcess.innerText;
        btnProcess.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cropping...';
        btnProcess.disabled = true;

        // Get cropped canvas
        // We use toBlob for better performance with large images
        cropper.getCroppedCanvas().toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            
            // Setup Download
            const downloadBtn = document.getElementById('downloadLink');
            const resultImg = document.getElementById('resultImage');
            
            downloadBtn.href = url;
            // Add "-cropped" to filename
            const ext = currentFile.name.split('.').pop();
            const name = currentFile.name.replace(`.${ext}`, '');
            downloadBtn.download = `${name}-cropped.${ext}`;

            // Show Preview of result
            resultImg.src = url;

            // Switch UI
            processingArea.style.display = 'none';
            resultArea.style.display = 'block';
            
            btnProcess.innerText = originalText;
            btnProcess.disabled = false;
        }, currentFile.type);
    });
});
