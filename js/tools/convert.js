// Handles both 'tojpg' and 'fromjpg' based on ID passed to process
export default {
    title: 'Convert Format',
    renderUI: () => `<div class="text-muted">Converts automatically.</div>`,
    process: async (img, file, toolId) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.naturalWidth; cvs.height = img.naturalHeight;
        const ctx = cvs.getContext('2d');
        // If JPG, fill white background for transparency handling
        if(toolId === 'tojpg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0,0,cvs.width,cvs.height);
        }
        ctx.drawImage(img, 0, 0);
        
        const type = (toolId === 'tojpg') ? 'image/jpeg' : 'image/png';
        return new Promise(r => cvs.toBlob(r, type, 0.9));
    }
};
