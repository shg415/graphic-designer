gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ============================================
   LOADER
   ============================================ */
const loader = document.getElementById('loader');
const loaderTl = gsap.timeline({
  onComplete: () => {
    loader.style.pointerEvents = 'none';
    initScrollAnimations();
  }
});
loaderTl
  .to('.loader__text', { opacity: 1, duration: 0.6, ease: 'power2.out' })
  .to('.loader', {
    yPercent: -100, duration: 1.0, ease: 'power3.inOut', delay: 0.4
  })
  .from('#heroEyebrow', { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' }, '-=0.3')
  .from('.hero__line', {
    opacity: 0, y: 80, duration: 1, stagger: 0.15, ease: 'power3.out'
  }, '-=0.4')
  .from('.hero__meta', { opacity: 0, y: 20, duration: 0.7, ease: 'power2.out' }, '-=0.5');

/* ============================================
   NAV STATE
   ============================================ */
const nav = document.getElementById('nav');

// Start as dark (hero is dark photo)
nav.classList.add('is-dark');

ScrollTrigger.create({
  trigger: '.marquee',
  start: 'top 80px',
  onEnter:    () => { nav.classList.remove('is-dark'); nav.classList.add('is-light'); },
  onLeaveBack:() => { nav.classList.remove('is-light'); nav.classList.add('is-dark'); },
});

// Back to dark on about section
ScrollTrigger.create({
  trigger: '.about',
  start: 'top 80px',
  onEnter:    () => { nav.classList.remove('is-light'); nav.classList.add('is-dark'); },
  onLeaveBack:() => { nav.classList.remove('is-dark'); nav.classList.add('is-light'); },
});
ScrollTrigger.create({
  trigger: '.services',
  start: 'top 80px',
  onEnter:    () => { nav.classList.remove('is-dark'); nav.classList.add('is-light'); },
  onLeaveBack:() => { nav.classList.remove('is-light'); nav.classList.add('is-dark'); },
});
ScrollTrigger.create({
  trigger: '.contact',
  start: 'top 80px',
  onEnter:    () => { nav.classList.remove('is-light'); nav.classList.add('is-dark'); },
  onLeaveBack:() => { nav.classList.remove('is-dark'); nav.classList.add('is-light'); },
});

/* ============================================
   MOBILE MENU
   ============================================ */
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

/* ============================================
   MARQUEE (infinite scroll)
   ============================================ */
const track = document.querySelector('.marquee__track');
const trackWidth = track.scrollWidth / 2;
gsap.to(track, {
  x: -trackWidth,
  duration: 30,
  ease: 'none',
  repeat: -1,
  modifiers: {
    x: gsap.utils.unitize(x => parseFloat(x) % trackWidth)
  }
});

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {

  // Hero parallax
  gsap.to('#heroImg', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  // Works header
  gsap.from('.works__header-left > *', {
    opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.works__header', start: 'top 82%' }
  });
  gsap.from('.works__note', {
    opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
    scrollTrigger: { trigger: '.works__header', start: 'top 80%' }
  });

  // Works items
  gsap.utils.toArray('.work').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
      delay: (i % 3) * 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  // About parallax background
  gsap.to('#aboutBg', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    }
  });

  // About content
  gsap.from('.about__left > *', {
    opacity: 0, x: -40, duration: 0.9, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.about__inner', start: 'top 78%' }
  });
  gsap.from('.about__right > *', {
    opacity: 0, x: 40, duration: 0.9, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.about__inner', start: 'top 78%' }
  });

  // Counter animation
  document.querySelectorAll('.stat__num').forEach(el => {
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.fromTo({ val: 0 }, { val: target }, {
          duration: 1.8, ease: 'power2.out',
          onUpdate: function() {
            el.textContent = Math.round(this.targets()[0].val);
          }
        });
      }
    });
  });

  // Services rows
  gsap.utils.toArray('.svc-row').forEach((row, i) => {
    gsap.from(row, {
      opacity: 0, x: -40, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: row, start: 'top 88%' }
    });
  });

  // Services header
  gsap.from('.services__header > *', {
    opacity: 0, y: 24, duration: 0.7, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '.services__header', start: 'top 82%' }
  });

  // Contact
  gsap.from('.contact__heading > span, .contact__heading > em', {
    opacity: 0, y: 40, duration: 0.9, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact__heading', start: 'top 82%' }
  });
  gsap.from('.contact-card', {
    opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact__cards', start: 'top 82%' }
  });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: target, offsetY: 62 },
        ease: 'power3.inOut'
      });
    }
  });
});
