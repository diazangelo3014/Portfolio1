const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const year = document.querySelector('#year');
const certificateDialog = document.querySelector('.certificate-dialog');
const certificateDialogTitle = document.querySelector('#certificateDialogTitle');
const certificateDialogImage = document.querySelector('.dialog-certificate-image');
const certificateClose = document.querySelector('.dialog-close');
const contactDialog = document.querySelector('.contact-dialog');
const contactDialogClose = document.querySelector('.contact-dialog-close');
const helloButton = document.querySelector('.hello-trigger');

if (year) {
  year.textContent = String(new Date().getFullYear());
}

if (certificateDialog && certificateDialogTitle && certificateDialogImage && certificateClose) {
  const openImagePreview = (title, src, alt) => {
    if (!title || !src) return;

    certificateDialogTitle.textContent = title;
    certificateDialogImage.src = src;
    certificateDialogImage.alt = alt;
    certificateDialog.showModal();
  };

  document.querySelectorAll('.credential-preview').forEach((preview) => {
    preview.addEventListener('click', () => {
      const { certificateTitle, certificateSrc } = preview.dataset;
      openImagePreview(certificateTitle, certificateSrc, `${certificateTitle} certificate`);
    });
  });

  document.querySelectorAll('.social-image-button').forEach((preview) => {
    preview.addEventListener('click', () => {
      const { mediaTitle, mediaSrc } = preview.dataset;
      openImagePreview(mediaTitle, mediaSrc, `${mediaTitle} social media graphic`);
    });
  });

  certificateClose.addEventListener('click', () => certificateDialog.close());
  certificateDialog.addEventListener('click', (event) => {
    if (event.target === certificateDialog) certificateDialog.close();
  });
}

if (contactDialog && contactDialogClose) {
  const closeContactDialog = () => {
    contactDialog.close();
  };

  if (helloButton) {
    helloButton.addEventListener('click', (event) => {
      event.preventDefault();
      contactDialog.showModal();
    });
  }

  contactDialogClose.addEventListener('click', closeContactDialog);
  contactDialog.addEventListener('click', (event) => {
    if (event.target === contactDialog) closeContactDialog();
  });
}

const galleryFilters = document.querySelectorAll('.gallery-filter');
const socialCards = document.querySelectorAll('.social-card');
const galleryViewport = document.querySelector('#socialGalleryViewport');
const galleryTrack = document.querySelector('#socialGallery');
const galleryCount = document.querySelector('.gallery-count');
const galleryArrows = document.querySelectorAll('.gallery-arrow');
const galleryScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
let galleryStart = 0;
const marquee = document.querySelector('.marquee');
const marqueeToggle = document.querySelector('.marquee-toggle');

if (marquee && marqueeToggle) {
  let isPlaying = true;

  const updateMarqueeMotion = () => {
    marquee.classList.toggle('is-paused', !isPlaying);
    marqueeToggle.setAttribute('aria-pressed', String(!isPlaying));
    marqueeToggle.setAttribute('aria-label', isPlaying ? 'Pause ticker animation' : 'Play ticker animation');
    marqueeToggle.title = isPlaying ? 'Pause ticker animation' : 'Play ticker animation';
    marqueeToggle.querySelector('span').textContent = isPlaying ? 'Ⅱ' : '▶';
  };

  marqueeToggle.addEventListener('click', () => {
    isPlaying = !isPlaying;
    updateMarqueeMotion();
  });

  updateMarqueeMotion();
}

document.querySelectorAll('.social-video-card').forEach((card) => {
  const video = card.querySelector('video');
  const playButton = card.querySelector('.video-poster');
  const playLabel = card.querySelector('.video-poster-label');

  if (!video || !playButton || !playLabel) return;

  const showPlaybackError = () => {
    playLabel.textContent = 'VIDEO UNAVAILABLE';
    playButton.disabled = true;
  };

  playButton.addEventListener('click', () => {
    video.play().catch(showPlaybackError);
  });

  video.addEventListener('playing', () => {
    playButton.hidden = true;
  });

  video.addEventListener('error', showPlaybackError);
});

