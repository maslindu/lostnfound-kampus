let allItems = [];
let currentUser = null;

// Update navbar sesuai status login
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    updateNavbar(user);
  } else {
    const navLogin = document.getElementById('nav-login');
    if (navLogin) navLogin.style.display = 'inline-block';
  }
  applyFilter(); // re-render with auth status
});

// ===== Load & Render =====

function loadItems() {
  document.getElementById('loading').style.display = 'block';

  db.collection('items')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      allItems = [];
      snapshot.forEach(doc => allItems.push({ id: doc.id, ...doc.data() }));
      document.getElementById('loading').style.display = 'none';
      applyFilter();
    }, err => {
      console.error(err);
      document.getElementById('loading').style.display = 'none';
      document.getElementById('empty-state').style.display = 'block';
    });
}

function applyFilter() {
  const search = document.getElementById('search').value.toLowerCase().trim();
  const status = document.getElementById('filter-status').value;

  let result = allItems;

  if (search) {
    result = result.filter(item =>
      item.namaBarang.toLowerCase().includes(search) ||
      item.kategori.toLowerCase().includes(search) ||
      (item.lokasi && item.lokasi.toLowerCase().includes(search))
    );
  }

  if (status) {
    result = result.filter(item => item.status === status);
  }

  renderItems(result);
}

function renderItems(items) {
  const grid  = document.getElementById('items-grid');
  const empty = document.getElementById('empty-state');

  if (items.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = items.map(item => {
    const isOwner = currentUser && currentUser.uid === item.userId;
    const isDitemukan = item.status === 'Ditemukan';
    const isApproved = item.claimStatus === 'approved';
    const shouldBlur = isDitemukan && !isOwner && !isApproved;

    return `
    <div class="card ${statusCardClass(item.status)}" onclick="window.location.href='detail.html?id=${item.id}'">
      ${item.foto
        ? `<div style="position:relative">
             <img class="card-img ${shouldBlur ? 'blurred-content' : ''}" src="${item.foto}" alt="${escHtml(item.namaBarang)}">
             ${shouldBlur ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:var(--text-primary); font-weight:bold; background:rgba(255,255,255,0.8); padding:4px 8px; border-radius:8px; font-size:0.8rem; z-index:1;">Disensor</div>` : ''}
           </div>`
        : `<div class="card-img-placeholder"><i data-lucide="image" style="width:48px;height:48px;color:#cbd5e1;"></i></div>`}
      <div class="card-body">
        <span class="badge ${statusClass(item.status)}">${item.status}</span>
        <h3 class="card-title">${escHtml(item.namaBarang)}</h3>
        <p class="card-meta"><i data-lucide="folder" class="meta-icon"></i> ${escHtml(item.kategori)}</p>
        <p class="card-meta"><i data-lucide="map-pin" class="meta-icon"></i> ${escHtml(item.lokasi)}</p>
        <p class="card-meta"><i data-lucide="clock" class="meta-icon"></i> ${formatDate(item.createdAt)}</p>
      </div>
    </div>
    `;
  }).join('');

  setTimeout(() => lucide.createIcons(), 0);
}

// ===== Helpers =====

function statusClass(status) {
  return { 'Hilang': 'badge-danger', 'Ditemukan': 'badge-success', 'Sudah Dikembalikan': 'badge-info' }[status] || 'badge-secondary';
}

function statusCardClass(status) {
  return { 'Hilang': 'card-hilang', 'Ditemukan': 'card-ditemukan', 'Sudah Dikembalikan': 'card-dikembalikan' }[status] || '';
}

function formatDate(ts) {
  if (!ts) return '-';
  return new Date(ts.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Event Listeners =====

document.getElementById('search').addEventListener('input', applyFilter);
document.getElementById('filter-status').addEventListener('change', applyFilter);

loadItems();
