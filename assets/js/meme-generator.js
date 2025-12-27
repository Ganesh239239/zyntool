let img = new Image();
let canvas, ctx;
let topText = '';
let bottomText = '';
let fontSize = 60;
let textColor = 'white';

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
                <label>Top Text</label>
                <input type="text" id="topText" value="${topText}" 
                       oninput="updateMeme()" placeholder="TOP TEXT">
            </div>
            <div class="control-group">
                <label>Bottom Text</label>
                <input type="text" id="bottomText" value="${bottomText}" 
                       oninput="updateMeme()" placeholder="BOTTOM TEXT">
            </div>
            <div class="control-group">
                <label>Font Size: <span id="fontSizeValue">${fontSize}px</span></label>
                <input type="range" id="fontSizeSlider" min="30" max="100" value="${fontSize}" 
                       oninput="updateFontSize(this.value)">
            </div>
            <div class="control-group">
                <label>Text Color</label>
                <select id="colorSelect" onchange="updateColor(this.value)">
                    <option value="white" selected>White (Classic)</option>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="yellow">Yellow</option>
                </select>
            </div>
        `;
    }

    resetBtn.addEventListener('click', () => {
        topText = '';
        bottomText = '';
        fontSize = 60;
        textColor = 'white';
        createControls();
        drawImage();
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

function drawImage() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Meme text style
    ctx.font = `bold ${fontSize}px Impact, Arial`;
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;

    // Top text
    if (topText) {
        const topY = fontSize + 20;
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY);
    }

    // Bottom text
    if (bottomText) {
        const bottomY = canvas.height - 20;
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY);
    }
}

function updateMeme() {
    topText = document.getElementById('topText').value;
    bottomText = document.getElementById('bottomText').value;
    drawImage();
}

function updateFontSize(value) {
    fontSize = parseInt(value);
    document.getElementById('fontSizeValue').textContent = fontSize + 'px';
    drawImage();
}

function updateColor(value) {
    textColor = value;
    drawImage();
}