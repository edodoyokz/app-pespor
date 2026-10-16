# Keputusan dan dependensi baseline

Status: keputusan scope disepakati dalam diskusi pengguna pada 16 Oktober 2026. Implementasi, akses layanan, dan kesiapan rilis tidak dinyatakan selesai oleh dokumen ini.

**Otoritas:** catatan ini menyimpan asal keputusan dan dependensi terbuka, bukan scope kedua. PRD memiliki kebutuhan produk; UX dan TECHNICAL memiliki kontrak target; DELIVERY memverifikasi. Aturan penyelesaian konflik ada di [README.md](README.md). Tabel D hanya keputusan pengguna; rincian turunan di bawah adalah pilihan implementasi baseline, bukan persetujuan pengguna yang direkayasa.

## Keputusan produk yang disepakati

| ID | Keputusan | Konsekuensi |
| --- | --- | --- |
| D-01 | Pespor adalah mobile Pestapora untuk pengunjung | Tidak ada fungsi operator di aplikasi mobile |
| D-02 | Android dahulu, bahasa Indonesia, satu edisi aktif | iOS, pemilih edisi, dan arsip di luar scope rilis pertama |
| D-03 | Konsep FUJI ROCK, desain dan stack sendiri | Fitur dipilih melalui diskusi; aset/kode/identitas tidak disalin tanpa hak |
| D-04 | React Native + TypeScript + Expo development build | Expo Go bukan batas kapabilitas; versi mengikuti manifest dan kompatibilitas yang diverifikasi |
| D-05 | Backend Go + PostgreSQL/pgx | Infrastruktur dan versi database produksi belum ditetapkan |
| D-06 | Empat kelompok fitur panduan wajib | Lineup/jadwal, peta/fasilitas, informasi/pengumuman dan direktori tenant tetap wajib; shop resmi ditambahkan D-19–D-27, bukan perluasan transaksi tenant |
| D-07 | Aktivitas interaktif ditunda | Stamp/QR check-in aktivitas/misi/hadiah di luar rilis pertama; tidak melarang QR bukti pengambilan pesanan shop D-21 |
| D-08 | Konten inti offline setelah tersimpan | Tidak mengklaim data baru atau tiket tersedia offline; data lama tidak dihapus oleh sync gagal |
| D-09 | Google opsional untuk panduan/pilihan lokal | Akun menambah sinkronisasi/pemulihan. Kewajiban login khusus transaksi shop mengikuti D-22; guest tetap bisa menjelajah katalog |
| D-10 | Pengingat lokal 15 menit, dapat dimatikan | Bukan pengingat 10 menit; perubahan diterapkan saat data diterima; izin notifikasi tidak wajib untuk menggunakan aplikasi |
| D-11 | Peta ilustrasi interaktif offline setelah unduhan | Zoom/pan, titik dan pencarian; tanpa GPS/routing |
| D-12 | Beli eksternal, target tampilkan tiket melalui mitra resmi | Loket.com/Ticketmelon masih dealing; belum ada API/kerja sama tersedia |
| D-13 | Rilis boleh tanpa tiket internal | Tiket rilis pertama memakai kanal resmi eksternal, tanpa QR/tiket palsu atau checkout tiket; transaksi merchandise resmi D-19 tetap wajib |
| D-14 | Admin web terpisah, React + TypeScript + Vite | Tambahan scope proyek, tidak memperluas mobile ke panitia |
| D-15 | Operator Google + allowlist backend | Operator mengelola konten; batas awal hanya satu role proyek **digantikan D-24** untuk petugas booth terbatas. Tidak ada editor/approver bertingkat |
| D-16 | Admin draft → terbit | Kelola konten lineup, panggung/jadwal, peta/fasilitas, tenant, informasi, pengumuman; simpan draft tidak memublikasikan atau mengirim push |
| D-17 | Scope diskusi menjadi baseline; analisis referensi terpisah | Tidak perlu menunggu reverse engineering; hasil riset berikutnya tidak otomatis mengubah scope |
| D-18 | Paket lima dokumen disetujui | PRD, UX, TECHNICAL, DELIVERY, DECISIONS; README sebagai indeks dan AGENTS diselaraskan |
| D-19 | Shop penuh wajib rilis pertama, merchandise resmi Pestapora saja | Satu toko/pengelola; bukan marketplace, merchandise artis atau transaksi tenant lain |
| D-20 | Varian ukuran/warna dan stok per SKU | Harga/stok setiap kombinasi; produk tanpa varian tetap dapat dijual |
| D-21 | Jual sebelum/selama festival; ambil lengkap sekali di satu booth resmi | Tanpa pengiriman/parsial/pemisahan booth/transfer hak ambil; petugas wajib validasi online dan tidak menyerahkan lewat alur aplikasi saat koneksi putus |
| D-22 | Google wajib checkout dan pesanan | Guest boleh katalog/keranjang lokal serta fitur panduan; pemilik akun mengakses riwayat dan permintaan pembatalan sendiri |
| D-23 | QRIS + virtual account wajib | Gateway belum dipilih; akses sandbox/produksi serta refund kedua metode menjadi prasyarat rilis shop |
| D-24 | Dua peran web: operator dan petugas booth terbatas | Menggantikan batas satu role proyek D-15. Operator mengelola konten/shop/stok/pesanan/refund; petugas hanya cari/pindai dan sahkan pengambilan, tanpa hak konten/harga/stok/refund |
| D-25 | Pembatalan pesanan dibayar sebelum diambil boleh diminta | Operator meninjau; persetujuan membatalkan hak ambil dan memproses refund penuh, bukan otomatis dana kembali |
| D-26 | Tidak diambil hingga batas waktu: refund penuh | Blokir hak ambil sebelum refund, tanpa serah barang setelah proses dimulai; batas pengambilan diumumkan sebelum bayar |
| D-27 | Batas transaksi disepakati | Backend menghitung total, stok ditahan sampai batas bayar; pembayaran terlambat tidak mengambil stok pembeli lain. Tanpa promo/voucher/cicilan/COD/bayar booth; bukti QR shop diverifikasi online, bukan tiket masuk |

