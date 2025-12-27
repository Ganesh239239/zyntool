// ZynTool - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Side menu
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

    // Category navigation - FIXED
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    if (categoryBtns.length > 0 && toolCards.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active from all buttons
                categoryBtns.forEach(b => b.classList.remove('active'));

                // Add active to clicked button
                this.classList.add('active');

                // Get selected category
                const category = this.dataset.category;

                // Filter tools
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
