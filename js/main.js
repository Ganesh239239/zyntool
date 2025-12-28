const icons = {
  compress: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4V5h2v6H4V9zm10-4h6v2h-4v4h-2V5zM8 15H4v-2h6v6H8v-4zm8 0v-6h2v4h4v2h-6z"/></svg>`,
  resize: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v2H5v4H3V3zm16 0h2v6h-2V5h-4V3h4zM5 15h4v2H3v-6h2v4zm14-4h2v6h-6v-2h4v-4z"/></svg>`,
  crop: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h2v4h4v2H9v8h8v-4h2v6H7V9H3V7h4V3z"/></svg>`,
  convert: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 4h-3v7h-2V6H8l4-4zm0 20l-4-4h3v-7h2v7h3l-4 4z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25z"/></svg>`,
  security: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l9 4v6c0 5-3.8 9.7-9 11-5.2-1.3-9-6-9-11V5l9-4z"/></svg>`
};

const toolsData = [
  {
    title: "Compress Image",
    desc: "Compress JPG, PNG, SVG, and GIF images.",
    cat: "Optimize",
    url: "/tools/compress.html"
  },
  {
    title: "Resize Image",
    desc: "Resize images by pixel or percentage.",
    cat: "Optimize",
    url: "/tools/resize.html"
  },
  {
    title: "Crop Image",
    desc: "Crop images easily online.",
    cat: "Edit",
    url: "/tools/crop.html"
  },
  {
    title: "Convert Image",
    desc: "Convert images to different formats.",
    cat: "Convert",
    url: "/tools/convert.html"
  }
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
          <div class="tool-icon"></div>
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

/* Hamburger */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

hamburger.addEventListener("click", () => {
  mobileNav.style.display =
    mobileNav.style.display === "flex" ? "none" : "flex";
});

/* Footer year */
document.getElementById("year").textContent = new Date().getFullYear();
