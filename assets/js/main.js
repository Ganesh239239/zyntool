document.addEventListener('DOMContentLoaded', () => {
    const pills = document.querySelectorAll('.pill');
    const cards = document.querySelectorAll('.tool-card');
    const mobileToggle = document.getElementById('mobileToggle');

    // 1. Filtering Logic (Hero Menus)
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active from all, add to clicked
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filterValue = pill.getAttribute('data-filter');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex'; // Use flex to maintain mobile alignment
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Adjust for Desktop Grid (where it should be 'block')
            if (window.innerWidth > 768) {
                cards.forEach(card => {
                    if (card.style.display !== 'none') card.style.display = 'block';
                });
            }
        });
    });

    // 2. Mobile Sidebar Toggle (Placeholder for your sidebar logic)
    if(mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            // Your sidebar code here
            console.log("Mobile Menu Clicked");
        });
    }
});
