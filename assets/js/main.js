// Main JavaScript - Menu & Category Filter
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');

    if (menuBtn && sideMenu && closeMenu) {
        menuBtn.addEventListener('click', () => {
            sideMenu.classList.add('active');
        });

        closeMenu.addEventListener('click', () => {
            sideMenu.classList.remove('active');
        });

        document.addEventListener('click', (e) => {
            if (!sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                sideMenu.classList.remove('active');
            }
        });
    }

    // Category filter
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    if (categoryBtns.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const category = this.dataset.category;
                toolCards.forEach(card => {
                    if (category === 'all' || card.dataset.category === category) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});