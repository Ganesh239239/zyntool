// assets/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');
    const hamburger = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    // 1. Mobile Sidebar Logic
    hamburger.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.style.display = 'block';
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
    });

    // 2. Filter Pills Logic
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            const filter = pill.getAttribute('data-filter');
            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    // Maintain mobile flex or desktop block via CSS classes or manual set
                    card.style.display = (window.innerWidth <= 768) ? 'flex' : 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
