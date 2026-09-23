/* ============================================================
   script.js — Jadwal STI ITB PGRI Dewantara
   v2.0 — with Kelas A / Kelas B switcher
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Data kelas ── */
  const classData = {
    A: {
      desc: 'Angkatan 2025 · Kelas Reguler A · Semester Gasal 2026/2027',
      pills: ['4 Hari Kuliah', '8 Mata Kuliah', '7 Dosen'],
      dayMap: { 1: 'senin', 3: 'rabu', 4: 'kamis', 6: 'sabtu' }
    },
    B: {
      desc: 'Angkatan 2025 · Kelas Reguler B · Semester Gasal 2026/2027',
      pills: ['3 Hari Kuliah', '8 Mata Kuliah', '6 Dosen'],
      dayMap: { 5: 'jumat', 6: 'sabtu', 0: 'minggu' }
    }
  };

  let activeClass = 'A';

  /* ── Class switcher ── */
  const classBtns     = document.querySelectorAll('.class-btn');
  const scheduleA     = document.getElementById('schedule-A');
  const scheduleB     = document.getElementById('schedule-B');
  const filterInnerA  = document.getElementById('filter-inner-A');
  const filterInnerB  = document.getElementById('filter-inner-B');
  const heroDesc      = document.getElementById('hero-desc');

  const pillIcons = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  ];

  function switchClass(cls) {
    activeClass = cls;

    // Update buttons
    classBtns.forEach(b => b.classList.toggle('active', b.dataset.class === cls));

    // Toggle schedule & filter visibility
    if (cls === 'A') {
      scheduleA.style.display  = '';
      scheduleB.style.display  = 'none';
      filterInnerA.style.display = '';
      filterInnerB.style.display = 'none';
      document.body.classList.remove('class-b');
    } else {
      scheduleA.style.display  = 'none';
      scheduleB.style.display  = '';
      filterInnerA.style.display = 'none';
      filterInnerB.style.display = '';
      document.body.classList.add('class-b');
    }

    // Update hero desc
    heroDesc.textContent = classData[cls].desc;

    // Update hero pills
    const pillsWrap = document.getElementById('hero-pills');
    pillsWrap.innerHTML = classData[cls].pills
      .map((label, i) => `<span class="pill">${pillIcons[i]}${label}</span>`)
      .join('');

    // Reset filter to "Semua Hari" and show all days
    const activeFilterInner = cls === 'A' ? filterInnerA : filterInnerB;
    const filterBtns = activeFilterInner.querySelectorAll('.filter-btn');
    filterBtns.forEach(b => b.classList.remove('active'));
    filterBtns[0].classList.add('active');

    const activeSchedule = cls === 'A' ? scheduleA : scheduleB;
    activeSchedule.querySelectorAll('.day-block').forEach(block => block.classList.remove('hidden'));

    // Re-run fade-in observer on new cards
    setupObserver(activeSchedule);

    // Re-highlight today for active class
    highlightToday(cls);
  }

  classBtns.forEach(btn => {
    btn.addEventListener('click', () => switchClass(btn.dataset.class));
  });

  /* ── Filter buttons (both sets) ── */
  function setupFilterBtns(filterInner, scheduleEl) {
    const btns   = filterInner.querySelectorAll('.filter-btn');
    const blocks = scheduleEl.querySelectorAll('.day-block');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.day;
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        blocks.forEach(block => {
          if (target === 'all' || block.dataset.day === target) {
            block.classList.remove('hidden');
          } else {
            block.classList.add('hidden');
          }
        });
      });
    });
  }

  setupFilterBtns(filterInnerA, scheduleA);
  setupFilterBtns(filterInnerB, scheduleB);

  /* ── Intersection Observer: fade-in on scroll ── */
  function setupObserver(container) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    container.querySelectorAll('.session-card, .info-card').forEach(el => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(16px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  // Init observers for both schedules
  setupObserver(scheduleA);
  setupObserver(scheduleB);

  // Info cards — observer terpisah dengan threshold sangat rendah agar pasti muncul
  const infoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        infoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -10px 0px' });

  document.querySelectorAll('.info-card').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    infoObserver.observe(el);
  });

  /* ── Highlight current day ── */
  function highlightToday(cls) {
    // Remove existing badges
    document.querySelectorAll('.today-badge').forEach(b => b.remove());

    const dayMap   = classData[cls].dayMap;
    const today    = new Date().getDay();
    const todayKey = dayMap[today];
    if (!todayKey) return;

    const activeSchedule = cls === 'A' ? scheduleA : scheduleB;
    const activeFilterInner = cls === 'A' ? filterInnerA : filterInnerB;

    // Auto-click matching filter button
    const todayBtn = activeFilterInner.querySelector(`.filter-btn[data-day="${todayKey}"]`);
    if (todayBtn) todayBtn.click();

    // Add badge
    const dayBlock = activeSchedule.querySelector(`.day-block[data-day="${todayKey}"]`);
    if (dayBlock) {
      const h2    = dayBlock.querySelector('h2');
      const badge = document.createElement('span');
      badge.className   = 'today-badge';
      badge.textContent = '📅 Hari Ini';
      badge.style.cssText = `
        display:inline-flex; align-items:center; gap:5px;
        font-family:'Exo 2',sans-serif; font-size:0.7rem; font-weight:600;
        padding:3px 10px; border-radius:999px;
        background:rgba(91,140,255,0.15); border:1px solid rgba(91,140,255,0.4);
        color:#5b8cff; margin-left:12px; vertical-align:middle;
      `;
      h2.appendChild(badge);
    }
  }

  // Initial highlight for Kelas A
  highlightToday('A');

  /* ── Circuit SVG pulse animation ── */
  const circles = document.querySelectorAll('.circuit-svg circle[fill="url(#grad1)"]');
  let pulseDir  = 1;
  let pulseVal  = 0.5;

  setInterval(() => {
    pulseVal += pulseDir * 0.05;
    if (pulseVal >= 1)   pulseDir = -1;
    if (pulseVal <= 0.3) pulseDir = 1;
    circles.forEach(c => c.setAttribute('opacity', pulseVal.toFixed(2)));
  }, 80);

  /* ── Particle effect on card hover ── */
  document.querySelectorAll('.session-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const rect = card.getBoundingClientRect();
      for (let i = 0; i < 3; i++) {
        createParticle(
          rect.left + Math.random() * rect.width,
          rect.top  + Math.random() * rect.height
        );
      }
    });
  });

  function createParticle(x, y) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:fixed; z-index:9999; pointer-events:none;
      width:4px; height:4px; border-radius:50%;
      background:rgba(91,140,255,0.6);
      left:${x}px; top:${y}px;
      transform:translate(-50%,-50%) scale(1);
      transition: all 0.6s ease;
    `;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 30 + Math.random() * 40;
      p.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`;
      p.style.opacity   = '0';
    });
    setTimeout(() => p.remove(), 700);
  }

});
