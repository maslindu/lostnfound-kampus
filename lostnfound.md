
# Lost & Found Kampus

## Sistem Informasi Barang Hilang dan Ditemukan Berbasis Cloud Computing

## 1. Deskripsi Proyek

Lost & Found Kampus merupakan aplikasi web berbasis cloud yang dirancang untuk membantu civitas akademika kampus dalam melaporkan, mencari, dan mengelola informasi barang hilang maupun barang yang ditemukan di lingkungan kampus.

Saat ini, informasi mengenai barang hilang biasanya disebarkan melalui grup WhatsApp, media sosial, atau komunikasi lisan yang tersebar dan tidak terpusat. Akibatnya, proses pencarian barang menjadi kurang efektif dan sering kali informasi tidak menjangkau seluruh pihak yang membutuhkan.

Melalui aplikasi ini, pengguna dapat membuat laporan barang hilang, mengunggah foto barang, melihat laporan yang telah dibuat oleh pengguna lain, melakukan pencarian, serta memperbarui status barang apabila telah ditemukan.

Aplikasi dikembangkan menggunakan teknologi cloud computing dengan pendekatan serverless sehingga tidak memerlukan server backend tradisional yang harus dikelola secara mandiri.

---

# 2. Latar Belakang

Di lingkungan kampus, kehilangan barang merupakan kejadian yang cukup sering terjadi. Barang seperti kartu mahasiswa, flashdisk, charger, buku, jaket, hingga perangkat elektronik sering tertinggal atau hilang di ruang kelas, perpustakaan, laboratorium, maupun area umum lainnya.

Meskipun informasi kehilangan biasanya disebarkan melalui berbagai media komunikasi, belum terdapat sistem terpusat yang memungkinkan seluruh mahasiswa untuk mengakses informasi tersebut secara mudah dan cepat.

Dengan memanfaatkan teknologi cloud computing, sistem Lost & Found Kampus dapat menyediakan platform terpusat yang mudah diakses, scalable, dan dapat digunakan kapan saja tanpa memerlukan infrastruktur server yang kompleks.

---

# 3. Tujuan Proyek

Tujuan dari pengembangan aplikasi ini adalah:

1. Menyediakan platform terpusat untuk pelaporan barang hilang dan ditemukan.
2. Mempermudah mahasiswa dalam mencari informasi terkait barang yang hilang.
3. Mengurangi penyebaran informasi yang terfragmentasi pada berbagai media komunikasi.
4. Mengimplementasikan konsep cloud computing dalam pengembangan aplikasi web.
5. Menerapkan layanan cloud modern seperti Authentication, Database, Storage, dan Hosting dalam satu sistem terintegrasi.

---

# 4. Manfaat Proyek

## Bagi Mahasiswa

* Mempermudah proses pencarian barang hilang.
* Mempercepat penyebaran informasi terkait barang ditemukan.
* Menyediakan sistem yang dapat diakses kapan saja melalui internet.

## Bagi Kampus

* Menyediakan sarana pelayanan digital yang bermanfaat bagi civitas akademika.
* Membantu mengurangi jumlah barang hilang yang tidak berhasil dikembalikan kepada pemiliknya.

## Bagi Pengembang

* Mempelajari implementasi cloud computing secara nyata.
* Memahami arsitektur serverless dan layanan Backend-as-a-Service (BaaS).
* Memahami integrasi berbagai layanan Firebase dalam satu aplikasi.

---

# 5. Fitur Utama

## Authentication

* Login menggunakan akun Google.
* Logout pengguna.
* Manajemen identitas pengguna menggunakan Firebase Authentication.

## Manajemen Laporan Barang

### Create

Membuat laporan barang hilang atau barang ditemukan.

### Read

Menampilkan seluruh laporan yang tersedia.

### Update

Mengubah informasi laporan atau status barang.

### Delete

Menghapus laporan yang tidak diperlukan.

## Upload Foto

Pengguna dapat mengunggah foto barang untuk membantu identifikasi.

## Pencarian Data

Pengguna dapat mencari laporan berdasarkan nama barang atau kategori tertentu.

## Status Barang

* Hilang
* Ditemukan
* Sudah Dikembalikan

---

# 6. Teknologi yang Digunakan

## Frontend

* HTML
* CSS
* JavaScript

## Cloud Platform

* Firebase

## Layanan Firebase

* Firebase Hosting
* Cloud Firestore
* Firebase Authentication

* Firebase Security Rules

---

# 7. Arsitektur Sistem

```text
+------------------+
|     Browser      |
+------------------+
          |
          |
          v
+----------------------+
| Firebase Hosting     |
+----------------------+
      |         |
      |         |
      v         v
| Firestore |
      ^
      |
      |
+----------------------+
| Firebase Auth        |
+----------------------+
```

Alur kerja sistem:

