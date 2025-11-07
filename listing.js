/* ===== Job Portal — Listings Enhancer (fixed) ===== */
document.addEventListener('DOMContentLoaded', () => {
  try {
    enhanceStructure();
    beautifyCards();
    buildToolbar();
    wireApplyForms();
  } catch (e) {
    console.error('Listings init error:', e);
  }
});

/* Safely wrap the page and preserve links (Logout, Post Job) */
function enhanceStructure() {
  if (document.querySelector('.listings-container')) return;

  // Capture important nodes BEFORE clearing
  const h2 = document.querySelector('h2');
  const allDivs = Array.from(document.body.children).filter(el => el.tagName === 'DIV');
  const postLink = Array.from(document.querySelectorAll('a')).find(a => /postjob\.html/i.test(a.getAttribute('href')||''));
  const logoutWrap = Array.from(document.querySelectorAll('a')).find(a => /logout\.php/i.test(a.getAttribute('href')||''))?.closest('p')
                      || Array.from(document.querySelectorAll('a')).find(a => /logout\.php/i.test(a.getAttribute('href')||''));

  // Clone nodes we will need after wiping the body
  const postClone = postLink ? postLink.cloneNode(true) : null;
  const logoutClone = logoutWrap ? logoutWrap.cloneNode(true) : null;

  // Build the new structure
  const container = document.createElement('div');
  container.className = 'listings-container';

  const head = document.createElement('div');
  head.className = 'page-head';

  const title = (h2 ? h2.cloneNode(true) : (() => {
    const hh = document.createElement('h2'); hh.textContent = 'Job Listings'; return hh;
  })());
  title.classList.add('page-title');

  const actions = document.createElement('div');
  actions.className = 'actions';
  if (postClone) { postClone.classList.add('btn'); actions.appendChild(postClone); }

  head.appendChild(title);
  head.appendChild(actions);

  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  toolbar.innerHTML = `
    <input class="input" type="text" id="search" placeholder="Search title or location…">
    <select class="select" id="sort">
      <option value="deadline-asc">Sort: Deadline (Soonest)</option>
      <option value="deadline-desc">Sort: Deadline (Latest)</option>
      <option value="salary-desc">Sort: Salary (High → Low)</option>
      <option value="salary-asc">Sort: Salary (Low → High)</option>
      <option value="title-asc">Sort: Title (A → Z)</option>
      <option value="location-asc">Sort: Location (A → Z)</option>
    </select>
  `;

  const grid = document.createElement('div');
  grid.className = 'jobs-grid';
  // Move *job blocks* (DIVs) into the grid
  allDivs.forEach(div => grid.appendChild(div));

  // Clear and rebuild body
  document.body.innerHTML = '';
  container.appendChild(head);
  container.appendChild(toolbar);
  container.appendChild(grid);

  // Footer with Logout (preserved even if it was inside <p>)
  if (logoutClone) {
    const footer = document.createElement('div');
    footer.className = 'footer';
    // If <p><a>Logout</a></p>, unwrap and take the <a>
    const anchor = logoutClone.querySelector('a') || logoutClone;
    anchor.classList.add('btn');
    anchor.textContent = 'Logout';
    footer.appendChild(anchor);
    container.appendChild(footer);
  }

  document.body.appendChild(container);
}

/* Turn each server-printed job <div> into a card; add badges and style forms */
function beautifyCards() {
  const cards = document.querySelectorAll('.jobs-grid > div');
  cards.forEach(card => {
    card.classList.add('job-card');

    const h3 = card.querySelector('h3');
    if (h3) h3.classList.add('job-title');

    // Group meta lines
    const metaPs = Array.from(card.querySelectorAll('p')).filter(p =>
      /Location:|Salary:|Apply Before:/i.test(p.textContent)
    );
    if (metaPs.length) {
      const meta = document.createElement('div'); meta.className = 'job-meta';
      metaPs.forEach(p => meta.appendChild(p));
      card.insertBefore(meta, card.firstElementChild?.nextSibling || card.firstChild);
    }

    // Description (first non-meta <p>)
    const desc = Array.from(card.querySelectorAll('p')).find(p =>
      !/Location:|Salary:|Apply Before:/i.test(p.textContent)
    );
    if (desc) desc.classList.add('job-desc');

    // Badges
    const badges = document.createElement('div'); badges.className = 'badges';
    const deadlineP = Array.from(card.querySelectorAll('p')).find(p => /Apply Before:/i.test(p.textContent));
    if (deadlineP) {
      const dateText = (deadlineP.textContent.split(':')[1] || '').trim();
      const d = new Date(dateText);
      const daysLeft = isNaN(d) ? null : Math.ceil((d - todayMidnight()) / (1000*60*60*24));
      const badge = document.createElement('span');
      badge.className = 'badge deadline';
      badge.textContent = isNaN(d)
        ? `Deadline: ${dateText}`
        : (daysLeft < 0 ? 'Closed' : daysLeft === 0 ? 'Deadline: today' : `Deadline: ${daysLeft}d`);
      if (!isNaN(d) && daysLeft !== null && daysLeft <= 3) badge.classList.add('urgent');
      badges.appendChild(badge);
    }
    const salaryP = Array.from(card.querySelectorAll('p')).find(p => /Salary:/i.test(p.textContent));
    if (salaryP) {
      const b = document.createElement('span'); b.className = 'badge'; b.textContent = salaryP.textContent.trim();
      badges.appendChild(b);
    }
    if (badges.children.length) card.insertBefore(badges, desc || card.lastChild);

    // Apply form beautify
    const form = card.querySelector('form[action="apply.php"]');
    if (form) {
      form.classList.add('apply');
      const file = form.querySelector('input[type="file"]');
      const btn = form.querySelector('button[type="submit"]');
      if (file) {
        const wrap = document.createElement('label');
        wrap.className = 'file';
        wrap.innerHTML = `<span>Upload resume:</span> <span class="file-name">PDF, DOC, DOCX</span>`;
        file.parentNode.insertBefore(wrap, file);
        wrap.appendChild(file);
        file.addEventListener('change', () => {
          const name = file.files?.[0]?.name || 'PDF, DOC, DOCX';
          wrap.querySelector('.file-name').textContent = name;
        });
      }
      if (btn) btn.classList.add('btn-primary');
    }
  });
}

