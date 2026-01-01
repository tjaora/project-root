document.addEventListener('DOMContentLoaded', function(){
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger && burger.addEventListener('click', ()=>{ mobileMenu.classList.toggle('show'); });

  if(window.gsap) {
    gsap.from('.logo-area',{y:-20,opacity:0,duration:0.8,stagger:0.05});
    gsap.from('.hero-text h1',{y:20,opacity:0,duration:0.9,delay:0.2});
    gsap.from('.hero-photo img',{scale:0.98,opacity:0,duration:0.9,delay:0.25});
    gsap.from('.card',{y:12,opacity:0,duration:0.7,delay:0.35,stagger:0.08});
  }

  loadRepos('tjaora');

});

async function loadRepos(username){
  const grid = document.getElementById('repoGrid');
  if(!grid) return;
  grid.innerHTML = '<div class="card">Loading repos...</div>';
  try{
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    const repos = await res.json();
    grid.innerHTML = '';
    repos.forEach(r=>{
      const d = document.createElement('div');
      d.className = 'card';
      d.innerHTML = `<h3 style="margin-bottom:8px">${r.name}</h3><p style="margin-bottom:8px">${r.description||''}</p><div style="margin:10px"><a class="btn outline" href="${r.html_url}" target="_blank">GitHub</a> </div>`;
      grid.appendChild(d);
    });
  }catch(e){ console.error(e); grid.innerHTML = '<div class="card">Failed to load repos.</div>'; }
}





