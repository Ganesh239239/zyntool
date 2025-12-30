document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const icon = mobileToggle.querySelector('i');

    function toggleMenu() {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            overlay.style.display = 'block';
            icon.classList.replace('fa-bars', 'fa-xmark');
        } else {
            overlay.style.display = 'none';
            icon.classList.replace('fa-xmark', 'fa-bars');
        }
    }

    mobileToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
});
