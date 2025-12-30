document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    // Sidebar
    toggle.onclick = () => {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
    };
    overlay.onclick = () => {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
    };

    // Filters
    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.dataset.filter;
            cards.forEach(card => {
                if(filter === 'all' || card.dataset.category === filter) {
                    card.style.display = (window.innerWidth <= 768) ? 'flex' : 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        };
    });
});
