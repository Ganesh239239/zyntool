// js/tools/compress.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Select Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processingArea = document.getElementById('processingArea');
    const resultArea = document.getElementById('resultArea');
    const imagePreview = document.getElementById('imagePreview');
    const btnProcess = document.getElementById('btnProcess');
    
    // 2. Global Variables
    let currentFile = null;

    // 3. Event Listeners for Upload
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if(e.target.files[0]) handleFile(e.target.files[0]);
    });

    // Drag and Drop Visuals
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

    // 4. Handle File Loading
    function handleFile(file) {
        if(!file.type.startsWith('image/')) {
            alert("Please upload a valid image file.");
            return;
        }
        currentFile = file;

        // Show Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            
            // Update UI
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('fileSize').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
            
            dropZone.style.display = 'none';
            processingArea.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // 5. Handle Compression Process
    btnProcess.addEventListener('click', async () => {
        // Loading State
        const originalText = btnProcess.innerText;
        btnProcess.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Compressing...';
        btnProcess.disabled = true;

        try {
            // Get options
            const qualityLevel = parseFloat(document.getElementById('qualityRange').value);
            
            const options = {
                maxSizeMB: 1, // Target size (approx)
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: qualityLevel
            };

            // Run Compression Library
            const compressedBlob = await imageCompression(currentFile, options);

            // Show Result
            showResult(compressedBlob);

        } catch (error) {
            console.error(error);
            alert("Compression failed. Please try a different image.");
        } finally {
            btnProcess.innerText = originalText;
            btnProcess.disabled = false;
        }
    });

    function showResult(blob) {
        const url = URL.createObjectURL(blob);
        const downloadBtn = document.getElementById('downloadLink');
        
        downloadBtn.href = url;
        // Keep original name but add -compressed
        const newName = currentFile.name.replace(/(\.[\w\d_-]+)$/i, '-compressed$1');
        downloadBtn.download = newName;

        // Calculate Savings
        const oldSize = currentFile.size;
        const newSize = blob.size;
        const savedPercent = ((oldSize - newSize) / oldSize * 100).toFixed(0);
        
        // Update Success Message
        const msg = document.querySelector('.alert-success');
        if(newSize < oldSize) {
            msg.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> Compressed by <strong>${savedPercent}%</strong>! (${(newSize/1024).toFixed(0)} KB)`;
        } else {
            msg.innerHTML = `<i class="fa-solid fa-info-circle me-2"></i> File was already optimized.`;
        }

        processingArea.style.display = 'none';
        resultArea.style.display = 'block';
    }
});
