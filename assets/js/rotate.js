let img = new Image();
let canvas, ctx;
let currentRotation = 0;
let flipH = false;
let flipV = false;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const previewArea = document.getElementById('previewArea');
    const controls = document.getElementById('controls');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Initialize file upload
    initializeFileUpload('fileInput', 'uploadArea');

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                img.src = event.target.result;
                img.onload = () => {
                    uploadArea.style.display = 'none';
                    previewArea.classList.add('active');
                    currentRotation = 0;
                    flipH = false;
                    flipV = false;
                    createControls();
                    drawImage();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    function createControls() {
        controls.innerHTML = `
            <div class="control-group">
                <label>Quick Rotate</label>
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="rotate(90)">↻ 90°</button>
                    <button class="btn btn-secondary" onclick="rotate(180)">↻ 180°</button>
                    <button class="btn btn-secondary" onclick="rotate(270)">↻ 270°</button>
                </div>
            </div>
            <div class="control-group">
                <label>Flip</label>
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="flipHorizontal()">Flip Horizontal ↔</button>
                    <button class="btn btn-secondary" onclick="flipVertical()">Flip Vertical ↕</button>
                </div>
            </div>
            <div class="control-group">
                <label>Current Rotation: <span id="rotationValue">${currentRotation}°</span></label>
                <input type="range" id="rotationSlider" min="0" max="360" value="${currentRotation}" 
                       oninput="rotateCustom(this.value)">
            </div>
        `;
    }

    resetBtn.addEventListener('click', () => {
        currentRotation = 0;
        flipH = false;
        flipV = false;
        createControls();
        drawImage();
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'rotated-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

function drawImage() {
    const rotation = currentRotation * Math.PI / 180;

    // Calculate new canvas size
    let width = img.width;
    let height = img.height;

    if (currentRotation % 180 !== 0) {
        canvas.width = height;
        canvas.height = width;
    } else {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate(rotation);

    // Apply flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw image centered
    ctx.drawImage(img, -width / 2, -height / 2, width, height);

    ctx.restore();
}

function rotate(degrees) {
    currentRotation = (currentRotation + degrees) % 360;
    document.getElementById('rotationValue').textContent = currentRotation + '°';
    document.getElementById('rotationSlider').value = currentRotation;
    drawImage();
}

function rotateCustom(value) {
    currentRotation = parseInt(value);
    document.getElementById('rotationValue').textContent = currentRotation + '°';
    drawImage();
}

function flipHorizontal() {
    flipH = !flipH;
    drawImage();
}

function flipVertical() {
    flipV = !flipV;
    drawImage();
}