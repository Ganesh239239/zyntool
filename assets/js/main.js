document.addEventListener('DOMContentLoaded', () => {
    // Mobile Sidebar
    const toggle = document.getElementById('hamToggle'), side = document.getElementById('sidebar'), over = document.getElementById('overlay');
    toggle.onclick = () => { side.classList.add('active'); over.style.display = 'block'; };
    over.onclick = () => { side.classList.remove('active'); over.style.display = 'none'; };

    // Tool Filtering
    const pills = document.querySelectorAll('.pill'), cards = document.querySelectorAll('.tool-card');
    pills.forEach(p => p.onclick = () => {
        pills.forEach(x => x.classList.remove('active')); p.classList.add('active');
        const f = p.dataset.filter;
        cards.forEach(c => {
            if(f === 'all' || c.dataset.cat === f) c.style.display = window.innerWidth <= 768 ? 'flex' : 'block';
            else c.style.display = 'none';
        });
    });
});
