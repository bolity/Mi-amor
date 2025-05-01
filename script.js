window.addEventListener('DOMContentLoaded', () => {
  const map = document.getElementById('map');
  const memories = Array.from(document.querySelectorAll('.memory'));
  const tooltip = document.getElementById('tooltip');
  const timeStar = document.getElementById('timeMachineStar');

  // ——— ÓRBITAS & PARALLAX ———
  const orbits = [];
  const count = memories.length;
  const minRadius = 120;
  const maxRadius = Math.min(window.innerWidth, window.innerHeight) / 2 - 50;
  const spacing = (maxRadius - minRadius) / count;

  memories.forEach((mem, i) => {
    const base   = minRadius + spacing * i;
    const radius = base + (Math.random() * spacing * 0.2 - spacing * 0.1);
    const angle0 = Math.random() * Math.PI * 2;
    const speed  = 0.0003 + Math.random() * 0.0003;
    orbits.push({ mem, radius, angle: angle0, speed, originalSpeed: speed });
  });

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  const strength = 20;

  document.addEventListener('mousemove', e => {
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    targetX = (e.clientX - halfW) / halfW;
    targetY = (e.clientY - halfH) / halfH;
  });

  (function animateParallax() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    map.style.transform = `translate(${-currentX * strength}px, ${-currentY * strength}px)`;
    requestAnimationFrame(animateParallax);
  })();

  (function animateOrbits() {
    orbits.forEach(o => {
      o.angle += o.speed;
      const irregular = Math.sin(o.angle * 2) * (spacing * 0.05);
      const r = o.radius + irregular;
      const x = Math.cos(o.angle) * r;
      const y = Math.sin(o.angle) * r;
      o.mem.style.transform =
        `translate(calc(50vw + ${x}px - 6px), calc(50vh + ${y}px - 6px))`;
    });
    requestAnimationFrame(animateOrbits);
  })();

  // ——— DETALLE DE MEMORIA ———
  const detail = document.createElement('div');
  detail.classList.add('memory-detail');
  document.body.appendChild(detail);

  let activeOrbit = null;
  function showDetail(orbitObj, text, imgSrc) {
    if (activeOrbit && activeOrbit !== orbitObj) {
      activeOrbit.speed = activeOrbit.originalSpeed;
    }
    activeOrbit = orbitObj;
    activeOrbit.speed = 0;

    detail.innerHTML = `
      <img src="${imgSrc}" class="memory-img" />
      <div class="memory-text">${text}</div>
    `;
    detail.style.display = 'block';

    const rect = orbitObj.mem.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const drect = detail.getBoundingClientRect();
    detail.style.left = `${cx - drect.width / 2}px`;
    detail.style.top  = `${cy - drect.height / 2}px`;
  }

  memories.forEach(mem => {
    const orbitObj = orbits.find(o => o.mem === mem);
    mem.addEventListener('mouseover', e => {
      tooltip.textContent = mem.dataset.text;
      tooltip.style.top = `${e.clientY - 30}px`;
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.opacity = '1';
    });
    mem.addEventListener('mousemove', e => {
      tooltip.style.top = `${e.clientY - 30}px`;
      tooltip.style.left = `${e.clientX + 10}px`;
    });
    mem.addEventListener('mouseout', () => {
      tooltip.style.opacity = '0';
    });
    mem.addEventListener('click', e => {
      e.stopPropagation();
      showDetail(orbitObj, mem.dataset.text, getImageForMemory(mem.dataset.text));
    });
  });

  detail.addEventListener('mouseleave', () => {
    detail.style.display = 'none';
    if (activeOrbit) {
      activeOrbit.speed = activeOrbit.originalSpeed;
      activeOrbit = null;
    }
  });

  // ========= MÁQUINA DEL TIEMPO =========
  const dates = [
    'Dic 1ª','Dic 2ª',
    'Ene 1ª','Ene 2ª',
    'Feb 1ª','Feb 2ª',
    'Mar 1ª','Mar 2ª',
    'Abr 1ª','Abr 2ª'
  ];
  let selectedIndex = dates.length - 1;

  const overlay = document.createElement('div');
  overlay.id = 'timeMachineOverlay';
  overlay.style.display = 'none';
  overlay.innerHTML = `
    <div id="timeWheel">
      <div class="wheel-date">${dates[selectedIndex-2]||''}</div>
      <div class="wheel-date">${dates[selectedIndex-1]||''}</div>
      <div class="wheel-date active">${dates[selectedIndex]}</div>
      <div class="wheel-date">${dates[selectedIndex+1]||''}</div>
      <div class="wheel-date">${dates[selectedIndex+2]||''}</div>
    </div>
    <div>
      <button id="prevDate" class="wheel-button">↑</button>
      <button id="nextDate" class="wheel-button">↓</button>
    </div>
    <button id="closeTimeMachine" class="wheel-button">Cerrar</button>
    <div class="gallery"></div>
    <p class="download-info">Haz clic en cualquier foto para descargarla 📸</p>
  `;
  document.body.appendChild(overlay);

  function updateWheel() {
    const wheel = document.getElementById('timeWheel');
    wheel.innerHTML = `
      <div class="wheel-date">${dates[selectedIndex-2]||''}</div>
      <div class="wheel-date">${dates[selectedIndex-1]||''}</div>
      <div class="wheel-date active">${dates[selectedIndex]}</div>
      <div class="wheel-date">${dates[selectedIndex+1]||''}</div>
      <div class="wheel-date">${dates[selectedIndex+2]||''}</div>
    `;
  }

  document.getElementById('prevDate').addEventListener('click', () => {
    if (selectedIndex>0) {
      selectedIndex--;
      updateWheel();
      updateGallery();
    }
  });
  document.getElementById('nextDate').addEventListener('click', () => {
    if (selectedIndex<dates.length-1) {
      selectedIndex++;
      updateWheel();
      updateGallery();
    }
  });
  document.getElementById('closeTimeMachine').addEventListener('click', () => {
    overlay.style.display = 'none';
  });
  timeStar.addEventListener('click', () => {
    overlay.style.display = 'flex';
    updateWheel();
    updateGallery();
  });

  // ========= IMÁGENAS DE MEMORIA =========
  function getImageForMemory(text) {
    switch (text) {
      case 'Día del primer beso 💋':            return 'images/primer.jpg';
      case 'Primeros mensajitos 📩':             return 'images/chat.jpg';
      case 'Primer día que dormimos juntos ♥️': return 'images/vez.jpg';
      case 'Primer beso documentado🗣️':         return 'images/besodo.jpg';
      case 'Día que quedamos por primera vez💌': return 'images/mensaje.jpg';
      case 'De mis mejores recuerdos😺':         return 'images/mejorr.jpg';
      default:                                  return 'images/default.jpg';
    }
  }

  // ========= GALERÍA DE IMÁGENES (±15 días) =========
  const imageList = [
    '20250215_160157.jpg',
    '20250215_160735.jpg',
    '20250301_172214.jpg',
    '20250215_160800.jpg',
'20250221_165802.jpg',
'20250221_165806.jpg',
'20250223_171614.jpg',
'20250223_171749.jpg',
'20250223_171751.jpg',
'20250404_194039.jpg',
'20250223_172030.jpg',
'20250223_172311.jpg',
'20250223_224500.jpg',
'20250228_191934.jpg',
'20250228_191944.jpg',
'20250301_172214.jpg',
'20250301_172241.jpg',
'20250301_172251.jpg',
'20250301_172634.jpg',
'20250301_172637.jpg',
'20250301_172639.jpg',
'20250301_172641.jpg',
'20250301_174201.jpg',
'20250301_174205.jpg',
'20250301_175133.jpg',
'20250301_175135.jpg',
'20250301_175137.jpg',
'20250301_175142.jpg',
'20250301_182144.jpg',
'20250301_224032_071.jpg',
'20250301_224033_470.jpg',
'20250301_224034_073.jpg',
'20250301_224035_400.jpg',
'20250301_224039_140.jpg',
'20250301_224041_039.jpg',
'20250301_224044_163.jpg',
'20250301_224045_555.jpg',
'20250301_224047_513.jpg',
'20250301_224051_737.jpg',
'20250301_224101_721.jpg',
'20250301_224105_038.jpg',
'20250301_224106_560.jpg',
'20250301_224112_511.jpg',
'20250302_012958_416.jpg',
'20250303_104700_541.jpg',
'20250303_104702_365.jpg',
'20250303_105927_162.webp',
'20250303_184238.jpg',
'20250303_193251.jpg',
'20250303_193257.jpg',
'20250303_193259.jpg',
'20250303_193308.jpg',
'20250303_193315.jpg',
'20250303_223650.jpg',
'20250303_WA0003.jpg',
'20250303-WA0004.jpg',
'20250303-WA0005.jpg',
'20250303-WA0006.jpg',
'20250303-WA0008.jpg',
'20250303-WA0009.jpg',
'20250303-WA0010.jpg',
'20250303-WA0011.jpg',
'20250303-WA0013.jpg',
'20250303-WA0014.jpg',
'20250303-WA0015.jpg',
'20250304_180047.jpg',
'20250304_180048.jpg',
'20250307-WA0000.jpg',
'20250308-160257.jpg',
'20250308-160259.jpg',
'20250308-160322.jpg',
'20250308-160326.jpg',
'20250308-160402.jpg',
'20250309_175251.jpg',
'20250309_175638.jpg',
'20250309_182852.jpg',
'20250315_192629.jpg',
'20250315_193046.jpg',
'20250315_193052.jpg',
'20250315_193055.jpg',
'20250315_193102.jpg',
'20250315_193107.jpg',
'20250315_193110.jpg',
'20250315_193115.jpg',
'20250315_193117.jpg',
'20250315_193428.jpg',
'20250315_193432.jpg',
'20250315_193759.jpg',
'20250315_193804.jpg',
'20250315_193809.jpg',
'20250316_181542.jpg',
'20250316-WA0001.jpg',
'20250316-WA0002.jpg',
'20250329_163608.jpg',
'20250329_163609.jpg',
'20250329_164137.jpg',
'20250404_193927.jpg',
'20250404_193942.jpg'

  ];
  const allPhotos = imageList.map(f => {
    const y = +f.slice(0,4), m = +f.slice(4,6)-1, d = +f.slice(6,8);
    return { date: new Date(y,m,d), file: f };
  });

  function updateGallery() {
    const gal = overlay.querySelector('.gallery');
    gal.innerHTML = '';
    const [dd, mon] = dates[selectedIndex].split(' ');
    const monthMap = { Ene:0,Feb:1,Mar:2,Abr:3,May:4,Jun:5,Jul:6,Ago:7,Sep:8,Oct:9,Nov:10,Dic:11 };
    const day = mon==='1ª'?15:28;
    const sel = new Date(2025, monthMap[dd], day);
    const start = new Date(sel); start.setDate(sel.getDate()-15);
    const end   = new Date(sel); end.setDate(sel.getDate()+15);
    const matches = allPhotos.filter(p=>p.date>=start&&p.date<=end);

    if(!matches.length){
      gal.innerHTML='<p class="no-photos">No hay fotos para este intervalo.</p>';
      return;
    }
    matches.forEach(({file})=>{
      const img=document.createElement('img');
      img.src=`images/gallery/${file}`;
      img.alt=file;
      img.className='gallery-img';
      img.addEventListener('click',()=>{
        const link=document.createElement('a');
        link.href=img.src; link.download=file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      gal.appendChild(img);
    });
  }

  // ─── TOAST DESCARGA ───
  function showDownloadToast(){
    let t=document.getElementById('download-toast');
    if(!t){
      t=document.createElement('div');
      t.id='download-toast';
      t.textContent='Descargando…';
      document.body.appendChild(t);
    }
    t.classList.add('visible');
    setTimeout(()=>t.classList.remove('visible'),1000);
  }
});
