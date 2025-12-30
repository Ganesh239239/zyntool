const toolGrid = document.getElementById('tool-grid');
const filterBtns = document.querySelectorAll('.filter-btn');

// Function to render cards
function renderTools(category = 'all') {
    toolGrid.innerHTML = ''; // Clear grid

    const filtered = category === 'all' 
        ? tools 
        : tools.filter(t => t.category === category);

    filtered.forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.link;
        card.className = 'tool-card';
        
        card.innerHTML = `
            ${tool.isNew ? '<span class="badge-new">New!</span>' : ''}
            <div class="tool-icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${tool.icon}
                </svg>
            </div>
            <div class="tool-text">
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
            </div>
        `;
        toolGrid.appendChild(card);
    });
}

// Handle Filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button UI
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Render filtered tools
        const category = btn.getAttribute('data-cat');
        renderTools(category);
    });
});

// Initial Render
renderTools();
