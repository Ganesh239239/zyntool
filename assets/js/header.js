document.addEventListener('DOMContentLoaded', () => {
    const hamBtn = document.getElementById('hamBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if(hamBtn) {
        hamBtn.onclick = () => {
            sidebar.classList.add('active');
            overlay.style.display = 'block';
        };
    }

    if(overlay) {
        overlay.onclick = () => {
            sidebar.classList.remove('active');
            overlay.style.display = 'none';
        };
    }
});