1. Pengguna mengakses aplikasi melalui browser.
2. Website disajikan melalui Firebase Hosting.
3. Pengguna melakukan login menggunakan Firebase Authentication.
4. Data laporan disimpan pada Cloud Firestore.
5. Foto barang dikompresi dan disimpan langsung pada Cloud Firestore.
6. Security Rules mengatur hak akses terhadap data.

---

# 8. Implementasi Cloud Computing

## Firebase Hosting

Firebase Hosting digunakan untuk melakukan deployment aplikasi web.

Karakteristik:

* Static web hosting.
* Didistribusikan melalui CDN global.
* Mendukung HTTPS secara otomatis.
* Tidak memerlukan konfigurasi server.

Keuntungan:

* Deployment sangat cepat.
* Skalabilitas otomatis.
* Performa tinggi karena distribusi melalui CDN.

---

## Cloud Firestore

Cloud Firestore digunakan sebagai database utama aplikasi.

Karakteristik:

* Database NoSQL berbasis dokumen.
* Realtime synchronization.
* Auto scaling.
* Serverless.

Contoh struktur data:

```json
{
  "namaBarang": "Flashdisk Kingston",
  "kategori": "Elektronik",
  "lokasi": "Perpustakaan",
  "status": "Hilang",
  "fotoUrl": "...",
  "userId": "abc123"
}
```

Keuntungan:

* Mudah digunakan.
* Tidak memerlukan pengelolaan database server.
* Skalabilitas tinggi.

---

## Firebase Authentication

Digunakan untuk mengelola identitas pengguna.

Metode login:

* Google OAuth

Keuntungan:

* Tidak perlu membuat sistem password sendiri.
* Lebih aman.
* Integrasi langsung dengan Firebase.

Data pengguna yang tersedia:

```text
UID
Nama
Email
Foto Profil
```

---



## Firebase Security Rules

Pada arsitektur serverless, aplikasi tidak memiliki backend tradisional untuk memvalidasi setiap permintaan pengguna.

Karena itu Firebase menyediakan Security Rules untuk mengatur hak akses langsung pada database dan storage.

Contoh kebijakan:

* Pengguna harus login sebelum membuat laporan.
* Pengguna hanya boleh mengubah laporannya sendiri.
* Pengguna hanya boleh menghapus laporannya sendiri.
* Semua pengguna dapat melihat laporan yang bersifat publik.

Manfaat:

* Menggantikan sebagian fungsi validasi backend.
* Menjaga keamanan data.
* Mengontrol akses secara granular.

---

# 9. Konsep Arsitektur Serverless / BaaS

Aplikasi ini menggunakan pendekatan Backend-as-a-Service (BaaS).

Pada pendekatan tradisional:

```text
Frontend
    |
Backend Server
    |
Database
```

Sedangkan pada Firebase:

```text
Frontend
    |
Firebase Services
```

Frontend berkomunikasi langsung dengan layanan cloud Firebase tanpa memerlukan server backend yang dikelola sendiri.

---

# 10. Keunggulan Arsitektur Serverless

## Tidak Memerlukan Server Sendiri

Pengembang tidak perlu:

* Menyewa VPS.
* Mengelola sistem operasi server.
* Mengelola web server.
* Mengelola database server.

## Skalabilitas Otomatis

Jumlah pengguna dapat meningkat tanpa perlu melakukan konfigurasi server tambahan.

## Pengembangan Lebih Cepat

Fokus pengembangan dapat diarahkan pada fitur aplikasi dibanding pengelolaan infrastruktur.

## Biaya Awal Rendah

Sangat cocok untuk proyek mahasiswa dan prototipe.

---

# 11. Kekurangan Arsitektur Serverless

## Ketergantungan Vendor

Aplikasi menjadi bergantung pada layanan Firebase.

## Logika Banyak Berada di Client

Karena tidak memiliki backend khusus, sebagian logika aplikasi dijalankan pada browser pengguna.

## Kustomisasi Terbatas

Beberapa kebutuhan kompleks lebih sulit diimplementasikan dibanding arsitektur backend tradisional.

## Potensi Biaya Bertambah

Jika jumlah pengguna sangat besar, biaya penggunaan layanan cloud dapat meningkat.

---

# 12. Kesimpulan

Lost & Found Kampus merupakan aplikasi web berbasis cloud yang memanfaatkan layanan Firebase secara penuh melalui pendekatan serverless. Sistem ini menyediakan fitur pelaporan barang hilang dan ditemukan, autentikasi pengguna, penyimpanan data, penyimpanan gambar secara terpusat, serta deployment berbasis cloud.

Melalui proyek ini, berbagai konsep Cloud Computing dapat diterapkan secara nyata, meliputi cloud hosting, database cloud, authentication service, storage service, security rules, serta arsitektur Backend-as-a-Service (BaaS).
