let img = new Image();
let canvas, ctx;
let newWidth, newHeight;
let aspectRatio;
let lockAspect = true;

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
                    newWidth = img.width;
                    newHeight = img.height;
                    aspectRatio = img.width / img.height;
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
                <label>
                    <input type="checkbox" id="aspectCheck" ${lockAspect ? 'checked' : ''} onchange="toggleAspect()">
                    Lock Aspect Ratio
                </label>
            </div>
            <div class="control-group">
                <label>Width: <span id="widthValue">${newWidth}px</span></label>
                <input type="range" id="widthSlider" min="50" max="${img.width * 2}" value="${newWidth}" 
                       oninput="updateWidth(this.value)">
            </div>
            <div class="control-group">
                <label>Height: <span id="heightValue">${newHeight}px</span></label>
                <input type="range" id="heightSlider" min="50" max="${img.height * 2}" value="${newHeight}" 
                       oninput="updateHeight(this.value)">
            </div>
            <div class="control-group">
                <label>Original: ${img.width} x ${img.height}px</label>
                <label>New: <span id="dimensions">${newWidth} x ${newHeight}px</span></label>
            </div>
            <div class="control-group">
                <label>Quick Resize</label>
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="quickResize(0.5)">50%</button>
                    <button class="btn btn-secondary" onclick="quickResize(0.75)">75%</button>
                    <button class="btn btn-secondary" onclick="quickResize(1.5)">150%</button>
                    <button class="btn btn-secondary" onclick="quickResize(2)">200%</button>
                </div>
            </div>
        `;
    }

    resetBtn.addEventListener('click', () => {
        newWidth = img.width;
        newHeight = img.height;
        lockAspect = true;
        createControls();
        drawImage();
    });

    downloadBtn.addEventListener('click', () => {
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;
        const resizedCtx = resizedCanvas.getContext('2d');
        resizedCtx.drawImage(img, 0, 0, newWidth, newHeight);

        const link = document.createElement('a');
        link.download = 'resized-image.png';
        link.href = resizedCanvas.toDataURL();
        link.click();
    });
});

function drawImage() {
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
}

function updateWidth(value) {
    newWidth = parseInt(value);
    if (lockAspect) {
        newHeight = Math.round(newWidth / aspectRatio);
        document.getElementById('heightSlider').value = newHeight;
        document.getElementById('heightValue').textContent = newHeight + 'px';
    }
    document.getElementById('widthValue').textContent = newWidth + 'px';
    document.getElementById('dimensions').textContent = newWidth + ' x ' + newHeight + 'px';
    drawImage();
}

function updateHeight(value) {
    newHeight = parseInt(value);
    if (lockAspect) {
        newWidth = Math.round(newHeight * aspectRatio);
        document.getElementById('widthSlider').value = newWidth;
        document.getElementById('widthValue').textContent = newWidth + 'px';
    }
    document.getElementById('heightValue').textContent = newHeight + 'px';
    document.getElementById('dimensions').textContent = newWidth + ' x ' + newHeight + 'px';
    drawImage();
}

function toggleAspect() {
    lockAspect = document.getElementById('aspectCheck').checked;
}

function quickResize(scale) {
    newWidth = Math.round(img.width * scale);
    newHeight = Math.round(img.height * scale);
    document.getElementById('widthSlider').value = newWidth;
    document.getElementById('heightSlider').value = newHeight;
    document.getElementById('widthValue').textContent = newWidth + 'px';
    document.getElementById('heightValue').textContent = newHeight + 'px';
    document.getElementById('dimensions').textContent = newWidth + ' x ' + newHeight + 'px';
    drawImage();
}