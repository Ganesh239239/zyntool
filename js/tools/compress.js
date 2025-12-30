export default {
    title: 'Compress IMAGE',
    renderUI: () => `
        <label class="form-label">Compression Level</label>
        <input type="range" class="form-range" id="qRange" min="0.1" max="1" step="0.1" value="0.6">
        <div class="d-flex justify-content-between small text-muted"><span>Max</span><span>Balanced</span><span>Light</span></div>
    `,
    process: async (img, file) => {
        const q = parseFloat(document.getElementById('qRange').value);
        return await imageCompression(file, { maxSizeMB: 1, initialQuality: q, useWebWorker: true });
    }
};
