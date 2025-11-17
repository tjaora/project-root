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

  const EMAILJS_USER_ID = 'REPLACE_WITH_EMAILJS_USER_ID';
  if(window.emailjs && EMAILJS_USER_ID!=='REPLACE_WITH_EMAILJS_USER_ID'){ emailjs.init(EMAILJS_USER_ID); }

  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      const from_email = document.getElementById('from_email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      if(EMAILJS_USER_ID==='REPLACE_WITH_EMAILJS_USER_ID'){
        alert('EmailJS not configured. Please replace placeholders in js/main.js with your EmailJS keys.');
        return;
      }
      try{
        const response = await emailjs.send('REPLACE_WITH_SERVICE_ID','REPLACE_WITH_TEMPLATE_ID',{from_email, subject, message});
        alert('Message sent — thank you!');
        form.reset();
      }catch(err){ console.error(err); alert('Failed to send message.'); }
    });
  }

  loadCerts();
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
      d.innerHTML = `<h3>${r.name}</h3><p>${r.description||''}</p><div style="margin:10px padding:5px"><a class="btn outline" href="${r.html_url}" target="_blank">GitHub</a> <a class="btn" href="${r.html_url.replace('github.com','github.io')}" target="_blank">Live</a></div>`;
      grid.appendChild(d);
    });
  }catch(e){ console.error(e); grid.innerHTML = '<div class="card">Failed to load repos.</div>'; }
}

async function sha256(message){
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b=>b.toString(16).padStart(2,'0')).join('');
  return hashHex;
}

function loadCerts(){
  const container = document.getElementById('certGrid');
  if(!container) return;
  const raw = localStorage.getItem('portfolio_certs');
  const list = raw?JSON.parse(raw):[];
  container.innerHTML = '';
  list.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.style.textAlign='center';
    el.innerHTML = `<img src="${c.data}" style="width:140px;height:90px;object-fit:cover;border-radius:8px"/><div style="margin-top:8px">${c.name}</div>`;
    container.appendChild(el);
  });
}

async function openCertAdmin(){
  const stored = localStorage.getItem('portfolio_admin_hash');
  if(!stored){
    const newPass = prompt('No admin password set. Enter a new admin password (will be stored hashed in your browser):');
    if(!newPass) return alert('Password required');
    const h = await sha256(newPass);
    localStorage.setItem('portfolio_admin_hash', h);
    alert('Password saved. Open admin again.');
    return;
  }
  const entered = prompt('Enter admin password:');
  if(!entered) return;
  const eh = await sha256(entered);
  if(eh !== stored){ alert('Incorrect password'); return; }
  const action = prompt('Admin: type ADD to add certificate, EXPORT to download JSON, or CLEAR to delete all');
  if(!action) return;
  if(action.toUpperCase()==='ADD'){
    const name = prompt('Certificate name:');
    if(!name) return alert('Name required');
    const fileData = prompt('Paste image data URL (base64) or an image URL:');
    if(!fileData) return alert('Image required');
    const raw = localStorage.getItem('portfolio_certs'); const list = raw?JSON.parse(raw):[];
    list.unshift({name, data:fileData}); localStorage.setItem('portfolio_certs', JSON.stringify(list));
    alert('Certificate added. Reload page to view.');
  } else if(action.toUpperCase()==='EXPORT'){
    const raw = localStorage.getItem('portfolio_certs')||'[]'; const blob = new Blob([raw],{type:'application/json'}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'certificates.json'; a.click();
  } else if(action.toUpperCase()==='CLEAR'){
    if(confirm('Delete all certificates?')){ localStorage.removeItem('portfolio_certs'); alert('Cleared'); }
  } else { alert('Unknown action'); }
}

function addCertFromFile(fileInputId, nameInputId){
  const f = document.getElementById(fileInputId).files[0];
  const name = document.getElementById(nameInputId).value;
  if(!f || !name){ alert('Provide name and file'); return; }
  const reader = new FileReader();
  reader.onload = ()=>{
    const raw = localStorage.getItem('portfolio_certs'); const list = raw?JSON.parse(raw):[];
    list.unshift({name, data:reader.result}); localStorage.setItem('portfolio_certs', JSON.stringify(list)); alert('Added'); location.reload();
  };
  reader.readAsDataURL(f);
}
