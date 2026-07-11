(function () {
  const counters = document.querySelectorAll('[data-counter-target]');

  if (!counters.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter-target'));
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const duration = parseInt(el.getAttribute('data-counter-duration') || '1800', 10);

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString('en-NG') + suffix;
      return;
    }

    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuint(progress);
      const current = Math.round(target * eased);
      el.textContent = current.toLocaleString('en-NG') + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('en-NG') + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
})();
