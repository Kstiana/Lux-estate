(function () {
  const searchInput = document.getElementById('property-search-input');

  if (!searchInput || typeof PropertyFilters === 'undefined') {
    return;
  }

  let debounceTimer = null;

  searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    const value = searchInput.value;
    debounceTimer = setTimeout(function () {
      PropertyFilters.setSearchTerm(value);
    }, 200);
  });
})();
