async function loadComponent(id, file) {
    const res = await fetch(`./components/${file}`);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Parts
    Promise.all([
        loadComponent('header-part', 'header.html'),
        loadComponent('sidebar-part', 'sidebar.html'),
        loadComponent('footer-part', 'footer.html')
    ]).then(() => {
        initApp();
    });
});

function initApp() {
    // Sidebar Logic
    const ham = document.getElementById('hamBtn'), side = document.getElementById('sidebar'), over = document.getElementById('overlay');
    if(ham) ham.onclick = () => { side.classList.add('active'); over.style.display = 'block'; };
    if(over) over.onclick = () => { side.classList.remove('active'); over.style.display = 'none'; };

    // Filter Logic
    const pills = document.querySelectorAll('.pill'), wrappers = document.querySelectorAll('.tool-wrapper');
    pills.forEach(p => p.onclick = () => {
        pills.forEach(x => x.classList.remove('active')); p.classList.add('active');
        const f = p.dataset.f;
        wrappers.forEach(w => {
            w.style.display = (f === 'all' || w.dataset.c === f) ? 'block' : 'none';
        });
    });
}
