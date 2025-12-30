export default {
    title: 'Blur Image',
    renderUI: () => `<label>Intensity</label><input type="range" class="form-range" id="bVal" min="0" max="20" value="10">`,
    process: async (img) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth; cvs.height = img.naturalHeight;
        const ctx = cvs.getContext('2d');
        ctx.filter = `blur(${document.getElementById('bVal').value}px)`;
        ctx.drawImage(img, 0, 0);
        return new Promise(r => cvs.toBlob(r));
    }
};
