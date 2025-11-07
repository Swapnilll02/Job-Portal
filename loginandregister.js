/* ===== Job Portal — UX Enhancements & Validation ===== */
(function () {
  const isRegister = /register\.php/i.test(document.querySelector('form')?.getAttribute('action') || '') ||
                     !!document.querySelector('select[name="role"]');

  document.addEventListener('DOMContentLoaded', () => {
    enhanceLayout();
    enhancePasswordFields();
    wireValidation();
    if (isRegister) addPasswordStrengthMeter();
  });

  /* Wrap the existing content into a styled container without changing your HTML files */
  function enhanceLayout() {
    // If a container already exists, skip
    if (document.querySelector('.container')) return;

    const bodyChildren = Array.from(document.body.childNodes);
    const wrapper = document.createElement('div');
    wrapper.className = 'container';

    // Move H2, form, and the helper paragraph into the container
    const title = document.querySelector('h2');
    const form = document.querySelector('form');
    const helper = document.querySelector('p');

    if (title) wrapper.appendChild(title);
    if (form) {
      // Insert labels for accessibility (if missing)
      ensureLabels(form);
      wrapper.appendChild(form);
    }
    if (helper) wrapper.appendChild(helper);

    document.body.innerHTML = '';
    document.body.appendChild(wrapper);
  }

  function ensureLabels(form) {
    const fields = form.querySelectorAll('input, select');
    fields.forEach((el) => {
      const type = (el.getAttribute('type') || el.tagName.toLowerCase()).toLowerCase();
      const name = el.getAttribute('name') || type;
      if (!el.id) el.id = `field_${name}`;
      // If there isn't a preceding label sibling, create a label + wrap in .input-row
      const row = document.createElement('div');
      row.className = 'input-row';
      const label = document.createElement('label');
      label.setAttribute('for', el.id);
      label.textContent = toLabelText(name);
      const wrap = document.createElement('div');
      wrap.className = 'input-wrap';
      el.parentNode.insertBefore(row, el);
      row.appendChild(label);
      row.appendChild(wrap);
      wrap.appendChild(el);
    });
  }

  function toLabelText(name) {
    const map = { username: 'Username', password: 'Password', role: 'Role' };
    if (map[name]) return map[name];
    return name.replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  /* Add show/hide toggle to password fields */
  function enhancePasswordFields() {
    document.querySelectorAll('input[type="password"]').forEach((pwd) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toggle-password';
      btn.setAttribute('aria-label', 'Show password');
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = eye(false);
      btn.addEventListener('click', () => {
        const isText = pwd.type === 'text';
        pwd.type = isText ? 'password' : 'text';
        btn.setAttribute('aria-pressed', String(!isText));
        btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
        btn.innerHTML = eye(!isText);
      });
      // Insert into input-wrap
      const wrap = pwd.closest('.input-wrap') || pwd.parentElement;
      wrap.appendChild(btn);
      // Keep cursor position
      btn.addEventListener('mousedown', (e) => e.preventDefault());
    });
  }

  function eye(open) {
    // Minimal inline SVG (no external assets)
    return open
      ? `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.53 2.47 2.47 3.53 6.3 7.36C3.48 9 2 12 2 12s4 7 10 7c2.03 0 3.82-.59 5.34-1.5l3.13 3.13 1.06-1.06L3.53 2.47ZM12 17c-2.76 0-5-2.24-5-5 0-.63.12-1.23.34-1.79l6.45 6.45c-.56.22-1.16.34-1.79.34Zm8.19-3.57c.54-.86.81-1.43.81-1.43s-4-7-10-7c-1.24 0-2.39.23-3.44.62l1.68 1.68A7.01 7.01 0 0 1 12 7c3.31 0 6 2.69 6 6 0 .68-.12 1.33-.34 1.93l2.53 2.5Z"/></svg>`;
  }

  /* Basic client-side validation */
  function wireValidation() {
    const form = document.querySelector('form');
    if (!form) return;

    const username = form.querySelector('input[name="username"]');
    const password = form.querySelector('input[name="password"]');
    const role = form.querySelector('select[name="role"]');

    const constraints = {
      username: (val) => /^[A-Za-z0-9_\.]{3,30}$/.test(val.trim()),
      password: (val) =>
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(val), // at least 8 chars, letters + numbers
    };

    function showError(el, msg) {
      clearError(el);
      const err = document.createElement('div');
      err.className = 'error';
      err.textContent = msg;
      (el.closest('.input-row') || el.parentElement).appendChild(err);
      el.setAttribute('aria-invalid', 'true');
    }
    function clearError(el) {
      const row = el.closest('.input-row') || el.parentElement;
      const existing = row.querySelector('.error');
      if (existing) existing.remove();
      el.removeAttribute('aria-invalid');
    }

    function validateUsername() {
      if (!username) return true;
      const val = username.value;
      if (!constraints.username(val)) {
        showError(
          username,
          'Username must be 3–30 chars, letters/numbers/underscore/dot.'
        );
        return false;
      }
      clearError(username);
      return true;
    }

    function validatePassword() {
      if (!password) return true;
      const val = password.value;
      if (!constraints.password(val)) {
        showError(
          password,
          'Password must be 8+ chars and include letters & numbers.'
        );
        return false;
      }
      clearError(password);
      return true;
    }

    username && username.addEventListener('input', validateUsername);
    password && password.addEventListener('input', () => {
      validatePassword();
      updateMeter(password.value);
    });
    role && role.addEventListener('change', () => clearError(role));

    form.addEventListener('submit', (e) => {
      const okUser = validateUsername();
      const okPass = validatePassword();
      if (isRegister && role && !role.value) {
        showError(role, 'Please select a role.');
      }
      if (!okUser || !okPass) {
        e.preventDefault();
      }
    });
  }

  /* Password strength meter (register page only) */
  function addPasswordStrengthMeter() {
    const pwd = document.querySelector('input[type="password"][name="password"]');
    if (!pwd) return;

    const row = pwd.closest('.input-row');
    const meter = document.createElement('div');
    meter.className = 'meter';
    const bar = document.createElement('span');
    meter.appendChild(bar);
    row.appendChild(meter);

    // initial
    updateMeter(pwd.value);
  }

  function updateMeter(value) {
    const bar = document.querySelector('.meter > span');
    if (!bar) return;
    const score = strengthScore(value);
    const pct = [0, 25, 50, 75, 100][score];
    bar.style.width = pct + '%';
  }

  // Tiny strength estimator (0–4)
  function strengthScore(pw) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
  }
})();
/* === existing code for styling, validation, etc === */
// ...your other JS...

// === Add this snippet at the end ===
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  if (form && form.getAttribute("action") === "register.php") {
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // stop normal form submission

      // Show popup
      alert("Registration Successful!");

      // Redirect to login page
      window.location.href = "login.html";
    });
  }
});

