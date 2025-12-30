// Mobile Menu Toggle (Since we are on a new page)
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
if(menuBtn) {
    menuBtn.onclick = () => navMenu.classList.toggle("active");
}

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const editorLayout = document.getElementById('editorLayout');
const imagePreview = document.getElementById('imagePreview');
const qRange = document.getElementById('qualityRange');
const qLabel = document.getElementById('qLabel');
const processBtn = document.getElementById('processBtn');

let originalFile = null;

// File Upload Logic
dropZone.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        originalFile = file;
        dropZone.style.display = 'none';
        editorLayout.style.display = 'grid';
        document.getElementById('origSize').innerText = (file.size / 1024).toFixed(2) + " KB";
        
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            updatePreviewStats();
        };
        reader.readAsDataURL(file);
    }
};

// Update Stats Label
qRange.oninput = () => {
    qLabel.innerText = qRange.value + "%";
    updatePreviewStats();
};

function updatePreviewStats() {
    // Estimate size reduction
    const estimated = originalFile.size * (qRange.value / 100);
    document.getElementById('newSize').innerText = (estimated / 1024).toFixed(2) + " KB";
    const saving = 100 - qRange.value;
    document.getElementById('savePercent').innerText = saving + "%";
}

// Processing
processBtn.onclick = () => {
    processBtn.innerText = "Processing...";
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "ZynTool_" + originalFile.name;
            link.click();
            processBtn.innerText = "Compress & Download";
        }, "image/jpeg", qRange.value / 100);
    };
    img.src = imagePreview.src;
};
