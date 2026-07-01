/* ── gallery.js ──────────────────────────────────────────
   Fetch dari Supabase → filter folder → masonry grid
──────────────────────────────────────────────────────── */

const ANIM_STAGGER = 40;

let _folders    = [];
let _photos     = [];
let _currentCat = 'ALL';
let _lightboxImgs = [];
let _lightboxIdx  = 0;

/* ── DOM refs ── */
const nav              = document.getElementById('nav');
const filterButtons    = document.getElementById('filterButtons');
const masonryGrid      = document.getElementById('masonryGrid');
const galleryLoading   = document.getElementById('galleryLoading');
const galleryError     = document.getElementById('galleryError');
const galleryErrorMsg  = document.getElementById('galleryErrorMsg');
const galleryEmpty     = document.getElementById('galleryEmpty');
const galleryMeta      = document.getElementById('galleryMeta');
const gallerySectionTitle = document.querySelector('.gallery-section-title');

/* ── NAV scroll ── */
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (!scrollTick) {
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
      scrollTick = false;
    });
    scrollTick = true;
  }
}, { passive: true });

/* ── Scroll indicator fade ── */
const scrollInd = document.querySelector('.scroll-indicator');
if (scrollInd) {
  scrollInd.style.transition = 'opacity 0.5s';
  let fadeDone = false;
  window.addEventListener('scroll', () => {
    if (!fadeDone && window.scrollY > 80) {
      scrollInd.style.opacity = '0';
      fadeDone = true;
    }
  }, { passive: true });
}

/* ── State helpers ── */
function showLoading() {
  galleryLoading.style.display = 'flex';
  galleryError.style.display   = 'none';
  masonryGrid.style.display    = 'none';
  galleryEmpty.style.display   = 'none';
}

function showError(msg) {
  galleryLoading.style.display = 'none';
  galleryError.style.display   = 'flex';
  masonryGrid.style.display    = 'none';
  galleryEmpty.style.display   = 'none';
  if (msg) galleryErrorMsg.innerHTML = msg;
}

/* ── Fetch folders → build filters ── */
async function initGallery() {
  showLoading();
  try {
    _folders = await sbGet('gallery_folders', 'order=sort_order.asc');
    buildFilters();
    await loadPhotos('ALL');
  } catch (e) {
    console.error('[gallery] init error:', e);
    showError('Gagal memuat gallery: <code>' + e.message + '</code>');
    galleryMeta.textContent = '— connection error';
  }
}

/* ── Build filter buttons ── */
function buildFilters() {
  filterButtons.innerHTML = '';

  // Hitung per folder (akan diupdate setelah semua foto di-load)
  const allBtn = _makeFilterBtn('ALL', 0, true);
  filterButtons.appendChild(allBtn);

  _folders.forEach(f => {
    const btn = _makeFilterBtn(f.name, 0, false, f.id);
    filterButtons.appendChild(btn);
  });
}

function _makeFilterBtn(label, count, active, folderId) {
  const btn = document.createElement('button');
  btn.className   = 'filter-btn' + (active ? ' active' : '');
  btn.dataset.cat = label;
  if (folderId) btn.dataset.folderId = folderId;
  btn.innerHTML   = label + '<span class="filter-count" id="fc-' + label.replace(/\s/g,'-') + '">' + count + '</span>';
  btn.addEventListener('click', () => filterGallery(label, folderId));
  return btn;
}

function _updateCount(label, count) {
  const el = document.getElementById('fc-' + label.replace(/\s/g,'-'));
  if (el) el.textContent = count;
}

/* ── Load photos ── */
async function loadPhotos(cat, folderId) {
  showLoading();
  try {
    if (cat === 'ALL') {
      _photos = await sbGet('gallery_photos', 'order=sort_order.asc');
      // Update count ALL
      _updateCount('ALL', _photos.length);
      // Update per-folder counts
      _folders.forEach(f => {
        const c = _photos.filter(p => p.folder_id === f.id).length;
        _updateCount(f.name, c);
      });
    } else {
      _photos = await sbGet('gallery_photos', 'folder_id=eq.' + folderId + '&order=sort_order.asc');
      _updateCount(cat, _photos.length);
    }
    renderGrid();
  } catch (e) {
    console.error('[gallery] loadPhotos error:', e);
    showError('Gagal memuat foto: <code>' + e.message + '</code>');
  }
}

/* ── Filter ── */
function filterGallery(cat, folderId) {
  if (_currentCat === cat) return;
  _currentCat = cat;

  // Update active state
  filterButtons.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === cat));

  // Update section title
  if (gallerySectionTitle) {
    gallerySectionTitle.innerHTML = cat === 'ALL'
      ? 'All <em>Moments</em>'
      : cat + ' <em>Gallery</em>';
  }

  // Transition out → load → in
  masonryGrid.classList.add('transitioning');
  setTimeout(async () => {
    await loadPhotos(cat, folderId);
    masonryGrid.classList.remove('transitioning');
    // Scroll ke gallery kalau sudah di bawah
    const galleryEl = document.getElementById('gallery');
    if (galleryEl && window.scrollY > galleryEl.offsetTop - 200) {
      galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 280);
}

/* ── Render masonry ── */
function renderGrid() {
  galleryLoading.style.display = 'none';
  galleryError.style.display   = 'none';
  galleryEmpty.style.display   = 'none';

  // Update meta
  const folderCount = _folders.length;
  galleryMeta.innerHTML =
    '<span>' + _photos.length + '</span> Photos &nbsp;·&nbsp; <span>' + folderCount + '</span> Categories';

  if (!_photos.length) {
    masonryGrid.style.display = 'none';
    galleryEmpty.style.display = 'flex';
    return;
  }

  masonryGrid.innerHTML = '';
  masonryGrid.style.display = 'block';
  _lightboxImgs = _photos;

  const fragment = document.createDocumentFragment();

  _photos.forEach((photo, i) => {
    // Cari nama folder
    const folder = _folders.find(f => f.id === photo.folder_id);
    const catName = folder ? folder.name : '';

    const item = document.createElement('div');
    item.className   = 'gallery-item';
    item.dataset.idx = i;
    item.setAttribute('role', 'listitem');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', (photo.name || catName) + ', ' + catName);

    const imgEl = document.createElement('img');
    imgEl.alt      = photo.name || catName + ' photo';
    imgEl.loading  = 'lazy';
    imgEl.decoding = 'async';
    imgEl.dataset.src = photo.url;
    imgEl.src = '';
    imgEl.style.minHeight = '120px';
    imgEl.style.background = 'rgba(79,195,247,0.03)';

    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    info.innerHTML =
      '<div class="gallery-item-category">' + catName + '</div>' +
      '<div class="gallery-item-name">' + (photo.name || '') + '</div>';

    const expand = document.createElement('div');
    expand.className = 'gallery-item-expand';
    expand.setAttribute('aria-hidden', 'true');
    expand.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

    item.appendChild(imgEl);
    item.appendChild(info);
    item.appendChild(expand);

    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });

    fragment.appendChild(item);
  });

  masonryGrid.appendChild(fragment);

  // IntersectionObserver lazy load + stagger reveal
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const img = el.querySelector('img');
      if (img && img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      const idx = parseInt(el.dataset.idx);
      setTimeout(() => el.classList.add('visible'), Math.min(idx % 12, 11) * ANIM_STAGGER);
      observer.unobserve(el);
    });
  }, { rootMargin: '200px 0px', threshold: 0.01 });

  masonryGrid.querySelectorAll('.gallery-item').forEach(el => observer.observe(el));
}

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href   = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Init ── */
document.addEventListener('DOMContentLoaded', initGallery);
