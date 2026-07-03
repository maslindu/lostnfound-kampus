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

// ===== Geolokasi =====
function getLokasiSekarang() {
  const info = document.getElementById('lokasi-info');
  const latInput = document.getElementById('lat');
  const lngInput = document.getElementById('lng');

  if (!navigator.geolocation) {
    info.textContent = "Geolokasi tidak didukung oleh browser Anda.";
    info.style.color = "red";
    return;
  }

  info.textContent = "Mencari lokasi...";
  info.style.color = "var(--text-muted)";

  navigator.geolocation.getCurrentPosition(pos => {
    latInput.value = pos.coords.latitude;
    lngInput.value = pos.coords.longitude;
    info.textContent = "✓ Koordinat berhasil disimpan (" + pos.coords.latitude.toFixed(5) + ", " + pos.coords.longitude.toFixed(5) + ")";
    info.style.color = "var(--color-ditemukan)";
  }, err => {
    console.error(err);
    info.textContent = "Gagal mengambil lokasi. Pastikan izin GPS diberikan.";
    info.style.color = "red";
  });
}

// ===== Opsi Penyimpanan =====
function togglePenyimpanan() {
  const val = document.querySelector('input[name="penyimpanan"]:checked').value;
  const group = document.getElementById('kontak-group');
  const input = document.getElementById('kontakPenyimpanan');
  
  if (val === 'dititipkan') {
    group.style.display = 'block';
    input.required = true;
  } else {
    group.style.display = 'none';
    input.required = false;
    input.value = '';
  }
}

// ===== Opsi Lokasi Detail =====
function toggleLokasiDetail() {
  const status = document.getElementById('status').value;
  const group = document.getElementById('lokasi-detail-group');
  const input = document.getElementById('lokasiDetail');
  
  if (status === 'Ditemukan') {
    group.style.display = 'block';
  } else {
    group.style.display = 'none';
    if (input) input.value = '';
  }
}

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
    const lokasiDetail = document.getElementById('lokasiDetail') ? document.getElementById('lokasiDetail').value.trim() : '';
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

    const penyimpanan = document.querySelector('input[name="penyimpanan"]:checked').value;
    const kontakPenyimpanan = document.getElementById('kontakPenyimpanan').value.trim();
    const lat = document.getElementById('lat').value ? parseFloat(document.getElementById('lat').value) : null;
    const lng = document.getElementById('lng').value ? parseFloat(document.getElementById('lng').value) : null;

    await db.collection('items').add({
      namaBarang,
      kategori,
      lokasi,
      lokasiDetail,
      status,
      deskripsi,
      foto,
      penyimpanan,
      kontakPenyimpanan,
      lat,
      lng,
      claimStatus: '', 
      claimBy: '',
      claimCiriCiri: '',
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
