const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.onclick = () => navMenu.classList.toggle("active");

const icons = {
  compress:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4V5h2v6H4z"/></svg>`,
  resize:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v2H5z"/></svg>`,
  edit:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75z"/></svg>`,
  convert:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4 4z"/></svg>`,
  security:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l9 4z"/></svg>`
};

const toolsData = [
  { title:"Compress IMAGE", desc:"Reduce image size", cat:"Optimize", icon:icons.compress, color:"green", slug:"compress" },
  { title:"Resize IMAGE", desc:"Resize images", cat:"Optimize", icon:icons.resize, color:"blue", slug:"resize" },
  { title:"Crop IMAGE", desc:"Crop images", cat:"Edit", icon:icons.edit, color:"cyan", slug:"crop" },
  { title:"Convert IMAGE", desc:"Convert formats", cat:"Convert", icon:icons.convert, color:"yellow", slug:"convert" },
  { title:"Watermark IMAGE", desc:"Add watermark", cat:"Create", icon:icons.security, color:"purple", slug:"watermark" }
];

const tools = document.getElementById("tools");
const cats = document.querySelectorAll(".cat");

function render(cat) {
  tools.innerHTML = "";
  toolsData.filter(t => cat==="All" || t.cat===cat).forEach(t => {
    const d = document.createElement("div");
    d.className = "tool-card";
    d.innerHTML = `
      <div class="tool-icon ${t.color}">${t.icon}</div>
      <div class="tool-content">
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
      </div>`;
    d.onclick = () => location.href = `tools/${t.slug}.html`;
    tools.appendChild(d);
  });
}

cats.forEach(b => {
  b.onclick = () => {
    cats.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.cat);
  };
});

render("All");
