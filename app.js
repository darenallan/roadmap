/* ══════════════════════════════════════════════════════════════
 *  Sanhia Roadmap — App Controller
 *  Synchronisation temps réel via Firebase Realtime Database
 * ══════════════════════════════════════════════════════════════ */

/* ── Configuration ── */
const USERS = {
  2252: { name: 'Daren', full: 'Daren Tiendrebeogo', role: 'Développeur principal' },
  3363: { name: 'Hassan', full: 'Hassan', role: 'Directeur marketing' }
};
const KEY = 'sanhia-roadmap-integrale-v2';
const DB_PATH = 'roadmap-overrides';
const $ = s => document.querySelector(s);

let user = null;
let overrides = {};
let expanded = true;
let collapsed = new Set();
let firebaseReady = false;
let dbRef = null;

/* ── Firebase Init ── */
function initFirebase() {
  try {
    // Check if Firebase SDK and config are available
    if (typeof firebase === 'undefined' || typeof FIREBASE_CONFIG === 'undefined') {
      console.warn('⚠️ Firebase non configuré — mode localStorage uniquement');
      return false;
    }
    // Check if config has real values (not placeholders)
    if (FIREBASE_CONFIG.apiKey === 'COLLE_TA_CLE_ICI') {
      console.warn('⚠️ Firebase: clés placeholder détectées — mode localStorage uniquement');
      console.warn('   → Modifie firebase-config.js avec tes vraies clés Firebase');
      return false;
    }

    firebase.initializeApp(FIREBASE_CONFIG);
    const db = firebase.database();
    dbRef = db.ref(DB_PATH);

    // Listen for real-time changes from ALL clients
    dbRef.on('value', snapshot => {
      const data = snapshot.val();
      overrides = data || {};
      // Also keep localStorage in sync as fallback
      localStorage.setItem(KEY, JSON.stringify(overrides));
      render();
    });

    firebaseReady = true;
    console.log('✅ Firebase connecté — synchronisation temps réel active');
    return true;
  } catch (err) {
    console.error('❌ Erreur Firebase:', err);
    return false;
  }
}

// Initialize Firebase, fallback to localStorage
if (!initFirebase()) {
  overrides = JSON.parse(localStorage.getItem(KEY) || '{}');
}

/* ── Data Helper ── */
const all = () => ROADMAP_DATA.flatMap(p =>
  p.steps.map(s => ({ ...s, phase: p.code, phaseName: p.name, ...(overrides[s.id] || {}) }))
);

/* ── Login ── */
$('#loginForm').onsubmit = e => {
  e.preventDefault();
  let u = USERS[$('#pin').value];
  if (!u) { $('#error').textContent = 'Code incorrect.'; return; }
  user = u;
  sessionStorage.setItem('sanhia-user', JSON.stringify(u));
  start();
};
let saved = sessionStorage.getItem('sanhia-user');
if (saved) { user = JSON.parse(saved); start(); }

function start() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  $('#hello').textContent = user.name;
  $('#userName').textContent = user.full;
  $('#role').textContent = user.role;
  $('#avatar').textContent = user.name.slice(0, 2).toUpperCase();
  // Show sync status indicator
  updateSyncStatus();
  render();
}

/* ── Sync Status ── */
function updateSyncStatus() {
  const el = $('#syncStatus');
  if (!el) return;
  if (firebaseReady) {
    el.textContent = '● Sync temps réel';
    el.style.color = '#0e9e73';
  } else {
    el.textContent = '○ Mode local';
    el.style.color = '#d78b09';
  }
}

/* ── Filters ── */
ROADMAP_DATA.forEach(p =>
  $('#phaseFilter').insertAdjacentHTML('beforeend',
    `<option value="${p.code}">Phase ${p.code} · ${esc(p.name)}</option>`)
);
['search', 'phaseFilter', 'statusFilter'].forEach(id =>
  $('#' + id).addEventListener(id === 'search' ? 'input' : 'change', render)
);

