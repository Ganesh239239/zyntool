(() => {
  const input = document.getElementById("imageInput");
  const preview = document.getElementById("imagePreview");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const compressBtn = document.getElementById("compressBtn");
  const qualityRange = document.getElementById("qualityRange");
  const qualityValue = document.getElementById("qualityValue");

  let sourceImage = null;

  /* UI sync */
  qualityValue.textContent = qualityRange.value + "%";
  qualityRange.addEventListener("input", () => {
    qualityValue.textContent = qualityRange.value + "%";
  });

  /* Image upload (modern + safe) */
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        sourceImage = img;
        preview.src = img.src;
        preview.style.display = "block";
      };
      img.onerror = () => {
        alert("Failed to load image.");
      };
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

  /* Compression */
  compressBtn.addEventListener("click", () => {
    if (!sourceImage) {
      alert("Please upload an image first.");
      return;
    }

    const quality = Number(qualityRange.value) / 100;

    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sourceImage, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Compression failed.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "compressed-image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      quality
    );
  });
})();
