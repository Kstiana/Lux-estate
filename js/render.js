const LuxRender = (function () {
  const DATA_PATHS = {
    properties: 'data/properties.json',
    agents: 'data/agents.json',
    blog: 'data/blog.json'
  };

  const cache = {
    properties: null,
    agents: null,
    blog: null
  };

  const ICONS = {
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 13h18"/><path d="M7 13V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/><path d="M3 18v2"/><path d="M21 18v2"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V6a2 2 0 0 1 2-2h1"/><path d="M3 19h18"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16V9l2-4h12l2 4v7"/><path d="M4 16h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3"/><path d="M11 8v3"/><path d="M15 8v3"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.5 7-12.5A7 7 0 0 0 5 9.5C5 14.5 12 22 12 22Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.7-10-9.3C.4 7.4 2.2 4 5.7 4c2 0 3.4 1 4.3 2.4C10.9 5 12.3 4 14.3 4c3.5 0 5.3 3.4 3.7 6.7C19.5 15.3 12 20 12 20Z"/></svg>'
  };

  function getFavoriteIds() {
    try {
      return JSON.parse(localStorage.getItem('luxestate_favorites') || '[]');
    } catch (err) {
      return [];
    }
  }

  function getCompareIds() {
    try {
      return JSON.parse(localStorage.getItem('luxestate_compare') || '[]');
    } catch (err) {
      return [];
    }
  }

  function escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  }

  function formatPrice(amount, status) {
    const formatted = '\u20A6' + Number(amount).toLocaleString('en-NG');
    return status === 'For Rent' ? formatted + '/year' : formatted;
  }

  function formatArea(area) {
    return Number(area).toLocaleString('en-NG') + ' sqm';
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function fetchJSON(key) {
    if (cache[key]) {
      return cache[key];
    }
    cache[key] = fetch(DATA_PATHS[key]).then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load ' + DATA_PATHS[key]);
      }
      return response.json();
    });
    return cache[key];
  }

  function loadProperties() {
    return fetchJSON('properties');
  }

  function loadAgents() {
    return fetchJSON('agents');
  }

  function loadBlogPosts() {
    return fetchJSON('blog');
  }

  function buildPropertyCard(property) {
    const favorites = getFavoriteIds();
    const isFavorite = favorites.indexOf(property.id) !== -1;
    const compareIds = getCompareIds();
    const isComparing = compareIds.indexOf(property.id) !== -1;
    const badges = [];

    if (property.featured) {
      badges.push('<span class="card-badge">Featured</span>');
    }
    if (property.isNew) {
      badges.push('<span class="card-badge new">New</span>');
    }

    return (
      '<article class="card property-card reveal" data-id="' + property.id + '">' +
        '<div class="property-card-media">' +
          '<div class="card-badge-group">' + badges.join('') + '</div>' +
          '<button type="button" class="favorite-btn' + (isFavorite ? ' is-active' : '') + '" data-favorite-id="' + property.id + '" aria-label="Toggle favorite" aria-pressed="' + isFavorite + '">' +
            ICONS.heart +
          '</button>' +
          '<img src="' + property.images[0] + '" alt="' + escapeHTML(property.title) + '" loading="lazy" width="480" height="360">' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-top-row">' +
            '<h3 class="card-title">' + escapeHTML(property.title) + '</h3>' +
            '<span class="card-price">' + formatPrice(property.price, property.status) + '</span>' +
          '</div>' +
          '<div class="card-location">' + ICONS.pin + '<span>' + escapeHTML(property.location) + '</span></div>' +
          '<div class="card-meta">' +
            (property.beds ? '<span class="card-meta-item">' + ICONS.bed + property.beds + '</span>' : '') +
            (property.baths ? '<span class="card-meta-item">' + ICONS.bath + property.baths + '</span>' : '') +
            (property.garage ? '<span class="card-meta-item">' + ICONS.car + property.garage + '</span>' : '') +
            '<span class="card-meta-item">' + ICONS.ruler + formatArea(property.area) + '</span>' +
          '</div>' +
          '<div class="card-footer-row">' +
            '<label class="compare-check">' +
              '<input type="checkbox" class="compare-checkbox" data-compare-id="' + property.id + '"' + (isComparing ? ' checked' : '') + '>' +
              '<span>Compare</span>' +
            '</label>' +
            '<a href="property-details.html?id=' + property.id + '" class="card-cta">View Details ' + ICONS.arrowRight + '</a>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function buildPropertySkeleton() {
    return (
      '<div class="skeleton-card">' +
        '<div class="skeleton skeleton-media"></div>' +
        '<div class="skeleton skeleton-line"></div>' +
        '<div class="skeleton skeleton-line short"></div>' +
        '<div class="skeleton skeleton-line"></div>' +
      '</div>'
    );
  }

  function buildAgentCard(agent) {
    const social = agent.social || {};
    const links = [];

    if (social.instagram) {
      links.push('<a href="' + social.instagram + '" target="_blank" rel="noopener" aria-label="' + escapeHTML(agent.name) + ' on Instagram"><i class="fa-brands fa-instagram"></i></a>');
    }
    if (social.linkedin) {
      links.push('<a href="' + social.linkedin + '" target="_blank" rel="noopener" aria-label="' + escapeHTML(agent.name) + ' on LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>');
    }
    if (social.twitter) {
      links.push('<a href="' + social.twitter + '" target="_blank" rel="noopener" aria-label="' + escapeHTML(agent.name) + ' on Twitter"><i class="fa-brands fa-x-twitter"></i></a>');
    }

    const avatar = agent.avatar || { initials: '?', bg: '#F1EFE8', fg: '#5C5C5C' };

    return (
      '<article class="card agent-card reveal" data-id="' + agent.id + '">' +
        '<div class="agent-photo">' +
          '<span class="avatar-initials" style="background:' + avatar.bg + ';color:' + avatar.fg + '">' + escapeHTML(avatar.initials) + '</span>' +
        '</div>' +
        '<div class="agent-info">' +
          '<h3 class="agent-name">' + escapeHTML(agent.name) + '</h3>' +
          '<p class="agent-role">' + escapeHTML(agent.position) + '</p>' +
          '<div class="agent-social">' + links.join('') + '</div>' +
          '<a href="agent.html?id=' + agent.id + '" class="card-cta btn-sm btn btn-secondary">View Profile</a>' +
        '</div>' +
      '</article>'
    );
  }

  function buildBlogCard(post) {
    return (
      '<article class="card blog-card reveal" data-id="' + post.id + '">' +
        '<div class="blog-card-media">' +
          '<span class="blog-card-category">' + escapeHTML(post.category) + '</span>' +
          '<img src="' + post.image + '" alt="' + escapeHTML(post.title) + '" loading="lazy" width="480" height="300">' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="blog-card-meta">' +
            '<span>' + escapeHTML(post.author) + '</span>' +
            '<span>' + formatDate(post.date) + '</span>' +
          '</div>' +
          '<h3 class="blog-card-title">' + escapeHTML(post.title) + '</h3>' +
          '<p class="blog-card-excerpt">' + escapeHTML(post.excerpt) + '</p>' +
          '<a href="blog-details.html?id=' + post.id + '" class="card-cta">Read Article ' + ICONS.arrowRight + '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function observeReveal(container) {
    if (!('IntersectionObserver' in window)) {
      container.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, index) {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (index % 6) * 60 + 'ms';
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    container.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  function renderSkeletons(container, count) {
    let markup = '';
    for (let i = 0; i < count; i++) {
      markup += buildPropertySkeleton();
    }
    container.innerHTML = markup;
  }

  function renderProperties(container, properties) {
    if (!properties.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = properties.map(buildPropertyCard).join('');
    observeReveal(container);
  }

  function renderAgents(container, agents) {
    container.innerHTML = agents.map(buildAgentCard).join('');
    observeReveal(container);
  }

  function renderBlogPosts(container, posts) {
    container.innerHTML = posts.map(buildBlogCard).join('');
    observeReveal(container);
  }

  return {
    loadProperties: loadProperties,
    loadAgents: loadAgents,
    loadBlogPosts: loadBlogPosts,
    formatPrice: formatPrice,
    formatArea: formatArea,
    formatDate: formatDate,
    escapeHTML: escapeHTML,
    buildPropertyCard: buildPropertyCard,
    buildAgentCard: buildAgentCard,
    buildBlogCard: buildBlogCard,
    buildPropertySkeleton: buildPropertySkeleton,
    renderSkeletons: renderSkeletons,
    renderProperties: renderProperties,
    renderAgents: renderAgents,
    renderBlogPosts: renderBlogPosts,
    observeReveal: observeReveal
  };
})();
