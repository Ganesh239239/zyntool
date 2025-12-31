document.addEventListener("DOMContentLoaded", function() {
    loadComponent('header-placeholder', '/components/header.html');
    loadComponent('footer-placeholder', '/components/footer.html');
});

async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Could not load ${filePath}`);
        
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        // Re-initialize Bootstrap Mobile Menu after HTML is injected
        if (elementId === 'header-placeholder') {
            const toggle = document.querySelector('.navbar-toggler');
            const collapse = document.getElementById('navbarNav');
            // We rely on Bootstrap's data-bs-toggle, but since we injected HTML dynamically, 
            // sometimes we need to manually re-attach listeners or just ensure bootstrap.js is loaded last.
        }
    } catch (error) {
        console.error("Error loading component:", error);
    }
}
