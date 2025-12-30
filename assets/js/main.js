async function loadLayout() {
    // Inject Header
    const header = document.getElementById('header-placeholder');
    if (header) {
        const hRes = await fetch('/components/header.html');
        header.innerHTML = await hRes.text();
        
        // Setup Mobile Toggle after injection
        const toggle = document.getElementById('mobile-toggle');
        const menu = document.getElementById('nav-menu');
        if (toggle) {
            toggle.onclick = () => menu.classList.toggle('active');
        }
    }

    // Inject Footer
    const footer = document.getElementById('footer-placeholder');
    if (footer) {
        const fRes = await fetch('/components/footer.html');
        footer.innerHTML = await fRes.text();
    }
}

function renderTools(cat = 'all') {
    const grid = document.getElementById('tool-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = cat === 'all' ? tools : tools.filter(t => t.category === cat);
    
    list.forEach(tool => {
        grid.innerHTML += `
            <a href="${tool.link}" class="tool-card">
                <div class="icon-box" style="background:${tool.color}15; color:${tool.color}">
                    ${tool.svg}
                </div>
                <div class="tool-info">
                    <h3>${tool.name}</h3>
                    <p>${tool.desc}</p>
                </div>
            </a>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadLayout();
    renderTools();

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTools(btn.dataset.cat);
        };
    });
});
