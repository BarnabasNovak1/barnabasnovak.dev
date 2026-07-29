// Arcade + Cyberpunk + Scientific Visualization JS
// - Particle network background
// - Glitch title on load
// - Command palette (no sounds)
// - Konami code toggles CRT theme

(function() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  // 1) Particle Network
  const hero = document.querySelector('.hero');
  if (hero) {
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-net';
    const bg = hero.querySelector('.hero-bg') || hero;
    bg.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const densityFactor = isMobile ? 0.6 : 1.0; // relative density
    let nodes = [];
    const maxDist = isMobile ? 90 : 120;
    const mouse = { x: -9999, y: -9999, active: false };

    function resize() {
      const rect = hero.getBoundingClientRect();
      w = Math.floor(rect.width);
      h = Math.floor(rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    }

    function initNodes() {
      const baseDivisor = 10500; // higher => fewer nodes
      const count = Math.floor(((w * h) / baseDivisor) * densityFactor);
      nodes = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.35),
        vy: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.35),
        c: Math.random() < 0.5 ? '#00f5d4' : '#ff3d81'
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // Move + draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Mouse influence
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist2 = dx*dx + dy*dy;
          const r = 120;
          if (dist2 < r*r) {
            const f = (1 - Math.sqrt(dist2)/r) * 0.6;
            n.vx += (dx / (Math.sqrt(dist2) + 0.001)) * f * 0.05;
            n.vy += (dy / (Math.sqrt(dist2) + 0.001)) * f * 0.05;
          }
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230,230,255,0.9)';
        ctx.fill();
      }

      // Edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < maxDist) {
            const alpha = 1 - d / maxDist;
            ctx.strokeStyle = `rgba(0,245,212,${alpha * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (!prefersReduced) requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);

    // Mouse events
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    canvas.addEventListener('mouseleave', () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; });

    if (!prefersReduced) requestAnimationFrame(step);
  }

  // 2) Glitch once
  const title = document.querySelector('.glitch-title');
  if (title) {
    requestAnimationFrame(() => title.classList.add('glitch-once'));
  }

  // 3) Command Palette
  const overlay = document.querySelector('.cmdk-overlay');
  const input = document.querySelector('.cmdk-input');
  const items = Array.from(document.querySelectorAll('.cmdk-item'));

  function openCmdk() {
    if (!overlay) return;
    overlay.classList.add('open');
    setTimeout(() => input && input.focus(), 0);
  }
  function closeCmdk() { overlay && overlay.classList.remove('open'); }

  document.querySelectorAll('[data-open-cmdk]').forEach(btn => btn.addEventListener('click', openCmdk));
  overlay && overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCmdk(); });

  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault(); openCmdk();
    } else if (e.key === 'Escape') {
      closeCmdk();
    }
  });

  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      items.forEach(it => {
        const text = it.dataset.search || it.textContent || '';
        it.style.display = text.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  items.forEach(it => it.addEventListener('click', () => {
    const action = it.dataset.action;
    if (action === 'resume') window.open('docs/2026Resume.pdf', '_blank');
    if (action === 'email') window.location.href = 'mailto:barnabas.novak01@gmail.com';
    if (action === 'copy-email') { navigator.clipboard.writeText('barnabas.novak01@gmail.com'); }
    if (action === 'projects') window.location.href = 'projects.html';
    if (action === 'projects-hu') window.location.href = 'projektek.html';
    if (action === 'home') window.location.href = 'index.html';
    if (action === 'home-hu') window.location.href = 'kezdolap.html';
    if (action === 'github') window.open('https://github.com/BarnabasNovak1', '_blank');
    if (action === 'linkedin') window.open('https://www.linkedin.com/in/barnabas-novak/', '_blank');
    closeCmdk();
  }));

  // Hologram laptop click to open command palette
  document.querySelectorAll('.holo-laptop[data-open-cmdk], .laptop[data-open-cmdk]').forEach(laptop => {
    laptop.addEventListener('click', openCmdk);
    laptop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openCmdk(); });
  });

  // Code rain effect
  const canvas = document.getElementById('codeRain');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = 240;
    canvas.height = 150;
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function drawRain() {
      ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00e5c7';
      ctx.font = fontSize + 'px JetBrains Mono, monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        
        ctx.fillStyle = Math.random() > 0.98 ? '#e8366f' : '#00e5c7';
        ctx.globalAlpha = 0.8 + Math.random() * 0.2;
        ctx.fillText(char, x, y);
        ctx.globalAlpha = 1;
        
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    setInterval(drawRain, 50);
  }

  // 4) Konami code => CRT theme
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let buf = [];
  window.addEventListener('keydown', (e) => {
    buf.push(e.key);
    if (buf.length > KONAMI.length) buf.shift();
    if (KONAMI.every((k, i) => buf[i] === k)) {
      document.body.classList.toggle('crt-theme');
      buf = [];
    }
  });
})();
