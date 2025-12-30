document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');

    // Filter Logic
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // UI Toggle
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filterValue = pill.getAttribute('data-filter');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    // Critical Fix: Re-apply display type based on screen width
                    if (window.innerWidth <= 768) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'block';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Sidebar Toggle
    const ham = document.getElementById('mobileToggle');
    const side = document.getElementById('sidebar');
    const over = document.getElementById('overlay');

    if(ham) {
        ham.onclick = () => {
            side.classList.add('active');
            over.style.display = 'block';
        };
    }
    if(over) {
        over.onclick = () => {
            side.classList.remove('active');
            over.style.display = 'none';
        };
    }
});
