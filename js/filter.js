const PropertyFilters = (function () {
  const PAGE_SIZE = 9;

  const state = {
    searchTerm: '',
    location: [],
    type: [],
    status: [],
    priceMin: null,
    priceMax: null,
    beds: '',
    baths: '',
    garage: '',
    sqmMin: null,
    sqmMax: null,
    furnished: false,
    pool: false,
    garden: false,
    petFriendly: false,
    sortBy: 'newest',
    viewMode: 'grid',
    page: 1
  };

  let allProperties = [];
  let grid = null;
  let resultCount = null;
  let pagination = null;
  let emptyState = null;

  function matchesProperty(property) {
    const term = state.searchTerm.trim().toLowerCase();
    if (term) {
      const haystack = (property.title + ' ' + property.location + ' ' + property.type + ' ' + property.agentName).toLowerCase();
      if (haystack.indexOf(term) === -1) {
        return false;
      }
    }

    if (state.location.length && !state.location.some(function (loc) {
      return property.location.indexOf(loc) !== -1;
    })) {
      return false;
    }

    if (state.type.length && state.type.indexOf(property.type) === -1) {
      return false;
    }

    if (state.status.length && state.status.indexOf(property.status) === -1) {
      return false;
    }

    if (state.priceMin !== null && property.price < state.priceMin) {
      return false;
    }

    if (state.priceMax !== null && property.price > state.priceMax) {
      return false;
    }

    if (state.beds && property.beds < parseInt(state.beds, 10)) {
      return false;
    }

    if (state.baths && property.baths < parseInt(state.baths, 10)) {
      return false;
    }

    if (state.garage && property.garage < parseInt(state.garage, 10)) {
      return false;
    }

    if (state.sqmMin !== null && property.area < state.sqmMin) {
      return false;
    }

    if (state.sqmMax !== null && property.area > state.sqmMax) {
      return false;
    }

    if (state.furnished && !property.furnished) {
      return false;
    }

    if (state.pool && !property.pool) {
      return false;
    }

    if (state.garden && !property.garden) {
      return false;
    }

    if (state.petFriendly && !property.petFriendly) {
      return false;
    }

    return true;
  }

  function sortProperties(list) {
    const sorted = list.slice();
    if (state.sortBy === 'price-asc') {
      sorted.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sortBy === 'price-desc') {
      sorted.sort(function (a, b) { return b.price - a.price; });
    } else if (state.sortBy === 'area-desc') {
      sorted.sort(function (a, b) { return b.area - a.area; });
    } else {
      sorted.sort(function (a, b) { return new Date(b.datePosted) - new Date(a.datePosted); });
    }
    return sorted;
  }

  function renderPagination(totalPages) {
    if (!pagination) {
      return;
    }

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let markup = '';
    markup += '<button type="button" data-page="prev" ' + (state.page === 1 ? 'disabled' : '') + ' aria-label="Previous page"><i class="fa-solid fa-chevron-left"></i></button>';

    for (let i = 1; i <= totalPages; i++) {
      markup += '<button type="button" data-page="' + i + '" class="' + (i === state.page ? 'is-active' : '') + '" aria-label="Page ' + i + '" aria-current="' + (i === state.page ? 'page' : 'false') + '">' + i + '</button>';
    }

    markup += '<button type="button" data-page="next" ' + (state.page === totalPages ? 'disabled' : '') + ' aria-label="Next page"><i class="fa-solid fa-chevron-right"></i></button>';

    pagination.innerHTML = markup;

    pagination.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const value = btn.getAttribute('data-page');
        if (value === 'prev') {
          state.page = Math.max(1, state.page - 1);
        } else if (value === 'next') {
          state.page = Math.min(totalPages, state.page + 1);
        } else {
          state.page = parseInt(value, 10);
        }
        applyFilters();
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function applyFilters() {
    const filtered = allProperties.filter(matchesProperty);
    const sorted = sortProperties(filtered);
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = sorted.slice(start, start + PAGE_SIZE);

    if (resultCount) {
      resultCount.innerHTML = 'Showing <strong>' + pageItems.length + '</strong> of <strong>' + sorted.length + '</strong> properties';
    }

    if (emptyState) {
      emptyState.style.display = sorted.length ? 'none' : 'block';
    }

    if (grid) {
      LuxRender.renderProperties(grid, pageItems);
    }

    renderPagination(totalPages);
  }

  function setSearchTerm(term) {
    state.searchTerm = term;
    state.page = 1;
    applyFilters();
  }

  function toggleArrayValue(list, value) {
    const index = list.indexOf(value);
    if (index === -1) {
      list.push(value);
    } else {
      list.splice(index, 1);
    }
  }

  function bindCheckboxGroup(fieldName) {
    document.querySelectorAll('[data-checkbox-for="' + fieldName + '"]').forEach(function (box) {
      box.addEventListener('click', function () {
        const value = box.getAttribute('data-value');
        const isChecked = box.classList.toggle('is-checked');
        box.innerHTML = isChecked ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>' : '';

        if (fieldName === 'feature') {
          state[value] = isChecked;
        } else {
          toggleArrayValue(state[fieldName], value);
        }

        state.page = 1;
        applyFilters();
      });
    });
  }

  function bindRadioGroup(fieldName) {
    document.querySelectorAll('[data-radio-for="' + fieldName + '"]').forEach(function (radio) {
      radio.addEventListener('click', function () {
        document.querySelectorAll('[data-radio-for="' + fieldName + '"]').forEach(function (r) {
          r.classList.remove('is-checked');
        });
        radio.classList.add('is-checked');
        state[fieldName] = radio.getAttribute('data-value');
        state.page = 1;
        applyFilters();
      });
    });
  }

  function bindRangeInputs(minId, maxId, stateMinKey, stateMaxKey) {
    const minInput = document.getElementById(minId);
    const maxInput = document.getElementById(maxId);

    if (minInput) {
      minInput.addEventListener('change', function () {
        state[stateMinKey] = minInput.value ? parseFloat(minInput.value) : null;
        state.page = 1;
        applyFilters();
      });
    }

    if (maxInput) {
      maxInput.addEventListener('change', function () {
        state[stateMaxKey] = maxInput.value ? parseFloat(maxInput.value) : null;
        state.page = 1;
        applyFilters();
      });
    }
  }

  function bindSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sortBy = sortSelect.value;
        applyFilters();
      });
    }
  }

  function bindViewToggle() {
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');

    if (gridBtn) {
      gridBtn.addEventListener('click', function () {
        state.viewMode = 'grid';
        grid.classList.remove('list-view');
        gridBtn.classList.add('is-active');
        gridBtn.setAttribute('aria-pressed', 'true');
        if (listBtn) {
          listBtn.classList.remove('is-active');
          listBtn.setAttribute('aria-pressed', 'false');
        }
      });
    }

    if (listBtn) {
      listBtn.addEventListener('click', function () {
        state.viewMode = 'list';
        grid.classList.add('list-view');
        listBtn.classList.add('is-active');
        listBtn.setAttribute('aria-pressed', 'true');
        if (gridBtn) {
          gridBtn.classList.remove('is-active');
          gridBtn.setAttribute('aria-pressed', 'false');
        }
      });
    }
  }

  function bindMobileFilterToggle() {
    const toggleBtn = document.getElementById('filter-toggle-btn');
    const sidebar = document.getElementById('filter-sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function () {
        const isOpen = sidebar.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  function resetFilters() {
    state.searchTerm = '';
    state.location = [];
    state.type = [];
    state.status = [];
    state.priceMin = null;
    state.priceMax = null;
    state.beds = '';
    state.baths = '';
    state.garage = '';
    state.sqmMin = null;
    state.sqmMax = null;
    state.furnished = false;
    state.pool = false;
    state.garden = false;
    state.petFriendly = false;
    state.sortBy = 'newest';
    state.page = 1;

    document.querySelectorAll('.checkbox').forEach(function (box) {
      box.classList.remove('is-checked');
      box.innerHTML = '';
    });

    document.querySelectorAll('.radio').forEach(function (radio) {
      radio.classList.remove('is-checked');
    });

    document.querySelectorAll('[data-value=""]').forEach(function (radio) {
      if (radio.classList.contains('radio')) {
        radio.classList.add('is-checked');
      }
    });

    const searchInput = document.getElementById('property-search-input');
    if (searchInput) {
      searchInput.value = '';
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = 'newest';
    }

    ['price-min', 'price-max', 'sqm-min', 'sqm-max'].forEach(function (id) {
      const input = document.getElementById(id);
      if (input) {
        input.value = '';
      }
    });

    applyFilters();
  }

  function applyFromURL() {
    const params = new URLSearchParams(window.location.search);
    const location = params.get('location');
    const type = params.get('type');
    const status = params.get('status');

    if (location) {
      state.location.push(location);
      const box = document.querySelector('[data-checkbox-for="location"][data-value="' + location + '"]');
      if (box) {
        box.classList.add('is-checked');
        box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
      }
    }

    if (type) {
      state.type.push(type);
      const box = document.querySelector('[data-checkbox-for="type"][data-value="' + type + '"]');
      if (box) {
        box.classList.add('is-checked');
        box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
      }
    }

    if (status) {
      state.status.push(status);
      const box = document.querySelector('[data-checkbox-for="status"][data-value="' + status + '"]');
      if (box) {
        box.classList.add('is-checked');
        box.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
      }
    }
  }

  function init() {
    grid = document.getElementById('properties-grid');
    resultCount = document.getElementById('result-count');
    pagination = document.getElementById('pagination');
    emptyState = document.getElementById('empty-state');

    if (!grid) {
      return;
    }

    LuxRender.renderSkeletons(grid, 9);

    bindCheckboxGroup('location');
    bindCheckboxGroup('type');
    bindCheckboxGroup('status');
    bindCheckboxGroup('feature');
    bindRadioGroup('beds');
    bindRadioGroup('baths');
    bindRadioGroup('garage');
    bindRangeInputs('price-min', 'price-max', 'priceMin', 'priceMax');
    bindRangeInputs('sqm-min', 'sqm-max', 'sqmMin', 'sqmMax');
    bindSort();
    bindViewToggle();
    bindMobileFilterToggle();

    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', resetFilters);
    }

    const emptyClearBtn = document.getElementById('empty-clear-btn');
    if (emptyClearBtn) {
      emptyClearBtn.addEventListener('click', resetFilters);
    }

    applyFromURL();

    LuxRender.loadProperties().then(function (properties) {
      allProperties = properties;
      applyFilters();
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    state: state,
    applyFilters: applyFilters,
    setSearchTerm: setSearchTerm
  };
})();
