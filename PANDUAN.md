# Panduan Menjalankan Lost & Found Kampus

## Struktur Folder

```
found-and-found/
├── public/
│   ├── index.html       ← Halaman utama (daftar laporan)
│   ├── login.html       ← Halaman login
│   ├── create.html      ← Buat laporan baru
│   ├── detail.html      ← Detail / edit laporan
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── firebase-config.js   ← ⚠️ ISI KONFIGURASI DI SINI
│       ├── auth.js
│       ├── app.js
│       ├── create.js
│       └── detail.js
├── firebase.json
├── firestore.rules
└── storage.rules
```

---

## Langkah 1 — Buat Proyek Firebase

1. Buka [https://console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** → beri nama proyek (misal: `lostnfound-kampus`)
3. Nonaktifkan Google Analytics jika tidak diperlukan → klik **Create project**

---

## Langkah 2 — Aktifkan Layanan Firebase

### Authentication
1. Di Firebase Console → menu **Authentication** → tab **Sign-in method**
2. Klik **Google** → aktifkan toggle → simpan

### Firestore Database
1. Menu **Firestore Database** → klik **Create database**
2. Pilih **Start in production mode** → pilih region (misal: `asia-southeast1`) → klik **Enable**



---

## Langkah 3 — Daftarkan Web App & Ambil Konfigurasi

1. Di halaman Project Overview → klik ikon **</>** (Web)
2. Beri nama app (misal: `lostnfound-web`) → klik **Register app**
3. Salin konfigurasi yang muncul, contohnya:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "lostnfound-kampus.firebaseapp.com",
  projectId: "lostnfound-kampus",
  storageBucket: "lostnfound-kampus.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

4. Buka file `public/js/firebase-config.js`
5. Ganti bagian `YOUR_API_KEY`, `YOUR_AUTH_DOMAIN`, dst. dengan nilai dari konfigurasi tadi

---

## Langkah 4 — Install Firebase CLI

Buka terminal / PowerShell, jalankan:

```bash
npm install -g firebase-tools
```

Kemudian login:

```bash
firebase login
```

Ikuti instruksi login di browser yang terbuka.

---

## Langkah 5 — Hubungkan Proyek

Di folder proyek, jalankan:

```bash
firebase use --add
```

Pilih proyek Firebase yang sudah dibuat tadi dari daftar.

---

## Langkah 6 — Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

---

## Langkah 7 — Deploy ke Firebase Hosting

```bash
firebase deploy --only hosting
```

Setelah selesai akan muncul URL seperti:
```
Hosting URL: https://lostnfound-kampus.web.app
```

Buka URL tersebut di browser — aplikasi sudah berjalan!

---

## Testing Lokal (Tanpa Deploy)

Untuk mencoba di komputer lokal tanpa deploy:

```bash
firebase serve
```

Aplikasi akan berjalan di `http://localhost:5000`

> **Catatan:** Login Google mungkin tidak bisa di `localhost` kecuali Anda menambahkan
> `localhost` ke **Authorized domains** di Firebase Console →
> Authentication → Settings → Authorized domains → Add domain → `localhost`

---

## Fitur Aplikasi

| Fitur | Keterangan |
|-------|-----------|
| Login Google | Autentikasi via Firebase Auth |
| Lihat laporan | Semua orang bisa melihat tanpa login |
| Buat laporan | Hanya user yang sudah login |
| Upload foto | Dikompresi otomatis & disimpan di Firestore |
| Edit & hapus | Hanya pemilik laporan |
| Update status | Hilang / Ditemukan / Sudah Dikembalikan |
| Pencarian | Filter berdasarkan nama, kategori, lokasi |
| Filter status | Dropdown filter per status |

---

## Troubleshooting

**Login gagal / popup diblokir**
→ Izinkan popup di browser untuk domain aplikasi

**Gagal upload foto**
→ Pastikan Firestore sudah diaktifkan dan ukuran file tidak melebihi batas (foto kini dikompresi otomatis dan disimpan di Firestore).

**Data tidak muncul**
→ Pastikan Firestore sudah diaktifkan dan rules sudah di-deploy

**Error: Firebase not defined**
→ Pastikan konfigurasi di `firebase-config.js` sudah diisi dengan benar
