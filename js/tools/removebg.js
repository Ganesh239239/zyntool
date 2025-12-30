export default {
    title: 'Remove Background',
    renderUI: () => `
        <label>White Tolerance</label>
        <input type="range" class="form-range" id="tol" min="0" max="100" value="20">
    `,
    process: async (img) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth; cvs.height = img.naturalHeight;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const frame = ctx.getImageData(0,0,cvs.width,cvs.height);
        const limit = 255 - parseInt(document.getElementById('tol').value);
        
        for(let i=0; i<frame.data.length; i+=4) {
            const r=frame.data[i], g=frame.data[i+1], b=frame.data[i+2];
            if(r>limit && g>limit && b>limit) frame.data[i+3] = 0; // Transparent
        }
        ctx.putImageData(frame, 0, 0);
        return new Promise(r => cvs.toBlob(r));
    }
};
