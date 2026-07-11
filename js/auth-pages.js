(function () {
  document.querySelectorAll('.password-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-toggle-for');
      const input = document.getElementById(targetId);
      if (!input) {
        return;
      }
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
    });
  });

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;

      if (!name || !email || password.length < 6) {
        if (typeof LuxToast !== 'undefined') {
          LuxToast.error('Please fill every field. Password must be at least 6 characters.');
        }
        return;
      }

      const result = LuxAuth.signup(name, email, password);

      if (!result.success) {
        if (typeof LuxToast !== 'undefined') {
          LuxToast.error(result.error);
        }
        return;
      }

      if (typeof LuxToast !== 'undefined') {
        LuxToast.success('Welcome to LuxEstate, ' + name.split(' ')[0] + '!');
      }

      setTimeout(function () {
        window.location.href = 'index.html';
      }, 900);
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      const result = LuxAuth.login(email, password);

      if (!result.success) {
        if (typeof LuxToast !== 'undefined') {
          LuxToast.error(result.error);
        }
        return;
      }

      if (typeof LuxToast !== 'undefined') {
        LuxToast.success('Welcome back, ' + result.user.name.split(' ')[0] + '!');
      }

      setTimeout(function () {
        window.location.href = 'index.html';
      }, 900);
    });
  }
})();
