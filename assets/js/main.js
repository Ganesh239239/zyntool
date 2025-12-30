const toolGrid = document.getElementById('tool-grid');
const filterButtons = document.querySelectorAll('.filter-btn');

function renderTools(category = 'all') {
    toolGrid.innerHTML = '';
    
    const filtered = category === 'all' 
        ? tools 
        : tools.filter(t => t.category === category);

    filtered.forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.link;
        card.className = 'tool-card';
        
        card.innerHTML = `
            <div class="tool-icon-box" style="background-color: ${tool.color}15; color: ${tool.color};">
                <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${tool.icon}
                </svg>
            </div>
            <div class="tool-info">
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
            </div>
        `;
        toolGrid.appendChild(card);
    });
}

// Filter Event Listeners
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTools(btn.getAttribute('data-cat'));
    });
});

// Load everything on start
document.addEventListener('DOMContentLoaded', () => renderTools());


// Load Header and Footer on all pages
async function loadLayout() {
    try {
        const headerEl = document.getElementById('header-placeholder');
        const footerEl = document.getElementById('footer-placeholder');
        
        if (headerEl) {
            const hRes = await fetch('/components/header.html');
            headerEl.innerHTML = await hRes.text();
        }
        if (footerEl) {
            const fRes = await fetch('/components/footer.html');
            footerEl.innerHTML = await fRes.text();
        }
    } catch (e) { console.error("Error loading layout", e); }
}

// Toggle Mobile Menu
function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('active');
}

// Render Tools on Home
function renderTools(cat = 'all') {
    const grid = document.getElementById('tool-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const list = cat === 'all' ? tools : tools.filter(t => t.category === cat);
    list.forEach(tool => {
        grid.innerHTML += `
            <a href="${tool.link}" class="tool-card">
                ${tool.isNew ? '<span class="badge-new">New!</span>' : ''}
                <div class="tool-icon-box" style="background:${tool.color}15; color:${tool.color}">
                    <span style="font-size:32px">${tool.icon}</span>
                </div>
                <div class="tool-info">
                    <h3>${tool.name}</h3>
                    <p>${tool.desc}</p>
                </div>
            </a>`;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadLayout();
    renderTools();
    
    // Add filtering logic to buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTools(btn.dataset.cat);
        });
    });
});
