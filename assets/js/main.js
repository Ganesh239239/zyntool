document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     MOBILE NAVIGATION
  ========================= */
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      mobileNav.classList.toggle("show");
    });
  }

  /* =========================
     CATEGORY FILTERING
  ========================= */
  const buttons = document.querySelectorAll(".categories button");
  const cards = document.querySelectorAll(".tool-card");

  if (buttons.length && cards.length) {
    buttons.forEach(button => {
      button.addEventListener("click", function () {

        // Active state
        buttons.forEach(b => b.classList.remove("active"));
        this.classList.add("active");

        const filter = this.dataset.filter;

        cards.forEach(card => {
          if (filter === "all" || card.dataset.category === filter) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });

      });
    });
  }

});
