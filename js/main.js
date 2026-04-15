// Wait for GSAP + ScrollTrigger to load
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // ============================================
  // NAV — scroll border
  // ============================================
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 'top -40',
    onEnter:  () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });

  // ============================================
  // MOBILE MENU
  // ============================================
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menuBtn.classList.remove('active');
    navLinks.classList.remove('active');
  }));

  // ============================================
  // HERO — staggered entrance
  // ============================================
  const heroTl = gsap.timeline({ delay: 0.15 });
  heroTl
    .from('.hero__label', { opacity: 0, y: -12, duration: 0.6, stagger: 0.12, ease: 'power2.out' })
    .from('.hero__title-line', { opacity: 0, y: 60, duration: 0.9, stagger: 0.18, ease: 'power3.out' }, '-=0.3')
    .from('.hero__desc', { opacity: 0, y: 20, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .from('.hero__cta', { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' }, '-=0.4');

  // ============================================
  // HERO IMAGE — parallax
  // ============================================
  gsap.to('.hero__img img', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero__img',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });

  // ============================================
  // SECTION HEADERS — slide in
  // ============================================
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.from(el.querySelectorAll('.section-en, .section-ja, .section-header__note'), {
      opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 82%' }
    });
  });

  // ============================================
  // WORKS GRID — staggered reveal
  // ============================================
  gsap.from('.work-item', {
    opacity: 0, y: 50, scale: 0.97,
    duration: 0.8, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '.works__grid', start: 'top 80%' }
  });

  // ============================================
  // ABOUT — split entrance
  // ============================================
  gsap.from('.about__message', {
    opacity: 0, x: -40, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.about__inner', start: 'top 78%' }
  });
  gsap.from('.about__data', {
    opacity: 0, x: 40, duration: 0.9, ease: 'power2.out',
    scrollTrigger: { trigger: '.about__inner', start: 'top 78%' }
  });

  // Number counter animation
  document.querySelectorAll('.stat__num').forEach(el => {
    const text = el.textContent;
    const num = parseInt(text);
    if (isNaN(num)) return;
    const suffix = text.replace(/[0-9]/g, '');
    const small = el.querySelector('small');
    const smallText = small ? small.outerHTML : '';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo({ val: 0 }, { val: num }, {
          duration: 1.6, ease: 'power2.out',
          onUpdate: function() {
            el.innerHTML = Math.round(this.targets()[0].val) + smallText;
          }
        });
      }
    });
  });

  // ============================================
  // SERVICES — rows slide in from left
  // ============================================
  gsap.utils.toArray('.service-row').forEach((row, i) => {
    gsap.from(row, {
      opacity: 0, x: -50, duration: 0.7, ease: 'power2.out',
      delay: i * 0.08,
      scrollTrigger: { trigger: row, start: 'top 88%' }
    });
  });

  // ============================================
  // CONTACT CARDS — scale up
  // ============================================
  gsap.from('.contact-card', {
    opacity: 0, y: 30, scale: 0.97, duration: 0.8,
    stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact__options', start: 'top 82%' }
  });

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        gsap.to(window, { duration: 1, scrollTo: target, ease: 'power2.inOut' });
      }
    });
  });
});

// GSAP ScrollTo plugin fallback (if not available, use native)
if (typeof gsap === 'undefined') {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn?.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
}
