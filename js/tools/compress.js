// Nav Toggle
document.getElementById("menuBtn").onclick = () => {
    document.getElementById("navMenu").classList.toggle("active");
};

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const editorLayout = document.getElementById('editorLayout');
const imagePreview = document.getElementById('imagePreview');
const qRange = document.getElementById('qualityRange');
const qLabel = document.getElementById('qLabel');
const processBtn = document.getElementById('processBtn');

let originalFile = null;

// Handle File Selection
dropZone.onclick = () => fileInput.click();

dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = "#3b82f6"; };
dropZone.ondragleave = () => { dropZone.style.borderColor = "#cbd5e1"; };
dropZone.ondrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
};

fileInput.onchange = (e) => handleFile(e.target.files[0]);

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }
    originalFile = file;
    dropZone.style.display = 'none';
    editorLayout.style.display = 'grid';
    document.getElementById('origSize').innerText = (file.size / 1024).toFixed(2) + " KB";
    
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Range Label Update
qRange.oninput = () => {
    const val = qRange.value;
    qLabel.innerText = val < 30 ? "Extreme" : (val < 70 ? "Recommended" : "Low");
};

// Compression Logic
processBtn.onclick = () => {
    processBtn.innerText = "Processing...";
    processBtn.disabled = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // FIXED: Set white background for transparent PNGs
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const quality = qRange.value / 100;
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "ZynTool_" + originalFile.name.split('.')[0] + ".jpg";
            link.click();

            document.getElementById('newSize').innerText = (blob.size / 1024).toFixed(2) + " KB";
            processBtn.innerText = "Compress & Download";
            processBtn.disabled = false;
            
            // Clean memory
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, "image/jpeg", quality);
    };
    img.src = imagePreview.src;
};
