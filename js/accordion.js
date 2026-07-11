(function () {
  const accordions = document.querySelectorAll('.accordion-item');

  if (!accordions.length) {
    return;
  }

  function closePanel(header, panel) {
    header.setAttribute('aria-expanded', 'false');
    panel.style.maxHeight = null;
  }

  function openPanel(header, panel) {
    header.setAttribute('aria-expanded', 'true');
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }

  function toggleItem(item, allowMultiple) {
    const header = item.querySelector('.accordion-header');
    const panel = item.querySelector('.accordion-panel');

    if (!header || !panel) {
      return;
    }

    const isOpen = header.getAttribute('aria-expanded') === 'true';

    if (!allowMultiple) {
      accordions.forEach(function (otherItem) {
        if (otherItem !== item) {
          const otherHeader = otherItem.querySelector('.accordion-header');
          const otherPanel = otherItem.querySelector('.accordion-panel');
          if (otherHeader && otherPanel) {
            closePanel(otherHeader, otherPanel);
          }
        }
      });
    }

    if (isOpen) {
      closePanel(header, panel);
    } else {
      openPanel(header, panel);
    }
  }

  accordions.forEach(function (item, index) {
    const header = item.querySelector('.accordion-header');
    const panel = item.querySelector('.accordion-panel');

    if (!header || !panel) {
      return;
    }

    const panelId = panel.id || 'accordion-panel-' + index;
    const headerId = header.id || 'accordion-header-' + index;

    panel.id = panelId;
    header.id = headerId;
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', panelId);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', headerId);

    header.addEventListener('click', function () {
      const allowMultiple = item.closest('[data-accordion-multiple]') !== null;
      toggleItem(item, allowMultiple);
    });

    header.addEventListener('keydown', function (event) {
      const items = Array.prototype.slice.call(accordions);
      const currentIndex = items.indexOf(item);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = items[currentIndex + 1] || items[0];
        const nextHeader = next.querySelector('.accordion-header');
        if (nextHeader) {
          nextHeader.focus();
        }
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = items[currentIndex - 1] || items[items.length - 1];
        const prevHeader = prev.querySelector('.accordion-header');
        if (prevHeader) {
          prevHeader.focus();
        }
      }

      if (event.key === 'Home') {
        event.preventDefault();
        const firstHeader = items[0].querySelector('.accordion-header');
        if (firstHeader) {
          firstHeader.focus();
        }
      }

      if (event.key === 'End') {
        event.preventDefault();
        const lastHeader = items[items.length - 1].querySelector('.accordion-header');
        if (lastHeader) {
          lastHeader.focus();
        }
      }
    });
  });

  window.addEventListener('resize', function () {
    accordions.forEach(function (item) {
      const header = item.querySelector('.accordion-header');
      const panel = item.querySelector('.accordion-panel');
      if (header && panel && header.getAttribute('aria-expanded') === 'true') {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
})();