galleryFilters.forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    const selectedFilter = filterButton.dataset.filter;
    if (!selectedFilter) return;

    galleryFilters.forEach((button) => {
      const isSelected = button === filterButton;
      button.classList.toggle('is-active', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });

    socialCards.forEach((card) => {
      const shouldShow = selectedFilter === 'all' || card.dataset.mediaKind === selectedFilter;
      card.hidden = !shouldShow;

      if (!shouldShow) {
        const video = card.querySelector('video');
        if (video) video.pause();
      }
    });

    galleryStart = 0;
    if (galleryViewport) galleryViewport.scrollTo({ left: 0, behavior: 'instant' });
    updateGalleryControls();
  });
});

const updateGalleryControls = () => {
  if (!galleryViewport || !galleryTrack || !galleryCount) return;

  const visibleCards = [...socialCards].filter((card) => !card.hidden);
  const firstCard = visibleCards[0];
  const cardWidth = firstCard?.getBoundingClientRect().width ?? 0;
  const gap = Number.parseFloat(getComputedStyle(galleryTrack).columnGap) || 0;
  const cardsPerPage = Math.max(1, Math.round((galleryViewport.clientWidth + gap) / (cardWidth + gap)));
  const maxStart = Math.max(0, visibleCards.length - cardsPerPage);
  const step = cardWidth + gap;
  galleryStart = Math.min(galleryStart, maxStart);
  const currentStart = galleryStart;
  const currentEnd = Math.min(visibleCards.length, currentStart + cardsPerPage);

  galleryCount.textContent = visibleCards.length === 0
    ? '00 / 00'
    : `${String(currentStart + 1).padStart(2, '0')}–${String(currentEnd).padStart(2, '0')} / ${String(visibleCards.length).padStart(2, '0')}`;

  galleryArrows.forEach((arrow) => {
    const direction = Number(arrow.dataset.galleryDirection);
    arrow.disabled = direction < 0 ? currentStart === 0 : currentStart >= maxStart;
  });
};

galleryArrows.forEach((arrow) => {
  arrow.addEventListener('click', () => {
    if (!galleryViewport || !galleryTrack) return;

    const visibleCards = [...socialCards].filter((card) => !card.hidden);
    const firstCard = visibleCards[0];
    if (!firstCard) return;

    const gap = Number.parseFloat(getComputedStyle(galleryTrack).columnGap) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const cardsPerPage = Math.max(1, Math.round((galleryViewport.clientWidth + gap) / (cardWidth + gap)));
    const maxStart = Math.max(0, visibleCards.length - cardsPerPage);
    const direction = Number(arrow.dataset.galleryDirection);
    const nextStart = Math.max(0, Math.min(maxStart, galleryStart + direction * cardsPerPage));
    const targetCard = visibleCards[nextStart];

    if (targetCard) {
      galleryStart = nextStart;
      updateGalleryControls();
      galleryViewport.scrollTo({ left: targetCard.offsetLeft, behavior: galleryScrollBehavior });
    }
  });
});

if (galleryViewport) {
  galleryViewport.addEventListener('scroll', () => {
    const firstCard = [...socialCards].find((card) => !card.hidden);
    const gap = Number.parseFloat(getComputedStyle(galleryTrack).columnGap) || 0;
    const step = (firstCard?.getBoundingClientRect().width ?? 0) + gap;
    if (step > 0) galleryStart = Math.round(galleryViewport.scrollLeft / step);
    updateGalleryControls();

    const bounds = galleryViewport.getBoundingClientRect();
    galleryViewport.querySelectorAll('video').forEach((video) => {
      const videoBounds = video.getBoundingClientRect();
      if (videoBounds.right <= bounds.left || videoBounds.left >= bounds.right) video.pause();
    });
  }, { passive: true });

  window.addEventListener('resize', updateGalleryControls);
  updateGalleryControls();
}

if (menuToggle && siteNav) {
  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    siteNav.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  };

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 620) setMenuOpen(false);
  });
}

const revealItems = document.querySelectorAll('.reveal');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));
}
