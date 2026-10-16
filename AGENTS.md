# Panduan Agen — Pespor

## Tujuan dan cakupan

- Pespor adalah aplikasi mobile Pestapora, festival musik di Indonesia.
- Aplikasi mobile ditujukan khusus untuk pengunjung. Fitur panitia/admin berada di luar cakupan mobile.
- Konsep konten dan alur menggunakan aplikasi FUJI ROCK sebagai referensi; desain, identitas visual, dan implementasi Pespor dibuat sendiri.
- Pelajari referensi, jelaskan temuan dan pilihan, lalu sepakati fitur bersama pengguna sebelum implementasi. Jangan menganggap seluruh fitur referensi wajib dibuat.
- Mulai dari `docs/README.md` untuk otoritas dokumen. `docs/PRD.md` adalah source of truth scope; `docs/UX.md` dan `docs/TECHNICAL.md` kontrak target; `docs/DELIVERY.md` penerimaan; `docs/DECISIONS.md` rekam keputusan/dependensi. Panduan ini bukan spesifikasi produk kedua; konflik wajib diselaraskan, bukan dipilih sepihak.
- Rilis pertama: Android/Indonesia/satu edisi, panduan festival offline dan shop penuh resmi Pestapora (FR-01–FR-15). Stamp/QR aktivitas/misi/hadiah ditunda; QR pengambilan merchandise masuk scope. Tiket internal bukan syarat rilis.
- Web terpisah: operator konten/shop/stok/pesanan/refund dan petugas booth terbatas hanya cari/pindai/serah; Google/allowlist/peran diperiksa backend. Draft → terbit untuk konten, bukan alur transaksi. Tidak ada admin dalam mobile.

## Keputusan teknologi

- Mobile: React Native, TypeScript, dan Expo dengan development build. Expo Go bukan batas kemampuan aplikasi.
- Backend: Go; versi toolchain/dependensi mengikuti `backend/go.mod` terbaru, bukan angka salinan dalam dokumentasi. Manifest bukan bukti runtime sudah diverifikasi.
- Database: PostgreSQL melalui `github.com/jackc/pgx/v5`; HTTP backend menggunakan `net/http`.
- Admin web: React, TypeScript, dan Vite; periksa kondisi source terbaru sebelum menyatakan implementasinya tersedia.
- Jangan mengganti stack atau beralih ke Community CLI tanpa keputusan pengguna.
- Jangan menetapkan library navigasi, state management, penyimpanan lokal, atau layanan build sebelum memeriksa dependensi yang tersedia dan membahas pilihan utama yang belum diputuskan.

## Peta proyek

- `mobile/`: aplikasi React Native/Expo; manifest dan source sudah tersedia. Keberadaan source bukan bukti seluruh baseline sudah diimplementasikan.
- `backend/cmd/server/`: entry point server HTTP.
- `backend/internal/api/`: handler dan kontrak HTTP yang sudah tersedia.
- `backend/internal/store/`: koneksi PostgreSQL dan penerapan SQL.
- `backend/internal/sync/`: logika revisi konten.
- `backend/migrations/`: migrasi skema SQL.
- `backend/seed/`: data contoh SQL; bukan sumber data festival produksi.
- `docs/`: PRD, UX, spesifikasi teknis/data/API, rencana implementasi/penerimaan, dan catatan keputusan. Mulai dari `docs/README.md`.
- `FUJI-ROCK-FESTIVAL-26_6.0.2_apkcube.apks`: artefak referensi, bukan source code Pespor.

Periksa kondisi folder dan manifest terbaru sebelum bekerja; jangan menganggap catatan kondisi awal tetap berlaku.

## Batas penggunaan referensi

- Gunakan arsip FUJI ROCK untuk memahami jenis konten, navigasi, dan perilaku yang relevan, bukan untuk menyalin identitas visual.
- Bedakan temuan yang teramati, hasil analisis statis, dan dugaan. Cantumkan sumber temuan; keberadaan endpoint atau aset tidak membuktikan fitur berjalan.
- Jangan mengubah atau menimpa arsip asli. Pisahkan hasil ekstraksi dari source aplikasi dan jangan memasukkan hasil ekstraksi besar tanpa kebutuhan yang disepakati.
- Jangan menyalin kode, logo, gambar, font, atau aset lain tanpa izin atau lisensi yang sesuai.
- Jangan menggunakan kredensial dari referensi atau mengakses layanan privatnya tanpa izin eksplisit.

## Pengalaman pengunjung dan offline

