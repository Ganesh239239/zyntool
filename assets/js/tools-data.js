const tools = [
    {
        id: "compress",
        name: "Compress IMAGE",
        desc: "Compress JPG, PNG, SVG, and GIFs while saving space and maintaining quality.",
        category: "optimize",
        icon: `<rect width="48" height="48" rx="12" fill="#8bc34a" fill-opacity="0.2"/><path d="M14 14L22 22M14 14V20M14 14H20" stroke="#8bc34a" stroke-width="3" stroke-linecap="round"/><path d="M34 34L26 26M34 34V28M34 34H28" stroke="#8bc34a" stroke-width="3" stroke-linecap="round"/>`,
        link: "/tools/compress-image/"
    },
    {
        id: "resize",
        name: "Resize IMAGE",
        desc: "Define your dimensions, by percent or pixel, and resize your images.",
        category: "edit",
        icon: `<rect width="48" height="48" rx="12" fill="#4fc3f7" fill-opacity="0.2"/><rect x="22" y="14" width="12" height="20" rx="1" stroke="#4fc3f7" stroke-width="3"/><path d="M14 26L18 22L14 18" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round"/>`,
        link: "/tools/resize-image/"
    },
    {
        id: "crop",
        name: "Crop IMAGE",
        desc: "Crop JPG, PNG or GIFs with ease; Choose pixels or use our editor.",
        category: "edit",
        icon: `<rect width="48" height="48" rx="12" fill="#29b6f6" fill-opacity="0.2"/><path d="M15 15H33V33" stroke="#29b6f6" stroke-width="3"/><path d="M10 15H15V10" stroke="#29b6f6" stroke-width="3"/>`,
        link: "#"
    },
    {
        id: "upscale",
        name: "Upscale Image",
        desc: "Enlarge your images with high resolution using AI technology.",
        category: "optimize",
        isNew: true,
        icon: `<rect width="48" height="48" rx="12" fill="#81c784" fill-opacity="0.2"/><path d="M24 14V34M14 24H34" stroke="#81c784" stroke-width="3"/>`,
        link: "#"
    },
    {
        id: "remove-bg",
        name: "Remove background",
        desc: "Quickly remove image backgrounds with high accuracy instantly.",
        category: "optimize",
        isNew: true,
        icon: `<rect width="48" height="48" rx="12" fill="#ba68c8" fill-opacity="0.2"/><circle cx="24" cy="20" r="6" stroke="#ba68c8" stroke-width="3"/>`,
        link: "#"
    },
    {
        id: "convert-to-jpg",
        name: "Convert to JPG",
        desc: "Turn PNG, GIF, WEBP or RAW to JPG format with ease.",
        category: "convert",
        icon: `<rect width="48" height="48" rx="12" fill="#ffca28" fill-opacity="0.2"/><text x="12" y="30" fill="#ffca28" font-size="10" font-weight="bold">JPG</text>`,
        link: "#"
    },
    {
        id: "meme",
        name: "Meme generator",
        desc: "Create your memes online with ease. Caption images or upload yours.",
        category: "create",
        icon: `<rect width="48" height="48" rx="12" fill="#f06292" fill-opacity="0.2"/><circle cx="24" cy="24" r="10" stroke="#f06292" stroke-width="3"/>`,
        link: "#"
    },
    {
        id: "watermark",
        name: "Watermark IMAGE",
        desc: "Stamp an image or text over your images in seconds.",
        category: "security",
        icon: `<rect width="48" height="48" rx="12" fill="#90a4ae" fill-opacity="0.2"/><path d="M24 14L34 34H14L24 14Z" stroke="#90a4ae" stroke-width="3"/>`,
        link: "#"
    }
];
