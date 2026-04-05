# 🚀 Setup Automation Dashboard

Sistem ini adalah web dashboard (lokal) yang digunakan untuk *automating GitHub commits*. Ikuti langkah-langkah di bawah ini untuk menjalankannya di laptop kamu.

## 📋 Persyaratan Sistem
Sebelum mulai, pastikan kamu sudah menginstal:
1. **Node.js** (versi 18 ke atas) -> [Download di sini](https://nodejs.org/)
2. **XAMPP** atau Laragon -> [Download XAMPP](https://www.apachefriends.org/)

---

## 🛠️ Langkah-Langkah Instalasi

### 1️⃣ Nyalakan Database
1. Buka aplikasi **XAMPP Control Panel**.
2. Klik tombol `Start` pada module **MySQL** (dan **Apache** jika perlu buka phpMyAdmin).
3. Buat database baru bernama `ukk_autocommit` di phpMyAdmin (`http://localhost/phpmyadmin`) jika kamu menggunakan nama default.

### 2️⃣ Siapkan File Konfigurasi (.env)
File konfigurasi digunakan supaya aplikasi ini tahu cara menyambung ke database kamu.
1. Di dalam folder utama project ini, cari file bernama `.env.example`.
2. Ganti nama file tersebut (Rename) menjadi `.env` (pastikan tidak ada kata .example lagi).
3. Jika XAMPP kamu menggunakan password untuk root, buka file `.env` dengan Notepad/VS Code dan masukkan passwordnya.
   *(Default XAMPP biasanya **tanpa password**, jadi URL `mysql://root:@localhost:3306/ukk_autocommit` biasanya sudah bisa langsung jalan).*

### 3️⃣ Install Dependencies & Sinkronisasi Database
Sekarang kita perlu mendownload package web-nya dan mencocokkan struktur database:
1. Buka **Terminal** (atau Command Prompt / PowerShell) dan arahkan ke folder ini.
2. Jalankan perintah berikut untuk menginstall library yang dibutuhkan:
   ```bash
   npm install
   ```
3. Setelah selesai, jalankan perintah ini agar tabel di file database kita otomatis terbentuk:
   ```bash
   npx prisma db push
   ```

### 4️⃣ Jalankan Aplikasi!
Semua sudah siap. Untuk menyalakan server lokal, jalankan:
```bash
npm run dev
```

Buka browser kamu dan akses alamat:
👉 **[http://localhost:3000](http://localhost:3000)**

---
*Catatan: Setiap kali kamu ingin menggunakan aplikasi ini kedepannya, kamu hanya perlu menyalakan **MySQL di XAMPP**, buka terminal di folder ini, dan jalankan `npm run dev`.*
