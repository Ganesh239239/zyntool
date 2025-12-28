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

// Mobile menu toggle
const menuBtn=document.getElementById('menuBtn');
const mobileMenu=document.getElementById('mobileMenu');
menuBtn.onclick=()=>mobileMenu.classList.toggle('open');
