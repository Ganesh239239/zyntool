const tools = [
    {
        id: "compress",
        name: "Compress IMAGE",
        desc: "Compress JPG, PNG, SVG, or GIF with the best quality and compression.",
        category: "optimize",
        color: "#8bc34a",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14V4h10M20 10v10H10M15 9l-6 6M9 9l6 6"/></svg>`,
        link: "/tools/compress-image/"
    },
    {
        id: "resize",
        name: "Resize IMAGE",
        desc: "Define your dimensions, by percent or pixel, and resize your images.",
        category: "edit",
        color: "#4fc3f7",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 7l10 10M17 7L7 17"/></svg>`,
        link: "/tools/resize-image/"
    },
    {
        id: "crop",
        name: "Crop IMAGE",
        desc: "Crop JPG, PNG or GIFs with ease; Choose pixels or use our editor.",
        category: "edit",
        color: "#29b6f6",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v16h16M2 6h16v16"/></svg>`,
        link: "#"
    },
    {
        id: "convert-to-jpg",
        name: "Convert to JPG",
        desc: "Turn PNG, GIF, TIF, PSD, SVG, WEBP or RAW to JPG format with ease.",
        category: "convert",
        color: "#ffca28",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>`,
        link: "#"
    },
    {
        id: "upscale",
        name: "Upscale Image",
        desc: "Enlarge your images with high resolution using AI technology.",
        category: "optimize",
        color: "#81c784",
        isNew: true,
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>`,
        link: "#"
    },
    {
        id: "remove-bg",
        name: "Remove background",
        desc: "Quickly remove image backgrounds with high accuracy instantly.",
        category: "optimize",
        color: "#ba68c8",
        isNew: true,
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        link: "#"
    },
    {
        id: "meme",
        name: "Meme generator",
        desc: "Create your memes online with ease. Caption images or upload yours.",
        category: "edit",
        color: "#f06292",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>`,
        link: "#"
    },
    {
        id: "watermark",
        name: "Watermark IMAGE",
        desc: "Stamp an image or text over your images in seconds.",
        category: "security",
        color: "#90a4ae",
        svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/></svg>`,
        link: "#"
    }
];
