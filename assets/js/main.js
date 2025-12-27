// Category filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            this.classList.add('active');

            const category = this.dataset.category;

            // Filter cards
            toolCards.forEach(card => {
                const categories = card.dataset.categories;
                if (category === 'all' || categories.includes(category)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
