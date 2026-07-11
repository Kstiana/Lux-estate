const LuxAuth = (function () {
  const USERS_KEY = 'luxestate_users';
  const SESSION_KEY = 'luxestate_session';

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

  function getUsers() {
    return readList(USERS_KEY);
  }

  function saveUsers(users) {
    writeList(USERS_KEY, users);
  }

  function getSession() {
    try {
      const email = localStorage.getItem(SESSION_KEY);
      if (!email) {
        return null;
      }
      return getUsers().find(function (u) { return u.email === email; }) || null;
    } catch (err) {
      return null;
    }
  }

  function setSession(email) {
    try {
      localStorage.setItem(SESSION_KEY, email);
    } catch (err) {
      return;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (err) {
      return;
    }
  }

  function getInitials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) { return part.charAt(0).toUpperCase(); })
      .join('');
  }

  function signup(name, email, password) {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(function (u) { return u.email === normalizedEmail; })) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const user = {
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      initials: getInitials(name),
      createdAt: Date.now()
    };

    users.push(user);
    saveUsers(users);
    setSession(normalizedEmail);
    return { success: true, user: user };
  }

  function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = getUsers().find(function (u) { return u.email === normalizedEmail; });

    if (!user || user.password !== password) {
      return { success: false, error: 'Incorrect email or password.' };
    }

    setSession(normalizedEmail);
    return { success: true, user: user };
  }

  function logout() {
    clearSession();
    renderHeaderAuth();
    if (typeof LuxToast !== 'undefined') {
      LuxToast.success('You have been logged out.');
    }
    if (window.location.pathname.indexOf('favorites.html') !== -1) {
      window.location.href = 'index.html';
    }
  }

  function closeAllUserMenus() {
    document.querySelectorAll('.user-menu-dropdown.is-open').forEach(function (el) {
      el.classList.remove('is-open');
    });
  }

  function buildLoggedOutMarkup() {
    return (
      '<a href="login.html" class="btn btn-ghost btn-sm">Log In</a>' +
      '<a href="signup.html" class="btn btn-secondary btn-sm">Sign Up</a>'
    );
  }

  function buildLoggedInMarkup(user) {
    return (
      '<div class="user-menu-wrap">' +
        '<button type="button" class="user-menu-trigger" id="user-menu-trigger" aria-haspopup="true" aria-expanded="false">' +
          '<span class="user-menu-avatar avatar-initials" style="background:#F3E9C9;color:#A2811C">' + LuxRender_escapeHTML(user.initials) + '</span>' +
          '<i class="fa-solid fa-chevron-down" style="font-size:10px;color:var(--text-secondary)"></i>' +
        '</button>' +
        '<div class="user-menu-dropdown" id="user-menu-dropdown">' +
          '<div class="user-menu-name">' + LuxRender_escapeHTML(user.name) + '</div>' +
          '<button type="button" class="user-menu-item" id="user-menu-favorites">' +
            '<i class="fa-solid fa-heart"></i> My Favorites' +
          '</button>' +
          '<button type="button" class="user-menu-item" id="user-menu-logout">' +
            '<i class="fa-solid fa-right-from-bracket"></i> Log Out' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function buildMobileAuthMarkup(user) {
    if (user) {
      return (
        '<div style="font-family:var(--font-display);font-size:var(--fs-18);font-weight:600;margin-bottom:var(--space-sm)">' + LuxRender_escapeHTML(user.name) + '</div>' +
        '<a href="favorites.html" style="display:block;margin-bottom:var(--space-sm);color:var(--text-secondary)"><i class="fa-solid fa-heart"></i> My Favorites</a>' +
        '<button type="button" class="btn btn-secondary btn-sm" id="mobile-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Log Out</button>'
      );
    }
    return (
      '<a href="login.html" class="btn btn-secondary btn-sm btn-block" style="margin-bottom:var(--space-sm)">Log In</a>' +
      '<a href="signup.html" class="btn btn-primary btn-sm btn-block">Sign Up</a>'
    );
  }

  function LuxRender_escapeHTML(value) {
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  }

  function renderHeaderAuth() {
    const user = getSession();
    const desktopContainer = document.getElementById('auth-header-actions');
    const mobileContainer = document.getElementById('mobile-auth-links');

    if (desktopContainer) {
      desktopContainer.innerHTML = user ? buildLoggedInMarkup(user) : buildLoggedOutMarkup();

      const trigger = document.getElementById('user-menu-trigger');
      const dropdown = document.getElementById('user-menu-dropdown');

      if (trigger && dropdown) {
        trigger.addEventListener('click', function (event) {
          event.stopPropagation();
          const isOpen = dropdown.classList.contains('is-open');
          closeAllUserMenus();
          if (!isOpen) {
            dropdown.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
          } else {
            trigger.setAttribute('aria-expanded', 'false');
          }
        });
      }

      const favoritesLink = document.getElementById('user-menu-favorites');
      if (favoritesLink) {
        favoritesLink.addEventListener('click', function () {
          window.location.href = 'favorites.html';
        });
      }

      const logoutBtn = document.getElementById('user-menu-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
      }
    }

    if (mobileContainer) {
      mobileContainer.innerHTML = buildMobileAuthMarkup(user);
      const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
      if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', logout);
      }
    }
  }

  document.addEventListener('click', closeAllUserMenus);

  document.addEventListener('DOMContentLoaded', renderHeaderAuth);

  return {
    getUsers: getUsers,
    getSession: getSession,
    signup: signup,
    login: login,
    logout: logout,
    renderHeaderAuth: renderHeaderAuth
  };
})();
