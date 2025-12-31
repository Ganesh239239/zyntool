// js/global.js

document.addEventListener("DOMContentLoaded", function() {
    loadComponent('header-placeholder', 'components/header.html', initNavbar);
    loadComponent('footer-placeholder', 'components/footer.html');
});

async function loadComponent(elementId, filePath, callback) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Could not load ${filePath}`);
        
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;

        if (callback) callback();

    } catch (error) {
        console.error("Error loading component:", error);
    }
}

// FIX: Initialize the mobile menu manually after injection
function initNavbar() {
    const toggleBtn = document.querySelector('.navbar-toggler');
    const collapseElement = document.querySelector('.navbar-collapse');
    
    if (toggleBtn && collapseElement) {
        toggleBtn.addEventListener('click', function() {
            // Using Bootstrap 5 API to toggle
            const bsCollapse = new bootstrap.Collapse(collapseElement, {
                toggle: false
            });
            bsCollapse.toggle();
        });
    }
}
