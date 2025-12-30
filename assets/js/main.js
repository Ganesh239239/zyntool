document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu
    const toggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    toggle.onclick = () => {
        sidebar.classList.toggle('active');
        overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
    };

    overlay.onclick = () => {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
    };

    // 2. Filtering
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.onclick = () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.getAttribute('data-filter');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    // Force flex on mobile, block on desktop
                    card.style.display = (window.innerWidth <= 768) ? 'flex' : 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        };
    });
});
