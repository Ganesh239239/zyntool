const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('mobileSidebar');
const overlay = document.getElementById('overlay');
const icon = menuToggle.querySelector('i');

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

menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);
