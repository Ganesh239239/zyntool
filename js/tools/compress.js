// js/tools/compress.js

export default {
    title: 'Compress IMAGE',
    
    // Returns the HTML for the options panel
    renderUI: () => `
        <label class="form-label">Compression Level</label>
        <input type="range" class="form-range" id="quality" min="0.1" max="1" step="0.1" value="0.6">
        <div class="small text-muted">Low Quality ----- High Quality</div>
    `,

    // Does the actual work
    process: async (imgElement, fileObj) => {
        const quality = parseFloat(document.getElementById('quality').value);
        return await imageCompression(fileObj, { 
            maxSizeMB: 1, 
            initialQuality: quality,
            useWebWorker: true 
        });
    }
};
