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
  const navUser   = document.getElementById('nav-user');
  const navLogout = document.getElementById('nav-logout');
  const navCreate = document.getElementById('nav-create');
  const navLogin  = document.getElementById('nav-login');

  if (navUser)   navUser.textContent = user.displayName;
  if (navLogout) navLogout.style.display = 'inline-block';
  if (navCreate) navCreate.style.display = 'inline-block';
  if (navLogin)  navLogin.style.display = 'none';
}
