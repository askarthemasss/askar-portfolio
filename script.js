/* ═══════════════════════════════════════════════════════
   ASKAR PORTFOLIO — DRAWN FROM THE INSIDE
   Interactive behaviors: scroll reveals, particles,
   journey line, idle star pulse, constellation dots
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Reduced Motion Check ──────────────────────────
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Intersection Observer: Reveal on Scroll ───────
  function initRevealObserver() {
    const revealItems = document.querySelectorAll('.reveal-item');
    const revealSections = document.querySelectorAll('.about, .timeline__node');

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    revealItems.forEach(item => observer.observe(item));

    // Section-level reveals (for branch animations, etc.)
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });

    revealSections.forEach(section => sectionObserver.observe(section));
  }

  // ── Ambient Particles ─────────────────────────────
  function initParticles() {
    if (prefersReducedMotion) return;

    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    const PARTICLE_COUNT = 35;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.1 - 0.05,
        opacity: Math.random() * 0.3 + 0.1,
        life: Math.random() * 600 + 200,
        maxLife: 0
      };
    }

    function initParticlesArray() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = createParticle();
        p.maxLife = p.life;
        particles.push(p);
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        const lifeRatio = p.life / p.maxLife;
        const fadeOpacity = lifeRatio < 0.2 ? lifeRatio / 0.2 : (lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 149, 106, ${p.opacity * fadeOpacity})`;
        ctx.fill();

        if (p.life <= 0 || p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) {
          particles[i] = createParticle();
          particles[i].maxLife = particles[i].life;
        }
      });

      // Draw faint constellation connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(196, 149, 106, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(drawParticles);
    }

    resize();
    initParticlesArray();
    drawParticles();

    window.addEventListener('resize', () => {
      resize();
    });

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        drawParticles();
      }
    });
  }

  // ── Hero Constellation Dots ───────────────────────
  function initHeroConstellation() {
    if (prefersReducedMotion) return;

    const container = document.querySelector('.hero__cosmos');
    if (!container) return;

    const DOTS = 20;
    const dots = [];

    for (let i = 0; i < DOTS; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position: absolute;
        width: ${Math.random() * 2 + 1}px;
        height: ${Math.random() * 2 + 1}px;
        border-radius: 50%;
        background: rgba(26, 26, 26, ${Math.random() * 0.08 + 0.03});
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        pointer-events: none;
      `;
      container.appendChild(dot);
      dots.push({
        el: dot,
        x: parseFloat(dot.style.left),
        y: parseFloat(dot.style.top),
        vx: (Math.random() - 0.5) * 0.003,
        vy: (Math.random() - 0.5) * 0.003
      });
    }

    function animateDots() {
      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > 100) d.vx *= -1;
        if (d.y < 0 || d.y > 100) d.vy *= -1;
        d.el.style.left = d.x + '%';
        d.el.style.top = d.y + '%';
      });
      requestAnimationFrame(animateDots);
    }

    animateDots();
  }

  // ── Hero Dynamic Node & Edge Network ─────────────────
  function initHeroNetwork() {
    const hero = document.getElementById('hero');
    const canvas = document.getElementById('hero-network-canvas');
    if (!hero || !canvas) return;

    const ctx = canvas.getContext('2d');
    const floatItems = Array.from(document.querySelectorAll('.hero__float-item'));
    if (!floatItems.length) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let hoveredIndex = null;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    function resize() {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Hover & touch tracking on nodes
    floatItems.forEach((item, idx) => {
      item.addEventListener('mouseenter', () => {
        hoveredIndex = idx;
        item.classList.add('is-active');
        highlightNeighbors(idx);
      });
      item.addEventListener('mouseleave', () => {
        hoveredIndex = null;
        item.classList.remove('is-active');
        floatItems.forEach(el => el.classList.remove('is-connected'));
      });
      // Touch support for mobile devices
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (hoveredIndex === idx) {
          hoveredIndex = null;
          item.classList.remove('is-active');
          floatItems.forEach(el => el.classList.remove('is-connected'));
        } else {
          floatItems.forEach(el => {
            el.classList.remove('is-active');
            el.classList.remove('is-connected');
          });
          hoveredIndex = idx;
          item.classList.add('is-active');
          highlightNeighbors(idx);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.hero__float-item')) {
        hoveredIndex = null;
        floatItems.forEach(el => {
          el.classList.remove('is-active');
          el.classList.remove('is-connected');
        });
      }
    });

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 22;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 22;
    });

    hero.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
      hoveredIndex = null;
    });

    hero.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const rect = hero.getBoundingClientRect();
        mouseX = ((touch.clientX - rect.left) / rect.width - 0.5) * 16;
        mouseY = ((touch.clientY - rect.top) / rect.height - 0.5) * 16;
      }
    }, { passive: true });

    // Defined logical relationship edges between nodes (by index 0-19)
    // Left cluster: 0:Angular, 1:TS, 2:RxJS, 3:YouTube, 4:Cricket, 5:Hospitality, 6:Copilot, 7:LeetCode, 8:Grok, 9:Chennai
    // Right cluster: 10:MCP, 11:Claude, 12:.NET, 13:X, 14:Ride, 15:SaaS, 16:Testing, 17:CLI, 18:Code, 19:Systems
    const definedEdges = [
      // Frontend & Core Craft
      [0, 1], [0, 2], [1, 2], [0, 5], [1, 7], [2, 6],
      // Media & Identity (Left)
      [3, 0], [3, 1], [4, 9], [5, 9], [6, 8], [7, 8], [8, 9], [4, 6],
      // AI & Systems (Right)
      [10, 11], [10, 12], [11, 13], [10, 15], [11, 16],
      // Backend & Engineering (Right)
      [12, 19], [12, 17], [13, 14], [14, 15], [15, 19], [16, 17], [17, 18], [18, 19], [15, 18],
      // Bridging Cross-Constellations (delicate arches)
      [1, 10], [6, 11], [9, 14], [7, 18]
    ];

    function highlightNeighbors(activeIdx) {
      floatItems.forEach(el => el.classList.remove('is-connected'));
      definedEdges.forEach(([a, b]) => {
        if (a === activeIdx && floatItems[b]) floatItems[b].classList.add('is-connected');
        if (b === activeIdx && floatItems[a]) floatItems[a].classList.add('is-connected');
      });
    }

    function drawNetwork(time) {
      if (width === 0 || height === 0) {
        requestAnimationFrame(drawNetwork);
        return;
      }

      // Parallax smooth interpolation
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      floatItems.forEach((item, idx) => {
        const factor = (idx % 4 + 1) * 0.45;
        const sign = idx % 2 === 0 ? 1 : -1;
        item.style.transform = `translate(${currentX * factor * sign}px, ${currentY * factor * sign}px)`;
      });

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      const heroRect = hero.getBoundingClientRect();
      const nodePositions = floatItems.map(item => {
        const r = item.getBoundingClientRect();
        return {
          x: r.left - heroRect.left + r.width / 2,
          y: r.top - heroRect.top + r.height / 2
        };
      });

      // Draw Edges
      definedEdges.forEach(([a, b], edgeIdx) => {
        const p1 = nodePositions[a];
        const p2 = nodePositions[b];
        if (!p1 || !p2) return;

        const isHoveredEdge = (hoveredIndex === a || hoveredIndex === b);
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        ctx.save();
        ctx.beginPath();

        // Gentle curvature
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + (edgeIdx % 2 === 0 ? 6 : -6);
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);

        if (isHoveredEdge) {
          ctx.strokeStyle = 'rgba(196, 149, 106, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(26, 26, 26, 0.09)';
          ctx.lineWidth = 0.75;
          ctx.setLineDash([3, 4]);
        }
        ctx.stroke();

        // Subtle traveling pulse beacon on hovered or periodic active edges
        if (isHoveredEdge || edgeIdx % 3 === 0) {
          const speed = isHoveredEdge ? 0.0012 : 0.0004;
          const t = (time * speed + edgeIdx * 0.17) % 1;
          const qx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midX + t * t * p2.x;
          const qy = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midY + t * t * p2.y;

          ctx.beginPath();
          ctx.arc(qx, qy, isHoveredEdge ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = isHoveredEdge ? 'rgba(196, 149, 106, 0.9)' : 'rgba(139, 158, 139, 0.4)';
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw subtle ring halos around active node
      if (hoveredIndex !== null && nodePositions[hoveredIndex]) {
        const hp = nodePositions[hoveredIndex];
        ctx.save();
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(196, 149, 106, 0.35)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(drawNetwork);
    }

    requestAnimationFrame(drawNetwork);
  }

  // ── Journey Line (Continuous Thread) ──────────────
  function initJourneyLine() {
    const svg = document.querySelector('.journey-line');
    const path = document.querySelector('.thread-path');
    const waypoints = Array.from(document.querySelectorAll('.journey-waypoint'));
    if (!svg || !path) return;

    let pathLength = 0;
    let waypointCoords = [];

    function calculatePath() {
      const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
      const docWidth = document.documentElement.clientWidth;
      const centerX = docWidth / 2;

      svg.setAttribute('width', docWidth);
      svg.setAttribute('height', docHeight);
      svg.style.width = docWidth + 'px';
      svg.style.height = docHeight + 'px';

      const points = [];

      // Hero starting point (around cosmos center)
      const hero = document.getElementById('hero');
      const heroHeight = hero ? hero.offsetHeight : 600;
      points.push({ x: centerX, y: Math.min(heroHeight * 0.35, 260) });

      // Gather waypoints coordinates
      waypointCoords = [];
      waypoints.forEach((wp, idx) => {
        const dot = wp.querySelector('.journey-waypoint__dot') || wp;
        const rect = dot.getBoundingClientRect();
        const y = rect.top + window.scrollY + rect.height / 2;
        const x = rect.left + window.scrollX + rect.width / 2;

        waypointCoords.push({ wp, y, x });

        // Add an organic weave point between waypoints if distance is large
        const prev = points[points.length - 1];
        if (prev && (y - prev.y > 450)) {
          const midY = (prev.y + y) / 2;
          const weaveSign = (idx % 2 === 0) ? 1 : -1;
          const amplitude = Math.min(docWidth * 0.12, 100);
          const weaveX = centerX + (weaveSign * amplitude);
          points.push({ x: weaveX, y: midY });
        }

        points.push({ x, y });
      });

      // Closing end point (bottom of closing compass)
      const closing = document.getElementById('closing');
      if (closing) {
        const closingRect = closing.getBoundingClientRect();
        const closingBottom = closingRect.top + window.scrollY + closingRect.height * 0.9;
        points.push({ x: centerX, y: closingBottom });
      }

      // Fallback if not enough points
      if (points.length < 2) {
        const segments = 25;
        const segH = docHeight / segments;
        for (let i = 0; i <= segments; i++) {
          const y = i * segH;
          const wave = Math.sin(i * 0.5) * (docWidth * 0.08);
          points.push({ x: centerX + wave, y });
        }
      }

      // Build smooth SVG Bézier path
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        const cpY = (prev.y + curr.y) / 2;
        d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${cpX.toFixed(1)} ${cpY.toFixed(1)}`;
      }
      const last = points[points.length - 1];
      d += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

      path.setAttribute('d', d);

      pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength;
      path.style.strokeDashoffset = pathLength;

      return pathLength;
    }

    calculatePath();

    // ── Floating Rail Elements & Synchronization ──
    const railProgress = document.querySelector('.journey-rail__progress');
    const railNodes = Array.from(document.querySelectorAll('.rail-node'));
    const allSections = ['hero', 'about', 'experience', 'skills', 'projects', 'learning', 'closing'].map(id => document.getElementById(id)).filter(Boolean);

    // Animate line on scroll and sync waypoint & rail activation
    function animateLine() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

      const drawLength = pathLength * scrollPercent;
      path.style.strokeDashoffset = Math.max(pathLength - drawLength, 0);

      // Update floating rail progress bar
      if (railProgress) {
        railProgress.style.height = (scrollPercent * 100).toFixed(1) + '%';
      }

      // Determine current tip Y in document coordinates
      let tipY = scrollTop + window.innerHeight * 0.6;
      if (path.getPointAtLength && drawLength > 0) {
        try {
          const tipPoint = path.getPointAtLength(drawLength);
          if (tipPoint && tipPoint.y) tipY = tipPoint.y;
        } catch (e) {
          // fallback to viewport middle
        }
      }

      // Activate in-section waypoints as line reaches them
      waypointCoords.forEach(({ wp, y }) => {
        if (tipY >= y - 60) {
          wp.classList.add('is-reached');
        } else {
          wp.classList.remove('is-reached');
        }
      });

      // Update active section on floating rail
      let activeSectionId = 'hero';
      const viewportMid = scrollTop + window.innerHeight * 0.45;

      allSections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (viewportMid >= top && viewportMid < top + height) {
          activeSectionId = section.id;
        }
      });

      railNodes.forEach(node => {
        if (node.getAttribute('data-section') === activeSectionId) {
          node.classList.add('is-active');
        } else {
          node.classList.remove('is-active');
        }
      });
    }

    // Interactive Waypoint Navigation & Popover Trigger
    function setupNavEvents(element, getTargetId) {
      function handleAction(e) {
        const actionBtn = e.target.closest('.waypoint-popover__action');
        const sectionId = getTargetId(element);
        const target = document.getElementById(sectionId);

        if (actionBtn || e.target.closest('.rail-node__dot') || element.classList.contains('rail-node')) {
          e.preventDefault();
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }

        // For in-section waypoints: toggle inline popover
        if (element.classList.contains('journey-waypoint')) {
          const wasOpen = element.classList.contains('is-open');
          document.querySelectorAll('.journey-waypoint.is-open').forEach(w => w.classList.remove('is-open'));
          if (!wasOpen) {
            element.classList.add('is-open');
          }
        }
      }

      element.addEventListener('click', handleAction);
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAction(e);
        }
      });
    }

    waypoints.forEach(wp => setupNavEvents(wp, el => el.getAttribute('data-section')));
    railNodes.forEach(node => setupNavEvents(node, el => el.getAttribute('data-section')));

    // Close open inline popovers on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.journey-waypoint')) {
        document.querySelectorAll('.journey-waypoint.is-open').forEach(w => w.classList.remove('is-open'));
      }
    });

    window.addEventListener('scroll', animateLine, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculatePath();
        animateLine();
      }, 200);
    });

    // Ensure layout is measured after font loading / reflow
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        calculatePath();
        animateLine();
      });
    }

    // Initial render
    requestAnimationFrame(() => {
      calculatePath();
      animateLine();
    });
  }

  // ── Idle Star Pulse ───────────────────────────────
  function initIdlePulse() {
    if (prefersReducedMotion) return;

    const nodes = document.querySelectorAll('.journey-node');
    let idleTimer;

    function triggerPulse() {
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      if (randomNode) {
        randomNode.style.transition = 'transform 1s ease, opacity 1s ease';
        randomNode.style.transform = 'scale(2)';
        randomNode.style.opacity = '0.9';
        setTimeout(() => {
          randomNode.style.transform = 'scale(1)';
          randomNode.style.opacity = '0.5';
        }, 1500);
      }
    }

    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(triggerPulse, 4000);
    }

    window.addEventListener('scroll', resetIdle, { passive: true });
    window.addEventListener('mousemove', resetIdle, { passive: true });
    resetIdle();
  }

  // ── SVG Draw-line Animation Enhancement ───────────
  function initDrawLines() {
    const drawLines = document.querySelectorAll('.draw-line');

    drawLines.forEach(line => {
      const length = line.getTotalLength ? line.getTotalLength() : 500;
      line.style.strokeDasharray = length;
      line.style.strokeDashoffset = length;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const lines = entry.target.querySelectorAll('.draw-line');
          lines.forEach((line, i) => {
            setTimeout(() => {
              line.classList.add('is-drawn');
              line.style.strokeDashoffset = '0';
            }, i * 150);
          });
        }
      });
    }, { threshold: 0.2 });

    // Observe parent containers of draw-lines
    const containers = new Set();
    drawLines.forEach(line => {
      const parent = line.closest('.reveal-item, .project-card__illustration, .timeline__illustration, .about__visual-card, .about__illu-item');
      if (parent) containers.add(parent);
    });
    containers.forEach(c => observer.observe(c));
  }

  // ── Smooth Scroll Hint (hero prompt) ──────────────
  function initScrollHint() {
    const prompt = document.querySelector('.hero__scroll-prompt');
    if (!prompt) return;

    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          prompt.style.opacity = '0';
          prompt.style.transition = 'opacity 1s ease';
        }
      });
    }, { threshold: 0.5 });

    fadeObserver.observe(document.querySelector('.hero'));
  }

  // ── Skill Cell Entrance Animation ─────────────────
  function initSkillCells() {
    const cells = document.querySelectorAll('.skill-cell');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const cell = entry.target;
          const icon = cell.querySelector('.skill-cell__icon svg');
          if (icon) {
            const paths = icon.querySelectorAll('path, line, rect, circle, ellipse');
            paths.forEach(p => {
              if (p.getTotalLength) {
                const len = p.getTotalLength();
                p.style.strokeDasharray = len;
                p.style.strokeDashoffset = len;
                p.style.transition = `stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1) ${Math.random() * 0.3}s`;
                requestAnimationFrame(() => {
                  p.style.strokeDashoffset = '0';
                });
              }
            });
          }
        }
      });
    }, { threshold: 0.3 });

    cells.forEach(cell => observer.observe(cell));
  }

  // ── Project Illustration Hover Breathing ──────────
  function initProjectBreathing() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
      const illu = card.querySelector('.project-card__illustration svg');
      if (!illu) return;

      card.addEventListener('mouseenter', () => {
        illu.style.transition = 'transform 3s ease';
        illu.style.transform = 'scale(1.02)';
      });

      card.addEventListener('mouseleave', () => {
        illu.style.transition = 'transform 2s ease';
        illu.style.transform = 'scale(1)';
      });
    });
  }

  // ── Text Underline Hand-drawn Effect ──────────────
  function initHandDrawnUnderlines() {
    const links = document.querySelectorAll('.about__text a, .project-card__description a');

    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.borderBottomWidth = '1.5px';
        link.style.borderBottomStyle = 'solid';
        link.style.borderBottomColor = 'rgba(184, 122, 90, 0.6)';
      });

      link.addEventListener('mouseleave', () => {
        link.style.borderBottomColor = 'rgba(184, 122, 90, 0.3)';
        link.style.borderBottomWidth = '1px';
      });
    });
  }

  // ── Timeline Node Expand ──────────────────────────
  function initTimelineExpand() {
    const nodes = document.querySelectorAll('.timeline__node');

    nodes.forEach(node => {
      const details = node.querySelector('.timeline__details');
      const illustration = node.querySelector('.timeline__illustration');

      if (details) {
        // Initially partially visible, expand on hover/focus
        node.addEventListener('mouseenter', () => {
          if (illustration) {
            illustration.style.opacity = '1';
          }
        });

        node.addEventListener('mouseleave', () => {
          if (illustration) {
            illustration.style.opacity = '0.7';
          }
        });
      }
    });
  }

  // ── Initialize Everything ─────────────────────────
  function init() {
    initRevealObserver();
    initParticles();
    initHeroConstellation();
    initHeroNetwork();
    initJourneyLine();
    initIdlePulse();
    initScrollHint();
    initSkillCells();
    initProjectBreathing();
    initHandDrawnUnderlines();
    initTimelineExpand();

    // Delayed init for draw lines (need layout to stabilize)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initDrawLines();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
