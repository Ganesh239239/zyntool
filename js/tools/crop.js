// js/tools/crop.js

let cropperInstance = null;

export default {
    title: 'Crop IMAGE',

    renderUI: () => `
        <div class="alert alert-info">Drag the box to crop your image</div>
    `,

    // Called when image is loaded
    init: (imgElement) => {
        cropperInstance = new Cropper(imgElement, { viewMode: 1 });
    },

    process: async () => {
        if (!cropperInstance) return null;
        const canvas = cropperInstance.getCroppedCanvas();
        return new Promise(resolve => canvas.toBlob(resolve));
    },

    // Clean up when leaving page
    cleanup: () => {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
    }
};
