const urlParams = new URLSearchParams(window.location.search);
const itemId    = urlParams.get('id');

if (!itemId) window.location.href = 'index.html';

let currentUser = null;
let itemData    = null;

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

  document.getElementById('detail-content').innerHTML = `
    <div class="detail-header">
      <div>
        <span class="badge ${statusClass(itemData.status)}">${itemData.status}</span>
        <h1 class="detail-title">${escHtml(itemData.namaBarang)}</h1>
      </div>
      ${isOwner ? `
        <div class="detail-actions">
          <button class="btn btn-secondary" onclick="toggleEditForm()">Edit</button>
          <button class="btn btn-danger" onclick="hapusItem()">Hapus</button>
        </div>
      ` : ''}
    </div>

    ${itemData.foto ? `<img class="detail-img" src="${itemData.foto}" alt="${escHtml(itemData.namaBarang)}">` : ''}

    <div class="detail-info">
      <div class="info-row"><span class="info-label">Kategori</span><span>${escHtml(itemData.kategori)}</span></div>
      <div class="info-row"><span class="info-label">Lokasi</span><span>${escHtml(itemData.lokasi)}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span>${escHtml(itemData.status)}</span></div>
      <div class="info-row"><span class="info-label">Tanggal</span><span>${formatDate(itemData.createdAt)}</span></div>
      <div class="info-row"><span class="info-label">Dilaporkan oleh</span><span>${escHtml(itemData.namaUser)}</span></div>
    </div>

    ${itemData.deskripsi ? `
      <div class="detail-section">
        <h3>Deskripsi</h3>
        <p>${escHtml(itemData.deskripsi)}</p>
      </div>
      <div class="divider"></div>
    ` : ''}

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
}

// ===== Foto =====

let fotoDihapus = false; // true bila user klik "Hapus Foto"

// Kompres foto jadi Base64 (sama seperti di create.js, tanpa Firebase Storage)
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

async function previewEditFoto(input) {
  const file = input.files[0];
  if (!file) return;
  fotoDihapus = false;
  const dataUrl = await compressImage(file);
  const prev = document.getElementById('e-foto-preview');
  prev.src = dataUrl;
  prev.style.display = 'block';
}

function hapusFoto() {
  fotoDihapus = true;
  const prev = document.getElementById('e-foto-preview');
  if (prev) prev.style.display = 'none';
  const input = document.getElementById('e-foto');
  if (input) input.value = '';
  alert('Foto akan dihapus setelah klik "Simpan Perubahan".');
}

// ===== Actions =====

function toggleEditForm() {
  fotoDihapus = false;
  const box = document.getElementById('edit-form-box');
  if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

async function updateStatus(status) {
  try {
    await db.collection('items').doc(itemId).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    itemData.status = status;
    render();
  } catch (err) {
    console.error(err);
    alert('Gagal update status.');
  }
}

async function simpanEdit(e) {
  e.preventDefault();
  const btn = document.getElementById('edit-btn');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

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
    Object.assign(itemData, updates);
    render();
    alert('Laporan berhasil diperbarui!');

  } catch (err) {
    console.error(err);
    alert('Gagal menyimpan perubahan.');
    btn.disabled = false;
    btn.textContent = 'Simpan Perubahan';
  }
}

async function hapusItem() {
  if (!confirm('Yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.')) return;
  try {
    await db.collection('items').doc(itemId).delete();
    alert('Laporan berhasil dihapus.');
    window.location.href = 'index.html';
  } catch (err) {
    console.error(err);
    alert('Gagal menghapus laporan.');
  }
}

// ===== Helpers =====

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
