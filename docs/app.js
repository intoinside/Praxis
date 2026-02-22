/* ──────────────────────────────────────────────────────────────
   Praxis — app.js
   Interactive canvas background + scroll animations
   ────────────────────────────────────────────────────────────── */

// ── Particle canvas ───────────────────────────────────────────
(function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H;
    const PARTICLE_COUNT = 90;
    const CONNECTION_DIST = 140;
    const particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.r = Math.random() * 1.8 + 0.5;
            // violet ↔ teal hue range
            const hue = Math.random() > 0.5 ? 263 : 174;
            this.color = `hsla(${hue}, 70%, 68%, 0.7)`;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -20 || this.x > W + 20) this.vx *= -1;
            if (this.y < -20 || this.y > H + 20) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles.length = 0;
        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); });
    resize();
    initParticles();
    animate();
})();

// ── Mouse parallax tilt on cards ─────────────────────────────
(function initTilt() {
    document.querySelectorAll('.concept-card, .feature-card, .workflow-step').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            card.style.transform = `perspective(600px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.4s ease';
            setTimeout(() => { card.style.transition = ''; }, 400);
        });
    });
})();

// ── Scroll reveal ─────────────────────────────────────────────
(function initReveal() {
    const targets = [
        '.concept-card',
        '.feature-card',
        '.workflow-step',
        '.install-text',
        '.install-terminal',
    ];

    const elements = document.querySelectorAll(targets.join(','));
    elements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // stagger siblings
                const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
                const idx = siblings.indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
})();

// ── Navbar active link highlight on scroll ────────────────────
(function initNavSpy() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');

    const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => spy.observe(s));
})();

// Active nav link style (added dynamically)
const style = document.createElement('style');
style.textContent = `
  .nav-link.active {
    color: var(--text);
    background: rgba(139,92,246,0.12);
  }
`;
document.head.appendChild(style);

// ── Terminal typewriter on first view ─────────────────────────
(function initTypewriter() {
    const terminal = document.getElementById('hero-terminal');
    if (!terminal) return;

    // Already visible — animate lines sequentially
    const lines = terminal.querySelectorAll('.term-line');
    lines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(6px)';
        setTimeout(() => {
            line.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 900 + i * 220);
    });
})();
