document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processingArea = document.getElementById('processingArea');
    const resultArea = document.getElementById('resultArea');
    const imagePreview = document.getElementById('imagePreview');
    const btnProcess = document.getElementById('btnProcess');
    
    // Inputs
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const ratioCheck = document.getElementById('ratioCheck');
    const fileNameDisplay = document.getElementById('fileName');
    const originalDimsDisplay = document.getElementById('originalDims');

    // State
    let currentFile = null;
    let originalImage = new Image();
    let aspectRatio = 0;

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
            alert("Please upload an image file (JPG, PNG, GIF).");
            return;
        }
        currentFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            imagePreview.src = e.target.result;
            
            originalImage.onload = () => {
                // Initialize State
                const w = originalImage.naturalWidth;
                const h = originalImage.naturalHeight;
                aspectRatio = w / h;

                // Update UI
                fileNameDisplay.textContent = file.name;
                originalDimsDisplay.textContent = `${w} x ${h}`;
                widthInput.value = w;
                heightInput.value = h;

                // Switch Views
                dropZone.style.display = 'none';
                processingArea.style.display = 'block';
            };
        };
        reader.readAsDataURL(file);
    }

    // --- Aspect Ratio Math ---
    widthInput.addEventListener('input', () => {
        if(ratioCheck.checked && widthInput.value) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
        }
    });

    heightInput.addEventListener('input', () => {
        if(ratioCheck.checked && heightInput.value) {
            widthInput.value = Math.round(heightInput.value * aspectRatio);
        }
    });

    // Toggle Visual Link Icon
    ratioCheck.addEventListener('change', () => {
        const icon = document.getElementById('linkIcon');
        if(ratioCheck.checked) {
            icon.classList.remove('text-muted');
            icon.classList.add('text-primary');
            // Re-calculate height immediately
            if(widthInput.value) heightInput.value = Math.round(widthInput.value / aspectRatio);
        } else {
            icon.classList.add('text-muted');
            icon.classList.remove('text-primary');
        }
    });

    // --- Process Resize ---
    btnProcess.addEventListener('click', () => {
        const targetW = parseInt(widthInput.value);
        const targetH = parseInt(heightInput.value);

        if(!targetW || !targetH || targetW <= 0 || targetH <= 0) {
            alert("Please enter valid dimensions.");
            return;
        }

        btnProcess.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resizing...';
        btnProcess.disabled = true;

        // Use setTimeout to allow UI to update (spinner) before heavy canvas work
        setTimeout(() => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // High quality scaling settings
            canvas.width = targetW;
            canvas.height = targetH;
            
            // Draw
            ctx.drawImage(originalImage, 0, 0, targetW, targetH);

            // Export
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const downloadBtn = document.getElementById('downloadLink');
                
                downloadBtn.href = url;
                // Add dimensions to filename: image-800x600.jpg
                const ext = currentFile.name.split('.').pop();
                const name = currentFile.name.replace(`.${ext}`, '');
                downloadBtn.download = `${name}-${targetW}x${targetH}.${ext}`;

                processingArea.style.display = 'none';
                resultArea.style.display = 'block';
                
                btnProcess.innerHTML = 'Resize Image';
                btnProcess.disabled = false;
            }, currentFile.type, 0.92); // 0.92 quality for JPEGs
        }, 100);
    });
});
