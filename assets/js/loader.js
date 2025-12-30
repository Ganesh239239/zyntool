async function loadHtml(id, url) {
    const res = await fetch(url);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
}

// Load all parts simultaneously
Promise.all([
    loadHtml('header-part', './components/header.html'),
    loadHtml('sidebar-part', './components/sidebar.html'),
    loadHtml('footer-part', './components/footer.html')
]).then(() => {
    // Re-initialize main logic AFTER parts are loaded
    initMainLogic();
});
