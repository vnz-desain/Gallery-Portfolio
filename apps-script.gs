/**
 * ============================================================
 *  MEA DOCUMENTATION GALLERY — Google Apps Script
 *  File: Code.gs
 *
 *  Cara pakai:
 *  1. Buka script.google.com
 *  2. Buat project baru → paste kode ini
 *  3. Ganti PARENT_FOLDER_ID dengan ID folder Google Drive kamu
 *  4. Deploy → Web App → Anyone → Copy URL
 *  5. Paste URL ke index.html di bagian CONFIG.APPS_SCRIPT_URL
 * ============================================================
 */

// ── KONFIGURASI ─────────────────────────────────────────────

/**
 * ID folder utama di Google Drive.
 * Cara mendapatkan ID:
 *   Buka folder di Google Drive → lihat URL:
 *   https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ
 *                                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *   Salin bagian setelah "/folders/"
 */
var PARENT_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // ← Ganti ini!

/**
 * Ekstensi file gambar yang akan dibaca.
 * Tambahkan atau hapus sesuai kebutuhan.
 */
var IMAGE_MIME_TYPES = [
  MimeType.JPEG,
  MimeType.PNG,
  MimeType.GIF,
  'image/webp'
];

/**
 * Urutkan gambar berdasarkan:
 * 'name'     → nama file A-Z
 * 'date'     → tanggal dibuat (terbaru dulu)
 * 'none'     → urutan default Drive
 */
var SORT_BY = 'date';

/**
 * Maksimal gambar per folder. 0 = tidak ada batas.
 */
var MAX_IMAGES_PER_FOLDER = 0;

// ── MAIN HANDLER ────────────────────────────────────────────

function doGet(e) {
  try {
    var result = getGalleryData();

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    var errorResponse = {
      error: true,
      message: err.message,
      images: [],
      categories: []
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── CORE FUNCTION ────────────────────────────────────────────

function getGalleryData() {
  if (!PARENT_FOLDER_ID || PARENT_FOLDER_ID === 'YOUR_FOLDER_ID_HERE') {
    throw new Error('PARENT_FOLDER_ID belum dikonfigurasi. Buka Code.gs dan isi PARENT_FOLDER_ID.');
  }

  var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);

  var result = {
    categories: [],
    images: [],
    updatedAt: new Date().toISOString()
  };

  // Iterasi semua subfolder (= kategori)
  var folderIter = parentFolder.getFolders();
  var folders = [];

  while (folderIter.hasNext()) {
    folders.push(folderIter.next());
  }

  // Urutkan folder berdasarkan nama A-Z
  folders.sort(function(a, b) {
    return a.getName().localeCompare(b.getName());
  });

  folders.forEach(function(folder) {
    var folderName = folder.getName().trim().toUpperCase();

    // Skip folder yang diawali dengan "_" (hidden)
    if (folderName.charAt(0) === '_') return;

    result.categories.push(folderName);

    var images = getImagesFromFolder(folder, folderName);
    images.forEach(function(img) {
      result.images.push(img);
    });
  });

  return result;
}

// ── HELPER: Get images from a folder ────────────────────────

function getImagesFromFolder(folder, categoryName) {
  var images = [];

  IMAGE_MIME_TYPES.forEach(function(mimeType) {
    try {
      var fileIter = folder.getFilesByType(mimeType);

      while (fileIter.hasNext()) {
        var file = fileIter.next();

        images.push({
          id:        file.getId(),
          name:      cleanName(file.getName()),
          category:  categoryName,
          date:      file.getDateCreated().getTime(),
          size:      file.getSize()
        });
      }
    } catch (err) {
      // MIME type tidak didukung di folder ini, skip
      Logger.log('MIME type error for ' + mimeType + ': ' + err.message);
    }
  });

  // Sort
  if (SORT_BY === 'name') {
    images.sort(function(a, b) { return a.name.localeCompare(b.name); });
  } else if (SORT_BY === 'date') {
    images.sort(function(a, b) { return b.date - a.date; }); // terbaru dulu
  }

  // Limit
  if (MAX_IMAGES_PER_FOLDER > 0 && images.length > MAX_IMAGES_PER_FOLDER) {
    images = images.slice(0, MAX_IMAGES_PER_FOLDER);
  }

  return images;
}

// ── HELPER: Clean file name ──────────────────────────────────

function cleanName(name) {
  // Hapus ekstensi file: "IMG_1234.jpg" → "IMG_1234"
  return name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
}

// ── TEST FUNCTION (run di editor untuk cek) ─────────────────

function testScript() {
  var data = getGalleryData();
  Logger.log('Categories: ' + JSON.stringify(data.categories));
  Logger.log('Total images: ' + data.images.length);
  Logger.log('Sample: ' + JSON.stringify(data.images.slice(0, 3)));
}
