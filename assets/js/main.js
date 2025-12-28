document.addEventListener("DOMContentLoaded", () => {

  // Mobile menu
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("show");
  });

  // Category filter
  const buttons = document.querySelectorAll(".categories button");
  const tools = document.querySelectorAll(".tool-card");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      tools.forEach(tool => {
        tool.style.display =
          filter === "all" || tool.dataset.category.includes(filter)
            ? "flex"
            : "none";
      });
    });
  });

});
