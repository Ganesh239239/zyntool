export default {
    title: 'Resize IMAGE',
    renderUI: (w, h) => `
        <div class="row">
            <div class="col-6"><label>Width</label><input type="number" id="w" class="form-control" value="${w}"></div>
            <div class="col-6"><label>Height</label><input type="number" id="h" class="form-control" value="${h}"></div>
        </div>
    `,
    process: async (img) => {
        const w = parseInt(document.getElementById('w').value);
        const h = parseInt(document.getElementById('h').value);
        const cvs = document.createElement('canvas');
        cvs.width = w; cvs.height = h;
        cvs.getContext('2d').drawImage(img, 0, 0, w, h);
        return new Promise(r => cvs.toBlob(r));
    }
};
