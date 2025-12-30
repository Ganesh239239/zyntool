// Navigation Toggle
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
menuBtn.onclick = () => navMenu.classList.toggle("active");

// Tool Logic
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const editorLayout = document.getElementById('editorLayout');
const imagePreview = document.getElementById('imagePreview');
const qRange = document.getElementById('qualityRange');
const qLabel = document.getElementById('qLabel');
const processBtn = document.getElementById('processBtn');

let originalFile = null;

// Trigger upload
dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        originalFile = file;
        dropZone.style.display = 'none';
        editorLayout.style.display = 'grid';
        document.getElementById('origSize').innerText = (file.size / 1024).toFixed(2) + " KB";
        
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            updateEstimate();
        };
        reader.readAsDataURL(file);
    }
};

// UI Feedback
qRange.oninput = () => {
    const val = qRange.value;
    if (val < 30) qLabel.innerText = "Extreme (Smallest)";
    else if (val < 70) qLabel.innerText = "Good (Balanced)";
    else qLabel.innerText = "Best (High Quality)";
    updateEstimate();
};

function updateEstimate() {
    // Visual estimate for the user
    const estimate = originalFile.size * (qRange.value / 100) * 0.8;
    document.getElementById('newSize').innerText = "~" + (estimate / 1024).toFixed(2) + " KB";
}

// Compression Engine
processBtn.onclick = () => {
    processBtn.innerText = "Processing...";
    processBtn.disabled = true;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw white background (prevents black background on PNGs)
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Quality slider conversion (Lower = stronger compression)
        const quality = qRange.value / 100;

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "ZynTool_Compressed_" + originalFile.name.split('.')[0] + ".jpg";
            link.click();

            processBtn.innerText = "Compress & Download";
            processBtn.disabled = false;
        }, "image/jpeg", quality);
    };
    img.src = imagePreview.src;
};