## Kontrak implementasi turunan

[TECHNICAL.md](TECHNICAL.md) dan [UX.md](UX.md) adalah acuan target implementasi untuk memenuhi PRD, bukan daftar proposal yang boleh dipilih sebagian. Rincian berikut ditetapkan sebagai default implementasi minimum dalam baseline; bukan klaim setiap rincian telah dipilih eksplisit oleh pengguna:

- UX memiliki lima tab dan alur interaksi; brand/warna/aset final tetap O-03.
- Pengingat memakai satu pengaturan aktif/nonaktif per perangkat untuk seluruh slot pilihan, awalnya nonaktif sampai diaktifkan pengguna; tidak ada toggle per slot atau sinkronisasi preferensi pengingat lintas perangkat.
- Login mengimpor pilihan guest sekali ke akun yang dituju dengan penjelasan/konfirmasi; kegagalan tidak menghilangkan pilihan dan tidak boleh memindahkan impor tertunda ke akun lain.
- TECHNICAL memiliki aturan CAS/rebase, isolasi logout, penghapusan akun, snapshot publikasi, dan keamanan. UX tidak mendefinisikan ulang protokol tersebut.
- Tenant/pengumuman yang tersimpan ikut dapat dibaca offline, tetapi pembaruan masih memerlukan jaringan. Kontrak cache tidak menciptakan kewajiban data yang belum pernah diunduh.
- Shop memakai domain transaksi terpisah dari draft publikasi konten. Katalog bisa tersimpan, tetapi harga/stok dan status pembayaran/refund/pengambilan harus diperiksa server online.
- Default kontrak: permintaan pembatalan menahan pengambilan sampai ditinjau; penolakan hanya membuka kembali jika masih memenuhi syarat dan belum lewat batas. Persetujuan/refund/no-show memblokir pengambilan secara atomik.
- Bukti pickup rahasia diterbitkan hanya ke pemilik akun; petugas berizin online menggunakannya untuk validasi sekali. Referensi pesanan publik/predictable bukan otorisasi serah barang. Prosedur fallback verifikasi pemilik mengikuti O-17.
- Refund penuh mengembalikan seluruh total pembeli tanpa potongan. Gateway, biaya penyelenggara, retensi ledger/pesanan dan pemrosesan permintaan penghapusan akun tetap O-11/O-14/O-18, bukan asumsi transaksi boleh dihapus cascade.

