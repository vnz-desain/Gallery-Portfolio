/* ── lightbox.js ─────────────────────────────────────────
   Lightbox: open, close, navigate, swipe, keyboard
──────────────────────────────────────────────────────── */

const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxCaption= document.getElementById('lightboxCaption');
const lightboxCounter= document.getElementById('lightboxCounter');
const lightboxClose  = document.getElementById('lightboxClose');
const lightboxPrev   = document.getElementById('lightboxPrev');
const lightboxNext   = document.getElementById('lightboxNext');

function openLightbox(idx) {
  _lightboxIdx = idx;
  _updateLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 350);
}

function _updateLightbox() {
  const photo = _lightboxImgs[_lightboxIdx];
  if (!photo) return;
  const folder = _folders.find(f => f.id === photo.folder_id);
  lightboxImg.src      = photo.url;
  lightboxImg.alt      = photo.name || (folder ? folder.name : '') + ' photo';
  lightboxCaption.textContent = photo.name || (folder ? folder.name : '');
  lightboxCounter.textContent = (_lightboxIdx + 1) + ' / ' + _lightboxImgs.length;
}

function _navigate(dir) {
  const len = _lightboxImgs.length;
  _lightboxIdx = (_lightboxIdx + dir + len) % len;
  lightboxImg.style.opacity   = '0';
  lightboxImg.style.transform = 'scale(0.96)';
  setTimeout(() => {
    _updateLightbox();
    lightboxImg.style.opacity   = '';
    lightboxImg.style.transform = '';
  }, 180);
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => _navigate(-1));
lightboxNext.addEventListener('click', () => _navigate(1));

lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   _navigate(-1);
  if (e.key === 'ArrowRight')  _navigate(1);
});

/* Touch swipe */
let _touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  _touchStartX = e.touches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = _touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) _navigate(diff > 0 ? 1 : -1);
}, { passive: true });
