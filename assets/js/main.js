// FILTER LOGIC
const filterButtons = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.tool-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    cards.forEach(card => {
      if (filter === 'all' || card.classList.contains(filter)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// NAV MENU (placeholder, working click)
document.getElementById('menuBtn').addEventListener('click', () => {
  alert('Navigation menu clicked');
});
