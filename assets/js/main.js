document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const f = pill.dataset.filter;
            cards.forEach(c => {
                if(f === 'all' || c.dataset.category === f) {
                    c.style.display = (window.innerWidth <= 768) ? 'flex' : 'block';
                } else {
                    c.style.display = 'none';
                }
            });
        };
    });
});
