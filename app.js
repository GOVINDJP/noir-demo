const $ = selector => document.querySelector(selector);
const STORAGE_KEY = 'noir-demo-watchlist-v1';
let titles = [];
let saved = [];
let page = 'home';
let query = '';
let storageAvailable = true;

const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
}

function validateList(value) {
  if (!Array.isArray(value)) return [];
  const known = new Set(titles.map(title => title.id));
  return [...new Set(value.filter(id => typeof id === 'string' && known.has(id)))];
}

function loadList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    try { saved = validateList(raw ? JSON.parse(raw) : []); }
    catch { saved = []; }
  } catch {
    saved = [];
    storageAvailable = false;
  }
}

function updateNotice() {
  $('#demo-notice').textContent = storageAvailable
    ? 'Portfolio demo · My List is saved only on this device'
    : 'Portfolio demo · Browser storage unavailable; My List lasts for this visit';
}

function card(title) {
  const selected = saved.includes(title.id);
  return `<article class="card">
    <button class="poster" data-detail="${esc(title.id)}" aria-label="View ${esc(title.title)}">
      <img src="./art/${esc(title.id)}.png" alt="" loading="lazy">
      <span class="card-badge">${esc(title.genre)}</span>
      <span class="poster-title">${esc(title.title)}</span>
      <span class="card-play" aria-hidden="true">▶</span>
    </button>
    <div class="card-bottom"><div><h3>${esc(title.title)}</h3><p>${title.year} <span>·</span> ${esc(title.duration)}</p></div>
      <button class="save ${selected ? 'saved' : ''}" data-save="${esc(title.id)}" aria-label="${selected ? 'Remove' : 'Save'} ${esc(title.title)}" aria-pressed="${selected}">${selected ? '✓' : '+'}</button>
    </div>
  </article>`;
}

function row(label, subtitle, items) {
  return `<section class="catalog-section"><div class="section-heading"><div><h2>${label}</h2><p>${subtitle}</p></div><span class="collection-count">${items.length} TITLES</span></div><div class="row">${items.map(card).join('')}</div></section>`;
}

