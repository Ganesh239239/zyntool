const icons = {
  compress: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4V5h2v6H4zm10-4h6v2h-4v4h-2zM8 15H4v-2h6v6H8zm8 0v-6h2v4h4v2z"/></svg>`,
  resize: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v2H5v4H3zm16 0h2v6h-2V5h-4zM5 15h4v2H3v-6h2zm14-4h2v6h-6v-2h4z"/></svg>`,
  crop: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h2v4h4v2H9v8h8v-4h2v6H7V9H3V7h4z"/></svg>`,
  convert: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 4h-3v7h-2V6H8zm0 20l-4-4h3v-7h2v7h3z"/></svg>`
};

const toolsData = [
  { title: "Compress Image", desc: "Compress JPG, PNG, SVG, and GIF images.", cat: "Optimize", icon: icons.compress, color: "green", url: "/tools/compress.html" },
  { title: "Resize Image", desc: "Resize images by pixel or percentage.", cat: "Optimize", icon: icons.resize, color: "blue", url: "/tools/resize.html" },
  { title: "Crop Image", desc: "Crop images easily online.", cat: "Edit", icon: icons.crop, color: "cyan", url: "/tools/crop.html" },
  { title: "Convert Image", desc: "Convert images to different formats.", cat: "Convert", icon: icons.convert, color: "yellow", url: "/tools/convert.html" }
];

const toolsContainer = document.getElementById("tools");
const cats = document.querySelectorAll(".cat");

function renderTools(category) {
  toolsContainer.innerHTML = "";
  toolsData
    .filter(t => category === "All" || t.cat === category)
    .forEach(tool => {
      const link = document.createElement("a");
      link.href = tool.url;
      link.className = "tool-link";

      link.innerHTML = `
        <div class="tool-card">
          <div class="tool-icon ${tool.color}">${tool.icon}</div>
          <div class="tool-content">
            <h3>${tool.title}</h3>
            <p>${tool.desc}</p>
          </div>
        </div>
      `;

      toolsContainer.appendChild(link);
    });
}

cats.forEach(btn => {
  btn.addEventListener("click", () => {
    cats.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTools(btn.dataset.cat);
  });
});

renderTools("All");

/* Mobile nav toggle */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

hamburger.addEventListener("click", () => {
  mobileNav.style.display =
    mobileNav.style.display === "flex" ? "none" : "flex";
});

/* Footer year */
document.getElementById("year").textContent = new Date().getFullYear();
