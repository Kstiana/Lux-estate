const LuxFavorites = (function () {
  const FAV_KEY = 'luxestate_favorites';
  const COMPARE_KEY = 'luxestate_compare';
  const RECENT_KEY = 'luxestate_recently_viewed';
  const COMPARE_MAX = 3;
  const RECENT_MAX = 8;

  let compareBarEl = null;
  let modalEl = null;
  let lastFocusedBeforeModal = null;

  function readList(key) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeList(key, list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
      return;
    }
  }

  // ---------------- Favorites ----------------

  function getFavorites() {
    return readList(FAV_KEY);
  }

  function isFavorite(id) {
    return getFavorites().indexOf(id) !== -1;
  }

  function toggleFavorite(id) {
    const list = getFavorites();
    const index = list.indexOf(id);
    let isNowFavorite;

    if (index === -1) {
      list.push(id);
      isNowFavorite = true;
    } else {
      list.splice(index, 1);
      isNowFavorite = false;
    }

    writeList(FAV_KEY, list);
    return isNowFavorite;
  }

  function bindFavoriteButtons(root) {
    root.addEventListener('click', function (event) {
      const btn = event.target.closest('.favorite-btn');
      if (!btn) {
        return;
      }

      const id = btn.getAttribute('data-favorite-id');
      if (!id) {
        return;
      }

      const isNowFavorite = toggleFavorite(id);
      btn.classList.toggle('is-active', isNowFavorite);
      btn.setAttribute('aria-pressed', isNowFavorite ? 'true' : 'false');

      btn.classList.add('is-animating');
      window.setTimeout(function () {
        btn.classList.remove('is-animating');
      }, 450);

      if (typeof LuxToast !== 'undefined') {
        LuxToast.success(isNowFavorite ? 'Added to favorites.' : 'Removed from favorites.');
      }
    });
  }

  // ---------------- Compare ----------------

  function getCompareList() {
    return readList(COMPARE_KEY);
  }

  function isComparing(id) {
    return getCompareList().indexOf(id) !== -1;
  }

  function toggleCompare(id) {
    const list = getCompareList();
    const index = list.indexOf(id);

    if (index === -1) {
      if (list.length >= COMPARE_MAX) {
        return { added: false, limitReached: true };
      }
      list.push(id);
      writeList(COMPARE_KEY, list);
      renderCompareBar();
      return { added: true };
    }

    list.splice(index, 1);
    writeList(COMPARE_KEY, list);
    renderCompareBar();
    return { added: false };
  }

  function removeFromCompare(id) {
    const list = getCompareList().filter(function (existingId) {
      return existingId !== id;
    });
    writeList(COMPARE_KEY, list);
    renderCompareBar();
    syncCompareCheckboxes();
  }

  function clearCompare() {
    writeList(COMPARE_KEY, []);
    renderCompareBar();
    syncCompareCheckboxes();
  }

  function syncCompareCheckboxes() {
    const compareIds = getCompareList();
    document.querySelectorAll('.compare-checkbox').forEach(function (checkbox) {
      const id = checkbox.getAttribute('data-compare-id');
      checkbox.checked = compareIds.indexOf(id) !== -1;
    });
  }

  function bindCompareCheckboxes(root) {
    root.addEventListener('change', function (event) {
      const checkbox = event.target.closest('.compare-checkbox');
      if (!checkbox) {
        return;
      }

      const id = checkbox.getAttribute('data-compare-id');
      if (!id) {
        return;
      }

      const result = toggleCompare(id);

      if (result.limitReached) {
        checkbox.checked = false;
        if (typeof LuxToast !== 'undefined') {
          LuxToast.error('You can compare up to ' + COMPARE_MAX + ' properties at a time.');
        }
      }
    });
  }

  function getCompareBar() {
    if (compareBarEl) {
      return compareBarEl;
    }
    compareBarEl = document.createElement('div');
    compareBarEl.className = 'compare-bar';
    compareBarEl.setAttribute('role', 'region');
    compareBarEl.setAttribute('aria-label', 'Property comparison');
    document.body.appendChild(compareBarEl);
    return compareBarEl;
  }

  function renderCompareBar() {
    const compareIds = getCompareList();
    const bar = getCompareBar();

    if (!compareIds.length) {
      bar.classList.remove('is-visible');
      bar.innerHTML = '';
      return;
    }

    if (typeof LuxRender === 'undefined') {
      return;
    }

    LuxRender.loadProperties().then(function (properties) {
      const items = compareIds
        .map(function (id) {
          return properties.find(function (p) { return p.id === id; });
        })
        .filter(Boolean);

      if (!items.length) {
        bar.classList.remove('is-visible');
        bar.innerHTML = '';
        return;
      }

      const thumbs = items.map(function (property) {
        return (
          '<div class="compare-thumb" title="' + LuxRender.escapeHTML(property.title) + '">' +
            '<img src="' + property.images[0] + '" alt="' + LuxRender.escapeHTML(property.title) + '">' +
            '<button type="button" class="compare-thumb-remove" data-remove-compare="' + property.id + '" aria-label="Remove ' + LuxRender.escapeHTML(property.title) + ' from comparison">' +
              '<i class="fa-solid fa-xmark"></i>' +
            '</button>' +
          '</div>'
        );
      }).join('');

      bar.innerHTML =
        '<div class="compare-bar-info">' +
          '<div class="compare-thumbs">' + thumbs + '</div>' +
          '<span class="compare-count">' + items.length + ' of ' + COMPARE_MAX + ' selected</span>' +
        '</div>' +
        '<div class="compare-bar-actions">' +
          '<button type="button" class="btn btn-secondary btn-sm" id="compare-clear-btn">Clear</button>' +
          '<button type="button" class="btn btn-primary btn-sm" id="compare-view-btn"' + (items.length < 2 ? ' disabled' : '') + '>Compare Now</button>' +
        '</div>';

      bar.classList.add('is-visible');

      bar.querySelectorAll('[data-remove-compare]').forEach(function (removeBtn) {
        removeBtn.addEventListener('click', function () {
          removeFromCompare(removeBtn.getAttribute('data-remove-compare'));
        });
      });

      const clearBtn = bar.querySelector('#compare-clear-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', clearCompare);
      }

      const viewBtn = bar.querySelector('#compare-view-btn');
      if (viewBtn && !viewBtn.disabled) {
        viewBtn.addEventListener('click', function () {
          openCompareModal(items);
        });
      }
    });
  }

  // ---------------- Compare modal ----------------

  function getCompareModal() {
    if (modalEl) {
      return modalEl;
    }

    modalEl = document.createElement('div');
    modalEl.className = 'compare-modal';
    modalEl.innerHTML =
      '<div class="compare-modal-backdrop"></div>' +
      '<div class="compare-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-modal-title">' +
        '<div class="compare-modal-header">' +
          '<h2 id="compare-modal-title">Compare Properties</h2>' +
          '<button type="button" class="btn-icon compare-modal-close" aria-label="Close comparison">' +
            '<i class="fa-solid fa-xmark"></i>' +
          '</button>' +
        '</div>' +
        '<div class="compare-modal-body" id="compare-modal-body"></div>' +
      '</div>';

    document.body.appendChild(modalEl);

    modalEl.querySelector('.compare-modal-backdrop').addEventListener('click', closeCompareModal);
    modalEl.querySelector('.compare-modal-close').addEventListener('click', closeCompareModal);

    document.addEventListener('keydown', function (event) {
      if (!modalEl.classList.contains('is-open')) {
        return;
      }

      if (event.key === 'Escape') {
        closeCompareModal();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = modalEl.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    return modalEl;
  }

  function closeCompareModal() {
    if (!modalEl) {
      return;
    }
    modalEl.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocusedBeforeModal) {
      lastFocusedBeforeModal.focus();
      lastFocusedBeforeModal = null;
    }
  }

  function openCompareModal(items) {
    const modal = getCompareModal();
    const body = modal.querySelector('#compare-modal-body');

    const rows = [
      { label: 'Photo', render: function (p) { return '<img src="' + p.images[0] + '" alt="' + LuxRender.escapeHTML(p.title) + '" class="compare-table-photo">'; } },
      { label: 'Title', render: function (p) { return LuxRender.escapeHTML(p.title); } },
      { label: 'Price', render: function (p) { return LuxRender.formatPrice(p.price, p.status); } },
      { label: 'Status', render: function (p) { return LuxRender.escapeHTML(p.status); } },
      { label: 'Type', render: function (p) { return LuxRender.escapeHTML(p.type); } },
      { label: 'Location', render: function (p) { return LuxRender.escapeHTML(p.location); } },
      { label: 'Bedrooms', render: function (p) { return p.beds || '\u2014'; } },
      { label: 'Bathrooms', render: function (p) { return p.baths || '\u2014'; } },
      { label: 'Parking', render: function (p) { return p.garage || '\u2014'; } },
      { label: 'Area', render: function (p) { return LuxRender.formatArea(p.area); } },
      { label: 'Furnished', render: function (p) { return p.furnished ? 'Yes' : 'No'; } },
      { label: 'Swimming Pool', render: function (p) { return p.pool ? 'Yes' : 'No'; } },
      { label: 'Garden', render: function (p) { return p.garden ? 'Yes' : 'No'; } },
      { label: 'Pet Friendly', render: function (p) { return p.petFriendly ? 'Yes' : 'No'; } },
      { label: '', render: function (p) { return '<a href="property-details.html?id=' + p.id + '" class="btn btn-secondary btn-sm">View Details</a>'; } }
    ];

    let markup = '<div class="compare-table-wrap"><table class="compare-table">' +
      '<caption class="sr-only">Side by side comparison of selected properties</caption><tbody>';

    rows.forEach(function (row) {
      markup += '<tr><th scope="row">' + row.label + '</th>';
      items.forEach(function (property) {
        markup += '<td>' + row.render(property) + '</td>';
      });
      markup += '</tr>';
    });

    markup += '</tbody></table></div>';

    body.innerHTML = markup;
    lastFocusedBeforeModal = document.activeElement;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.compare-modal-close');
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  // ---------------- Recently viewed ----------------

  function getRecentlyViewed() {
    return readList(RECENT_KEY);
  }

  function addRecentlyViewed(id) {
    let list = getRecentlyViewed().filter(function (existingId) {
      return existingId !== id;
    });
    list.unshift(id);
    if (list.length > RECENT_MAX) {
      list = list.slice(0, RECENT_MAX);
    }
    writeList(RECENT_KEY, list);
  }

  function renderRecentlyViewedInto(container, options) {
    if (!container || typeof LuxRender === 'undefined') {
      return;
    }

    const settings = options || {};
    const excludeId = settings.excludeId || null;
    const limit = settings.limit || 4;
    const sectionEl = settings.sectionEl || null;

    const ids = getRecentlyViewed()
      .filter(function (id) { return id !== excludeId; })
      .slice(0, limit);

    if (!ids.length) {
      if (sectionEl) {
        sectionEl.style.display = 'none';
      }
      container.innerHTML = '';
      return;
    }

    LuxRender.loadProperties().then(function (properties) {
      const items = ids
        .map(function (id) {
          return properties.find(function (p) { return p.id === id; });
        })
        .filter(Boolean);

      if (!items.length) {
        if (sectionEl) {
          sectionEl.style.display = 'none';
        }
        return;
      }

      if (sectionEl) {
        sectionEl.style.display = '';
      }
      LuxRender.renderProperties(container, items);
    });
  }

  function init() {
    bindFavoriteButtons(document.body);
    bindCompareCheckboxes(document.body);
    renderCompareBar();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    getCompareList: getCompareList,
    isComparing: isComparing,
    toggleCompare: toggleCompare,
    clearCompare: clearCompare,
    syncCompareCheckboxes: syncCompareCheckboxes,
    getRecentlyViewed: getRecentlyViewed,
    addRecentlyViewed: addRecentlyViewed,
    renderRecentlyViewedInto: renderRecentlyViewedInto,
    COMPARE_MAX: COMPARE_MAX
  };
})();
