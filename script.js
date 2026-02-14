// --- Mobile menu ---
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
  });
}

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// --- 3D mouse tilt on hero card ---
const heroTilt = document.getElementById('hero-tilt');
const heroContent = document.querySelector('.hero-content.card-3d');

if (heroTilt && heroContent) {
  const tiltStrength = 12;
  const smooth = 0.15;
  let currentX = 0, currentY = 0;
  let targetX = 0, targetY = 0;

  heroTilt.addEventListener('mousemove', (e) => {
    const rect = heroTilt.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = -y * tiltStrength;
    targetY = x * tiltStrength;
  });

  heroTilt.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function animateTilt() {
    currentX += (targetX - currentX) * smooth;
    currentY += (targetY - currentY) * smooth;
    heroContent.style.transform = `
      rotateX(${currentX}deg)
      rotateY(${currentY}deg)
      translateZ(0)
    `;
    requestAnimationFrame(animateTilt);
  }
  animateTilt();
}

// --- Scroll-in animation (Intersection Observer) ---
const observeTargets = document.querySelectorAll('.observe-in');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
);

observeTargets.forEach((el) => observer.observe(el));

// --- Book / resume page flip ---
const TOTAL_PAGES = 10;
const PAGES_PER_SPREAD = 2;
const book = document.getElementById('book');
const pageStack = document.getElementById('page-stack');
const bookPrev = document.getElementById('book-prev');
const bookNext = document.getElementById('book-next');
const bookPagination = document.getElementById('book-pagination');

if (book && pageStack && bookPrev && bookNext && bookPagination) {
  const leftBack = book.querySelector('.book-left .page-back-slot');
  const leftFlip = book.querySelector('.book-left .page-flip-slot');
  const rightFlip = book.querySelector('.book-right .page-flip-slot');
  const rightBack = book.querySelector('.book-right .page-back-slot');

  let currentSpread = 0;
  const maxSpread = Math.ceil(TOTAL_PAGES / PAGES_PER_SPREAD) - 1;

  function getPage(i) {
    return document.getElementById('page-' + i);
  }

  function assignSlots() {
    // Real book order: right page = first page of spread (odd in 1-based), left = second (even)
    const rightIdx = currentSpread * 2;       // page 1, 3, 5, 7, 9 (0-based: 0,2,4,6,8)
    const leftIdx = currentSpread * 2 + 1;  // page 2, 4, 6, 8, 10 (0-based: 1,3,5,7,9)
    const nextRightIdx = (currentSpread + 1) * 2;   // for flip next: new right page
    const prevLeftIdx = currentSpread > 0 ? (currentSpread - 1) * 2 + 1 : -1; // for flip prev: page behind left

    [leftBack, leftFlip, rightFlip, rightBack].forEach((slot) => {
      while (slot.firstChild) slot.removeChild(slot.firstChild);
    });

    if (prevLeftIdx >= 0) {
      const p = getPage(prevLeftIdx);
      if (p) leftBack.appendChild(p);
    }
    const leftPage = getPage(leftIdx);
    if (leftPage) leftFlip.appendChild(leftPage);
    const rightPage = getPage(rightIdx);
    if (rightPage) rightFlip.appendChild(rightPage);
    if (nextRightIdx < TOTAL_PAGES) {
      const p = getPage(nextRightIdx);
      if (p) rightBack.appendChild(p);
    }
  }

  function updateUI() {
    const start = currentSpread * 2 + 1;
    const end = Math.min(currentSpread * 2 + 2, TOTAL_PAGES);
    bookPagination.textContent = 'Pages ' + start + '–' + end + ' of ' + TOTAL_PAGES;
    bookPrev.disabled = currentSpread <= 0;
    bookNext.disabled = currentSpread >= maxSpread;
  }

  function flipNext() {
    if (currentSpread >= maxSpread || book.classList.contains('flip-next')) return;
    book.classList.remove('flip-prev');
    book.classList.add('flip-next');
    bookPrev.disabled = true;
    bookNext.disabled = true;
    setTimeout(() => {
      currentSpread++;
      book.classList.remove('flip-next'); // reset slot transform before putting new content in
      assignSlots();
      updateUI();
    }, 600);
  }

  function flipPrev() {
    if (currentSpread <= 0 || book.classList.contains('flip-prev')) return;
    book.classList.remove('flip-next');
    book.classList.add('flip-prev');
    bookPrev.disabled = true;
    bookNext.disabled = true;
    setTimeout(() => {
      currentSpread--;
      book.classList.remove('flip-prev'); // reset slot transform so new content isn’t inside rotated container
      assignSlots();
      updateUI();
    }, 600);
  }

  bookNext.addEventListener('click', flipNext);
  bookPrev.addEventListener('click', flipPrev);

  assignSlots();
  updateUI();
}
