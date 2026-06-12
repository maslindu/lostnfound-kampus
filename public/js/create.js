requireAuth();

let currentUser = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    updateNavbar(user);
  }
});

// ===== Kompres foto jadi Base64 (tanpa Firebase Storage) =====
// Resize ke maks 800px lalu encode JPEG. Hasilnya disimpan langsung
// di dokumen Firestore sebagai string Base64 (data URL).
function compressImage(file, maxSize = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round(height * maxSize / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round(width * maxSize / height);
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Preview foto yang dipilih
const fotoInput   = document.getElementById('foto');
const fotoPreview = document.getElementById('foto-preview');
fotoInput.addEventListener('change', async () => {
  const file = fotoInput.files[0];
  if (!file) {
    fotoPreview.style.display = 'none';
    return;
  }
  const dataUrl = await compressImage(file);
  fotoPreview.src = dataUrl;
  fotoPreview.style.display = 'block';
});

// Submit form buat laporan
document.getElementById('create-form').addEventListener('submit', async e => {
  e.preventDefault();

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  try {
    const namaBarang = document.getElementById('namaBarang').value.trim();
    const kategori   = document.getElementById('kategori').value;
    const lokasi     = document.getElementById('lokasi').value.trim();
    const status     = document.getElementById('status').value;
    const deskripsi  = document.getElementById('deskripsi').value.trim();

    // Kompres foto (jika ada) jadi Base64
    let foto = '';
    if (fotoInput.files[0]) {
      foto = await compressImage(fotoInput.files[0]);
      // Firestore batas 1 MB per dokumen. Tolak kalau masih terlalu besar.
      if (foto.length > 900000) {
        foto = await compressImage(fotoInput.files[0], 600, 0.5);
      }
    }

    await db.collection('items').add({
      namaBarang,
      kategori,
      lokasi,
      status,
      deskripsi,
      foto,
      userId:    currentUser.uid,
      namaUser:  currentUser.displayName,
      emailUser: currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('Laporan berhasil dibuat!');
    window.location.href = 'index.html';

  } catch (err) {
    console.error(err);
    alert('Gagal membuat laporan. Coba lagi.');
    btn.disabled = false;
    btn.textContent = 'Buat Laporan';
  }
});
