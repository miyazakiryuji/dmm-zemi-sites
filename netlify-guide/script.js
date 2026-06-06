/* =========================================================
   Netlify Start Guide - Interactions
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 読み進めゲージ + Back to top + Nav scroll ---------- */
  const progressBar = document.getElementById('readingProgress');
  const topNav = document.getElementById('topNav');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const percent = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
    progressBar.style.width = percent + '%';

    if (scrolled > 50) topNav.classList.add('scrolled');
    else topNav.classList.remove('scrolled');

    if (scrolled > 600) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- スムーズスクロール ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- Reveal アニメーション ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- TOC アクティブハイライト + アクティブステップ ---------- */
  const chapters = document.querySelectorAll('.chapter');
  const tocLinks = document.querySelectorAll('.toc-link');
  const navLinks = document.querySelectorAll('.nav-link');

  const chapterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { threshold: 0.15, rootMargin: '-30% 0px -50% 0px' });

  chapters.forEach(ch => chapterObserver.observe(ch));

  const steps = document.querySelectorAll('.step');
  const stepObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-active', entry.isIntersecting);
    });
  }, { threshold: 0.3, rootMargin: '-20% 0px -40% 0px' });

  steps.forEach(s => stepObserver.observe(s));

  /* ---------- カウントアップ ---------- */
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (Number.isNaN(target) || el.dataset.counted === 'true') return;
      el.dataset.counted = 'true';
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const images = Array.from(document.querySelectorAll('.step-image'));
  let currentIndex = 0;

  function openLightbox(index) {
    if (index < 0 || index >= images.length) return;
    currentIndex = index;
    const img = images[index];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = img.dataset.caption || img.alt || '';
    lightboxCounter.textContent = `${index + 1} / ${images.length}`;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function showPrev() {
    openLightbox((currentIndex - 1 + images.length) % images.length);
  }

  function showNext() {
    openLightbox((currentIndex + 1) % images.length);
  }

  images.forEach((img, i) => {
    img.addEventListener('click', () => openLightbox(i));
    img.style.cursor = 'zoom-in';
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showPrev();
    else if (e.key === 'ArrowRight') showNext();
  });

  /* ---------- スワイプ対応 (Lightbox) ---------- */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) showPrev();
    else showNext();
  }, { passive: true });

  /* ---------- メニュートグル (モバイル) ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      if (isOpen) {
        navLinksContainer.style.display = 'flex';
        navLinksContainer.style.position = 'absolute';
        navLinksContainer.style.top = '100%';
        navLinksContainer.style.left = '0';
        navLinksContainer.style.right = '0';
        navLinksContainer.style.background = 'rgba(10, 20, 25, 0.98)';
        navLinksContainer.style.flexDirection = 'column';
        navLinksContainer.style.padding = '16px';
        navLinksContainer.style.borderBottom = '1px solid var(--border)';
      } else {
        navLinksContainer.style.display = '';
      }
    });

    navLinksContainer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        navLinksContainer.style.display = '';
      });
    });
  }

  /* ---------- パララックス効果 (Hero) ---------- */
  const floatCards = document.querySelectorAll('.float-card');
  if (floatCards.length && window.matchMedia('(min-width: 1100px)').matches) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      floatCards.forEach((card, i) => {
        const depth = (i + 1) * 8;
        card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });
  }

  /* ---------- 画像のロード完了でフェード ---------- */
  document.querySelectorAll('.step-image').forEach(img => {
    if (img.complete) return;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
    img.addEventListener('load', () => {
      img.style.opacity = '1';
    });
  });

})();