Nilai terbuka hanya dicatat di O-01–O-18. OAuth/push, gateway shop, jadwal/biaya dan retensi belum final; endpoint target bukan bukti kontrak pihak ketiga. Jika keputusan baru dibutuhkan, tambahkan ke daftar ini beserta gate terkait, bukan tersembunyi di turunan.

Jika implementasi memerlukan penggantian stack, dependensi utama, perluasan fitur, atau perubahan besar kontrak, diskusikan sebelum mengubahnya. Jangan menyelesaikan ketidakpastian dengan menambahkan fitur di luar scope.

## Dependensi terbuka

Kolom penanggung jawab di bawah adalah fungsi yang perlu ditunjuk, bukan nama orang yang sudah ditetapkan. Dependensi memblokir bagian terkait, bukan seluruh penyusunan dokumen.

| ID | Belum dikonfirmasi | Penanggung jawab yang dibutuhkan | Harus selesai sebelum |
| --- | --- | --- | --- |
| O-01 | Edisi, tanggal, venue, zona waktu, dan hari festival resmi | Pemilik produk/penyelenggara | Memasukkan data produksi dan menerima pengujian jadwal/pengingat |
| O-02 | Tenggat rilis, target perangkat/Android minimum, kapasitas dan target performa terukur | Produk + teknis | Perencanaan rilis final dan uji beban/perangkat; angka tidak diada-adakan dalam baseline |
| O-03 | Logo/brand, desain final, foto penampil, lisensi peta dan dimensi/koordinat titik | Desain + tim konten | Menyelesaikan UI dan menerbitkan aset produksi |
| O-04 | Data lineup/jadwal/tenant, FAQ/aturan, kontak bantuan dan PIC publikasi | Tim konten/operasional | Uji konten produksi dan distribusi publik |
| O-05 | Akses/API resmi Loket.com atau Ticketmelon, pilihan mitra, hak penggunaan dan spesifikasi tiket | Kemitraan + teknis | Merancang atau menjanjikan tiket internal; bukan gate rilis link-out |
| O-06 | Minimal satu tautan resmi pembelian/pembukaan tiket yang dikonfirmasi dan kontak dukungan mitra | Kemitraan + operator | Kelulusan FR-09 dan rilis pertama; tidak mensyaratkan API tiket atau kedua mitra sekaligus |
| O-07 | Project/client OAuth Google, client SDK/alur nonce/PKCE/reauth, secure storage, package ID/signing Android, callback/audience/Origin yang cocok dokumentasi resmi | Teknis + pemilik distribusi | Implementasi integrasi login mobile/admin dan uji development/release build; kontrak target tidak berarti SDK/provider sudah dipilih atau terpasang |
| O-08 | Allowlist operator dan petugas booth, pemeriksaan peran dan proses cabut akses | Pemilik operasional + teknis | Akses web/API nyata; Google valid tidak otomatis memberi hak operator/booth, hak commerce terbatas mengikuti O-17 |
| O-09 | Transport/token/payload push terlihat, credentials, consent/izin, handler dan batas background Android yang didukung | Teknis | Implementasi push dan penerimaan perangkat nyata; sender atau provider accepted bukan bukti delivery ke pengunjung |
| O-10 | Hosting API/admin, domain/TLS, penyimpanan aset, database, backup dan pemulihan | Teknis/operasional | Integrasi staging, publikasi aset, dan persetujuan produksi |
| O-11 | Privasi/retensi sesi/receipt/idempotensi/publication, akun/pilihan/token/backup dan catatan transaksi minimum | Produk + privasi/operasional/teknis | Finalisasi lifecycle akun dan distribusi; retensi shop/penyelesaian pesanan/refund mengikuti O-18, tanpa janji menghapus semua ledger/backup saat profil dihapus |
| O-12 | Akun distribusi Android, pemegang signing key, konfigurasi store dan perangkat uji | Pemilik distribusi + QA/teknis | Persetujuan distribusi publik |
| O-13 | SOP draft/preview/publish, perubahan jadwal mendadak, koreksi pengumuman, backup dan pemulihan konten | Tim konten + operasional/teknis | Simulasi operasional dan persetujuan rilis |
| O-14 | Gateway, merchant/account credentials, sandbox/produksi, QRIS/VA, webhook/status/refund/reconciliation dan masa berlaku pembayaran provider | Keuangan/kemitraan + teknis | Implementasi integrasi terarah, uji pembayaran/refund kedua metode, dan rilis shop; tidak boleh mengganti transaksi nyata dengan mock |
| O-15 | Jadwal buka/tutup penjualan sebelum/selama festival, durasi tahan stok/batas bayar, jam dan batas akhir pengambilan satu booth | Operasional toko + teknis | Membuka penjualan; batas server harus konsisten dengan gateway, ditampilkan sebelum bayar dan diuji terhadap pembayaran terlambat/no-show |
| O-16 | Daftar SKU/varian, stok awal/sumber stok, harga IDR, biaya/pajak/total, produk/foto resmi dan PIC persediaan | Toko/keuangan + konten | Publikasi produk dan checkout produksi; tidak mengarang harga/biaya/stok dari fixture |
| O-17 | Petugas allowlist terbatas, koneksi booth, verifikasi pemilik jika bukti hilang, QR rahasia dan SOP gangguan/pengambilan | Operasional booth + teknis | Uji penyerahan online sekali dan rilis; tanpa serah offline atau override pembayaran oleh petugas |
| O-18 | Ketentuan rinci pembatalan/no-show, dukungan/refund SLA/metode/biaya, kewajiban hukum dan retensi/minimisasi data transaksi termasuk penghapusan akun | Produk + hukum/keuangan/dukungan | Penjualan dibuka; full refund tidak dipotong biaya dan hak ambil diblokir, tetapi dana kembali hanya setelah konfirmasi gateway |

