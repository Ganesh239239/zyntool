// FILTERS
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.tool-card');

filters.forEach(filter => {
  filter.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    filter.classList.add('active');

    const type = filter.dataset.filter;

    cards.forEach(card => {
      if (type === 'all' || card.classList.contains(type)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// MOBILE MENU
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

menuBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('show');
});
