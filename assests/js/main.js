document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Pill Active state
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            // Filtering logic
            const category = pill.getAttribute('data-cat');
            cards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
