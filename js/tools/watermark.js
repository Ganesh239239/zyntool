export default {
    title: 'Watermark',
    renderUI: () => `<label>Text</label><input type="text" class="form-control" id="wmText" value="© Copyright">`,
    process: async (img) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth; cvs.height = img.naturalHeight;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const text = document.getElementById('wmText').value;
        ctx.font = `bold ${cvs.width/10}px Arial`;
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(text, cvs.width/2, cvs.height/2);
        return new Promise(r => cvs.toBlob(r));
    }
};
