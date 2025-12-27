let img = new Image();
let canvas, ctx;
let cropX = 0, cropY = 0, cropWidth = 0, cropHeight = 0;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const uploadArea = document.getElementById('uploadArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');

    initializeFileUpload('fileInput', 'uploadArea');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                img.src = event.target.result;
                img.onload = () => {
                    uploadArea.style.display = 'none';
                    previewArea.classList.add('active');
                    cropWidth = img.width;
                    cropHeight = img.height;
                    cropX = 0;
                    cropY = 0;
                    createControls();
                    drawImage();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    function createControls() {
        document.getElementById('controls').innerHTML = `
            <div class="control-group">
                <label>Crop Width: <span id="widthValue">${cropWidth}px</span></label>
                <input type="range" id="widthSlider" min="50" max="${img.width}" value="${cropWidth}" 
                       oninput="updateCrop()">
            </div>
            <div class="control-group">
                <label>Crop Height: <span id="heightValue">${cropHeight}px</span></label>
                <input type="range" id="heightSlider" min="50" max="${img.height}" value="${cropHeight}" 
                       oninput="updateCrop()">
            </div>
            <div class="control-group">
                <label>Position X: <span id="xValue">${cropX}px</span></label>
                <input type="range" id="xSlider" min="0" max="${img.width - cropWidth}" value="${cropX}" 
                       oninput="updateCrop()">
            </div>
            <div class="control-group">
                <label>Position Y: <span id="yValue">${cropY}px</span></label>
                <input type="range" id="ySlider" min="0" max="${img.height - cropHeight}" value="${cropY}" 
                       oninput="updateCrop()">
            </div>
            <div class="control-group">
                <label>Preset Ratios</label>
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="setRatio(1, 1)">1:1 Square</button>
                    <button class="btn btn-secondary" onclick="setRatio(16, 9)">16:9</button>
                    <button class="btn btn-secondary" onclick="setRatio(4, 3)">4:3</button>
                </div>
            </div>
        `;
    }

    resetBtn.addEventListener('click', () => {
        cropWidth = img.width;
        cropHeight = img.height;
        cropX = 0;
        cropY = 0;
        createControls();
        drawImage();
    });

    downloadBtn.addEventListener('click', () => {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

        const link = document.createElement('a');
        link.download = 'cropped-image.png';
        link.href = croppedCanvas.toDataURL();
        link.click();
    });
});

function drawImage() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, cropX, cropY, cropWidth, cropHeight);

    // Draw crop box border
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
}

function updateCrop() {
    cropWidth = parseInt(document.getElementById('widthSlider').value);
    cropHeight = parseInt(document.getElementById('heightSlider').value);
    cropX = parseInt(document.getElementById('xSlider').value);
    cropY = parseInt(document.getElementById('ySlider').value);

    document.getElementById('widthValue').textContent = cropWidth + 'px';
    document.getElementById('heightValue').textContent = cropHeight + 'px';
    document.getElementById('xValue').textContent = cropX + 'px';
    document.getElementById('yValue').textContent = cropY + 'px';

    // Update max values for position sliders
    document.getElementById('xSlider').max = img.width - cropWidth;
    document.getElementById('ySlider').max = img.height - cropHeight;

    drawImage();
}

function setRatio(ratioW, ratioH) {
    const maxWidth = img.width;
    const maxHeight = img.height;

    if (maxWidth / maxHeight > ratioW / ratioH) {
        cropHeight = maxHeight;
        cropWidth = Math.round(cropHeight * ratioW / ratioH);
    } else {
        cropWidth = maxWidth;
        cropHeight = Math.round(cropWidth * ratioH / ratioW);
    }

    cropX = Math.round((maxWidth - cropWidth) / 2);
    cropY = Math.round((maxHeight - cropHeight) / 2);

    document.getElementById('widthSlider').value = cropWidth;
    document.getElementById('heightSlider').value = cropHeight;
    document.getElementById('xSlider').value = cropX;
    document.getElementById('ySlider').value = cropY;

    updateCrop();
}