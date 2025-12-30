// js/tools/resize.js

export default {
    title: 'Resize IMAGE',

    renderUI: (w, h) => `
        <div class="row">
            <div class="col-6">
                <label>Width</label>
                <input type="number" id="w" class="form-control" value="${w}">
            </div>
            <div class="col-6">
                <label>Height</label>
                <input type="number" id="h" class="form-control" value="${h}">
            </div>
        </div>
    `,

    process: async (imgElement) => {
        const w = parseInt(document.getElementById('w').value);
        const h = parseInt(document.getElementById('h').value);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0, w, h);

        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    }
};
