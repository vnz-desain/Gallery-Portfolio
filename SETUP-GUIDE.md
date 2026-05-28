# 📸 MEA Documentation Gallery — Panduan Lengkap Setup

Visual identity konsisten dengan portfolio utama: dark cinematic, grain overlay,
Bebas Neue typography, masonry Pinterest-style, full Google Drive integration.

---

## 🗂️ File yang Diterima

```
index.html       → Website gallery utama (upload ke hosting)
apps-script.gs   → Kode Google Apps Script (paste ke script.google.com)
SETUP-GUIDE.md   → Panduan ini
```

---

## LANGKAH 1 — Siapkan Folder Google Drive

1. Buka **Google Drive** → Buat folder utama, contoh: **`DOKUMENTASI`**
2. Di dalam folder itu, buat subfolder sesuai kategori:

```
DOKUMENTASI/
├── MKV/
├── OSIS/
├── CLASS/
└── RANDOM/
```

> **Aturan penamaan folder:**
> - Nama folder = nama kategori filter (otomatis UPPERCASE)
> - Folder berawalan `_` akan disembunyikan (misal `_ARSIP`)
> - Spasi dan karakter khusus didukung

3. Upload foto ke masing-masing subfolder.
4. **Penting:** Klik kanan folder utama `DOKUMENTASI` → **Share** → **Anyone with the link** → **Viewer**. Lakukan hal yang sama untuk setiap subfolder.

---

## LANGKAH 2 — Setup Google Apps Script

