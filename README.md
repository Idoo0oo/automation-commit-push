# 🚀 Setup Automation Dashboard (Vite + Express)

Sistem ini adalah web dashboard (lokal) yang digunakan untuk *automating GitHub commits*. Aplikasi ini sekarang menggunakan arsitektur **NPM Workspaces** yang memisahkan frontend (Vite + React) dan backend (Node.js + Express).

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
File konfigurasi digunakan supaya backend tahu cara menyambung ke database kamu.
1. Masuk ke dalam folder `server/` dan cari file bernama `.env.example`.
2. Duplikat/Ganti nama file tersebut menjadi `.env` (pastikan tidak ada kata .example lagi).
3. Jika XAMPP kamu menggunakan password untuk root, buka file `.env` tersebut dan masukkan passwordnya.
   *(Default XAMPP biasanya **tanpa password**, jadi URL `mysql://root:@localhost:3306/ukk_autocommit` biasanya sudah bisa langsung jalan).*

### 3️⃣ Install Dependencies & Sinkronisasi Database
Sekarang kita perlu mendownload package web-nya dan mencocokkan struktur database:
1. Buka **Terminal** (atau Command Prompt / PowerShell) di **folder UTAMA (root)** project ini.
2. Jalankan perintah berikut untuk menginstall seluruh library (Front-End & Back-End otomatis):
   ```bash
   npm install
   ```
3. Setelah selesai, masuk ke dalam folder server dan jalankan perintah db push:
   ```bash
   cd server
   npx prisma db push
   cd ..
   ```

### 4️⃣ Jalankan Aplikasi!
Karena aplikasi ini terbagi menjadi dua bagian (Client dan Server), kamu perlu menjalankan keduanya:

Buka **Dua Terminal Baru** di folder utama project ini:

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
```

**Terminal 2 (Frontend UI):**
```bash
npm run dev:client
```

Buka browser kamu dan akses alamat Frontend Vite:
👉 **[http://localhost:5173](http://localhost:5173)**

---
*Catatan: Setiap kali kamu ingin menggunakan aplikasi ini kedepannya, kamu hanya perlu memastikan **MySQL di XAMPP hidup**, lalu buka dua terminal di folder ini untuk menjalankan `npm run dev:server` dan `npm run dev:client`.*
