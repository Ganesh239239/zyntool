let img = new Image();
let canvas, ctx;
let brightness = 100;
let contrast = 100;
let saturation = 100;
let blur = 0;
let grayscale = 0;
let sepia = 0;

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
                <label>Brightness: <span id="brightnessValue">${brightness}%</span></label>
                <input type="range" id="brightnessSlider" min="0" max="200" value="${brightness}" 
                       oninput="updateFilter('brightness', this.value)">
            </div>
            <div class="control-group">
                <label>Contrast: <span id="contrastValue">${contrast}%</span></label>
                <input type="range" id="contrastSlider" min="0" max="200" value="${contrast}" 
                       oninput="updateFilter('contrast', this.value)">
            </div>
            <div class="control-group">
                <label>Saturation: <span id="saturationValue">${saturation}%</span></label>
                <input type="range" id="saturationSlider" min="0" max="200" value="${saturation}" 
                       oninput="updateFilter('saturation', this.value)">
            </div>
            <div class="control-group">
                <label>Blur: <span id="blurValue">${blur}px</span></label>
                <input type="range" id="blurSlider" min="0" max="10" value="${blur}" 
                       oninput="updateFilter('blur', this.value)">
            </div>
            <div class="control-group">
                <label>Grayscale: <span id="grayscaleValue">${grayscale}%</span></label>
                <input type="range" id="grayscaleSlider" min="0" max="100" value="${grayscale}" 
                       oninput="updateFilter('grayscale', this.value)">
            </div>
            <div class="control-group">
                <label>Sepia: <span id="sepiaValue">${sepia}%</span></label>
                <input type="range" id="sepiaSlider" min="0" max="100" value="${sepia}" 
                       oninput="updateFilter('sepia', this.value)">
            </div>
        `;
    }

    resetBtn.addEventListener('click', () => {
        brightness = 100;
        contrast = 100;
        saturation = 100;
        blur = 0;
        grayscale = 0;
        sepia = 0;
        createControls();
        drawImage();
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

function drawImage() {
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply CSS filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.filter = 'none';
}

function updateFilter(type, value) {
    value = parseInt(value);

    switch(type) {
        case 'brightness':
            brightness = value;
            document.getElementById('brightnessValue').textContent = value + '%';
            break;
        case 'contrast':
            contrast = value;
            document.getElementById('contrastValue').textContent = value + '%';
            break;
        case 'saturation':
            saturation = value;
            document.getElementById('saturationValue').textContent = value + '%';
            break;
        case 'blur':
            blur = value;
            document.getElementById('blurValue').textContent = value + 'px';
            break;
        case 'grayscale':
            grayscale = value;
            document.getElementById('grayscaleValue').textContent = value + '%';
            break;
        case 'sepia':
            sepia = value;
            document.getElementById('sepiaValue').textContent = value + '%';
            break;
    }

    drawImage();
}