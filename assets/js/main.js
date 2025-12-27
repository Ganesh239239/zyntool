// Main JavaScript - Working Menus
document.addEventListener('DOMContentLoaded', function() {
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

    const gridBtn = document.getElementById('grid-btn');
    if (gridBtn) {
        gridBtn.addEventListener('click', function() {
            alert('Grid menu - Coming soon!');
        });
    }
});
