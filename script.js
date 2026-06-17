/* =============================================
   JESSIE'S ICE PORTFOLIO — script.js
   ============================================= */

/* ---------- DARK / LIGHT MODE ---------- */
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved preference
if (localStorage.getItem('theme') === 'light') {
  body.classList.add('light-mode');
  themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const isLight = body.classList.contains('light-mode');
  themeToggle.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

/* ---------- MOBILE MENU ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  hamburger.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
});

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.textContent = '☰';
}

/* ---------- NAVBAR SCROLL EFFECT ---------- */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.style.padding = '0.8rem 2.5rem';
  } else {
    navbar.style.padding = '1.2rem 2.5rem';
  }
});

/* ---------- ICE PARTICLES (hero) ---------- */
const container = document.getElementById('particles');
const colors = ['#3ae8d4', '#7ec8f0', '#b8a4e8', '#e8f4ff'];

function createParticle() {
  const p = document.createElement('div');
  p.classList.add('particle');

  const size = Math.random() * 5 + 2;
  const left = Math.random() * 100;
  const duration = Math.random() * 4 + 3;
  const delay = Math.random() * 5;
  const color = colors[Math.floor(Math.random() * colors.length)];

  p.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${left}%;
    bottom: ${Math.random() * 60}%;
    background: ${color};
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
  `;

  container.appendChild(p);

  // remove after animation to keep DOM clean
  setTimeout(() => p.remove(), (duration + delay) * 1000);
}

// spawn particles continuously
setInterval(createParticle, 400);

/* ---------- SCROLL REVEAL ---------- */
const revealElements = document.querySelectorAll(
  '.project-card, .skill-category, .contact-card, .about-grid'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

/* ---------- ACTIVE NAV LINK on scroll ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}`
      ? 'var(--teal)'
      : '';
  });
});