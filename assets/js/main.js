// Main JavaScript - Working Menus & Filters
document.addEventListener('DOMContentLoaded', function() {
    // Side Menu
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');

    if (menuBtn && sideMenu && closeMenu) {
        menuBtn.addEventListener('click', function() {
            sideMenu.classList.add('active');
        });

        closeMenu.addEventListener('click', function() {
            sideMenu.classList.remove('active');
        });

        document.addEventListener('click', function(event) {
            if (!sideMenu.contains(event.target) && !menuBtn.contains(event.target)) {
                sideMenu.classList.remove('active');
            }
        });
    }

    // Grid button
    const gridBtn = document.getElementById('grid-btn');
    if (gridBtn) {
        gridBtn.addEventListener('click', function() {
            alert('Grid menu - Coming soon!');
        });
    }

    // Category Filters
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;

            toolCards.forEach(card => {
                const categories = card.dataset.categories;
                if (category === 'all' || categories.includes(category)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
