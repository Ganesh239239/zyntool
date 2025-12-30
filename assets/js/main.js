const toolGrid = document.getElementById('tool-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

function renderTools(category = 'all') {
    if (!toolGrid) return;
    toolGrid.innerHTML = '';

    const filtered = category === 'all' 
        ? tools 
        : tools.filter(t => t.category === category);

    filtered.forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.link;
        card.className = 'tool-card';
        
        card.innerHTML = `
            ${tool.isNew ? '<span class="badge-new">New!</span>' : ''}
            <div class="icon-box" style="background:${tool.color}15; color:${tool.color}">
                ${tool.svg}
            </div>
            <div class="tool-info">
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
            </div>
        `;
        toolGrid.appendChild(card);
    });
}

// Event Listeners for Filter Buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTools(btn.getAttribute('data-cat'));
    });
});

// Run render immediately
document.addEventListener('DOMContentLoaded', () => {
    renderTools('all');
});
