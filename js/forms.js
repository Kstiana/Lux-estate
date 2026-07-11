(function () {
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_PATTERN = /^[0-9+()\s-]{7,20}$/;

  function setFieldError(field, message) {
    const wrapper = field.closest('.field');
    if (!wrapper) {
      return;
    }
    wrapper.classList.add('has-error');
    let errorEl = wrapper.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error';
      wrapper.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  function clearFieldError(field) {
    const wrapper = field.closest('.field');
    if (!wrapper) {
      return;
    }
    wrapper.classList.remove('has-error');
  }

  function validateField(field) {
    const value = field.value.trim();
    clearFieldError(field);

    if (field.hasAttribute('required') && !value) {
      setFieldError(field, 'This field is required.');
      return false;
    }

    if (field.type === 'email' && value && !EMAIL_PATTERN.test(value)) {
      setFieldError(field, 'Enter a valid email address.');
      return false;
    }

    if (field.type === 'tel' && value && !PHONE_PATTERN.test(value)) {
      setFieldError(field, 'Enter a valid phone number.');
      return false;
    }

    if (field.tagName === 'TEXTAREA' && value && value.length < 10) {
      setFieldError(field, 'Please write at least 10 characters.');
      return false;
    }

    return true;
  }

  function validateForm(form) {
    const fields = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'));
    let isValid = true;

    fields.forEach(function (field) {
      if (field.type === 'checkbox' || field.type === 'radio' || field.type === 'hidden') {
        return;
      }
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  function initForm(form) {
    const fields = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'));

    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'hidden') {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!validateForm(form)) {
        if (typeof LuxToast !== 'undefined') {
          LuxToast.error('Please correct the highlighted fields.');
        }
        return;
      }

      if (typeof LuxToast !== 'undefined') {
        LuxToast.success('Message sent. This is a demo — no data was actually submitted.');
      }

      form.reset();
      fields.forEach(clearFieldError);
    });
  }

  document.querySelectorAll('form[data-validate="true"]').forEach(initForm);
})();
