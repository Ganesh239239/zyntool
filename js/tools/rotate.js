let rot = 0;
export default {
    title: 'Rotate IMAGE',
    renderUI: () => `
        <div class="text-center">
            <button class="btn btn-outline-secondary" id="btnRotLeft"><i class="fa fa-undo"></i></button>
            <button class="btn btn-outline-secondary" id="btnRotRight"><i class="fa fa-redo"></i></button>
        </div>
    `,
    init: (img) => {
        rot = 0;
        const update = () => img.style.transform = `rotate(${rot}deg)`;
        document.getElementById('btnRotLeft').onclick = () => { rot -= 90; update(); };
        document.getElementById('btnRotRight').onclick = () => { rot += 90; update(); };
    },
    process: async (img) => {
        const cvs = document.createElement('canvas');
        const swap = (Math.abs(rot / 90) % 2 === 1);
        cvs.width = swap ? img.naturalHeight : img.naturalWidth;
        cvs.height = swap ? img.naturalWidth : img.naturalHeight;
        
        const ctx = cvs.getContext('2d');
        ctx.translate(cvs.width/2, cvs.height/2);
        ctx.rotate(rot * Math.PI/180);
        ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);
        return new Promise(r => cvs.toBlob(r));
    },
    cleanup: () => { rot = 0; }
};