## Kondisi implementasi dan batas bukti

- Repository berubah selama diskusi; sumber kode adalah bukti struktur implementasi, bukan verifikasi runtime. [TECHNICAL.md](TECHNICAL.md) memetakan gap terhadap kebutuhan.
- Versi toolchain/dependensi dan keberadaan implementasi ditentukan manifest/source terbaru. Snapshot hasil pembacaan dan gap tersimpan hanya di TECHNICAL bagian 2; catatan itu bukan kontrak runtime permanen.
- Ketentuan prototype atau catatan lama yang berbeda dari PRD adalah gap penyelarasan, bukan baseline alternatif. Analisis referensi belum menjadi bukti dalam baseline ini.
- Tidak ada klaim verifikasi hasil analisis FUJI ROCK, integrasi tiket, login Google, push, fitur offline, atau kelulusan aplikasi pada Android dalam penulisan baseline. Bukti runtime harus ditambahkan saat implementasi diuji.
- Kode dan skema yang sudah ada tidak dihapus hanya karena belum masuk scope. Rencana penyelarasan disusun tanpa menimpa pekerjaan pengguna.

## Aturan perubahan baseline

1. Usulkan perubahan scope/keputusan beserta alasan dan dampaknya terhadap rilis/offline/operasional.
2. Dapatkan keputusan pengguna untuk perubahan utama; catat keputusan pengganti tanpa membiarkan dua ketentuan aktif yang bertentangan.
3. Selaraskan PRD, UX, TECHNICAL, DELIVERY, README, dan AGENTS yang terdampak dalam perubahan yang sama. Perubahan kode atau DECISIONS saja tidak mengubah janji produk; jangan meninggalkan dua aturan aktif yang bertentangan.
4. Catat bukti pengujian nyata terpisah dari kriteria yang baru direncanakan; daftar penerimaan bukan laporan kelulusan.
