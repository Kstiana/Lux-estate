(function () {
  function getDrawer() {
    return document.getElementById('favorites-drawer');
  }

  function getBackdrop() {
    return document.getElementById('favorites-drawer-backdrop');
  }

  function openDrawer() {
    const drawer = getDrawer();
    const backdrop = getBackdrop();
    if (!drawer || !backdrop) {
      return;
    }
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderDrawer();
  }

  function closeDrawer() {
    const drawer = getDrawer();
    const backdrop = getBackdrop();
    if (!drawer || !backdrop) {
      return;
    }
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function updateBadge() {
    const badge = document.getElementById('favorites-count-badge');
    if (!badge || typeof LuxFavorites === 'undefined') {
      return;
    }
    const count = LuxFavorites.getFavorites ? getFavoriteCount() : 0;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  function getFavoriteCount() {
    try {
      const raw = localStorage.getItem('luxestate_favorites');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch (err) {
      return 0;
    }
  }

  function renderDrawer() {
    const body = document.getElementById('favorites-drawer-body');
    if (!body) {
      return;
    }

    const favoriteIds = getFavoriteIds();

    if (!favoriteIds.length) {
      body.innerHTML =
        '<div class="favorites-drawer-empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.7-10-9.3C.4 7.4 2.2 4 5.7 4c2 0 3.4 1 4.3 2.4C10.9 5 12.3 4 14.3 4c3.5 0 5.3 3.4 3.7 6.7C19.5 15.3 12 20 12 20Z"/></svg>' +
          '<p>No favorites yet. Tap the heart on any property to save it here.</p>' +
        '</div>';
      return;
    }

    if (typeof LuxRender === 'undefined') {
      return;
    }

    LuxRender.loadProperties().then(function (properties) {
      const items = favoriteIds
        .map(function (id) { return properties.find(function (p) { return p.id === id; }); })
        .filter(Boolean);

      if (!items.length) {
        body.innerHTML = '<div class="favorites-drawer-empty"><p>No favorites yet.</p></div>';
        return;
      }

      body.innerHTML = items.map(function (property) {
        return (
          '<div class="favorites-drawer-item">' +
            '<a href="property-details.html?id=' + property.id + '" style="flex-shrink:0">' +
              '<img src="' + property.images[0] + '" alt="' + LuxRender.escapeHTML(property.title) + '">' +
            '</a>' +
            '<div class="favorites-drawer-item-info">' +
              '<a href="property-details.html?id=' + property.id + '" class="favorites-drawer-item-title">' + LuxRender.escapeHTML(property.title) + '</a>' +
              '<div class="favorites-drawer-item-price">' + LuxRender.formatPrice(property.price, property.status) + '</div>' +
            '</div>' +
            '<button type="button" class="favorites-drawer-item-remove" data-remove-favorite="' + property.id + '" aria-label="Remove from favorites">' +
              '<i class="fa-solid fa-xmark"></i>' +
            '</button>' +
          '</div>'
        );
      }).join('');

      body.querySelectorAll('[data-remove-favorite]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = btn.getAttribute('data-remove-favorite');
          if (typeof LuxFavorites !== 'undefined') {
            LuxFavorites.toggleFavorite(id);
          }
          document.querySelectorAll('.favorite-btn[data-favorite-id="' + id + '"]').forEach(function (heartBtn) {
            heartBtn.classList.remove('is-active');
            heartBtn.setAttribute('aria-pressed', 'false');
          });
          renderDrawer();
          updateBadge();
        });
      });
    });
  }

  function getFavoriteIds() {
    try {
      const raw = localStorage.getItem('luxestate_favorites');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const openBtn = document.getElementById('favorites-drawer-btn');
    const closeBtn = document.getElementById('favorites-drawer-close');
    const backdrop = getBackdrop();

    if (openBtn) {
      openBtn.addEventListener('click', openDrawer);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDrawer);
    }
    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    document.addEventListener('keydown', function (event) {
      const drawer = getDrawer();
      if (event.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    document.body.addEventListener('click', function (event) {
      if (event.target.closest('.favorite-btn')) {
        updateBadge();
        const drawer = getDrawer();
        if (drawer && drawer.classList.contains('is-open')) {
          renderDrawer();
        }
      }
    });

    updateBadge();
  });
})();