function todayMidnight(){
  const t = new Date(); t.setHours(0,0,0,0); return t;
}

/* Search + sort */
function buildToolbar() {
  const grid = document.querySelector('.jobs-grid');
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  if (!grid || !search || !sort) return;

  function cards() { return Array.from(grid.children); }
  function norm(s){ return (s||'').toLowerCase(); }

  function data(card){
    const title = card.querySelector('h3')?.textContent || '';
    const loc = Array.from(card.querySelectorAll('p')).find(p => /Location:/i.test(p.textContent))?.textContent || '';
    const salaryTxt = Array.from(card.querySelectorAll('p')).find(p => /Salary:/i.test(p.textContent))?.textContent || '';
    const salary = Number((salaryTxt.match(/[\d.,]+/) || ['0'])[0].replace(/,/g,'')) || 0;
    const deadlineTxt = Array.from(card.querySelectorAll('p')).find(p => /Apply Before:/i.test(p.textContent))?.textContent.split(':')[1] || '';
    const deadline = new Date((deadlineTxt || '').trim());
    return { title, loc, salary, deadline };
  }

  function apply(){
    const q = norm(search.value);
    const list = cards();

    // filter
    list.forEach(c => {
      const d = data(c);
      const hit = norm(d.title).includes(q) || norm(d.loc).includes(q);
      c.style.display = hit ? '' : 'none';
    });

    // sort
    const [field, dir] = (sort.value||'deadline-asc').split('-');
    const visible = list.filter(c => c.style.display !== 'none');
    visible.sort((a,b) => {
      const A = data(a), B = data(b);
      let vA=0,vB=0;
      if (field==='deadline'){ vA = A.deadline.getTime()||0; vB = B.deadline.getTime()||0; }
      if (field==='salary'){ vA = A.salary; vB = B.salary; }
      if (field==='title'){ return (dir==='asc'?1:-1) * (A.title||'').localeCompare(B.title||''); }
      if (field==='location'){ return (dir==='asc'?1:-1) * (A.loc||'').localeCompare(B.loc||''); }
      return (dir==='asc'?1:-1) * (vA - vB);
    });
    visible.forEach(c => grid.appendChild(c));
  }

  search.addEventListener('input', apply);
  sort.addEventListener('change', apply);
  apply();
}

/* Apply forms: validate + show feedback; DO NOT block if valid */
function wireApplyForms() {
  const forms = document.querySelectorAll('form[action="apply.php"]');
  forms.forEach(form => {
    const file = form.querySelector('input[type="file"]');
    const btn = form.querySelector('button[type="submit"]');

    // visible file name already handled in beautifyCards()

    form.addEventListener('submit', (e) => {
      if (!file || !file.files || !file.files[0]) {
        toast('Please select your resume file first.'); e.preventDefault(); return;
      }
      const allowed = ['pdf','doc','docx'];
      const maxMB = 5;
      const ext = file.files[0].name.split('.').pop().toLowerCase();
      const sizeMB = file.files[0].size / (1024*1024);

      if (!allowed.includes(ext)) {
        toast('Allowed file types: PDF, DOC, DOCX.'); e.preventDefault(); return;
      }
      if (sizeMB > maxMB) {
        toast(`File too large. Max ${maxMB} MB.`); e.preventDefault(); return;
      }

      // valid → allow natural submit (no preventDefault)
      if (btn) { btn.disabled = true; btn.textContent = 'Applying…'; }
    });
  });
}

/* Tiny toast */
function toast(msg){
  let t = document.querySelector('.toast');
  if (!t){
    t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => t.classList.remove('show'), 2500);
}

// === Show success toast after redirect ===
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  console.log('URL params:', Object.fromEntries(params.entries())); // <--- debug
  if (params.get('applied') === '1') {
    toast('✅ Application submitted successfully!');
    // optional: clean URL so it doesn’t repeat on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});


// === Success message after redirect ===
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('applied') === '1') {
    toast('✅ Application submitted successfully!');
    // Remove the query so it doesn't repeat
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
