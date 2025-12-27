let img = new Image();
let canvas, ctx;
let watermarkText = 'Watermark';
let fontSize = 40;
let position = 'bottom-right';
let opacity = 0.7;
let color = '#ffffff';

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
                <label>Watermark Text</label>
                <input type="text" id="watermarkText" value="${watermarkText}" 
                       oninput="updateWatermark()">
            </div>
            <div class="control-group">
                <label>Font Size: <span id="fontSizeValue">${fontSize}px</span></label>
                <input type="range" id="fontSizeSlider" min="20" max="100" value="${fontSize}" 
                       oninput="updateFontSize(this.value)">
            </div>
            <div class="control-group">
                <label>Position</label>
                <select id="positionSelect" onchange="updatePosition(this.value)">
                    <option value="bottom-right" selected>Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Center</option>
                </select>
            </div>
            <div class="control-group">
                <label>Opacity: <span id="opacityValue">${Math.round(opacity * 100)}%</span></label>
                <input type="range" id="opacitySlider" min="0.1" max="1" step="0.1" value="${opacity}" 
                       oninput="updateOpacity(this.value)">
            </div>
            <div class="control-group">
                <label>Color</label>
                <select id="colorSelect" onchange="updateColor(this.value)">
                    <option value="#ffffff" selected>White</option>
                    <option value="#000000">Black</option>
                    <option value="#ff0000">Red</option>
                    <option value="#00ff00">Green</option>
                    <option value="#0000ff">Blue</option>
                </select>
            </div>
        `;
    }

    resetBtn.addEventListener('click', () => {
        watermarkText = 'Watermark';
        fontSize = 40;
        position = 'bottom-right';
        opacity = 0.7;
        color = '#ffffff';
        createControls();
        drawImage();
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'watermarked-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

function drawImage() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Draw watermark
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    const textWidth = ctx.measureText(watermarkText).width;
    const padding = 20;

    let x, y;
    switch(position) {
        case 'bottom-right':
            x = canvas.width - textWidth - padding;
            y = canvas.height - padding;
            break;
        case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            break;
        case 'top-right':
            x = canvas.width - textWidth - padding;
            y = fontSize + padding;
            break;
        case 'top-left':
            x = padding;
            y = fontSize + padding;
            break;
        case 'center':
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
            break;
    }

    // Draw text shadow
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(watermarkText, x, y);
    ctx.fillText(watermarkText, x, y);

    ctx.globalAlpha = 1;
}

function updateWatermark() {
    watermarkText = document.getElementById('watermarkText').value;
    drawImage();
}

function updateFontSize(value) {
    fontSize = parseInt(value);
    document.getElementById('fontSizeValue').textContent = fontSize + 'px';
    drawImage();
}

function updatePosition(value) {
    position = value;
    drawImage();
}

function updateOpacity(value) {
    opacity = parseFloat(value);
    document.getElementById('opacityValue').textContent = Math.round(opacity * 100) + '%';
    drawImage();
}

function updateColor(value) {
    color = value;
    drawImage();
}