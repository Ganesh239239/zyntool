// Navigation logic
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
if(menuBtn) menuBtn.onclick = () => navMenu.classList.toggle("active");

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const qRange = document.getElementById('qualityRange');
const qLabel = document.getElementById('qLabel');
const processBtn = document.getElementById('processBtn');

let originalFile = null;

dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        originalFile = file;
        document.getElementById('editorLayout').style.display = 'grid';
        dropZone.style.display = 'none';
        document.getElementById('origSize').innerText = (file.size / 1024).toFixed(2) + " KB";
        
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imagePreview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
};

qRange.oninput = () => {
    let val = qRange.value;
    if(val < 30) qLabel.innerText = "Extreme";
    else if(val < 60) qLabel.innerText = "Recommended";
    else qLabel.innerText = "Low";
};

processBtn.onclick = () => {
    processBtn.innerText = "Compressing...";
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Quality from range (reversed logic for UX: lower range = higher compression)
        const quality = qRange.value / 100;
        
        // We use 'image/jpeg' even for PNGs to ensure STRONG compression
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "ZynTool_Compressed_" + originalFile.name.split('.')[0] + ".jpg";
            link.click();
            
            document.getElementById('newSize').innerText = (blob.size / 1024).toFixed(2) + " KB";
            processBtn.innerText = "Compress & Download";
        }, "image/jpeg", quality);
    };
    img.src = document.getElementById('imagePreview').src;
};
