(() => {
  const PAGE_PREFIX = 'page-';
  const NAV_PREFIX = 'nav-';
  const DEFAULT_PAGE = 'home';

  const GALLERY_MANIFEST_PATH = 'assets/images/gallery/gallery-manifest.json';
  const GALLERY_PAGE_ID = 'gallery';
  const GALLERY_REFRESH_MS = 5000;
  let galleryRefreshTimer = null;

  const renderGallery = async () => {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    try {
      const response = await fetch(GALLERY_MANIFEST_PATH, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Gallery manifest request failed with ${response.status}`);

      const manifestItems = await response.json();
      const userItems = window.COLGalleryUpload?.readUploads?.() || [];
      const items = [...userItems, ...manifestItems];
      if (!Array.isArray(items) || items.length === 0) {
        grid.innerHTML = '<p>No gallery images yet. Add files to <code>assets/images/gallery</code> and regenerate the manifest.</p>';
        return;
      }

      grid.innerHTML = items
        .map((item) => {
          const src = String(item.src || '').trim();
          if (!src) return '';
          const alt = String(item.alt || 'Gallery image');
          return `
            <figure class="gallery-card">
              <img src="${src}" alt="${alt}" loading="lazy" />
            </figure>
          `;
        })
        .join('');
    } catch (error) {
      console.error('Unable to load gallery manifest:', error);
      grid.innerHTML = '<p>Unable to load gallery right now. Please try again later.</p>';
    }
  };

  const setupGalleryUpload = () => {
    window.COLGalleryUpload?.bindUploadForm?.({
      onSuccess: () => renderGallery(),
    });
  };

  const getPageIdFromHash = () => {
    const value = window.location.hash.replace('#', '').trim().toLowerCase();
    return value || DEFAULT_PAGE;
  };

  const pageExists = (id) => Boolean(document.getElementById(`${PAGE_PREFIX}${id}`));

  const setActivePage = (id, { updateHash = true, smoothScroll = true } = {}) => {
    const targetId = pageExists(id) ? id : DEFAULT_PAGE;

    document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach((link) => link.classList.remove('active'));

    document.getElementById(`${PAGE_PREFIX}${targetId}`)?.classList.add('active');
    document.getElementById(`${NAV_PREFIX}${targetId}`)?.classList.add('active');

    if (targetId === GALLERY_PAGE_ID) {
      renderGallery();
      if (!galleryRefreshTimer) {
        galleryRefreshTimer = window.setInterval(renderGallery, GALLERY_REFRESH_MS);
      }
    } else if (galleryRefreshTimer) {
      window.clearInterval(galleryRefreshTimer);
      galleryRefreshTimer = null;
    }

    if (updateHash && window.location.hash !== `#${targetId}`) {
      history.replaceState(null, '', `#${targetId}`);
    }

    window.scrollTo({ top: 0, behavior: smoothScroll ? 'smooth' : 'auto' });
  };

  window.showPage = (id) => setActivePage(id);

  window.addEventListener('hashchange', () => setActivePage(getPageIdFromHash(), { updateHash: false }));

  window.addEventListener('DOMContentLoaded', () => {
    setActivePage(getPageIdFromHash(), { updateHash: false, smoothScroll: false });
    setupGalleryUpload();
    renderGallery();
  });
})();
