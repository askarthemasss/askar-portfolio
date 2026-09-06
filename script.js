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

  // ── Closing Section Node & Edge Network ───────────────
  function initClosingNetwork() {
    const closing = document.getElementById('closing');
    const canvas = document.getElementById('closing-network-canvas');
    if (!closing || !canvas) return;

    const ctx = canvas.getContext('2d');
    const floatItems = Array.from(closing.querySelectorAll('.closing__float-item'));
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
      const rect = closing.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Re-measure when section enters viewport to account for full page layout
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            resize();
          }
        });
      }, { threshold: 0.1 });
      obs.observe(closing);
    }

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
      if (!e.target.closest('.closing__float-item')) {
        hoveredIndex = null;
        floatItems.forEach(el => {
          el.classList.remove('is-active');
          el.classList.remove('is-connected');
        });
      }
    });

    // Mouse parallax tracking within closing section
    closing.addEventListener('mousemove', (e) => {
      const rect = closing.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 18;
    });

    closing.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
      hoveredIndex = null;
    });

    closing.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const rect = closing.getBoundingClientRect();
        mouseX = ((touch.clientX - rect.left) / rect.width - 0.5) * 14;
        mouseY = ((touch.clientY - rect.top) / rect.height - 0.5) * 14;
      }
    }, { passive: true });

    // Defined logical relationship edges between nodes (by index 0-19)
    // Left cluster: 0:Angular, 1:TS, 2:RxJS, 3:YouTube, 4:Cricket, 5:Hospitality, 6:Copilot, 7:LeetCode, 8:Grok, 9:Chennai
    // Right cluster: 10:MCP, 11:Claude, 12:.NET, 13:X, 14:Ride, 15:SaaS, 16:Testing, 17:CLI, 18:Code, 19:Architecture
    const definedEdges = [
      // Left cluster: Core Frontend & Craft
      [0, 1], [0, 2], [1, 2],
      [1, 3], [2, 3], [0, 5],
      // Left cluster: Media & Identity
      [3, 4], [4, 5], [5, 6],
      [4, 7], [6, 7], [6, 8],
      [7, 8], [7, 9], [8, 9], [5, 9],

      // Right cluster: AI & Systems
      [10, 11], [10, 12], [11, 12],
      [11, 13], [12, 13], [10, 15],
      // Right cluster: Backend & Architecture
      [12, 14], [13, 14], [14, 15],
      [15, 16], [12, 16], [16, 17],
      [13, 17], [17, 18], [15, 18],
      [18, 19], [16, 19], [17, 19],

      // Delicate Arching Bridges (Over top & bottom without cutting through center text)
      [0, 10], // Angular -> MCP (high arch)
      [1, 11], // TypeScript -> Claude (upper arch)
      [9, 19], // Chennai -> Architecture (lower arch across bottom)
      [8, 18]  // Grok -> Code (bottom arch)
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
        const factor = (idx % 4 + 1) * 0.4;
        const sign = idx % 2 === 0 ? 1 : -1;
        item.style.transform = `translate(${currentX * factor * sign}px, ${currentY * factor * sign}px)`;
      });

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      const closingRect = closing.getBoundingClientRect();
      const nodePositions = floatItems.map(item => {
        const r = item.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;
        return {
          x: r.left - closingRect.left + r.width / 2,
          y: r.top - closingRect.top + r.height / 2
        };
      });

      // Draw Edges
      definedEdges.forEach(([a, b], edgeIdx) => {
        const p1 = nodePositions[a];
        const p2 = nodePositions[b];
        if (!p1 || !p2) return;

        const isHoveredEdge = (hoveredIndex === a || hoveredIndex === b);
        const isBridge = (a < 10 && b >= 10) || (b < 10 && a >= 10);

        ctx.save();
        ctx.beginPath();

        const midX = (p1.x + p2.x) / 2;
        let midY;
        if (isBridge) {
          // Curve arches upward or downward to avoid obscuring center text
          if (a <= 1 || b <= 11) {
            midY = Math.min(p1.y, p2.y) - 22;
          } else {
            midY = Math.max(p1.y, p2.y) + 22;
          }
        } else {
          midY = (p1.y + p2.y) / 2 + (edgeIdx % 2 === 0 ? 6 : -6);
        }

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);

        if (isHoveredEdge) {
          ctx.strokeStyle = 'rgba(196, 149, 106, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(26, 26, 26, 0.08)';
          ctx.lineWidth = 0.75;
          ctx.setLineDash([3, 4]);
        }
        ctx.stroke();

        // Traveling pulse beacon
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

      // Draw halo rings around active node
      if (hoveredIndex !== null && nodePositions[hoveredIndex]) {
        const hp = nodePositions[hoveredIndex];
        ctx.save();
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 20, 0, Math.PI * 2);
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
    let yToLengthTable = [];
    let currentDrawLength = 0;
    let targetDrawLength = 0;
    let rAFId = null;

    function getLengthForY(targetY) {
      if (!yToLengthTable.length) return 0;
      if (targetY <= yToLengthTable[0].y) return 0;
      const last = yToLengthTable[yToLengthTable.length - 1];
      if (targetY >= last.y) return pathLength;

      for (let i = 0; i < yToLengthTable.length - 1; i++) {
        const p1 = yToLengthTable[i];
        const p2 = yToLengthTable[i + 1];
        if (targetY >= p1.y && targetY <= p2.y) {
          const span = p2.y - p1.y;
          const frac = span > 0 ? (targetY - p1.y) / span : 0;
          return p1.len + frac * (p2.len - p1.len);
        }
      }
      return pathLength;
    }

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

      const bodyRect = document.body.getBoundingClientRect();
      const points = [];

      // Hero starting point (around cosmos center, high up)
      const hero = document.getElementById('hero');
      const heroHeight = hero ? hero.offsetHeight : 600;
      points.push({
        x: centerX,
        y: Math.min(heroHeight * 0.22, 170)
      });

      // Gather waypoint coordinates (passing directly through each dot's exact center)
      waypointCoords = [];
      waypoints.forEach((wp) => {
        const dot = wp.querySelector('.journey-waypoint__dot') || wp;
        const rect = dot.getBoundingClientRect();
        // Calculate coordinate relative to document body (immune to scroll position)
        const x = rect.left - bodyRect.left + rect.width / 2;
        const y = rect.top - bodyRect.top + rect.height / 2;

        waypointCoords.push({ wp, x, y, len: 0 });
        points.push({ x, y });
      });

      // Closing end point (bottom compass star center)
      const closingCircle = document.querySelector('.closing__circle');
      if (closingCircle) {
        const circleRect = closingCircle.getBoundingClientRect();
        points.push({
          x: circleRect.left - bodyRect.left + circleRect.width / 2,
          y: circleRect.top - bodyRect.top + circleRect.height / 2
        });
      } else {
        const closing = document.getElementById('closing');
        if (closing) {
          const closingRect = closing.getBoundingClientRect();
          points.push({
            x: centerX,
            y: closingRect.top - bodyRect.top + closingRect.height * 0.85
          });
        }
      }

      // Ensure points are ordered from top to bottom
      points.sort((a, b) => a.y - b.y);

      const n = points.length;
      if (n < 2) return 0;

      // Calculate smooth unit tangent vectors for every point (C1 continuity, no sharp corners)
      const tangents = [];
      for (let i = 0; i < n; i++) {
        if (i === 0) {
          const dx = points[1].x - points[0].x;
          const dy = Math.max(points[1].y - points[0].y, 1);
          const len = Math.hypot(dx, dy) || 1;
          tangents.push({ x: dx / len, y: dy / len });
        } else if (i === n - 1) {
          const dx = points[n - 1].x - points[n - 2].x;
          const dy = Math.max(points[n - 1].y - points[n - 2].y, 1);
          const len = Math.hypot(dx, dy) || 1;
          tangents.push({ x: dx / len, y: dy / len });
        } else {
          const prev = points[i - 1];
          const curr = points[i];
          const next = points[i + 1];

          const d1x = curr.x - prev.x;
          const d1y = Math.max(curr.y - prev.y, 0.1);
          const len1 = Math.hypot(d1x, d1y) || 1;

          const d2x = next.x - curr.x;
          const d2y = Math.max(next.y - curr.y, 0.1);
          const len2 = Math.hypot(d2x, d2y) || 1;

          const tx = (d1x / len1) + (d2x / len2);
          const ty = (d1y / len1) + (d2y / len2);
          const tLen = Math.hypot(tx, ty) || 1;
          tangents.push({ x: tx / tLen, y: ty / tLen });
        }
      }

      // Build smooth cubic Bézier curve segments passing directly through every point
      const tension = 0.30;
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

      for (let i = 0; i < n - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const handleLen = segLen * tension;

        const cp1x = Math.max(16, Math.min(docWidth - 16, p0.x + tangents[i].x * handleLen));
        const cp1y = p0.y + tangents[i].y * handleLen;

        const cp2x = Math.max(16, Math.min(docWidth - 16, p1.x - tangents[i + 1].x * handleLen));
        const cp2y = p1.y - tangents[i + 1].y * handleLen;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
      }

      path.setAttribute('d', d);

      pathLength = path.getTotalLength();

      // Set strokeDasharray with a massive gap to mathematically guarantee
      // that no second dash or ghost line can EVER wrap around or appear down the page
      path.style.strokeDasharray = `${pathLength + 100} ${pathLength * 3 + 5000}`;

      // Build a vertical lookup table to map document Y coordinate to exact path length
      yToLengthTable = [];
      const SAMPLES = 120;
      for (let i = 0; i <= SAMPLES; i++) {
        const len = (pathLength * i) / SAMPLES;
        const pt = path.getPointAtLength(len);
        yToLengthTable.push({ len, y: pt.y });
      }

      // Update exact path length for each waypoint
      waypointCoords.forEach(item => {
        item.len = getLengthForY(item.y);
      });

      return pathLength;
    }

    calculatePath();

    // ── Floating Rail Elements & Synchronization ──
    const railProgress = document.querySelector('.journey-rail__progress');
    const railNodes = Array.from(document.querySelectorAll('.rail-node'));
    const allSections = ['hero', 'about', 'experience', 'skills', 'projects', 'learning', 'closing'].map(id => document.getElementById(id)).filter(Boolean);

    // Frame renderer for buttery-smooth fluid interpolation during scroll up and down
    function renderSmoothLine() {
      const diff = targetDrawLength - currentDrawLength;

      if (Math.abs(diff) < 0.2) {
        currentDrawLength = targetDrawLength;
        rAFId = null;
      } else {
        // 0.18 gives a silky, natural liquid ease-out with zero stutter
        currentDrawLength += diff * 0.18;
        rAFId = requestAnimationFrame(renderSmoothLine);
      }

      const offset = Math.max(pathLength - currentDrawLength, 0);
      path.style.strokeDashoffset = offset.toFixed(1);

      // Activate in-section waypoints as the line physically reaches them
      waypointCoords.forEach(({ wp, len }) => {
        if (currentDrawLength >= len - 15) {
          wp.classList.add('is-reached');
        } else {
          wp.classList.remove('is-reached');
        }
      });
    }

    // Animate line on scroll: active drawing tip stays at the middle of the viewport
    function animateLine() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

      // The tip of the line stays at the middle of the user's screen (0.50 of viewport height)
      // As the user nears the end of the page (last 15%), smoothly complete into the closing compass star
      let targetY = scrollTop + window.innerHeight * 0.50;

      if (yToLengthTable.length > 0) {
        const endY = yToLengthTable[yToLengthTable.length - 1].y;
        if (scrollFraction > 0.85) {
          const finishRatio = (scrollFraction - 0.85) / 0.15;
          targetY = targetY * (1 - finishRatio) + endY * finishRatio;
        }
      }

      targetDrawLength = getLengthForY(targetY);

      // Update floating rail progress bar
      if (railProgress) {
        railProgress.style.height = (scrollFraction * 100).toFixed(1) + '%';
      }

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

      if (!rAFId) {
        rAFId = requestAnimationFrame(renderSmoothLine);
      }
    }

    // Floating rail navigation (side dots navigate to sections)
    railNodes.forEach(node => {
      function handleRailAction(e) {
        const sectionId = node.getAttribute('data-section');
        const target = document.getElementById(sectionId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      node.addEventListener('click', handleRailAction);
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleRailAction(e);
        }
      });
    });

    // In-page journey waypoint dots:
    // MUST NOT scroll to start of section on click!
    // Clicking/tapping toggles the cool hover message in-place without moving the viewport.
    waypoints.forEach(wp => {
      function toggleWaypointMessage(e) {
        e.preventDefault();
        e.stopPropagation();
        const wasActive = wp.classList.contains('is-active');
        // Dismiss other open waypoint messages
        waypoints.forEach(other => other.classList.remove('is-active'));
        if (!wasActive) {
          wp.classList.add('is-active');
        }
      }

      wp.addEventListener('click', toggleWaypointMessage);
      wp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleWaypointMessage(e);
        }
      });
    });

    // Close any active in-page waypoint message when clicking anywhere else
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.journey-waypoint')) {
        waypoints.forEach(wp => wp.classList.remove('is-active'));
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

    // Initial render: immediately draw down to the middle of the hero section
    requestAnimationFrame(() => {
      calculatePath();
      animateLine();
      // Snap initial frame without transition delay
      currentDrawLength = targetDrawLength;
      path.style.strokeDashoffset = Math.max(pathLength - currentDrawLength, 0).toFixed(1);
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
    initClosingNetwork();
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
