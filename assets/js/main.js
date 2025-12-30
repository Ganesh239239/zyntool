document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filter = pill.getAttribute('data-filter');
            
            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (filter === 'all' || cat === filter) {
                    // This logic ensures mobile stays as a list and desktop stays as a grid
                    if (window.innerWidth <= 768) {
                        card.style.setProperty('display', 'flex', 'important');
                    } else {
                        card.style.display = 'block';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
