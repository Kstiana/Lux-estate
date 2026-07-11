const LuxToast = (function () {
  const ICON_SUCCESS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>';
  const ICON_ERROR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  let container = null;

  function getContainer() {
    if (container) {
      return container;
    }
    container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }

  function removeToast(toastEl) {
    if (!toastEl || toastEl.classList.contains('is-leaving')) {
      return;
    }
    toastEl.classList.add('is-leaving');
    toastEl.addEventListener('animationend', function () {
      toastEl.remove();
    }, { once: true });
  }

  function show(message, options) {
    const settings = options || {};
    const type = settings.type === 'error' ? 'error' : 'success';
    const duration = typeof settings.duration === 'number' ? settings.duration : 3000;
    const target = getContainer();

    const toastEl = document.createElement('div');
    toastEl.className = 'toast' + (type === 'error' ? ' toast-error' : '');
    toastEl.innerHTML =
      '<span class="toast-icon">' + (type === 'error' ? ICON_ERROR : ICON_SUCCESS) + '</span>' +
      '<span class="toast-message"></span>' +
      '<button type="button" class="toast-close" aria-label="Dismiss notification">' + ICON_CLOSE + '</button>';

    toastEl.querySelector('.toast-message').textContent = message;

    const closeBtn = toastEl.querySelector('.toast-close');
    closeBtn.addEventListener('click', function () {
      removeToast(toastEl);
    });

    target.appendChild(toastEl);

    if (duration > 0) {
      setTimeout(function () {
        removeToast(toastEl);
      }, duration);
    }

    return toastEl;
  }

  function success(message, duration) {
    return show(message, { type: 'success', duration: duration });
  }

  function error(message, duration) {
    return show(message, { type: 'error', duration: duration });
  }

  return {
    show: show,
    success: success,
    error: error
  };
})();
