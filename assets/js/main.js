document.addEventListener('DOMContentLoaded', () => {
    // 1. MOBILE MENU TOGGLE
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const body = document.body;

    if (mobileToggle && mobileSidebar && sidebarOverlay) {
        mobileToggle.addEventListener('click', () => {
            mobileSidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            body.style.overflow = mobileSidebar.classList.contains('active') ? 'hidden' : '';
        });

        sidebarOverlay.addEventListener('click', () => {
            mobileSidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            body.style.overflow = '';
        });
    }

    // 2. HERO SECTION FILTER PILLS
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update active UI
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filterValue = pill.getAttribute('data-filter');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'block'; // Desktop default
                    // Handle mobile flex display inside media query logic via CSS classes if needed
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
