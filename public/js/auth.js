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
