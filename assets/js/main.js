document.addEventListener("DOMContentLoaded", () => {

  /* MOBILE MENU */
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
  });

  /* CATEGORY FILTER */
  const buttons = document.querySelectorAll(".categories button");
  const cards = document.querySelectorAll(".tool-card");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        card.style.display =
          filter === "all" || card.dataset.category === filter
            ? "flex"
            : "none";
      });
    });
  });

});
