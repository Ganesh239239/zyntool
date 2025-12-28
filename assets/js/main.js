// Mobile nav
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');

menuBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Category filter
const cats = document.querySelectorAll('.cat');
const cards = document.querySelectorAll('.tool-card');

cats.forEach(cat => {
  cat.addEventListener('click', () => {
    cats.forEach(c => c.classList.remove('active'));
    cat.classList.add('active');

    const filter = cat.dataset.filter;

    cards.forEach(card => {
      card.style.display =
        filter === 'all' || card.dataset.category === filter
          ? 'flex'
          : 'none';
    });
  });
});
