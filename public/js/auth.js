// ===== Theme =====
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  _syncThemeIcon();
}

function _syncThemeIcon() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.textContent = isDark ? '☀️' : '🌙';
  btn.title = isDark ? 'Mode Terang' : 'Mode Gelap';
}

// Sync icon on load (theme already applied via inline script in <head>)
document.addEventListener('DOMContentLoaded', _syncThemeIcon);

function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => { window.location.href = 'index.html'; })
    .catch(err => {
      console.error(err);
      alert('Login gagal. Pastikan popup tidak diblokir oleh browser.');
    });
}

function logout() {
  if (confirm('Yakin ingin keluar?')) {
    auth.signOut().then(() => { window.location.href = 'login.html'; });
  }
}

// Redirect ke login jika belum login
function requireAuth() {
  auth.onAuthStateChanged(user => {
    if (!user) window.location.href = 'login.html';
  });
}

// Update elemen navbar sesuai data user
function updateNavbar(user) {
  const navUser = document.getElementById('nav-user');
  const navLogout = document.getElementById('nav-logout');
  const navLogin = document.getElementById('nav-login');
  const navCreate = document.getElementById('nav-create');
  const navNotifContainer = document.getElementById('nav-notif-container');

  if (navUser) navUser.textContent = user.displayName;
  if (navLogout) navLogout.style.display = 'inline-block';
  if (navLogin) navLogin.style.display = 'none';
  if (navCreate) navCreate.style.display = 'inline-flex';
  if (navNotifContainer) {
    navNotifContainer.style.display = 'flex';
    listenToNotifications(user.uid);
  }
}

// ===== Global Notifications =====
let notifUnsubscribe = null;

function listenToNotifications(uid) {
  if (notifUnsubscribe) notifUnsubscribe(); // Hapus listener lama jika ada

  notifUnsubscribe = db.collection('items')
    .where('userId', '==', uid)
    .where('claimStatus', '==', 'pending')
    .onSnapshot(snapshot => {
      const badge = document.getElementById('notif-badge');
      const list = document.getElementById('notif-list');
      if (!badge || !list) return;

      if (snapshot.empty) {
        badge.style.display = 'none';
        list.innerHTML = '<div class="notif-empty">Tidak ada notifikasi baru.</div>';
        return;
      }

      badge.style.display = 'inline-block';
      badge.textContent = snapshot.size;

      let html = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const isHilang = data.status === 'Hilang';
        const titleText = isHilang ? 'Ada yang menemukan barang Anda!' : 'Ada Permintaan Klaim!';
        html += `
          <a href="detail.html?id=${doc.id}" class="notif-item">
            <div class="notif-title">${titleText}</div>
            <div class="notif-desc">${data.namaBarang}</div>
          </a>
        `;
      });
      list.innerHTML = html;
    }, err => console.error("Error notif:", err));
}

function toggleNotifDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

// Tutup dropdown jika klik di luar
document.addEventListener('click', (e) => {
  const container = document.getElementById('nav-notif-container');
  const dropdown = document.getElementById('notif-dropdown');
  if (container && dropdown && !container.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});
