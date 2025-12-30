export default {
    title: 'Photo Editor',
    renderUI: () => `
        <label>Brightness</label><input type="range" class="form-range" id="vB" min="0" max="200" value="100">
        <label>Contrast</label><input type="range" class="form-range" id="vC" min="0" max="200" value="100">
    `,
    init: (img) => {
        // Simple live preview binder
        const update = () => {
            img.style.filter = `brightness(${document.getElementById('vB').value}%) contrast(${document.getElementById('vC').value}%)`;
        };
        document.getElementById('vB').oninput = update;
        document.getElementById('vC').oninput = update;
    },
    process: async (img) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth; cvs.height = img.naturalHeight;
        const ctx = cvs.getContext('2d');
        const b = document.getElementById('vB').value;
        const c = document.getElementById('vC').value;
        ctx.filter = `brightness(${b}%) contrast(${c}%)`;
        ctx.drawImage(img, 0, 0);
        return new Promise(r => cvs.toBlob(r));
    }
};
