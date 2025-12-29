const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {
  menuBtn.onclick = () => {
    navMenu.classList.toggle("active");
  };
}
