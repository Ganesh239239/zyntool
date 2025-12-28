// FILTERS
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.tool-card');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    btn.classList.add('active');

    const type = btn.dataset.filter;

    cards.forEach(card => {
      card.style.display =
        type === 'all' || card.classList.contains(type)
          ? 'flex'
          : 'none';
    });
  });
});

// MOBILE MENU
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');

menuBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('show');
});
