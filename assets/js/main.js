document.querySelectorAll('.categories button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.categories .active')?.classList.remove('active');
    btn.classList.add('active');
  });
});
