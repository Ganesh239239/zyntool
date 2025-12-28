const icons = {
  compress: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4V5h2v6H4V9zm10-4h6v2h-4v4h-2V5zM8 15H4v-2h6v6H8v-4zm8 0v-6h2v4h4v2h-6z"/></svg>`,
  resize: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v2H5v4H3V3zm16 0h2v6h-2V5h-4V3h4zM5 15h4v2H3v-6h2v4zm14-4h2v6h-6v-2h4v-4z"/></svg>`,
  crop: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h2v4h4v2H9v8h8v-4h2v6H7V9H3V7h4V3z"/></svg>`,
  convert: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 4h-3v7h-2V6H8l4-4zm0 20l-4-4h3v-7h2v7h3l-4 4z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25z"/></svg>`,
  security: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l9 4v6c0 5-3.8 9.7-9 11-5.2-1.3-9-6-9-11V5l9-4z"/></svg>`
};

const toolsData = [
  { title: "Compress IMAGE", desc: "Compress JPG, PNG, SVG, and GIFs while saving space.", cat: "Optimize", icon: icons.compress, color: "green" },
  { title: "Resize IMAGE", desc: "Resize images by pixel or percent.", cat: "Optimize", icon: icons.resize, color: "blue" },

  { title: "Crop IMAGE", desc: "Crop JPG, PNG, or GIFs easily.", cat: "Edit", icon: icons.crop, color: "cyan" },
  { title: "Rotate IMAGE", desc: "Rotate images in bulk.", cat: "Edit", icon: icons.edit, color: "blue" },
  { title: "Photo editor", desc: "Add text, effects, and frames.", cat: "Edit", icon: icons.edit, color: "purple" },
  { title: "Upscale Image", desc: "Increase image resolution.", cat: "Edit", icon: icons.resize, color: "green" },

  { title: "Convert to JPG", desc: "Convert PNG, SVG, WEBP, HEIC to JPG.", cat: "Convert", icon: icons.convert, color: "yellow" },
  { title: "Convert from JPG", desc: "Convert JPG to PNG or GIF.", cat: "Convert", icon: icons.convert, color: "yellow" },
  { title: "JPG to PDF", desc: "Convert JPG images to PDF.", cat: "Convert", icon: icons.convert, color: "gray" },
  { title: "PDF to JPG", desc: "Extract images from PDF.", cat: "Convert", icon: icons.convert, color: "gray" },
  { title: "HTML to IMAGE", desc: "Convert webpages to images.", cat: "Convert", icon: icons.convert, color: "yellow" },

  { title: "Meme generator", desc: "Create memes online.", cat: "Create", icon: icons.edit, color: "purple" },
  { title: "Watermark IMAGE", desc: "Add watermark to images.", cat: "Create", icon: icons.security, color: "blue" },

  { title: "Blur face", desc: "Blur faces in photos.", cat: "Security", icon: icons.security, color: "gray" },
  { title: "Remove background", desc: "Remove image background.", cat: "Security", icon: icons.crop, color: "gray" }
];

const toolsContainer = document.getElementById("tools");
const categoryButtons = document.querySelectorAll(".cat");


function renderTools(category) {
  toolsContainer.innerHTML = "";

  toolsData
    .filter(t => category === "All" || t.cat === category)
    .forEach(tool => {

      const link = document.createElement("a");
      link.href = tool.url;
      link.className = "tool-link";

      const card = document.createElement("div");
      card.className = "tool-card";
      card.innerHTML = `
        <div class="tool-icon ${tool.color}">${tool.icon}</div>
        <div class="tool-content">
          <h3>${tool.title}</h3>
          <p>${tool.desc}</p>
        </div>
      `;

      link.appendChild(card);
      toolsContainer.appendChild(link);
    });
                                          }

categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTools(btn.dataset.cat);
  });
});

renderTools("All");

const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

hamburger.addEventListener("click", () => {
  mobileNav.style.display =
    mobileNav.style.display === "flex" ? "none" : "flex";
});

document.getElementById("year").textContent = new Date().getFullYear();
