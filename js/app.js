(function () {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const backToTop = document.querySelector('.back-to-top');

  function updateHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 24) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function updateBackToTop() {
    if (!backToTop) {
      return;
    }
    if (window.scrollY > 480) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  }

  function openMobileMenu() {
    if (!mobileMenu || !mobileMenuBackdrop || !hamburger) {
      return;
    }
    mobileMenu.classList.add('is-open');
    mobileMenuBackdrop.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = mobileMenu.querySelector('a, button');
    if (firstLink) {
      firstLink.focus();
    }
  }

  function closeMobileMenu() {
    if (!mobileMenu || !mobileMenuBackdrop || !hamburger) {
      return;
    }
    mobileMenu.classList.remove('is-open');
    mobileMenuBackdrop.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  function isMobileMenuOpen() {
    return mobileMenu && mobileMenu.classList.contains('is-open');
  }

  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.addEventListener('click', function () {
      if (isMobileMenuOpen()) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isMobileMenuOpen()) {
      closeMobileMenu();
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', function () {
    updateHeaderState();
    updateBackToTop();
  }, { passive: true });

  updateHeaderState();
  updateBackToTop();

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab') {
      document.body.classList.add('is-keyboard-user');
    }
  });

  document.addEventListener('mousedown', function () {
    document.body.classList.remove('is-keyboard-user');
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (isMobileMenuOpen()) {
            closeMobileMenu();
          }
        }
      }
    });
  });

  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(function (link) {
    const linkPath = link.getAttribute('href');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (linkPath && linkPath === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('.reveal').forEach(function (el) {
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    observer.observe(el);
  });

  document.querySelectorAll('.tabs').forEach(function (tabList) {
    const tabButtons = Array.prototype.slice.call(tabList.querySelectorAll('.tab-btn'));

    function activateTab(button) {
      const targetId = button.getAttribute('data-tab-target');
      const targetPanel = document.getElementById(targetId);

      tabButtons.forEach(function (btn) {
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('tabindex', '-1');
      });

      tabList.parentElement.querySelectorAll('.tab-panel').forEach(function (panel) {
        panel.classList.remove('is-active');
      });

      button.setAttribute('aria-selected', 'true');
      button.setAttribute('tabindex', '0');
      if (targetPanel) {
        targetPanel.classList.add('is-active');
      }
    }

    tabButtons.forEach(function (button, index) {
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.setAttribute('tabindex', index === 0 ? '0' : '-1');

      button.addEventListener('click', function () {
        activateTab(button);
      });

      button.addEventListener('keydown', function (event) {
        let newIndex = null;

        if (event.key === 'ArrowRight') {
          newIndex = (index + 1) % tabButtons.length;
        } else if (event.key === 'ArrowLeft') {
          newIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else if (event.key === 'Home') {
          newIndex = 0;
        } else if (event.key === 'End') {
          newIndex = tabButtons.length - 1;
        }

        if (newIndex !== null) {
          event.preventDefault();
          tabButtons[newIndex].focus();
          activateTab(tabButtons[newIndex]);
        }
      });
    });
  });
})();
