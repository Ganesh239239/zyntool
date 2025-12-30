document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all pills and add to the clicked one
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filterValue = pill.getAttribute('data-filter');

            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || filterValue === cardCategory) {
                    card.style.display = 'block';
                    // Optional: add a small fade-in animation
                    card.style.opacity = '0';
                    setTimeout(() => card.style.opacity = '1', 10);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
