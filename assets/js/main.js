(() => {
  const PAGE_PREFIX = 'page-';
  const NAV_PREFIX = 'nav-';
  const DEFAULT_PAGE = 'home';

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

    if (updateHash && window.location.hash !== `#${targetId}`) {
      history.replaceState(null, '', `#${targetId}`);
    }

    window.scrollTo({ top: 0, behavior: smoothScroll ? 'smooth' : 'auto' });
  };

  window.showPage = (id) => setActivePage(id);

  window.addEventListener('hashchange', () => setActivePage(getPageIdFromHash(), { updateHash: false }));

  window.addEventListener('DOMContentLoaded', () => {
    setActivePage(getPageIdFromHash(), { updateHash: false, smoothScroll: false });
  });
})();
