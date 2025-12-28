const toolsData = [
  // OPTIMIZE
  { title: "Compress IMAGE", desc: "Compress JPG, PNG, SVG, and GIFs while saving space and maintaining quality.", cat: "Optimize", icon: "⇲", color: "green" },
  { title: "Resize IMAGE", desc: "Define your dimensions by percent or pixel and resize images easily.", cat: "Optimize", icon: "🖼", color: "blue" },

  // EDIT
  { title: "Crop IMAGE", desc: "Crop JPG, PNG, or GIFs with ease using pixels or visual editor.", cat: "Edit", icon: "✂", color: "cyan" },
  { title: "Rotate IMAGE", desc: "Rotate images in bulk with ease.", cat: "Edit", icon: "⟳", color: "blue" },
  { title: "Photo editor", desc: "Add text, effects, frames, or stickers to your images.", cat: "Edit", icon: "✏", color: "purple" },
  { title: "Upscale Image", desc: "Increase image resolution while maintaining quality.", cat: "Edit", icon: "⬆", color: "green" },

  // CONVERT
  { title: "Convert to JPG", desc: "Convert PNG, GIF, TIF, PSD, SVG, WEBP, HEIC, or RAW to JPG.", cat: "Convert", icon: "JPG", color: "yellow" },
  { title: "Convert from JPG", desc: "Convert JPG images to PNG or GIF.", cat: "Convert", icon: "JPG", color: "yellow" },
  { title: "JPG to PDF", desc: "Convert JPG images to PDF in seconds.", cat: "Convert", icon: "PDF", color: "gray" },
  { title: "PDF to JPG", desc: "Extract images from PDF files.", cat: "Convert", icon: "PDF", color: "gray" },
  { title: "HTML to IMAGE", desc: "Convert webpages in HTML to JPG or PNG.", cat: "Convert", icon: "HTML", color: "yellow" },

  // CREATE
  { title: "Meme generator", desc: "Create memes online easily.", cat: "Create", icon: "😄", color: "purple" },
  { title: "Watermark IMAGE", desc: "Stamp an image or text over your images.", cat: "Create", icon: "ⓦ", color: "blue" },

  // SECURITY
  { title: "Blur face", desc: "Blur faces in photos to protect privacy.", cat: "Security", icon: "🙂", color: "gray" },
  { title: "Remove background", desc: "Automatically remove image backgrounds.", cat: "Security", icon: "✂", color: "gray" }
];

const toolsContainer = document.getElementById("tools");
const categoryButtons = document.querySelectorAll(".cat");

function renderTools(category) {
  toolsContainer.innerHTML = "";
  toolsData
    .filter(t => category === "All" || t.cat === category)
    .forEach(tool => {
      const card = document.createElement("div");
      card.className = "tool-card";
      card.innerHTML = `
        <div class="tool-icon ${tool.color}">${tool.icon}</div>
        <div class="tool-content">
          <h3>${tool.title}</h3>
          <p>${tool.desc}</p>
        </div>
      `;
      toolsContainer.appendChild(card);
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
