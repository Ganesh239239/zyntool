// Tabs filter
const tabs=document.querySelectorAll('#tabs button');
const cards=document.querySelectorAll('.card');
tabs.forEach(tab=>{
  tab.onclick=()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const f=tab.dataset.filter;
    cards.forEach(c=>{
      c.style.display=(f==='all'||c.classList.contains(f))?'flex':'none';
    });
  };
});

// Mobile menu
const menuBtn=document.getElementById('menuBtn');
const closeBtn=document.getElementById('closeMenu');
const menu=document.getElementById('mobileMenu');
const overlay=document.getElementById('overlay');

menuBtn.onclick=()=>{menu.classList.add('open');overlay.classList.add('show');}
overlay.onclick=()=>{menu.classList.remove('open');overlay.classList.remove('show');}
