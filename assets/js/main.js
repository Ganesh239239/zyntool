document.addEventListener("DOMContentLoaded", () => {

  /* MOBILE MENU */
  const menuBtn = document.querySelector(".menu-btn");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenu = document.querySelector(".close-menu");

  menuBtn.onclick = () => mobileMenu.classList.add("open");
  closeMenu.onclick = () => mobileMenu.classList.remove("open");

  /* FILTERS */
  const filterButtons = document.querySelectorAll(".filters button");
  const toolCards = document.querySelectorAll(".tool-card");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      toolCards.forEach(card => {
        if(filter === "all" || card.dataset.category === filter){
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  /* TOOL CLICK (demo) */
  toolCards.forEach(card => {
    card.addEventListener("click", () => {
      alert(card.querySelector("h3").innerText + " clicked");
    });
  });

});
