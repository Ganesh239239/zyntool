// Crop
const uploadZone=document.getElementById('upload-zone'),selectBtn=document.getElementById('select-btn'),fileInput=document.getElementById('file-input'),workArea=document.getElementById('work-area'),loadingOverlay=document.getElementById('loading-overlay'),thumbnailImg=document.getElementById('thumbnail-img'),imageName=document.getElementById('image-name'),controlsContent=document.getElementById('controls-content'),processBtn=document.getElementById('process-btn'),downloadBtn=document.getElementById('download-btn');let currentImage=null,originalFile=null,processedBlob=null;

controlsContent.innerHTML=`<div class="control-item">
    <label class="control-label">Aspect Ratio</label>
    <select id="aspect-ratio" class="select-field">
        <option value="free">Free</option>
        <option value="1:1">Square (1:1)</option>
        <option value="16:9">Landscape (16:9)</option>
        <option value="4:3">Standard (4:3)</option>
        <option value="9:16">Portrait (9:16)</option>
    </select>
</div>
<div class="info-box">
    <p>Select an aspect ratio to crop your image</p>
</div>`;

// Quality slider handler
if(document.getElementById('quality-slider')){
    const slider=document.getElementById('quality-slider'),valueDisplay=document.getElementById('quality-value');
    slider.oninput=()=>valueDisplay.textContent=slider.value;
}

// Blur slider handler
if(document.getElementById('blur-slider')){
    const slider=document.getElementById('blur-slider'),valueDisplay=document.getElementById('blur-value');
    slider.oninput=()=>valueDisplay.textContent=slider.value;
}

selectBtn.onclick=()=>fileInput.click();
uploadZone.onclick=()=>fileInput.click();
uploadZone.ondragover=e=>{e.preventDefault();uploadZone.classList.add('dragover');};
uploadZone.ondragleave=()=>uploadZone.classList.remove('dragover');
uploadZone.ondrop=e=>{
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if(e.dataTransfer.files.length)fileInput.files=e.dataTransfer.files,handleFileSelect();
};

fileInput.onchange=handleFileSelect;

function handleFileSelect(){
    const file=fileInput.files[0];
    if(!file||!file.type.startsWith('image/'))return alert('Please select an image file');
    originalFile=file;
    const reader=new FileReader();
    reader.onload=e=>{
        currentImage=new Image();
        currentImage.onload=()=>{
            uploadZone.style.display='none';
            workArea.style.display='grid';
            thumbnailImg.src=e.target.result;
            imageName.textContent=file.name;
            processBtn.disabled=false;
        };
        currentImage.src=e.target.result;
    };
    reader.readAsDataURL(file);
}

processBtn.onclick=()=>{
    if(!currentImage)return;
    loadingOverlay.style.display='flex';
    setTimeout(()=>{
        try{
const ratio = document.getElementById('aspect-ratio').value;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let width = currentImage.width;
    let height = currentImage.height;

    if (ratio === '1:1') {
        width = height = Math.min(width, height);
    } else if (ratio === '16:9') {
        height = Math.round(width * 9 / 16);
    } else if (ratio === '4:3') {
        height = Math.round(width * 3 / 4);
    } else if (ratio === '9:16') {
        width = Math.round(height * 9 / 16);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(currentImage, 0, 0, width, height);

    canvas.toBlob(blob => {
        processedBlob = blob;
        downloadBtn.disabled = false;
        loadingOverlay.style.display = 'none';
    }, 'image/jpeg', 0.95);
        }catch(err){
            console.error(err);
            loadingOverlay.style.display='none';
            alert('Error processing image');
        }
    },500);
};

downloadBtn.onclick=()=>{
    if(!processedBlob)return;
    const url=URL.createObjectURL(processedBlob);
    const a=document.createElement('a');
    a.href=url;
    a.download='crop_'+originalFile.name;
    a.click();
    URL.revokeObjectURL(url);
};