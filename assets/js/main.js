// Hero tab filtering
const tabs = document.querySelectorAll('#tabs button');
const cards = document.querySelectorAll('.card');

tabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const filter = tab.dataset.filter;

    cards.forEach(card=>{
      if(filter==='all' || card.classList.contains(filter)){
        card.style.display='flex';
      }else{
        card.style.display='none';
      }
    });
  });
});

// Menu button (placeholder)
document.getElementById('menuBtn').addEventListener('click',()=>{
  alert('Navigation menu clicked');
});
