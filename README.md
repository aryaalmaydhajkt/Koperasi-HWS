# Aplikasi Sistem Informasi Koperasi HWS (Himpunan Wirausaha Sejahtera)

Sistem aplikasi koperasi terpadu untuk pengelolaan Tabungan Kewajiban, Tabungan Umum, Buku Kas Anggota, Buku Kas Besar Koperasi, Mutasi Resmi PDF, KTA Digital, Zakat & Qurban, dan multi-role Admin (Super Admin, Teller, CS, Manajer).

---

## 🚀 Cara Menjalankan Aplikasi di Laptop / Komputer

### Prasyarat
- Pastikan laptop/komputer Anda sudah terpasang **Node.js** (Versi 18 atau lebih baru).
  Unduh gratis di: https://nodejs.org/

---

### Cara 1: Menggunakan Skrip Otomatis (Paling Mudah)
- **Pengguna Windows:** Cukup klik dua kali file `Jalankan-Aplikasi-Windows.bat`. Skrip akan otomatis menginstall dependensi dan membuka browser di `http://localhost:3000`.
- **Pengguna Mac / Linux:** Buka terminal di folder ini dan jalankan:
  ```bash
  chmod +x jalankan-aplikasi-mac-linux.sh
  ./jalankan-aplikasi-mac-linux.sh
  ```

---

### Cara 2: Menjalankan Manual Lewat Terminal / Command Prompt
1. Buka folder proyek ini di Command Prompt / Terminal.
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses alamat:
   ```
   http://localhost:3000
   ```

---

## 📱 Memasang sebagai Aplikasi Mandiri (PWA / Desktop App)
Aplikasi ini sudah mendukung Progressive Web App (PWA):
1. **Di Google Chrome / Microsoft Edge di Laptop:**
   - Buka `http://localhost:3000`
   - Klik ikon **Install** (gambar komputer dengan panah bawah di bilah URL kanan atas) atau klik tombol **"Install Aplikasi"** di dalam website.
   - Aplikasi akan terpasang di desktop seperti aplikasi bawaan Windows / Mac tanpa address bar browser.
2. **Di HP Android:**
   - Buka tautan di Chrome Android.
   - Ketuk menu titik tiga (⋮) -> **"Tambahkan ke Layar Utama"** atau klik **"Install Aplikasi"**.

---

## 🔑 Akun Demo Bawaan
- **Portal Anggota:**
  - No. Anggota: `HWS-001` (Password: `123`)
  - Atau gunakan tombol *Demo Anggota 1-Klik* pada halaman login.
- **Portal Admin:**
  - Super Admin: `admin` (Password: `admin123`)
  - Teller Kasir: `teller` (Password: `teller123`)
  - Customer Service: `cs` (Password: `cs123`)
  - Manajer: `manager` (Password: `manager123`)

---

## 📂 Struktur Folder Proyek
- `src/`: Seluruh kode sumber React + TypeScript & Tailwind CSS
  - `src/components/`: Komponen UI (Dashboard Anggota, Dashboard Admin, Mutasi, KTA, Modal Setor/Tarik, PWA Installer)
  - `src/data/`: State manager toko data koperasi (`store.ts`) dan data inisial (`initialData.ts`)
  - `src/utils/`: Utilitas ekspor laporan (PDF, Excel, CSV) dan hook PWA
- `public/`: Aset statis, ikon PWA, manifest web, dan file logo
- `server.ts`: Server Express & Vite engine
- `vite.config.ts`: Konfigurasi bundler Vite dan PWA Workbox

---
© 2026 Koperasi Himpunan Wirausaha Sejahtera (HWS). Seluruh hak cipta dilindungi undang-undang.