- Konten inti yang sudah tersimpan—jadwal, lineup, informasi penting, favorit, dan peta beserta titiknya—harus tetap dapat dibuka tanpa koneksi.
- Jangan menjanjikan data yang belum pernah diunduh tersedia offline. Sediakan keadaan awal, loading, kosong, dan gagal yang jelas.
- Kegagalan jaringan atau sinkronisasi tidak boleh menghapus data lokal yang masih valid maupun perubahan favorit yang belum tersinkron.
- Bedakan data tersimpan dengan data terbaru; tampilkan status sinkronisasi ketika relevan.
- Jangan menyatakan tindakan yang memerlukan server berhasil sebelum ada konfirmasi server. Jika mendukung antrean offline, jelaskan status tertundanya.
- Desain harus dapat diakses: label elemen interaktif, keterbacaan teks, kontras, dan target sentuh yang memadai.
- Google opsional untuk panduan/katalog/keranjang lokal dan sinkronisasi pilihan; wajib untuk checkout dan pesanan shop sendiri. Jangan mempercayai `user_id` request atau QR/reference sebagai bukti pembayaran tanpa pemeriksaan backend.
- Pengingat lokal slot pilihan adalah 15 menit sebelum penampilan; kontrak pengaturan perangkat dan rekonsiliasi mengikuti UX/TECHNICAL. Perubahan jadwal baru diselaraskan setelah data diterima; izin ditolak tidak boleh memblokir aplikasi.
- Tiket rilis pertama membuka kanal resmi mitra di luar aplikasi. Loket.com/Ticketmelon masih proses kerja sama; jangan mengarang kontrak API, QR valid, atau dukungan tiket offline.
- Shop wajib rilis: merchandise resmi saja, QRIS+VA, varian/stok, penjualan sebelum/selama festival, ambil lengkap sekali di satu booth dengan petugas online. Gateway/kebijakan belum lengkap dicatat O-14–O-18, bukan diisi simulasi.
- Pembayaran/refund hanya sukses berdasarkan konfirmasi terverifikasi; cegah oversell dan pengambilan ganda. Pembatalan disetujui/no-show memblokir pickup sebelum refund penuh; kegagalan tidak dinyatakan selesai. Data transaksi/ledger tidak dihapus buta oleh penghapusan akun.

## Cara bekerja

- Gunakan bahasa Indonesia dalam diskusi dan dokumentasi proyek; ikuti konvensi penamaan kode yang sudah ada.
- Perubahan kecil dalam lingkup yang disepakati boleh langsung dikerjakan. Bahas fitur baru, perubahan arsitektur, dependensi utama, dan perubahan kontrak yang berdampak luas sebelum implementasi.
- Baca implementasi dan manifest terkait terlebih dahulu. Endpoint yang sudah ada bukan otomatis keputusan fitur produk atau bukti kesiapan produksi.
- Pilih perubahan terkecil yang benar; dahulukan stdlib, kemampuan platform, dan dependensi yang sudah terpasang. Hindari abstraksi dan konfigurasi untuk kebutuhan hipotetis.
- Untuk perubahan API atau skema, perbarui seluruh konsumen yang terdampak dan gunakan migrasi yang mempertahankan data. Jangan mengubah migrasi yang sudah diterapkan.
- Jangan menimpa perubahan pengguna atau menjalankan operasi destruktif tanpa persetujuan.
- Validasi masukan pada batas kepercayaan; identitas dari request bukan pengganti autentikasi dan otorisasi. Jangan menyimpan rahasia dalam source atau log.

## Menjalankan dan memverifikasi

- Baca script dan manifest aktual sebelum memilih perintah. Jangan mengarang script mobile ketika `package.json` belum tersedia.
- Berdasarkan entry point saat ini, backend dijalankan dari direktori `backend/` dengan `go run ./cmd/server`. Perintah ini belum diuji sebagai bagian dari penulisan panduan.
- Backend membutuhkan PostgreSQL yang dapat diakses melalui `DATABASE_URL`; `ADDR` mengatur alamat listen, dengan default `:8080`.
- Startup backend menerapkan SQL dari `migrations/` dan dapat mengubah database. Gunakan database pengembangan terpisah, bukan database produksi.
- `SEED=1` meminta penerapan data contoh saat startup. Periksa SQL dan mekanisme pelacakan migrasi sebelum menggunakannya; jangan menganggap data contoh otomatis diterapkan atau aman untuk produksi.
- Untuk perubahan perilaku, jalankan alur yang berubah dan amati hasilnya. Build atau pemeriksaan tipe saja bukan bukti perilaku benar.
- Perubahan UI mobile diverifikasi pada development build di emulator atau perangkat. Perubahan offline diperiksa setelah data tersimpan, koneksi diputus, dan aplikasi dibuka kembali.
- Untuk logika nontrivial, sisakan satu pemeriksaan otomatis kecil yang dapat dijalankan dan menguji perilaku pengguna atau invariant penting; gunakan konvensi pengujian yang sudah ada.
- Laporkan perintah atau skenario yang benar-benar dijalankan, hasilnya, dan keterbatasannya. Jangan mengklaim pengujian, platform, atau fitur yang belum diverifikasi.
- Perbarui dokumentasi yang terdampak ketika keputusan, kontrak, atau cara menjalankan proyek berubah.
