// This function runs automatically when the page loads
document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    setupMobileMenu();
});

function renderHeader() {
    const headerContainer = document.getElementById("header-inner-target");
    if (!headerContainer) return;

    headerContainer.innerHTML = `
    <header class="header">
        <div class="header-inner">
            <div class="logo" onclick="location.href='../index.html'">Zyn<span>Tool</span></div>
            <nav class="nav" id="navMenu">
                <a href="../index.html">All Tools</a>
                <a href="compress.html">Compress</a>
                <a href="resize.html">Resize</a>
                <a href="crop.html">Crop</a>
                <a href="convert.html">Convert</a>
            </nav>
            <div class="menu" id="menuBtn">☰</div>
        </div>
    </header>
    `;
}

function renderFooter() {
    const footerContainer = document.getElementById("footer-target");
    if (!footerContainer) return;

    footerContainer.innerHTML = `
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-col">
                <div class="logo">Zyn<span>Tool</span></div>
                <p>Professional-grade image tools, 100% free and private. Your images never leave your computer.</p>
            </div>
            <div class="footer-col">
                <h4>Tools</h4>
                <ul>
                    <li><a href="compress.html">Compress Image</a></li>
                    <li><a href="resize.html">Resize Image</a></li>
                    <li><a href="crop.html">Crop Image</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Company</h4>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-copyright">
            &copy; ${new Date().getFullYear()} ZynTool. All rights reserved. Optimized for Speed & Privacy.
        </div>
    </footer>
    `;
}

function setupMobileMenu() {
    // We use a timeout to ensure the HTML is injected before searching for the button
    setTimeout(() => {
        const menuBtn = document.getElementById("menuBtn");
        const navMenu = document.getElementById("navMenu");
        if (menuBtn && navMenu) {
            menuBtn.onclick = () => navMenu.classList.toggle("active");
        }
    }, 100);
              }
