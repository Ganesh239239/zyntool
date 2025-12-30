document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Control
    const ham = document.getElementById('hamBtn'), side = document.getElementById('sidebar'), over = document.getElementById('overlay');
    
    ham.onclick = () => { side.classList.add('active'); over.style.display = 'block'; };
    over.onclick = () => { side.classList.remove('active'); over.style.display = 'none'; };

    // 2. Filter Pills Control
    const pills = document.querySelectorAll('.pill'), cards = document.querySelectorAll('.tool-card');
    pills.forEach(p => {
        p.onclick = () => {
            pills.forEach(x => x.classList.remove('active')); p.classList.add('active');
            const f = p.dataset.filter;
            cards.forEach(c => {
                if(f === 'all' || c.dataset.category === f) {
                    c.style.display = window.innerWidth <= 768 ? 'flex' : 'block';
                } else {
                    c.style.display = 'none';
                }
            });
        };
    });
});
