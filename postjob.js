/* ===== Job Portal — Post Job Enhancer ===== */
document.addEventListener('DOMContentLoaded', () => {
  wrapLayout();
  addLabels();
  enhanceDescription();
  setMinDeadlineToday();
  wireValidation();
});

/* Wrap content into a pretty card without changing your PHP/HTML */
function wrapLayout(){
  if (document.querySelector('.wrapper')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';

  const h2 = document.querySelector('h2') || (() => {
    const h = document.createElement('h2'); h.textContent = 'Post New Job'; return h;
  })();
  const backLink = Array.from(document.querySelectorAll('a')).find(a => /jobs\.php/i.test(a.getAttribute('href')||''));
  const header = document.createElement('div');
  header.className = 'header';
  const title = document.createElement('div'); title.appendChild(h2);
  header.appendChild(title);
  if (backLink) { backLink.classList.add('back'); header.appendChild(backLink); }

  const form = document.querySelector('form');
  document.body.innerHTML = '';
  wrapper.appendChild(header);
  if (form) wrapper.appendChild(form);
  document.body.appendChild(wrapper);
}

/* Convert placeholders into accessible labels */
function addLabels(){
  const form = document.querySelector('form');
  if (!form) return;

  const fields = [
    { sel: 'input[name="job_title"]', label: 'Job Title' },
    { sel: 'textarea[name="job_desc"]', label: 'Job Description' },
    { sel: 'input[name="location"]', label: 'Location' },
    { sel: 'input[name="salary"]', label: 'Salary (per year)' },
    { sel: 'input[name="deadline"]', label: 'Application Deadline' },
  ];

  fields.forEach(({sel, label}) => {
    const el = form.querySelector(sel);
    if (!el) return;
    if (!el.id) el.id = 'fld_' + (el.getAttribute('name') || Math.random().toString(36).slice(2));
    const row = document.createElement('div');
    row.className = 'row';
    const lab = document.createElement('label');
    lab.setAttribute('for', el.id);
    lab.textContent = label;

    // move element into row
    el.parentNode.insertBefore(row, el);
    row.appendChild(lab);
    row.appendChild(el);

    // add helper slots
    const help = document.createElement('div');
    help.className = 'help';
    row.appendChild(help);

    // error placeholder
    const err = document.createElement('div');
    err.className = 'error';
    err.style.display = 'none';
    row.appendChild(err);
  });

  // little default helps
  const salaryHelp = form.querySelector('input[name="salary"]')?.closest('.row')?.querySelector('.help');
  if (salaryHelp) salaryHelp.textContent = 'Numbers only. Example: 600000 (annual).';

  const descHelp = form.querySelector('textarea[name="job_desc"]')?.closest('.row')?.querySelector('.help');
  if (descHelp) descHelp.textContent = 'Describe responsibilities, requirements, perks. Minimum 30 characters.';
}

/* Textarea: autosize + live character count */
function enhanceDescription(){
  const ta = document.querySelector('textarea[name="job_desc"]');
  if (!ta) return;

  // required + minlength for better native validation
  ta.required = true;
  ta.setAttribute('minlength', '30');

  // counter
  const row = ta.closest('.row');
  const counter = document.createElement('div');
  counter.className = 'count';
  row.appendChild(counter);

  const update = () => {
    // autosize
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';

    const len = ta.value.trim().length;
    counter.textContent = `${len} characters`;
  };
  ['input','change'].forEach(evt => ta.addEventListener(evt, update));
  setTimeout(update, 0);
}

/* Today or later only */
function setMinDeadlineToday(){
  const date = document.querySelector('input[name="deadline"]');
  if (!date) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  date.min = `${yyyy}-${mm}-${dd}`;
}

/* Client-side validation + safe submit */
function wireValidation(){
  const form = document.querySelector('form');
  if (!form) return;

  const title = form.querySelector('input[name="job_title"]');
  const desc = form.querySelector('textarea[name="job_desc"]');
  const location = form.querySelector('input[name="location"]');
  const salary = form.querySelector('input[name="salary"]');
  const deadline = form.querySelector('input[name="deadline"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  // sensible constraints
  salary.min = '0';
  salary.step = '1';

  function show(el, msg){
    const err = el.closest('.row').querySelector('.error');
    err.textContent = msg;
    err.style.display = msg ? 'block' : 'none';
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }

  function validTitle(){
    const ok = (title.value.trim().length >= 3);
    show(title, ok ? '' : 'Title must be at least 3 characters.');
    return ok;
  }
  function validDesc(){
    const ok = (desc.value.trim().length >= 30);
    show(desc, ok ? '' : 'Description must be at least 30 characters.');
    return ok;
  }
  function validLocation(){
    const ok = (location.value.trim().length >= 2);
    show(location, ok ? '' : 'Please enter a location.');
    return ok;
  }
  function validSalary(){
    const val = Number(salary.value);
    const ok = Number.isFinite(val) && val >= 0;
    show(salary, ok ? '' : 'Enter a valid salary (0 or higher).');
    return ok;
  }
  function validDeadline(){
    if (!deadline.value) return true; // optional
    const d = new Date(deadline.value + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const ok = d >= today;
    show(deadline, ok ? '' : 'Deadline cannot be in the past.');
    return ok;
  }

  title.addEventListener('input', validTitle);
  desc.addEventListener('input', validDesc);
  location.addEventListener('input', validLocation);
  salary.addEventListener('input', validSalary);
  deadline.addEventListener('change', validDeadline);

  // Prevent accidental double submit and validate
  form.addEventListener('submit', (e) => {
    const ok = [validTitle(), validDesc(), validLocation(), validSalary(), validDeadline()].every(Boolean);
    if (!ok){
      e.preventDefault();
      toast('Please fix the highlighted fields.');
      return;
    }
    if (submitBtn){
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting…';
    }
  });
}

/* Small toast helper */
function toast(msg){
  let t = document.querySelector('.toast');
  if (!t){
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => t.classList.remove('show'), 2400);
}
