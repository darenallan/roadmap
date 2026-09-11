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
const COMP_KEY = 'sanhia-composants-v1';
const DB_PATH = 'roadmap-overrides';
const COMP_DB_PATH = 'composant-overrides';
const $ = s => document.querySelector(s);

let user = null;
let overrides = {};
let compOverrides = {};
let expanded = true;
let collapsed = new Set();
let firebaseReady = false;
let dbRef = null;
let compDbRef = null;
let currentPage = 'roadmap'; // 'roadmap' or 'composants'

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
    compDbRef = db.ref(COMP_DB_PATH);

    // Listen for real-time changes from ALL clients
    dbRef.on('value', snapshot => {
      const data = snapshot.val();
      overrides = data || {};
      localStorage.setItem(KEY, JSON.stringify(overrides));
      render();
    });

    // Listen for composant changes
    compDbRef.on('value', snapshot => {
      const data = snapshot.val();
      compOverrides = data || {};
      localStorage.setItem(COMP_KEY, JSON.stringify(compOverrides));
      renderComposants();
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
  compOverrides = JSON.parse(localStorage.getItem(COMP_KEY) || '{}');
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
  renderComposants();
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

/* ── Navigation with page switching ── */
document.querySelectorAll('[data-go]').forEach(b =>
  b.onclick = () => {
    let target = b.dataset.go;

    // Update active nav state
    document.querySelectorAll('[data-go]').forEach(n => n.classList.remove('nav-active'));
    b.classList.add('nav-active');

    // Close mobile menu
    document.querySelector('aside').classList.remove('open');

    // Handle page switching
    let roadmapSections = document.querySelectorAll('.hero, .stats, #roadmap');
    let composantsPage = $('#composants');
    let scopeSection = $('#scope');

    if (target === 'composants') {
      // Show composants, hide roadmap sections
      roadmapSections.forEach(s => s.style.display = 'none');
      scopeSection.style.display = 'none';
      composantsPage.style.display = 'block';
      currentPage = 'composants';
      renderComposants();
    } else if (target === 'scope') {
      // Show scope, hide composants, show roadmap stuff
      roadmapSections.forEach(s => s.style.display = '');
      composantsPage.style.display = 'none';
      scopeSection.style.display = '';
      currentPage = 'roadmap';
      document.getElementById('scope').scrollIntoView();
    } else {
      // Show roadmap sections, hide composants
      roadmapSections.forEach(s => s.style.display = '');
      composantsPage.style.display = 'none';
      scopeSection.style.display = '';
      currentPage = 'roadmap';
      document.getElementById(target).scrollIntoView();
    }
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

/* ══════════════════════════════════════════════════════════════
 *  COMPOSANTS PAGE — Rendering with toggle & progress
 * ══════════════════════════════════════════════════════════════ */

/* Generate a unique key for each composant item */
function compKey(sectionId, index) {
  return 'c' + sectionId + '_' + index;
}

/* Get effective status: override if checked, otherwise original */
function getCompStatus(sectionId, index, originalStatut) {
  let key = compKey(sectionId, index);
  if (compOverrides[key] && compOverrides[key].status) return compOverrides[key].status;
  return originalStatut;
}

/* Build enriched items list with effective statuses */
function allComps() {
  let items = [];
  COMPOSANTS_DATA.forEach(section => {
    section.items.forEach((item, idx) => {
      let key = compKey(section.id, idx);
      let ov = compOverrides[key] || {};
      items.push({
        ...item,
        sectionId: section.id,
        sectionName: section.name,
        index: idx,
        key: key,
        effectiveStatus: ov.status || item.statut,
        checkedBy: ov.checkedBy || '',
        checkedAt: ov.checkedAt || '',
        compNote: ov.note || ''
      });
    });
  });
  return items;
}

function renderComposants() {
  if (typeof COMPOSANTS_DATA === 'undefined') return;

  let items = allComps();
  let totalCount = items.length;
  let trouveCount = items.filter(i => i.effectiveStatus === 'trouve').length;
  let existCount = items.filter(i => i.effectiveStatus === 'existe' || i.effectiveStatus === 'existe_partiel').length;
  let searchCount = items.filter(i => i.effectiveStatus === 'a_chercher').length;
  let progressCount = trouveCount + existCount;
  let pct = Math.round(progressCount / totalCount * 100);

  $('#compTotal').textContent = totalCount;
  $('#compExist').textContent = existCount;
  $('#compSearch').textContent = searchCount;
  $('#compTrouve').textContent = trouveCount;

  // Update progress ring
  let ringEl = $('#compRing');
  if (ringEl) ringEl.style.strokeDashoffset = 314 - 314 * pct / 100;
  let pctEl = $('#compPct');
  if (pctEl) pctEl.textContent = pct + '%';
  let compBarEl = $('#compBar');
  if (compBarEl) compBarEl.style.width = pct + '%';
  let compStatPctEl = $('#compStatPct');
  if (compStatPctEl) compStatPctEl.textContent = pct + '%';

  // Apply filters
  let q = ($('#compSearchInput') ? $('#compSearchInput').value : '').trim().toLowerCase();
  let pf = ($('#compPlatformFilter') ? $('#compPlatformFilter').value : 'all');
  let sf = ($('#compStatusFilter') ? $('#compStatusFilter').value : 'all');

  let html = COMPOSANTS_DATA.map(section => {
    let sectionItems = items.filter(i => i.sectionId === section.id);
    let filtered = sectionItems.filter(item =>
      (pf === 'all' || item.plateforme === pf) &&
      (sf === 'all' || item.effectiveStatus === sf) &&
      [item.composant, item.destination, item.note, item.plateforme, item.compNote]
        .join(' ').toLowerCase().includes(q)
    );

    if (!filtered.length) return '';

    let sectionDone = sectionItems.filter(i => i.effectiveStatus === 'trouve' || i.effectiveStatus === 'existe' || i.effectiveStatus === 'existe_partiel').length;
    let sectionTrouve = sectionItems.filter(i => i.effectiveStatus === 'trouve').length;
    let sectionSearch = sectionItems.filter(i => i.effectiveStatus === 'a_chercher').length;
    let sectionPct = Math.round(sectionDone / sectionItems.length * 100);

    return `<article class="comp-section">
      <div class="comp-section-head">
        <span class="phase-code">${section.id}</span>
        <div class="comp-section-info">
          <b>${esc(section.name)}</b>
          <small>${sectionItems.length} composant${sectionItems.length > 1 ? 's' : ''} · ${sectionDone} prêt${sectionDone > 1 ? 's' : ''} · ${sectionSearch} à chercher${sectionTrouve ? ' · ' + sectionTrouve + ' trouvé' + (sectionTrouve > 1 ? 's' : '') : ''}</small>
        </div>
        <div class="phase-progress"><i style="width:${sectionPct}%;${sectionPct === 100 ? 'background:var(--green)' : ''}"></i></div>
        <span class="phase-percent">${sectionPct}%</span>
      </div>
      <div class="comp-table-wrap">
        <table class="comp-table">
          <thead><tr><th style="width:30px"></th><th>Composant</th><th>Plateforme</th><th>Statut</th><th>Destination</th><th>Note</th></tr></thead>
          <tbody>${filtered.map(compRowHTML).join('')}</tbody>
        </table>
      </div>
    </article>`;
  }).join('');

  $('#composantsSections').innerHTML = html || '<div class="scope" style="text-align:center;padding:40px">Aucun composant ne correspond aux filtres.</div>';

  // Render priorities
  if (typeof COMPOSANTS_PRIORITIES !== 'undefined') {
    $('#priorityList').innerHTML = COMPOSANTS_PRIORITIES.map(p =>
      `<div class="priority-item">
        <span class="priority-rank">${p.rank}</span>
        <div><b>${esc(p.section)}</b><small>${esc(p.reason)}</small></div>
      </div>`
    ).join('');
  }
}

function compRowHTML(item) {
  let statusLabels = {
    'a_chercher': 'À chercher',
    'existe': 'Existe',
    'existe_partiel': 'Partiel',
    'trouve': 'Trouvé ✓'
  };
  let statusClass = {
    'a_chercher': 'comp-status-search',
    'existe': 'comp-status-exist',
    'existe_partiel': 'comp-status-partial',
    'trouve': 'comp-status-trouve'
  };
  let platformClass = {
    'Web': 'plat-web',
    'Mobile': 'plat-mobile',
    'Web + Mobile': 'plat-both'
  };
  let isDone = item.effectiveStatus === 'trouve' || item.effectiveStatus === 'existe';
  let meta = '';
  if (item.checkedBy) meta += esc(item.checkedBy);
  if (item.checkedAt) meta += ' · ' + item.checkedAt;
  if (item.compNote) meta += (meta ? ' · ' : '') + esc(item.compNote);

  return `<tr class="${isDone ? 'comp-row-done' : ''} ${statusClass[item.effectiveStatus] || ''}">
    <td><button class="comp-check ${isDone ? 'checked' : ''}" onclick="toggleComp(${item.sectionId},${item.index},'${item.statut}')">✓</button></td>
    <td class="comp-name">${esc(item.composant)}${meta ? '<small class="comp-meta">' + meta + '</small>' : ''}</td>
    <td><span class="plat-badge ${platformClass[item.plateforme] || ''}">${esc(item.plateforme)}</span></td>
    <td><span class="comp-badge ${statusClass[item.effectiveStatus] || ''}">${statusLabels[item.effectiveStatus] || item.effectiveStatus}</span></td>
    <td class="comp-dest"><code>${esc(item.destination)}</code></td>
    <td class="comp-note">${item.note ? esc(item.note) : '—'}</td>
  </tr>`;
}

/* ── Toggle composant status ── */
window.toggleComp = (sectionId, index, originalStatut) => {
  let key = compKey(sectionId, index);
  let current = compOverrides[key];
  let isChecked = current && current.status === 'trouve';

  if (isChecked) {
    // Uncheck — remove override to go back to original status
    delete compOverrides[key];
  } else {
    // Check — mark as found
    compOverrides[key] = {
      status: 'trouve',
      checkedBy: user.name,
      checkedAt: new Date().toISOString().slice(0, 10),
      note: (current && current.note) || ''
    };
  }
  saveComp(isChecked ? 'Composant décoché' : 'Composant marqué trouvé ✓');
};

/* ── Save composant overrides ── */
function saveComp(msg) {
  if (firebaseReady && compDbRef) {
    compDbRef.set(compOverrides).catch(err => {
      console.error('Erreur sauvegarde composants Firebase:', err);
      localStorage.setItem(COMP_KEY, JSON.stringify(compOverrides));
      renderComposants();
    });
  } else {
    localStorage.setItem(COMP_KEY, JSON.stringify(compOverrides));
    renderComposants();
  }
  toast(msg);
}

// Composants filters
['compSearchInput', 'compPlatformFilter', 'compStatusFilter'].forEach(id => {
  let el = $('#' + id);
  if (el) el.addEventListener(id === 'compSearchInput' ? 'input' : 'change', renderComposants);
});

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