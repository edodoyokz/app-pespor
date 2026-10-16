# Baseline Pespor

Aplikasi mobile Pestapora untuk pengunjung, dengan desain sendiri dan konsep konten yang mengambil referensi FUJI ROCK. Scope disepakati melalui diskusi pengguna; penulisan dokumen tidak membuktikan implementasi sudah selesai.

## Dokumen baseline

| Dokumen | Otoritas utama |
| --- | --- |
| [PRD.md](PRD.md) | Scope/hasil produk wajib FR-01–FR-15 dan batas rilis pertama, termasuk shop resmi |
| [UX.md](UX.md) | Kontrak interaksi/struktur layar target; bukan desain visual final |
| [TECHNICAL.md](TECHNICAL.md) | Kontrak implementasi target, data/API dan sinkronisasi; bagian 2 hanya snapshot kode saat audit |
| [DELIVERY.md](DELIVERY.md) | Urutan kerja, kriteria penerimaan dan gate rilis; bukan sumber fitur tambahan |
| [DECISIONS.md](DECISIONS.md) | Rekam keputusan D-01–D-27 dan dependensi terbuka O-01–O-18; keputusan pengganti ditandai eksplisit |

Mulai dari PRD. Tabel ini menetapkan **satu pemilik untuk setiap jenis informasi**, bukan enam spesifikasi yang saling menggantikan. README adalah indeks; [AGENTS.md](../AGENTS.md) mengatur cara kerja agen, bukan scope produk kedua.

### Status dan penyelesaian konflik

- **Keputusan produk:** kebutuhan yang disepakati pengguna dan dicatat dalam PRD/DECISIONS. Perubahan scope membutuhkan keputusan pengguna, lalu pembaruan semua dokumen terdampak dalam satu perubahan.
- **Kontrak target:** rincian UX/teknis yang menjadi acuan implementasi baseline, bukan alternatif bebas atau klaim seluruh rincian dipilih langsung oleh pengguna. Perubahan kontrak utama dibahas sebelum implementasi; rincian ini tidak boleh memperluas scope PRD.
- **Terbuka:** dependensi kanonis O-01–O-18 di DECISIONS. Tabel prasyarat lain hanya menerapkan daftar itu. Jangan mengisi ketidakpastian dengan asumsi atau mock sebagai hasil final.
- **Snapshot implementasi:** inventaris source pada TECHNICAL bagian 2 dan perintah di bawah merekam keadaan saat penyusunan. Manifest/source terbaru menentukan apa yang benar-benar tersedia; kode yang berbeda dari target adalah gap, bukan pengganti kebutuhan.
- **Bukti penerimaan:** status aplikasi baru boleh disebut lulus setelah hasil aktual per skenario/gate DELIVERY dicatat. Baseline dokumentasi bukan bukti runtime.

Jika dokumen bertentangan, scope PRD membatasi semua turunan; UX memiliki interaksi, TECHNICAL memiliki protokol/data, DELIVERY hanya memverifikasi keduanya. DECISIONS menyimpan asal keputusan dan hal terbuka, bukan override PRD secara diam-diam. Jangan memilih aturan dari file yang paling baru atau menganggap ringkasan lebih kuat: selaraskan pemilik informasi dan semua turunan sebelum mengerjakan bagian yang konflik; pekerjaan lain yang tidak terdampak tetap dapat berjalan.

## Ringkasan scope dan stack

- Android, bahasa Indonesia, satu edisi; Google opsional untuk panduan/katalog dan pilihan lokal, wajib checkout/riwayat pesanan.
- Wajib: panduan festival/offline dan **shop penuh merchandise resmi Pestapora**—varian/stok, keranjang, checkout QRIS+VA, pesanan, pengambilan lengkap sekali online di satu booth, pembatalan ditinjau/refund penuh serta refund penuh no-show. Penjualan sebelum/selama festival; gateway belum dipilih, kesiapan shop memblokir rilis.
- Mobile: React Native + TypeScript + Expo development build; backend: Go + PostgreSQL/pgx, versi Go mengikuti `backend/go.mod`.
- Web React + TypeScript + Vite terpisah: operator konten/shop/refund dan petugas booth terbatas; Google + allowlist/backend role checks. Draft → terbit untuk konten, bukan edit bebas stok/status transaksi. Stack disepakati bukan bukti implementasi tersedia.
- Rilis pertama memakai tautan tiket resmi. Tiket internal menunggu kerja sama/API Loket.com atau Ticketmelon dan tidak memblokir rilis.
- Stamp/QR check-in aktivitas/misi/hadiah, iOS, multi-edisi, GPS/routing, marketplace/transaksi tenant lain, pengiriman, pickup parsial dan promo **di luar rilis pertama**. QR pengambilan merchandise resmi masuk scope; tiket internal tetap tahap berikutnya bersyarat.

## Perintah yang tersedia di source

Perintah berikut dibaca dari entry point/manifest, **tidak dijalankan sebagai bagian penulisan baseline**. Gunakan database pengembangan terpisah: startup backend menerapkan SQL dari `migrations/`.

Backend, dari direktori `backend/`:

```sh
go run ./cmd/server
```

Prasyarat: toolchain sesuai `go.mod`, PostgreSQL yang dapat diakses melalui `DATABASE_URL`. `ADDR` default `:8080`; `SEED=1` meminta penerapan data contoh, bukan data produksi. Periksa SQL dan pelacakan migrasi sebelum seed; lihat [TECHNICAL.md](TECHNICAL.md). `FCM_CREDENTIALS` digunakan entry point untuk inisialisasi pengirim push, tetapi credentials dan delivery produksi belum diverifikasi.

Mobile, dari direktori `mobile/`, menggunakan lockfile pnpm yang tersedia:

```sh
pnpm install
pnpm android
pnpm start
pnpm typecheck
```

`pnpm android` membutuhkan Android SDK serta emulator/perangkat dan membangun aplikasi native. `pnpm start` menjalankan Metro untuk development build, bukan pengganti instalasi build native. Manifest menyediakan script iOS, tetapi iOS bukan target penerimaan rilis pertama. Jangan menyimpulkan kompatibilitas versi dependensi hanya dari keberadaan manifest.

## Batas bukti dan pekerjaan berikutnya

Repository berisi prototype backend/mobile dan script pemeriksaan; itu bukan bukti FR terpenuhi. Ketentuan lama pada prototype yang berbeda dari PRD adalah gap migrasi, bukan baseline alternatif. Analisis arsip FUJI ROCK tetap pekerjaan riset terpisah dan tidak otomatis menambah fitur.

Tidak ada pemeriksaan runtime aplikasi dilakukan untuk penulisan baseline. Rencana pengujian dan gate di DELIVERY adalah pekerjaan yang harus dibuktikan saat implementasi, bukan laporan lulus. Gunakan DECISIONS untuk dependensi dan TECHNICAL untuk gap sebelum melanjutkan kode.

