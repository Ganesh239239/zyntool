export default {
    title: 'Upscale Image',
    renderUI: () => `<div class="text-muted">Scaling 2x Resolution...</div>`,
    process: async (img) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth * 2;
        cvs.height = img.naturalHeight * 2;
        cvs.getContext('2d').drawImage(img, 0, 0, cvs.width, cvs.height);
        return new Promise(r => cvs.toBlob(r));
    }
};
