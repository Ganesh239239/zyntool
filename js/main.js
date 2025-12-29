/* Menu */
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.onclick = () => navMenu.classList.toggle("active");

/* Icons */
const icons = {
  compress: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 9h4V5h2v6H4V9zm10-4h6v2h-4v4h-2V5z"/>
  </svg>`,

  resize: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h6v2H5v4H3V3zm16 0h2v6h-2V5h-4V3z"/>
  </svg>`,

  crop: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 3h2v4h4v2H9v8h8v-4h2v6H7V9H3V7h4V3z"/>
  </svg>`,

  edit: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25z"/>
  </svg>`,

  convert: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l4 4h-3v7h-2V6H8l4-4z"/>
  </svg>`,

  security: `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1l9 4v6c0 5-3.8 9.7-9 11-5.2-1.3-9-6-9-11V5l9-4z"/>
  </svg>`
};

/* Tools Data */
const toolsData = [
  { title:"Compress IMAGE", desc:"Reduce image size", cat:"Optimize", icon:icons.compress, color:"green", slug:"compress" },
  { title:"Resize IMAGE", desc:"Resize images", cat:"Optimize", icon:icons.resize, color:"blue", slug:"resize" },

  { title:"Crop IMAGE", desc:"Crop images", cat:"Edit", icon:icons.crop, color:"cyan", slug:"crop" },
  { title:"Rotate IMAGE", desc:"Rotate images", cat:"Edit", icon:icons.edit, color:"blue", slug:"rotate" },
  { title:"Photo Editor", desc:"Edit photos", cat:"Edit", icon:icons.edit, color:"purple", slug:"editor" },

  { title:"Convert IMAGE", desc:"Convert formats", cat:"Convert", icon:icons.convert, color:"yellow", slug:"convert" },
  { title:"JPG to PDF", desc:"Convert JPG to PDF", cat:"Convert", icon:icons.convert, color:"gray", slug:"jpg-to-pdf" },

  { title:"Watermark IMAGE", desc:"Add watermark", cat:"Create", icon:icons.security, color:"purple", slug:"watermark" },

  { title:"Remove Background", desc:"Remove image background", cat:"Security", icon:icons.crop, color:"gray", slug:"remove-bg" }
];

const tools = document.getElementById("tools");
const cats = document.querySelectorAll(".cat");

function render(category) {
  tools.innerHTML = "";
  toolsData
    .filter(t => category === "All" || t.cat === category)
    .forEach(t => {
      const card = document.createElement("div");
      card.className = "tool-card";
      card.innerHTML = `
        <div class="tool-icon ${t.color}">${t.icon}</div>
        <div class="tool-content">
          <h3>${t.title}</h3>
          <p>${t.desc}</p>
        </div>
      `;
      card.onclick = () => {
  window.location.href = `tools/${t.slug}.html`;
};
      tools.appendChild(card);
    });
}

cats.forEach(btn => {
  btn.onclick = () => {
    cats.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.cat);
  };
});

/* Initial load */
render("All");
