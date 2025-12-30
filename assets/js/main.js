document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Logic
    const toggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (toggle) {
        toggle.onclick = () => {
            sidebar.classList.add('active');
            overlay.style.display = 'block';
        };
    }
    if (overlay) {
        overlay.onclick = () => {
            sidebar.classList.remove('active');
            overlay.style.display = 'none';
        };
    }

    // 2. Filter Logic
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const filter = pill.getAttribute('data-filter');
            cards.forEach(card => {
                if(filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = (window.innerWidth <= 768) ? 'flex' : 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        };
    });
});
