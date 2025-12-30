export default {
    title: 'HTML to IMAGE',
    renderUI: () => `<div class="text-muted">Rendering HTML...</div>`,
    process: async (elementToRender) => {
        // This receives the HTML div element instead of an image
        const canvas = await html2canvas(elementToRender);
        return new Promise(r => canvas.toBlob(r, 'image/jpeg'));
    }
};
