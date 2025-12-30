document.addEventListener('DOMContentLoaded', function() {
    const megaTrigger = document.getElementById('megaTrigger');
    const megaMenu = document.getElementById('megaMenu');

    // iLoveIMG uses a slight delay or hover logic. 
    // This JS ensures the menu stays open when moving the mouse to it.
    
    megaTrigger.addEventListener('mouseenter', () => {
        megaMenu.style.display = 'block';
    });

    megaTrigger.addEventListener('mouseleave', () => {
        // We add a tiny timeout so the user can move the mouse into the menu
        setTimeout(() => {
            if (!megaMenu.matches(':hover') && !megaTrigger.matches(':hover')) {
                megaMenu.style.display = 'none';
            }
        }, 100);
    });

    console.log("Header Navigation Loaded Successfully");
});
