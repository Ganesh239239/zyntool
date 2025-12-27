// Main JavaScript with working menus
document.addEventListener('DOMContentLoaded', function() {
    // Side Menu Functionality
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');

    // Open side menu
    menuBtn.addEventListener('click', function() {
        sideMenu.classList.add('active');
    });

    // Close side menu
    closeMenu.addEventListener('click', function() {
        sideMenu.classList.remove('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!sideMenu.contains(event.target) && !menuBtn.contains(event.target)) {
            sideMenu.classList.remove('active');
        }
    });

    // Grid button (you can add functionality later)
    const gridBtn = document.getElementById('grid-btn');
    gridBtn.addEventListener('click', function() {
        alert('Grid menu feature coming soon!');
    });

    // Category Filter Functionality
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            this.classList.add('active');

            const category = this.dataset.category;

            // Filter cards
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
