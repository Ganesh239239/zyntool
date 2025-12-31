// js/main.js

import compress from './tools/compress.js';
import resize from './tools/resize.js';
import crop from './tools/crop.js';
import convert from './tools/convert.js';
import editor from './tools/editor.js';
import upscale from './tools/upscale.js';
import removebg from './tools/removebg.js';
import watermark from './tools/watermark.js';
import meme from './tools/meme.js';
import rotate from './tools/rotate.js';
import html2image from './tools/html2image.js';
import blur from './tools/blur.js';

const TOOLS = {
    'compress': compress,
    'resize': resize,
    'crop': crop,
    'tojpg': convert,
    'fromjpg': convert,
    'editor': editor,
    'upscale': upscale,
    'removebg': removebg,
    'watermark': watermark,
    'meme': meme,
    'rotate': rotate,
    'html2image': html2image,
    'blur': blur
};

const App = {
    currentToolId: null,
    currentToolModule: null,
    currentFile: null,

    init() {
        window.addEventListener('popstate', () => this.router());
        window.addEventListener('load', () => this.router());
        
        // Listeners for Tools
        document.getElementById('dropZone').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFile(e.target.files[0]));
        document.getElementById('btnProcess').addEventListener('click', () => this.execute());
        document.getElementById('btnRenderHtml').addEventListener('click', () => this.handleHtmlInput());
        document.getElementById('btnReset').addEventListener('click', (e) => { e.preventDefault(); this.resetUI(); });

         // NEW: Close mobile menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(menuToggle, {toggle: false});
    
    navLinks.forEach((l) => {
        l.addEventListener('click', () => {
            if(menuToggle.classList.contains('show')) {
                bsCollapse.hide();
            }
        });
    });
        
        // Initialize Filter Logic
        this.initFilters();
    },

    // --- NEW FILTER LOGIC ---
    initFilters() {
        const buttons = document.querySelectorAll('#filterContainer .btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 1. UI Update
                buttons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // 2. Filter Grid
                const category = e.target.dataset.filter;
                document.querySelectorAll('.tool-item').forEach(item => {
                    if (category === 'all' || item.dataset.category.includes(category)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    },

    router() {
        const hash = window.location.hash.replace('#/', '');
        const home = document.getElementById('homeView');
        const workspace = document.getElementById('toolWorkspace');

        if (!hash || !TOOLS[hash]) {
            home.classList.add('active');
            workspace.classList.remove('active');
            this.resetUI();
            
            // Re-run filter logic to show all tools when returning home
            document.querySelector('[data-filter="all"]').click();
        } else {
            home.classList.remove('active');
            workspace.classList.add('active');
            this.loadTool(hash);
        }
    },

    loadTool(toolId) {
        this.currentToolId = toolId;
        this.currentToolModule = TOOLS[toolId];
        this.resetUI();
        document.getElementById('workspaceTitle').innerText = this.currentToolModule.title;
        
        if (toolId === 'html2image') {
            document.getElementById('dropZone').style.display = 'none';
            document.getElementById('htmlInputZone').style.display = 'block';
        }
    },

    handleFile(file) {
        if(!file) return;
        this.currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById('imagePreview');
            img.onload = () => {
                document.getElementById('dropZone').style.display = 'none';
                document.getElementById('processingArea').style.display = 'block';
                const opts = document.getElementById('optionsPanel');
                if(this.currentToolModule.renderUI) {
                    opts.innerHTML = this.currentToolModule.renderUI(img.naturalWidth, img.naturalHeight);
                } else {
                    opts.innerHTML = '<div class="text-muted">Ready to process.</div>';
                }
                if(this.currentToolModule.init) this.currentToolModule.init(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    handleHtmlInput() {
        const code = document.getElementById('htmlCode').value;
        document.getElementById('htmlInputZone').style.display = 'none';
        document.getElementById('processingArea').style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
        const render = document.getElementById('htmlRender');
        render.style.display = 'inline-block';
        render.innerHTML = code;
    },

    async execute() {
        const btn = document.getElementById('btnProcess');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        try {
            const img = document.getElementById('imagePreview');
            let blob;
            if(this.currentToolId === 'html2image') {
                 blob = await this.currentToolModule.process(document.getElementById('htmlRender'));
            } else {
                 blob = await this.currentToolModule.process(img, this.currentFile, this.currentToolId);
            }

            const url = URL.createObjectURL(blob);
            document.getElementById('resultImage').src = url;
            document.getElementById('downloadLink').href = url;
            document.getElementById('downloadLink').download = `iloveimg-${this.currentToolId}.png`;
            
            document.getElementById('processingArea').style.display = 'none';
            document.getElementById('resultArea').style.display = 'block';
        } catch (error) {
            console.error(error);
            alert("Error processing image.");
        } finally {
            btn.innerHTML = 'Process Image';
            btn.disabled = false;
        }
    },

    resetUI() {
        if(this.currentToolModule && this.currentToolModule.cleanup) this.currentToolModule.cleanup();
        this.currentFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('dropZone').style.display = 'block';
        document.getElementById('htmlInputZone').style.display = 'none';
        document.getElementById('processingArea').style.display = 'none';
        document.getElementById('resultArea').style.display = 'none';
        document.getElementById('imagePreview').style.display = 'inline-block';
        document.getElementById('imagePreview').style.filter = 'none';
        document.getElementById('htmlRender').style.display = 'none';
        document.getElementById('optionsPanel').innerHTML = '';
    }
};

App.init();


