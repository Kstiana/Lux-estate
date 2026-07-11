const LuxSlider = (function () {
  function initTestimonialSlider(slider) {
    const slides = Array.prototype.slice.call(slider.querySelectorAll('.testimonial-slide'));
    const dots = Array.prototype.slice.call(slider.querySelectorAll('.slider-dot'));
    const prevBtn = slider.querySelector('.slider-arrow.prev');
    const nextBtn = slider.querySelector('.slider-arrow.next');
    let current = 0;

    function goTo(index) {
      slides[current].classList.remove('is-active');
      dots[current] && dots[current].classList.remove('is-active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current] && dots[current].classList.add('is-active');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(current - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(current + 1);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        goTo(index);
      });
    });

    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        goTo(current - 1);
      } else if (event.key === 'ArrowRight') {
        goTo(current + 1);
      }
    });
  }

  function initGallery(container, images, altText) {
    if (!container || !images || !images.length) {
      return;
    }

    let current = 0;

    const mainMarkup = images.map(function (src, index) {
      return '<img src="' + src + '" alt="' + altText + ' photo ' + (index + 1) + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '" class="' + (index === 0 ? 'is-active' : '') + '">';
    }).join('');

    const thumbMarkup = images.map(function (src, index) {
      return '<button type="button" class="gallery-thumb' + (index === 0 ? ' is-active' : '') + '" data-index="' + index + '" aria-label="View photo ' + (index + 1) + '"><img src="' + src + '" alt="" loading="lazy"></button>';
    }).join('');

    container.innerHTML =
      '<div class="gallery-main" tabindex="0">' + mainMarkup + '</div>' +
      '<div class="gallery-thumbs">' + thumbMarkup + '</div>';

    const mainEl = container.querySelector('.gallery-main');
    const mainImages = Array.prototype.slice.call(container.querySelectorAll('.gallery-main img'));
    const thumbs = Array.prototype.slice.call(container.querySelectorAll('.gallery-thumb'));

    function goTo(index) {
      mainImages[current].classList.remove('is-active');
      thumbs[current].classList.remove('is-active');
      current = (index + mainImages.length) % mainImages.length;
      mainImages[current].classList.add('is-active');
      thumbs[current].classList.add('is-active');
      thumbs[current].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        goTo(index);
      });
    });

    mainEl.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(current + 1);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.testimonial-slider').forEach(initTestimonialSlider);
  });

  return {
    initGallery: initGallery
  };
})();
