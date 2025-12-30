function initMainLogic() {
    const ham = document.getElementById('hamBtn'), side = document.getElementById('sidebar'), over = document.getElementById('overlay');
    
    if(ham) ham.onclick = () => { side.classList.add('active'); over.style.display = 'block'; };
    if(over) over.onclick = () => { side.classList.remove('active'); over.style.display = 'none'; };

    const pills = document.querySelectorAll('.pill'), cards = document.querySelectorAll('.tool-card');
    pills.forEach(p => p.onclick = () => {
        pills.forEach(x => x.classList.remove('active')); p.classList.add('active');
        const f = p.dataset.f;
        cards.forEach(c => {
            if(f === 'all' || c.dataset.cat === f) c.style.display = window.innerWidth <= 768 ? 'flex' : 'block';
            else c.style.display = 'none';
        });
    });
}
