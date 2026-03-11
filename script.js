/* ── 1. CUSTOM CURSOR ─────────────────────── */
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursorRing');
    let mouseX=0, mouseY=0, ringX=0, ringY=0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    (function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width='20px'; cursor.style.height='20px';
        cursor.style.background='var(--accent2)';
        ring.style.width='52px'; ring.style.height='52px';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width='12px'; cursor.style.height='12px';
        cursor.style.background='var(--accent1)';
        ring.style.width='36px'; ring.style.height='36px';
      });
    });

    /* ── 2. SCROLL REVEAL ─────────────────────── */
    const revealEls = document.querySelectorAll('.reveal, .timeline-item');
    const observer  = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => observer.observe(el));

    /* ── 3. PROJECT CARD MOUSE GLOW ───────────── */
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width  * 100) + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - rect.top)  / rect.height * 100) + '%');
      });
    });

    /* ── 4. ACTIVE NAV HIGHLIGHT ──────────────── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks  = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(s => { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + current ? 'var(--text)' : '';
      });
    });

    /* ── 5. SKILL BARS on scroll ──────────────── */
    const barSection = document.getElementById('skillBarsSection');
    let barsAnimated = false;
    const barObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !barsAnimated) {
        barsAnimated = true;
        document.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
      }
    }, { threshold: 0.3 });
    if (barSection) barObserver.observe(barSection);

    /* ── 6. PROGRESS RINGS on scroll ─────────── */
    const rings = document.getElementById('progressRings');
    let ringsAnimated = false;
    const ringObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !ringsAnimated) {
        ringsAnimated = true;
        document.querySelectorAll('.ring-fill').forEach(circle => {
          const target = parseInt(circle.dataset.dash);
          const total  = 251;
          circle.style.strokeDashoffset = (total - target).toString();
        });
      }
    }, { threshold: 0.3 });
    if (rings) ringObserver.observe(rings);

    /* ── 7. TYPING ANIMATION ──────────────────── */
    const lines = [
      'responsive portfolio websites',
      'smooth CSS animations',
      'React component libraries',
      'pixel-perfect UI layouts',
      'interactive web experiences',
    ];
    let li = 0, ci = 0, deleting = false;
    const el = document.getElementById('typingText');

    function type() {
      if (!el) return;
      const word = lines[li];
      if (!deleting) {
        el.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
      } else {
        el.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
      }
      setTimeout(type, deleting ? 45 : 80);
    }
    type();

    /* ── 8. TILT ON STAT CARDS ────────────────── */
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width  - 0.5;
        const cy = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `translateY(-3px) rotateX(${-cy*10}deg) rotateY(${cx*10}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
      });
    });

    /* ── 9. CERT CARD STAGGER ON SCROLL ────────── */
    const certObserver = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.style.opacity = '1', i * 100);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.cert-card').forEach(c => {
      c.style.opacity = '0';
      c.style.transition = 'opacity 0.5s ease, transform 0.3s ease, border-color 0.3s';
      certObserver.observe(c);
    });

    /* ── 10. NAV scroll shrink ────────────────── */
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('nav');
      if (window.scrollY > 60) {
        nav.style.padding = '12px 60px';
        nav.style.background = 'rgba(9,9,15,0.95)';
      } else {
        nav.style.padding = '20px 60px';
        nav.style.background = 'rgba(9,9,15,0.7)';
      }
    });