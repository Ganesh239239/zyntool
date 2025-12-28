const buttons = document.querySelectorAll('.categories button');
const tools = document.querySelectorAll('.tool-card');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    tools.forEach(tool => {
      if (filter === 'all' || tool.dataset.category.includes(filter)) {
        tool.style.display = 'flex';
      } else {
        tool.style.display = 'none';
      }
    });
  });
});
