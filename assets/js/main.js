const menuBtn = document.getElementById("menuBtn");
const closeMenu = document.getElementById("closeMenu");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.add("open");
});

closeMenu.addEventListener("click", () => {
  mobileMenu.classList.remove("open");
});


document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     MOBILE NAVIGATION MENU
  ========================= */

  const menuBtn = document.querySelector(".menu-btn");
  let navOpen = false;

  // Create mobile menu dynamically
  const mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu";
  mobileMenu.innerHTML = `
    <div class="menu-header">
      <span class="menu-title">Zyntool</span>
      <button class="close-menu">&times;</button>
    </div>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">Tools</a></li>
      <li><a href="#">Blog</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  `;
  document.body.appendChild(mobileMenu);

  const closeBtn = mobileMenu.querySelector(".close-menu");

  menuBtn.addEventListener("click", () => {
    navOpen = true;
    mobileMenu.classList.add("open");
  });

  closeBtn.addEventListener("click", () => {
    navOpen = false;
    mobileMenu.classList.remove("open");
  });

  /* =========================
     HERO FILTER BUTTONS
  ========================= */

  const filterButtons = document.querySelectorAll(".filters button");
  const toolCards = document.querySelectorAll(".tool-card");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

      // active state
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.innerText.toLowerCase();

      toolCards.forEach(card => {
        const category = card.getAttribute("data-category");

        if (filter === "all" || category === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  /* =========================
     TOOL CARD CLICK (DEMO)
  ========================= */

  toolCards.forEach(card => {
    card.addEventListener("click", () => {
      const toolName = card.querySelector("h3").innerText;
      alert(`${toolName} clicked`);
    });
  });

});
