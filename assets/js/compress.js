// Compress
const uploadZone=document.getElementById('upload-zone'),selectBtn=document.getElementById('select-btn'),fileInput=document.getElementById('file-input'),workArea=document.getElementById('work-area'),loadingOverlay=document.getElementById('loading-overlay'),thumbnailImg=document.getElementById('thumbnail-img'),imageName=document.getElementById('image-name'),controlsContent=document.getElementById('controls-content'),processBtn=document.getElementById('process-btn'),downloadBtn=document.getElementById('download-btn');let currentImage=null,originalFile=null,processedBlob=null;

controlsContent.innerHTML=`<div class="control-item">
    <label class="control-label">
        <span>Quality</span>
        <span id="quality-value">80</span>
    </label>
    <input type="range" id="quality-slider" class="slider" min="1" max="100" value="80">
    <div class="slider-labels">
        <span>Low</span>
        <span>High</span>
    </div>
</div>
<div class="info-box">
    <p>Lower quality = smaller file size</p>
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
const quality = parseInt(document.getElementById('quality-slider').value) / 100;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    ctx.drawImage(currentImage, 0, 0);

    canvas.toBlob(blob => {
        processedBlob = blob;
        downloadBtn.disabled = false;
        loadingOverlay.style.display = 'none';
    }, 'image/jpeg', quality);
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
    a.download='compress_'+originalFile.name;
    a.click();
    URL.revokeObjectURL(url);
};