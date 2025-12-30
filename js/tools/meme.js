export default {
    title: 'Meme Generator',
    renderUI: () => `
        <label>Top</label><input type="text" id="mTop" class="form-control mb-2" value="TOP TEXT">
        <label>Bottom</label><input type="text" id="mBot" class="form-control" value="BOTTOM TEXT">
    `,
    process: async (img) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth; cvs.height = img.naturalHeight;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        ctx.font = `bold ${cvs.width/10}px Impact`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = cvs.width/200;
        ctx.textAlign = 'center';

        const draw = (txt, y) => {
            ctx.fillText(txt, cvs.width/2, y);
            ctx.strokeText(txt, cvs.width/2, y);
        };
        
        draw(document.getElementById('mTop').value.toUpperCase(), cvs.height*0.15);
        draw(document.getElementById('mBot').value.toUpperCase(), cvs.height*0.9);
        return new Promise(r => cvs.toBlob(r));
    }
};