function render() {
  $('#count').textContent = saved.length;
  document.querySelectorAll('.nav').forEach(button => {
    const active = button.dataset.page === page && !query;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  updateNotice();
  let html;
  if (query) {
    const search = query.toLowerCase();
    const found = titles.filter(title => `${title.title} ${title.genre} ${title.description}`.toLowerCase().includes(search));
    html = `<section class="browse"><div class="eyebrow">FIND YOUR NEXT STORY</div><h1>Search results</h1><p>${found.length} result${found.length === 1 ? '' : 's'} for “${esc(query)}”</p><div class="grid">${found.map(card).join('')}</div>${found.length ? '' : '<div class="empty">No titles found. Try “Sci-Fi”, “Drama”, or “Bunny”.</div>'}</section>`;
  } else if (page === 'list') {
    const list = saved.map(id => titles.find(title => title.id === id)).filter(Boolean);
    html = `<section class="browse"><div class="eyebrow">A COLLECTION THAT'S ALL YOU</div><h1>My List<span class="accent">.</span></h1><p>Saved in this browser. No account needed for this demo.</p>${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : '<div class="empty"><h2>Make room for a great story.</h2><p>Tap + on any title to add it here.</p><button class="primary" data-page="home">Explore titles</button></div>'}</section>`;
  } else if (page === 'movies') {
    html = `<section class="browse"><div class="eyebrow">THE COMPLETE COLLECTION</div><h1>Every mood. Every story<span class="accent">.</span></h1><p>Explore our curated demo catalog.</p><div class="grid">${titles.map(card).join('')}</div></section>`;
  } else {
    html = `<section class="hero">
      <img class="hero-art" src="./art/orbit.png" alt="Cinematic concept cover of an astronaut looking toward a glowing orange planet" fetchpriority="high">
      <div class="hero-shade"></div>
      <div class="hero-content"><div class="eyebrow"><span class="tiny-logo">N</span> NOIR ORIGINAL CONCEPT</div>
        <p class="hero-kicker">SOME STORIES TAKE YOU FURTHER.</p><h1>THE LAST<br>ORBIT<span class="accent">.</span></h1>
        <div class="metadata"><span class="match">98% for your imagination</span><span>2026</span><span class="rating">PG</span><span>2h 08m</span><span>4K</span></div>
        <p class="hero-description">A signal from a silent planet. One last mission.<br>An extraordinary journey beyond everything we know.</p>
        <div class="hero-actions"><button class="primary" data-play="orbit">▶ &nbsp; Play sample</button><button class="secondary" data-detail="orbit">ⓘ &nbsp; More info</button></div>
        <div class="hero-note">FICTIONAL FEATURE · OPEN-FILM PLAYBACK DEMO</div>
      </div><div class="hero-index"><b>01</b><span> / 09</span><div></div></div>
    </section><div class="collections">
      ${row('Your next obsession', 'Fresh perspectives. Unforgettable worlds.', titles.slice(0, 5))}
      <section class="editorial"><div><div class="eyebrow">THE WEEKEND COLLECTION</div><h2>Get a little<br>lost in a story.</h2><p>From distant worlds to the places we call home.</p><button class="text-button" data-page="movies">Explore the collection →</button></div><div class="editorial-orbit" aria-hidden="true"><span>N</span></div></section>
      ${row('Made for a quiet night', 'Slow down. Settle in. Press play.', [titles[5], titles[6], titles[7], titles[8], titles[1]])}
    </div>`;
  }
  $('#main').innerHTML = html;
}

function details(id) {
  const title = titles.find(item => item.id === id);
  if (!title) return;
  $('#detail').dataset.title = id;
  $('#detail-content').innerHTML = `<div class="detail-art"><img src="./art/${esc(id)}.png" alt="AI-generated cinematic concept cover for ${esc(title.title)}"><h2>${esc(title.title)}</h2></div>
    <div class="detail-body"><div class="eyebrow">${esc(title.genre)} · ${title.sample ? 'ORIGINAL CONCEPT' : 'OPEN FILM'}</div>
      <div class="metadata"><span>${title.year}</span><span>${esc(title.duration)}</span><span class="rating">${esc(title.rating)}</span></div>
      <p>${esc(title.description)}</p><div class="hero-actions"><button class="primary" data-play="${esc(id)}">▶ &nbsp; Play sample</button><button class="secondary" data-save="${esc(id)}" aria-pressed="${saved.includes(id)}">${saved.includes(id) ? '✓ In My List' : '+ My List'}</button></div>
      <p class="fine">${title.sample ? 'This title is fictional portfolio content. Playback uses the credited Big Buck Bunny sample.' : 'Big Buck Bunny © 2008 Blender Foundation. Licensed under CC BY 3.0. This demo plays a 10-second excerpt.'}<br>My List is stored in this browser only.</p>
    </div>`;
  if (!$('#detail').open) $('#detail').showModal();
}

function save(id) {
  if (!titles.some(title => title.id === id)) return;
  const selected = saved.includes(id);
  saved = selected ? saved.filter(value => value !== id) : [id, ...saved];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    storageAvailable = true;
  } catch { storageAvailable = false; }
  const focused = document.activeElement;
  const focusWasSave = focused?.dataset.save === id;
  const inDetails = $('#detail').open;
  render();
  if (inDetails) details($('#detail').dataset.title);
  if (focusWasSave) {
    const scope = inDetails ? $('#detail') : $('#main');
    scope.querySelector(`[data-save="${id}"]`)?.focus();
  }
  toast(storageAvailable ? (selected ? 'Removed from My List' : 'Added to My List on this device') : 'List updated for this visit. Browser storage is unavailable.');
}

function play(id) {
  const title = titles.find(item => item.id === id);
  if (!title) return;
  $('#detail').close();
  $('#player-title').textContent = `${title.title} — Sample screening`;
  $('#video-status').textContent = '';
  $('#player').showModal();
  $('#video').play().catch(() => {
    $('#video-status').textContent = 'Press play to begin the sample film.';
  });
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.detail) details(button.dataset.detail);
  if (button.dataset.save) save(button.dataset.save);
  if (button.dataset.play) play(button.dataset.play);
  if (button.dataset.page) {
    page = button.dataset.page;
    query = '';
    $('#search').value = '';
    render();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  if (button.classList.contains('close')) button.closest('dialog').close();
  if (button.hasAttribute('data-retry')) location.reload();
});
$('#search').addEventListener('input', event => { query = event.target.value.trim(); render(); });
$('#player').addEventListener('close', () => $('#video').pause());
$('#video').addEventListener('error', () => { $('#video-status').textContent = 'The sample could not load. Refresh the page and try again.'; });
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  loadList();
  render();
  if ($('#detail').open) details($('#detail').dataset.title);
});

async function start() {
  try {
    const response = await fetch('./catalog.json');
    if (!response.ok) throw new Error('Catalog unavailable');
    const catalog = await response.json();
    if (!Array.isArray(catalog) || catalog.length !== 9 || !catalog.every(title => /^[a-z]+$/.test(title.id) && typeof title.title === 'string')) {
      throw new Error('Invalid catalog');
    }
    titles = catalog;
    loadList();
    render();
  } catch {
    $('#main').innerHTML = '<section class="empty load-error"><h1>Unable to load NOIR</h1><p>Check your connection and try again.</p><button class="primary" data-retry>Try again</button></section>';
  }
}
start();
