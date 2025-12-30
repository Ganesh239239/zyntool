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