1. Buka **[script.google.com](https://script.google.com)**
2. Klik **New project**
3. Hapus semua kode default, paste seluruh isi `apps-script.gs`
4. Cari baris ini dan isi **ID folder utama** kamu:

```javascript
var PARENT_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // ← Ganti ini!
```

**Cara dapat Folder ID:**
Buka folder `DOKUMENTASI` di Google Drive → lihat URL browser:
```
https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        Ini Folder ID-nya
```

5. Klik **Save** (Ctrl+S) → beri nama project, misal `MEA Gallery API`

---

## LANGKAH 3 — Test Script

1. Di Apps Script editor, pilih function `testScript` dari dropdown
2. Klik **Run** (▶)
3. Izinkan akses ke Google Drive saat diminta
4. Cek **Execution log** — harus terlihat daftar kategori dan jumlah foto

Contoh output yang benar:
```
Categories: ["CLASS","MKV","OSIS","RANDOM"]
Total images: 47
Sample: [{"id":"1xYz...","name":"IMG 0042","category":"MKV",...}]
```

---

## LANGKAH 4 — Deploy Apps Script sebagai Web App

1. Klik **Deploy** (pojok kanan atas) → **New deployment**
2. Klik ikon ⚙️ di sebelah "Select type" → pilih **Web app**
3. Isi pengaturan:

| Field | Value |
|-------|-------|
| Description | MEA Gallery API |
| Execute as | **Me** |
| Who has access | **Anyone** |

4. Klik **Deploy**
5. **Copy URL** yang muncul (format: `https://script.google.com/macros/s/AKfyc.../exec`)

> ⚠️ **Simpan URL ini** — kamu akan membutuhkannya di langkah berikutnya.

---

## LANGKAH 5 — Konfigurasi index.html

1. Buka `index.html` dengan text editor (VS Code, Notepad++, dll.)
2. Cari bagian `CONFIG` di dalam tag `<script>`:

```javascript
const CONFIG = {
  APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL_HERE',   // ← Ganti ini!
  ...
};
```

3. Ganti `'YOUR_APPS_SCRIPT_URL_HERE'` dengan URL Apps Script dari Langkah 4:

```javascript
const CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfyc.../exec',
  ...
};
```

4. Simpan file.

---

## LANGKAH 6 — Upload ke Hosting

### Opsi A: GitHub Pages (Gratis)
1. Buat repository baru di GitHub
2. Upload `index.html`
3. Buka **Settings** → **Pages** → Source: **main branch** → Save
4. Website aktif di `https://username.github.io/repository-name`

### Opsi B: Hostinger / Niagahoster
1. Login ke cPanel → **File Manager**
2. Upload `index.html` ke folder `public_html` (atau subfolder)
3. Akses via domain kamu

### Opsi C: Netlify (Drag & Drop)
1. Buka [netlify.com](https://netlify.com)
2. Drag folder berisi `index.html` ke dashboard
3. URL langsung aktif

---

## LANGKAH 7 — Test Website

1. Buka website di browser
2. Gallery harus otomatis load foto dari Google Drive
3. Filter kategori muncul otomatis sesuai nama folder
4. Klik foto untuk buka lightbox full-size

---

## 🔄 Cara Update Gallery (Setelah Setup)

**Tambah foto baru:**
→ Upload foto ke subfolder yang sesuai di Google Drive
→ Website otomatis update (tidak perlu edit apapun)

**Tambah kategori baru:**
→ Buat subfolder baru di folder `DOKUMENTASI`
→ Upload foto ke subfolder itu
→ Website otomatis menambahkan filter baru

**Hapus foto:**
→ Hapus foto dari Google Drive
→ Foto hilang dari website otomatis

---

## ⚙️ Konfigurasi Lanjutan (Opsional)

### Ubah kualitas gambar
Di `index.html`, cari bagian `CONFIG`:
```javascript
IMG_QUALITY: 'w800',   // thumbnail: w400, w600, w800, w1200
IMG_FULL:    'w1920',  // lightbox full size
```

### Ubah urutan foto
Di `apps-script.gs`:
```javascript
var SORT_BY = 'date';  // 'date' = terbaru dulu | 'name' = A-Z | 'none' = default
```

### Batasi jumlah foto per kategori
Di `apps-script.gs`:
```javascript
var MAX_IMAGES_PER_FOLDER = 50;  // 0 = tidak ada batas
```

### Sembunyikan folder
Beri nama folder dengan awalan `_`:
```
_PRIVATE/   ← tidak akan muncul di website
```

---

## ❗ Troubleshooting

**Gallery tidak muncul / error "connection error"**
- Pastikan Apps Script sudah di-deploy dengan akses **Anyone**
- Pastikan URL di `CONFIG.APPS_SCRIPT_URL` sudah benar
- Pastikan folder Google Drive sudah di-share ke **Anyone with the link**
- Coba buka URL Apps Script langsung di browser — harus tampil JSON

**Foto tidak tampil (broken image)**
- Pastikan foto sudah di-share publik di Google Drive
- Klik kanan foto → Share → Anyone with the link → Viewer

**Filter tidak muncul**
- Pastikan subfolder sudah dibuat di dalam folder utama
- Jalankan ulang `testScript` di Apps Script editor untuk cek

**Error "Script function not found"**
- Pastikan kamu memilih function `doGet` saat deploy, bukan yang lain

**Foto terlambat muncul**
- Normal — ini karena lazy loading. Foto muncul saat masuk viewport.
- Untuk mempercepat, kurangi `IMG_QUALITY` ke `'w600'` atau `'w400'`

---

## 📐 Struktur Folder Drive yang Disarankan

```
DOKUMENTASI EVAN/
│
├── MKV/
│   ├── foto-1.jpg
│   ├── foto-2.jpg
│   └── ...
│
├── OSIS/
│   ├── dokumentasi-rapat.jpg
│   └── ...
│
├── CLASS/
│   └── ...
│
├── RANDOM/
│   └── ...
│
└── _ARSIP/        ← Diawali _ = tidak muncul di website
    └── ...
```

---

## 🎨 Kustomisasi Tampilan

Semua warna dan font bisa diubah di bagian `:root` dalam `<style>` di `index.html`:

```css
:root {
  --black:       #050505;   /* Background utama */
  --red-bright:  #C41E3A;   /* Aksen merah */
  --white:       #F0EDE8;   /* Teks utama */
  --white-dim:   #9A9690;   /* Teks sekunder */
}
```

---

*Dokumentasi ini untuk website gallery M. Evan Almunawar*
*evanalmunawar.my.id — dokumentasi.evanalmunawar.my.id*
