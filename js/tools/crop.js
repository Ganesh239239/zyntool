let cropper = null;
export default {
    title: 'Crop IMAGE',
    renderUI: () => `<div class="alert alert-info py-1">Drag on image to crop</div>`,
    init: (img) => {
        if(cropper) cropper.destroy();
        cropper = new Cropper(img, { viewMode: 1, minContainerHeight: 300 });
    },
    process: async () => {
        const cvs = cropper.getCroppedCanvas();
        return new Promise(r => cvs.toBlob(r));
    },
    cleanup: () => {
        if(cropper) { cropper.destroy(); cropper = null; }
    }
};