/* ── Render ── */
function render() {
  let items = all();
  let done = items.filter(x => x.status === 'done').length;
  let doing = items.filter(x => x.status === 'doing').length;
  let total = items.length;
  let pct = Math.round(done / total * 100);

  $('#done').textContent = done;
  $('#doing').textContent = doing;
  $('#pct').textContent = $('#statPct').textContent = pct + '%';
  $('#bar').style.width = pct + '%';
  $('#ring').style.strokeDashoffset = 314 - 314 * pct / 100;
  if ($('#total')) $('#total').textContent = total;
  if ($('#phaseTotal')) $('#phaseTotal').textContent = ROADMAP_DATA.length;
  $('#phaseDone').textContent = ROADMAP_DATA.filter(p =>
    items.filter(x => x.phase === p.code).every(x => x.status === 'done')
  ).length;

  let q = $('#search').value.trim().toLowerCase();
  let pf = $('#phaseFilter').value;
  let sf = $('#statusFilter').value;
  let filtered = items.filter(x =>
    (pf === 'all' || x.phase === pf) &&
    (sf === 'all' || x.status === sf) &&
    [x.title, x.objective, x.files, x.instructions, x.validation, x.originalStatus, x.note]
      .join(' ').toLowerCase().includes(q)
  );

  $('#results').textContent = filtered.length + ' étape' + (filtered.length > 1 ? 's' : '') +
    ' affichée' + (filtered.length > 1 ? 's' : '');
  $('#phases').innerHTML = ROADMAP_DATA.map(p => phaseHTML(p, filtered, items)).join('') ||
    '<div class="scope">Aucun résultat.</div>';

  $('#scopeContent').innerHTML = markdownSimple(
    OUT_OF_SCOPE.replace(/^## Hors périmètre de cette roadmap\s*/, '')
  ).replace(/^<h3>.*?<\/h3>/, '');
}

/* ── Phase HTML ── */
function phaseHTML(p, filtered, items) {
  let arr = filtered.filter(x => x.phase === p.code);
  if (!arr.length) return '';
  let pa = items.filter(x => x.phase === p.code);
  let d = pa.filter(x => x.status === 'done').length;
  let pc = Math.round(d / pa.length * 100);
  let isClosed = collapsed.has(p.code);
  let introText = esc(p.intro).replace(/^&gt;\s*/, '');
  return `<article class="phase ${isClosed ? 'closed' : ''}">` +
    `<div class="phase-head" onclick="togglePhase('${p.code}',this.parentElement)">` +
    `<span class="phase-code">${p.code}</span>` +
    `<div class="phase-name"><b>Phase ${p.code} · ${esc(p.name)}</b>` +
    `<p>${introText}</p></div>` +
    `<div class="phase-progress"><i style="width:${pc}%"></i></div>` +
    `<span class="phase-percent">${pc}%</span>` +
    `<span class="arrow">⌄</span></div>` +
    `<div class="steps">${arr.map(stepHTML).join('')}</div></article>`;
}

/* ── Step HTML ── */
function stepHTML(x) {
  let labels = { todo: 'Non commencé', doing: 'En cours', done: 'Terminé' };
  let filesHtml = renderInlineCode(esc(x.files));
  let instructionsHtml = renderInlineCode(esc(x.instructions));
  let validationHtml = renderInlineCode(esc(x.validation));
  return `<article class="step ${x.status}">` +
    `<div class="step-summary">` +
    `<button class="check" onclick="toggle(${x.id})">✓</button>` +
    `<div class="step-title"><b>Étape ${x.id} : ${esc(x.title)}</b>` +
    `<small>${x.assignee ? 'Responsable : ' + esc(x.assignee) : 'Non attribué'}` +
    `${x.completedAt ? ' · ' + x.completedAt : ''}` +
    `${x.note ? ' · Note : ' + esc(x.note) : ''}</small></div>` +
    `<span class="badge ${x.status}">${labels[x.status]}</span>` +
    `<button class="edit" onclick="edit(${x.id})">Modifier</button></div>` +
    `<div class="details">` +
    `<section class="detail wide"><h4>Objectif</h4><p>${esc(x.objective)}</p></section>` +
    `<section class="detail"><h4>Fichiers impactés</h4><p>${filesHtml}</p></section>` +
    `<section class="detail status"><h4>Statut original du document</h4><p>${esc(x.originalStatus)}</p></section>` +
    `<section class="detail wide"><h4>Instructions d'exécution</h4><p>${instructionsHtml}</p></section>` +
    `<section class="detail wide validation"><h4>Critères de validation</h4><p>${validationHtml}</p></section>` +
    `</div></article>`;
}

/* ── Toggle & Edit ── */
window.toggle = id => {
  let x = all().find(v => v.id === id);
  let status = x.status === 'done' ? 'todo' : 'done';
  overrides[id] = {
    ...(overrides[id] || {}),
    status,
    completedAt: status === 'done' ? new Date().toISOString().slice(0, 10) : '',
    assignee: x.assignee || user.name,
    updatedBy: user.name
  };
  save('Étape mise à jour');
};

window.edit = id => {
  let x = all().find(v => v.id === id);
  $('#editId').value = id;
  $('#editPhase').textContent = 'PHASE ' + x.phase;
  $('#editTitle').textContent = 'Étape ' + id + ' : ' + x.title;
  $('#editStatus').value = x.status;
  $('#assignee').value = x.assignee || '';
  $('#note').value = x.note || '';
  $('#editDialog').showModal();
};

$('#close').onclick = () => $('#editDialog').close();

$('#editForm').onsubmit = e => {
  e.preventDefault();
  let id = +$('#editId').value;
  let x = all().find(v => v.id === id);
  let status = $('#editStatus').value;
  overrides[id] = {
    ...(overrides[id] || {}),
    status,
    assignee: $('#assignee').value,
    note: $('#note').value.trim(),
    completedAt: status === 'done' ? (x.completedAt || new Date().toISOString().slice(0, 10)) : '',
    updatedBy: user.name
  };
  $('#editDialog').close();
  save('Modification enregistrée');
};

/* ── Save: Firebase (primary) + localStorage (fallback) ── */
function save(msg) {
  if (firebaseReady && dbRef) {
    // Write to Firebase → the onValue listener will auto-trigger render() for ALL clients
    dbRef.set(overrides).catch(err => {
      console.error('Erreur sauvegarde Firebase:', err);
      // Fallback to localStorage if Firebase write fails
      localStorage.setItem(KEY, JSON.stringify(overrides));
      render();
    });
  } else {
    // No Firebase — use localStorage only (single-user mode)
    localStorage.setItem(KEY, JSON.stringify(overrides));
    render();
  }
  toast(msg);
}

/* ── Phase collapse toggle ── */
window.togglePhase = (code, el) => {
  if (collapsed.has(code)) {
    collapsed.delete(code);
  } else {
    collapsed.add(code);
  }
  el.classList.toggle('closed');
};

/* ── Toolbar actions ── */
$('#expand').onclick = () => {
  expanded = !expanded;
  $('#expand').textContent = expanded ? 'Tout réduire' : 'Tout développer';
  if (expanded) {
    collapsed.clear();
  } else {
    ROADMAP_DATA.forEach(p => collapsed.add(p.code));
  }
  document.querySelectorAll('.phase').forEach(x => x.classList.toggle('closed', !expanded));
};

$('#logout').onclick = () => {
  sessionStorage.removeItem('sanhia-user');
  location.reload();
};

$('#menu').onclick = () => document.querySelector('aside').classList.toggle('open');

document.querySelectorAll('[data-go]').forEach(b =>
  b.onclick = () => {
    document.getElementById(b.dataset.go).scrollIntoView();
    document.querySelector('aside').classList.remove('open');
  }
);

$('#reset').onclick = () => {
  if (confirm('Réinitialiser TOUT le suivi ? Cette action est irréversible et affecte tous les utilisateurs.')) {
    overrides = {};
    save('Suivi réinitialisé');
  }
};

$('#export').onclick = () => {
  let b = new Blob(
    [JSON.stringify({ exportedBy: user, exportedAt: new Date().toISOString(), roadmap: all() }, null, 2)],
    { type: 'application/json' }
  );
  let a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'sanhia-roadmap-complete.json';
  a.click();
};

/* ── Utilities ── */
function esc(v = '') {
  return String(v).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function renderInlineCode(s) {
  return s.replace(/`([^`]+)`/g, '<code style="background:#eef3fa;padding:2px 5px;border-radius:4px;font-size:10px;color:#1a3a5c">$1</code>');
}

function toast(t) {
  $('#toast').textContent = t;
  $('#toast').classList.add('show');
  setTimeout(() => $('#toast').classList.remove('show'), 1800);
}

function markdownSimple(s) {
  let lines = s.split('\\n');
  let out = lines.map(l => {
    if (l.startsWith('- ')) {
      let content = esc(l.slice(2)).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      return '<li>' + content + '</li>';
    }
    if (l.trim()) {
      let content = esc(l).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      return '<p>' + content + '</p>';
    }
    return '';
  }).join('');
  return '<div class="scope-content"><ul>' + out + '</ul></div>';
}