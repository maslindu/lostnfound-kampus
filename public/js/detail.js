const urlParams = new URLSearchParams(window.location.search);
const itemId    = urlParams.get('id');

if (!itemId) window.location.href = 'index.html';

let currentUser = null;
let itemData    = null;
let mapInstance = null;

auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user) updateNavbar(user);
  loadItem();
});

// ===== Load =====
async function loadItem() {
  try {
    const doc = await db.collection('items').doc(itemId).get();
    if (!doc.exists) {
      alert('Laporan tidak ditemukan.');
      window.location.href = 'index.html';
      return;
    }
    itemData = { id: doc.id, ...doc.data() };
    render();
  } catch (err) {
    console.error(err);
    document.getElementById('detail-content').innerHTML = '<p style="color:red">Gagal memuat data.</p>';
  }
}

// ===== Render =====
function render() {
  const isOwner = currentUser && currentUser.uid === itemData.userId;
  const isDitemukan = itemData.status === 'Ditemukan';
  const isTitipan = itemData.penyimpanan === 'dititipkan';
  const isApproved = itemData.claimStatus === 'approved';
  const isPending = itemData.claimStatus === 'pending';
  const hasMapData = itemData.lat && itemData.lng;
  
  // Sembunyikan detail sensitif jika barang "Ditemukan", bukan milik sendiri, dan belum di-ACC
  const shouldBlur = isDitemukan && !isOwner && !isApproved;
  const showClaimButton = isDitemukan && !isOwner && !isApproved && !isPending;
  const showPendingStatus = isDitemukan && !isOwner && isPending;

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-header">
      <div>
        <span class="badge ${statusClass(itemData.status)}">${itemData.status}</span>
        <h1 class="detail-title">${escHtml(itemData.namaBarang)}</h1>
      </div>
      ${isOwner ? `
        <div class="detail-actions">
          <button class="btn btn-secondary" onclick="toggleEditForm()"><i data-lucide="edit"></i> Edit</button>
          <button class="btn btn-danger" onclick="hapusItem()"><i data-lucide="trash-2"></i> Hapus</button>
        </div>
      ` : ''}
    </div>

    ${itemData.foto ? `
      <div style="position:relative">
        <img class="detail-img ${shouldBlur ? 'blurred-content' : ''}" src="${itemData.foto}" alt="${escHtml(itemData.namaBarang)}">
        ${shouldBlur ? `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:var(--text-primary); font-weight:bold; background:rgba(255,255,255,0.8); padding:8px 16px; border-radius:8px;">Foto Disensor</div>` : ''}
      </div>
    ` : ''}

    ${hasMapData && !shouldBlur ? `
      <div id="map" class="map-container"></div>
    ` : ''}

    <div class="detail-info ${shouldBlur ? 'blurred-content' : ''}">
      <div class="info-row"><span class="info-label">Kategori</span><span>${escHtml(itemData.kategori)}</span></div>
      <div class="info-row"><span class="info-label">Lokasi</span><span>${escHtml(itemData.lokasi)}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span>${escHtml(itemData.status)}</span></div>
      <div class="info-row"><span class="info-label">Tanggal</span><span>${formatDate(itemData.createdAt)}</span></div>
      <div class="info-row"><span class="info-label">Dilaporkan oleh</span><span>${escHtml(itemData.namaUser)}</span></div>
      ${itemData.kontakPenyimpanan ? `<div class="info-row"><span class="info-label">Info Penitipan</span><span style="font-weight:bold; color:var(--primary);">${escHtml(itemData.kontakPenyimpanan)}</span></div>` : ''}
    </div>

    ${itemData.deskripsi ? `
      <div class="detail-section ${shouldBlur ? 'blurred-content' : ''}">
        <h3>Deskripsi</h3>
        <p>${escHtml(itemData.deskripsi)}</p>
      </div>
    ` : ''}

    <!-- KLAIM SECTION UNTUK PENGUNJUNG -->
    ${showClaimButton ? `
      <div class="claim-box">
        <h3>Apakah ini barang Anda?</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:16px;">Klaim barang ini dengan menyebutkan ciri-cirinya.</p>
        <button class="btn btn-primary" onclick="toggleClaimForm()"><i data-lucide="hand"></i> Klaim Barang Ini</button>
        <div id="claim-form-box" style="display:none; margin-top:20px; text-align:left;">
          <form onsubmit="submitClaim(event)">
            <div class="form-group">
              <label>Sebutkan ciri-ciri spesifik barang ini (warna, isi, merk, dll)</label>
              <textarea id="claimCiri" class="form-control" required placeholder="Contoh: Flashdisk merk Sandisk warna merah ada stiker kucing..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">Kirim Permintaan Klaim</button>
          </form>
        </div>
      </div>
    ` : ''}

    <!-- "SAYA MENEMUKAN BARANG INI" UNTUK PENGUNJUNG (BARANG HILANG) -->
    ${itemData.status === 'Hilang' && !isOwner && !isPending && !isApproved ? `
      <div class="claim-box">
        <h3>Apakah Anda menemukan barang ini?</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:16px;">Bantu pemiliknya dengan menginformasikan lokasi barang tersebut.</p>
        <button class="btn btn-primary" style="background:var(--color-ditemukan)" onclick="toggleClaimForm()"><i data-lucide="map-pin"></i> Saya Menemukan Barang Ini</button>
        <div id="claim-form-box" style="display:none; margin-top:20px; text-align:left;">
          <form onsubmit="submitClaim(event)">
            <div class="form-group">
              <label>Tinggalkan info lokasi Anda menitipkan barang ini atau kontak Anda</label>
              <textarea id="claimCiri" class="form-control" required placeholder="Contoh: Barang saya titipkan ke Satpam Gedung A, atas nama Pak Budi..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="background:var(--color-ditemukan); width:100%; justify-content:center;">Kirim Informasi ke Pemilik</button>
          </form>
        </div>
      </div>
    ` : ''}

    ${itemData.status === 'Hilang' && !isOwner && isPending ? `
      <div class="claim-box">
        <h3><i data-lucide="check-circle" style="display:inline-block; vertical-align:middle; margin-top:-2px;"></i> Informasi Terkirim</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary);">Terima kasih! Informasi Anda sedang menunggu konfirmasi dari pemilik barang.</p>
      </div>
    ` : ''}

    ${showPendingStatus ? `
      <div class="claim-box">
        <h3><i data-lucide="clock" style="display:inline-block; vertical-align:middle; margin-top:-2px;"></i> Klaim Sedang Diproses</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary);">Permintaan klaim Anda sedang menunggu persetujuan (ACC) dari penemu.</p>
      </div>
    ` : ''}

    <!-- ACC SECTION UNTUK PENEMU / PEMILIK (DITEMUKAN / HILANG) -->
    ${isOwner && isPending ? `
      <div class="claim-box" style="border-color:var(--color-ditemukan);">
        <h3 style="color:var(--color-ditemukan);">${itemData.status === 'Hilang' ? 'Ada Yang Menemukan Barang Anda!' : 'Ada Permintaan Klaim!'}</h3>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:12px;">${itemData.status === 'Hilang' ? 'Seseorang memberikan informasi terkait barang Anda:' : 'Seseorang mengklaim barang ini dengan ciri-ciri berikut:'}</p>
        <div style="background:var(--surface); padding:12px; border-radius:8px; border:1px solid var(--border); margin-bottom:16px; text-align:left;">
          <i>"${escHtml(itemData.claimCiriCiri)}"</i>
        </div>
        <div style="display:flex; gap:10px; justify-content:center;">
          <button class="btn btn-primary" style="background:var(--color-ditemukan)" onclick="${itemData.status === 'Hilang' ? 'accFoundItem()' : 'accClaim()'}"><i data-lucide="check"></i> ${itemData.status === 'Hilang' ? 'Tandai Sudah Dikembalikan' : 'Terima (ACC)'}</button>
          <button class="btn btn-danger" onclick="tolakClaim()"><i data-lucide="x"></i> ${itemData.status === 'Hilang' ? 'Bukan Barang Saya / Tolak' : 'Tolak'}</button>
        </div>
      </div>
    ` : ''}

    <div class="divider"></div>

    ${isOwner ? `
      <div class="update-status-box">
        <div class="detail-section">
          <h3>Update Status</h3>
          <div class="status-buttons">
            <button class="btn ${itemData.status === 'Hilang' ? 'btn-active' : 'btn-outline'}" onclick="updateStatus('Hilang')">Hilang</button>
            <button class="btn ${itemData.status === 'Ditemukan' ? 'btn-active' : 'btn-outline'}" onclick="updateStatus('Ditemukan')">Ditemukan</button>
            <button class="btn ${itemData.status === 'Sudah Dikembalikan' ? 'btn-active' : 'btn-outline'}" onclick="updateStatus('Sudah Dikembalikan')">Sudah Dikembalikan</button>
          </div>
        </div>
      </div>

      <div id="edit-form-box" class="edit-form-box" style="display:none">
        <h3>Edit Laporan</h3>
        <form id="edit-form" onsubmit="simpanEdit(event)">
          <!-- Edit Form Fields Omitted for Brevity but retained logically -->
          <div class="form-group">
            <label>Nama Barang</label>
            <input type="text" id="e-nama" class="form-control" value="${escHtml(itemData.namaBarang)}" required>
          </div>
          <div class="form-group">
            <label>Kategori</label>
            <select id="e-kategori" class="form-control">
              ${['Elektronik','Pakaian','Dokumen','Aksesoris','Tas & Dompet','Buku & ATK','Lainnya']
                .map(k => `<option value="${k}" ${itemData.kategori === k ? 'selected' : ''}>${k}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Lokasi</label>
            <input type="text" id="e-lokasi" class="form-control" value="${escHtml(itemData.lokasi)}" required>
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea id="e-deskripsi" class="form-control">${escHtml(itemData.deskripsi || '')}</textarea>
          </div>
          <div class="form-group">
            <label>Foto Barang</label>
            <img id="e-foto-preview" src="${itemData.foto || ''}" style="display:${itemData.foto ? 'block' : 'none'}; max-width:100%; max-height:220px; margin-bottom:10px; border-radius:8px;">
            ${itemData.foto ? `<button type="button" class="btn btn-secondary" style="margin-bottom:10px;" onclick="hapusFoto()">Hapus Foto</button>` : ''}
            <input type="file" id="e-foto" class="form-control" accept="image/*" onchange="previewEditFoto(this)">
            <small style="color:#64748b; display:block; margin-top:6px;">Pilih file untuk mengganti foto. Foto otomatis dikompres.</small>
          </div>
          <div class="form-actions">
            <button type="submit" id="edit-btn" class="btn btn-primary">Simpan Perubahan</button>
            <button type="button" class="btn btn-secondary" onclick="toggleEditForm()">Batal</button>
          </div>
        </form>
      </div>
    ` : ''}
  `;

  setTimeout(() => {
    lucide.createIcons();
    if (hasMapData && !shouldBlur) {
      initMap(itemData.lat, itemData.lng);
    }
  }, 0);
}

// ===== Edit Foto Helper =====
let fotoDihapus = false;
function hapusFoto() {
  fotoDihapus = true;
  const prev = document.getElementById('e-foto-preview');
  if (prev) prev.style.display = 'none';
  const input = document.getElementById('e-foto');
  if (input) input.value = '';
  alert('Foto akan dihapus setelah klik "Simpan Perubahan".');
}
function compressImage(file, maxSize = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize; } 
        else if (height > maxSize) { width = Math.round(width * maxSize / height); height = maxSize; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject; img.src = e.target.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}
async function previewEditFoto(input) {
  const file = input.files[0];
  if (!file) return;
  fotoDihapus = false;
  const dataUrl = await compressImage(file);
  const prev = document.getElementById('e-foto-preview');
  prev.src = dataUrl; prev.style.display = 'block';
}

// ===== Map =====
function initMap(lat, lng) {
  if (mapInstance) {
    mapInstance.remove();
  }
  mapInstance = L.map('map').setView([lat, lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapInstance);

  const marker = L.marker([lat, lng]).addTo(mapInstance);
  
  if (itemData.foto) {
    marker.bindPopup(`<img src="${itemData.foto}" style="width:150px; border-radius:8px;">`).openPopup();
  }
}

// ===== Claim Flow =====
function toggleClaimForm() {
  if (!currentUser) {
    alert("Silakan Masuk/Login terlebih dahulu untuk mengklaim barang.");
    window.location.href = 'login.html';
    return;
  }
  const box = document.getElementById('claim-form-box');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

async function submitClaim(e) {
  e.preventDefault();
  const ciri = document.getElementById('claimCiri').value.trim();
  const isTitipan = itemData.penyimpanan === 'dititipkan';
  
  try {
    await db.collection('items').doc(itemId).update({
      claimBy: currentUser.uid,
      claimCiriCiri: ciri,
      claimStatus: isTitipan ? 'approved' : 'pending',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    if (isTitipan) {
      alert("Klaim berhasil! Barang dititipkan di pihak terkait. Silakan lihat lokasi dan detail kontak.");
    } else {
      alert("Permintaan klaim berhasil dikirim. Menunggu persetujuan penemu.");
    }
    
    loadItem();
  } catch (err) {
    console.error(err);
    alert("Gagal mengirim klaim.");
  }
}

async function accClaim() {
  if(!confirm("Yakin ingin memberikan ACC? Lokasi dan foto akan terlihat oleh pengklaim.")) return;
  try {
    await db.collection('items').doc(itemId).update({
      claimStatus: 'approved',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Klaim di-ACC.");
    loadItem();
  } catch (err) {
    console.error(err);
  }
}

async function accFoundItem() {
  if(!confirm("Tandai barang ini sebagai Sudah Dikembalikan?")) return;
  try {
    await db.collection('items').doc(itemId).update({
      claimStatus: 'approved',
      status: 'Sudah Dikembalikan',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Barang berhasil ditandai sebagai Sudah Dikembalikan!");
    loadItem();
  } catch (err) {
    console.error(err);
  }
}

async function tolakClaim() {
  if(!confirm("Tolak klaim ini?")) return;
  try {
    await db.collection('items').doc(itemId).update({
      claimBy: '',
      claimCiriCiri: '',
      claimStatus: '',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Klaim ditolak.");
    loadItem();
  } catch (err) {
    console.error(err);
  }
}

// ===== Actions & Helpers =====
function toggleEditForm() {
  const box = document.getElementById('edit-form-box');
  if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

async function simpanEdit(e) {
  e.preventDefault();
  try {
    const updates = {
      namaBarang: document.getElementById('e-nama').value.trim(),
      kategori:   document.getElementById('e-kategori').value,
      lokasi:     document.getElementById('e-lokasi').value.trim(),
      deskripsi:  document.getElementById('e-deskripsi').value.trim(),
      updatedAt:  firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Foto: ganti dengan yang baru, hapus, atau biarkan apa adanya
    const fotoFile = document.getElementById('e-foto').files[0];
    if (fotoFile) {
      let foto = await compressImage(fotoFile);
      if (foto.length > 900000) foto = await compressImage(fotoFile, 600, 0.5);
      updates.foto = foto;
    } else if (fotoDihapus) {
      updates.foto = '';
    }

    await db.collection('items').doc(itemId).update(updates);
    alert('Laporan berhasil diperbarui!');
    loadItem();
  } catch (err) {
    console.error(err);
    alert('Gagal menyimpan perubahan.');
  }
}

async function hapusItem() {
  if (!confirm('Yakin menghapus laporan ini?')) return;
  try {
    await db.collection('items').doc(itemId).delete();
    window.location.href = 'index.html';
  } catch (err) {
    console.error(err);
  }
}

async function updateStatus(status) {
  try {
    await db.collection('items').doc(itemId).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    loadItem();
  } catch (err) {
    console.error(err);
  }
}

function statusClass(status) {
  return { 'Hilang': 'badge-danger', 'Ditemukan': 'badge-success', 'Sudah Dikembalikan': 'badge-info' }[status] || 'badge-secondary';
}
function formatDate(ts) {
  if (!ts) return '-';
  return new Date(ts.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
