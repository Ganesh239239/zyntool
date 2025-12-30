// assets/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update Active Pill UI
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.getAttribute('data-filter');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    // Smart display check
                    if (window.innerWidth <= 768) {
                        card.style.display = 'flex'; // Mobile List Style
                    } else {
                        card.style.display = 'block'; // Desktop Grid Style
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
