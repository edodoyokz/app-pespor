# PRD — Pespor

Status: baseline scope disetujui melalui diskusi, termasuk perluasan shop penuh pada 16 Oktober 2026. Dokumen menetapkan kebutuhan, bukan fitur yang sudah selesai. Tanggal rilis dan edisi Pestapora belum dikonfirmasi.

**Otoritas:** dokumen ini adalah source of truth scope dan hasil produk. Aturan kepemilikan ada di [README.md](README.md); UX/TECHNICAL adalah kontrak target, bukan bukti implementasi. Dependensi belum terkonfirmasi mengikuti O-01–O-18 di DECISIONS.

## 1. Produk dan masalah

Pespor adalah aplikasi mobile Pestapora untuk pengunjung: menemukan penampil, merencanakan tontonan, mencari fasilitas/tenant, membaca informasi resmi, serta membeli merchandise resmi untuk diambil di booth festival. Konten festival yang diunduh tetap berguna tanpa koneksi; transaksi shop dan pengesahan pengambilan wajib online.

Konsep konten dan alur mengambil referensi FUJI ROCK; desain, identitas, dan implementasi Pespor dibuat sendiri. Arsip referensi belum dianalisis untuk baseline ini. Daftar fitur berasal dari keputusan pengguna, bukan klaim kesetaraan dengan aplikasi tersebut.

## 2. Pengguna dan hasil yang dituju

| Pengguna | Kebutuhan | Hasil yang harus dapat dibuktikan |
| --- | --- | --- |
| Pengunjung tanpa akun | Langsung mendapatkan informasi dan merencanakan kunjungan | Dapat melihat konten, memilih penampil/jadwal, dan membukanya kembali tanpa login |
| Pengunjung dengan akun Google | Sinkronisasi pilihan serta pembelian merchandise | Pilihan diakui server dapat dipulihkan; pesanan milik akun dapat dibayar/dipantau dan diambil sekali |
| Operator | Konten dan operasional toko resmi | Mengelola konten terbit, produk/varian/harga/stok, pesanan dan persetujuan refund melalui web |
| Petugas booth | Menyerahkan pesanan yang sah | Akses terbatas untuk mencari/memindai dan mengesahkan pengambilan online; tanpa hak konten, harga, stok atau refund |

Keberhasilan rilis diukur melalui skenario penerimaan di [DELIVERY.md](DELIVERY.md), bukan angka unduhan atau kapasitas yang belum disepakati. Target performa, kapasitas, perangkat minimum, tanggal/edisi, dan penanggung jawab operasional harus ditetapkan sebelum persetujuan rilis; lihat [DECISIONS.md](DECISIONS.md).

## 3. Batas rilis pertama

- Android dahulu, bahasa Indonesia, satu edisi Pestapora aktif. Tidak ada pemilih edisi atau arsip tahun sebelumnya.
- Mobile khusus pengunjung. Panel admin web adalah aplikasi operasional terpisah.
- Akun Google opsional untuk konten festival, favorit/jadwal lokal dan katalog/keranjang lokal; wajib untuk checkout, riwayat pesanan, pembatalan dan pengambilan pesanan milik akun.
- Tiket rilis pertama berupa tautan ke kanal resmi. Rilis tidak menunggu integrasi tiket internal.
- Shop merchandise resmi Pestapora wajib rilis pertama: QRIS + virtual account, penjualan sebelum/selama festival, ambil lengkap sekali di satu booth resmi. Gateway belum dipilih; kesiapan pembayaran/refund/stok/booth memblokir rilis jika belum terbukti.
- Teknologi disepakati: React Native + TypeScript + Expo development build; Go + PostgreSQL/pgx; admin React + TypeScript + Vite.

## 4. Kebutuhan fungsional

FR-01–FR-15 wajib rilis pertama. “Akun opsional” berarti pengguna boleh menjelajah festival/katalog tanpa login, bukan fitur akun boleh dihilangkan; transaksi shop memerlukan login. Izin notifikasi boleh ditolak, tetapi kemampuan push/pengingat tetap dibuktikan. Tiket internal dan fitur pada bagian 5 di luar scope; shop resmi bukan transaksi tenant.

| ID | Kebutuhan | Batas dan kriteria produk |
| --- | --- | --- |
| FR-01 | Beranda dan satu edisi aktif | Tampilkan identitas edisi, akses jadwal/lineup/peta/informasi dan kanal tiket resmi. Tidak menawarkan edisi lain. Jangan menampilkan data contoh sebagai informasi festival resmi. |
| FR-02 | Lineup dan favorit penampil | Daftar, pencarian nama, detail penampil, dan tambah/hapus favorit. Favorit penampil berbeda dari memilih slot jadwal; tidak otomatis memilih seluruh penampilannya. |
| FR-03 | Jadwal personal dan pengingat | Jadwal per hari/panggung; tambah/hapus slot dari jadwal pribadi. Konflik waktu ditampilkan tanpa melarang pilihan. Pengingat lokal 15 menit sebelum slot pilihan, dapat dimatikan. Pembatalan/perubahan diterapkan setelah data terbaru diterima. |
| FR-04 | Peta dan fasilitas | Peta ilustrasi dapat di-zoom/pan, titik panggung/fasilitas/tenant dan pencarian. Data peta termasuk gambar tersedia offline setelah unduhan berhasil. Tidak ada lokasi pengguna, GPS langsung, atau petunjuk rute. |
| FR-05 | Informasi dan pengumuman | Panduan, FAQ, aturan barang bawaan, informasi bantuan, serta pengumuman/perubahan jadwal. Pengumuman tersedia dalam aplikasi dan dapat dikirim sebagai push. Push bukan kanal darurat yang dijamin sampai. |
| FR-06 | Direktori tenant | Daftar/detail makanan dan merchandise, kategori/lokasi pada peta. Tidak memproses pesanan atau pembayaran tenant lain. Shop resmi Pestapora adalah domain terpisah FR-11–FR-15. |
| FR-07 | Offline dan kesinambungan data | Jadwal, lineup, informasi penting, favorit, dan peta yang sudah tersimpan dapat dibuka setelah aplikasi ditutup lalu dibuka offline. Kegagalan sinkronisasi tidak menghapus data valid atau pilihan lokal. Pengguna mengetahui data tersimpan/belum tersedia/belum tersinkron. |
| FR-08 | Akun Google | Opsional untuk personalisasi festival dan katalog/keranjang lokal; wajib untuk checkout dan akses pesanan sendiri. Guest tetap lokal; impor pilihan tidak menghilangkan data atau memindahkannya antar akun tanpa konfirmasi. |
| FR-09 | Kanal tiket resmi | Tampilkan tautan HTTPS kanal pembelian/pembukaan tiket resmi di luar Pespor; bedakan penyedia bila lebih dari satu. Minimal satu kanal resmi yang dikonfirmasi diperlukan sebelum rilis. Tiket internal hanya target tahap berikutnya; tanpa QR/tiket contoh atau janji akses gerbang. |
| FR-10 | Operator konten | Admin web memakai Google + allowlist backend; operator mengelola lineup, panggung/jadwal, peta, tenant, informasi/pengumuman dengan draft → terbit. Draft tidak mengubah publik atau mengirim push. Peran booth FR-15 tidak memperoleh hak ini. |
| FR-11 | Katalog dan keranjang shop resmi | Produk resmi Pestapora, detail/foto, pilihan ukuran/warna, SKU/harga/stok per kombinasi; produk tanpa varian juga boleh. Keranjang lokal dapat dipakai guest, tetapi harga/ketersediaan tersimpan bukan jaminan stok. |
| FR-12 | Checkout dan pembayaran | Google wajib; backend menghitung harga/biaya/total IDR dan menahan stok hingga batas bayar yang ditampilkan. QRIS dan virtual account wajib melalui gateway terpilih. Konfirmasi pembayaran berasal dari gateway yang diverifikasi, bukan layar sukses/redirect client. Retry tidak membuat pesanan/tagihan ganda. |
| FR-13 | Pesanan dan pengambilan | Riwayat/detail akun, status pembayaran dan bukti QR/referensi pesanan. Ambil seluruh barang sekali di satu booth resmi; petugas berizin memvalidasi online lalu mengesahkan satu kali. QR bukan tiket masuk atau stamp; bukti tersimpan saja bukan izin serah barang. |
| FR-14 | Pembatalan dan refund penuh | Pembeli boleh meminta pembatalan sebelum diambil, ditinjau operator; jika disetujui, hak ambil diblokir dan refund penuh diproses. Tidak diambil hingga batas waktu juga refund penuh. Permintaan/proses refund bukan dana sudah kembali; gateway gagal/tidak pasti harus direkonsiliasi, bukan diklaim sukses. |
| FR-15 | Operasional shop dan booth | Operator mengelola produk/varian/harga/stok, pesanan dan keputusan refund; petugas booth hanya melihat data minimum untuk pencarian/pemindaian/serah barang. Identitas/hak dicek backend; pembayaran, reservasi, serah barang dan refund bersaing secara aman, bukan edit status bebas. |

### Aturan jadwal dan pengingat

- Hari festival dan jam pertunjukan mengacu pada zona waktu resmi edisi, bukan otomatis zona waktu perangkat. Zona waktu edisi belum dikonfirmasi.
- Slot memiliki identitas stabil; perubahan waktu/panggung tidak menciptakan pilihan pengguna baru. Penampilan lintas tengah malam harus tetap terkait hari festival yang ditetapkan penyelenggara.
- Pengingat dijadwalkan ulang atau dibatalkan saat aplikasi menerima perubahan relevan. Pengingat tidak menjamin informasi terbaru bila perangkat masih offline.
- Izin notifikasi ditolak atau pembatasan Android tidak boleh memblokir jadwal personal. Jangan menjanjikan notifikasi tepat waktu bila OS menundanya.

### Aturan offline dan identitas

- Offline bukan jaminan mendapatkan data baru. Instalasi pertama tanpa unduhan menampilkan keadaan belum tersedia, bukan konten palsu.
- Peta dianggap siap offline hanya setelah gambar dan titik yang cocok tersimpan. Konten teks inti tidak boleh bergantung pada gambar dekoratif.
- Pengumuman dan tenant yang sudah tersimpan tetap dapat dibaca offline; kesegaran hanya diperbarui setelah sinkronisasi sukses. Informasi bantuan tidak bergantung pada push.
- Penggabungan pilihan lokal dengan akun, konflik antarperangkat, logout, dan penghapusan akun membutuhkan aturan deterministik. Rancangan minimum ada di [TECHNICAL.md](TECHNICAL.md); jangan menganggapnya fitur backend yang sudah tersedia.

### Aturan shop yang mengikat rilis

- Satu toko resmi, bukan marketplace atau penjualan merchandise artis/tenant lain. Tanpa pengiriman ke alamat, pengambilan parsial, pemisahan booth, atau transfer hak ambil dalam aplikasi.
- Penjualan dibuka sebelum dan selama festival; waktu mulai/tutup penjualan, batas bayar dan jam/batas pengambilan dikonfirmasi sebelum penjualan. Seluruh barang tetap diambil di booth pada jadwal yang diumumkan.
- Total akhir, varian/jumlah, biaya yang berlaku, lokasi/waktu pengambilan dan ketentuan pembatalan/refund terlihat sebelum komitmen bayar. Perubahan harga/ketersediaan perlu persetujuan ulang, bukan diam-diam menagih nominal lain.
- Stok tidak boleh terjual ganda. Pembayaran sukses terlambat setelah reservasi dilepas tidak boleh mengambil stok pembeli lain; pesanan diblokir dari pengambilan dan masuk rekonsiliasi/refund, bukan otomatis siap diambil.
- Permintaan pembatalan menahan pengambilan sampai diputuskan sebagai default kontrak target. Penolakan dapat membuka kembali hak ambil bila belum lewat batas dan syarat lain terpenuhi. Persetujuan/no-show memblokirnya sebelum mulai refund. Pengambilan dan keputusan pembatalan/refund tidak boleh sama-sama berhasil.
- Penyerahan hanya online, lengkap sekali; ketika koneksi booth putus, petugas tidak menyerahkan lewat alur aplikasi. Kebutuhan koneksi dan SOP gangguan wajib siap sebelum rilis.
- Tidak ada promo/voucher, cicilan, COD, bayar di booth, refund parsial, retur/penukaran mandiri. “Refund penuh” berarti seluruh total yang dibayar pembeli dikembalikan tanpa potongan; metode, biaya penyelenggara, durasi dan prosedur gateway harus dikonfirmasi sebelum menerima pembayaran.
- Offline dapat membaca katalog/detail pesanan yang sudah tersimpan dengan label data lama, tetapi tidak melakukan checkout, mengonfirmasi pembayaran/pembatalan/refund atau mengesahkan pengambilan. Keranjang tetap lokal, diverifikasi ulang saat checkout.

## 5. Yang tidak masuk rilis pertama

| Di luar scope | Perlakuan |
| --- | --- |
| Stamp rally, QR check-in aktivitas, misi/hadiah/penukaran | Ditunda; QR pengambilan pesanan shop FR-13 bukan aktivitas stamp dan tetap masuk scope |
| Tiket internal dan pemindaian gerbang | Menunggu kemampuan dan kesepakatan mitra; tidak memblokir rilis |
| Checkout/pembayaran/refund tiket di Pespor | Tiket tetap eksternal; batas ini tidak melarang transaksi merchandise resmi FR-12/FR-14 |
| iOS | Bukan syarat rilis pertama; jangan mengklaim sudah didukung tanpa verifikasi |
| Banyak edisi, arsip festival, multi-festival picker | Hanya satu edisi aktif dalam pengalaman pengunjung |
| GPS/routing, kepadatan venue real-time | Peta ilustrasi saja |
| Chat/social feed, marketplace, transaksi tenant/artis lain | Tidak disepakati; hanya toko merchandise resmi Pestapora |
| Role editor/approver/penjual tambahan | Hanya operator dan petugas booth terbatas; tanpa approval konten bertingkat atau marketplace |
| Pengiriman, pengambilan parsial/transfer, promo/voucher/cicilan/COD/bayar booth, refund parsial/retur mandiri | Shop resmi hanya pembayaran QRIS/VA dan ambil lengkap sekali online di satu booth; tidak memperluas metode/operasional di luar keputusan |
| CMS yang dapat mengganti struktur navigasi/desain aplikasi secara arbitrer | Konten dikelola admin, desain aplikasi tetap milik Pespor |

## 6. Tiket dan mitra

Loket.com dan Ticketmelon sedang dalam proses dealing; API/kerja sama belum tersedia. Belum ada keputusan apakah satu atau kedua mitra akan diintegrasikan.

Target berikutnya: beli eksternal, tampilkan tiket di Pespor melalui integrasi resmi. Validasi identitas pemilik tiket, format kredensial/QR, hak penyimpanan, validitas offline, siklus perubahan/pembatalan, dan dukungan gerbang harus dikonfirmasi sebelum merancang kontrak integrasi. Menampilkan tiket tidak otomatis membuktikan tiket dapat dipakai masuk venue.

Untuk rilis pertama, operator hanya dapat menerbitkan tautan kanal resmi yang tervalidasi. URL belum tersedia/tidak aman ditampilkan sebagai keadaan belum tersedia selama pengembangan atau gangguan konfigurasi, bukan pengganti FR-09 yang lulus; minimal satu URL resmi harus dikonfirmasi sebelum rilis. Tidak perlu menunggu API tiket atau kedua mitra sekaligus. Kegagalan layanan eksternal ditampilkan dengan jujur dan tidak dianggap transaksi/tiket berhasil.

## 7. Kebutuhan kualitas dan keamanan

- Pilihan pengguna tahan terhadap restart, hilang koneksi, dan kegagalan sinkronisasi; status server tidak boleh dipalsukan oleh UI.
- API mengautentikasi pengguna dari token terverifikasi, bukan `user_id` yang dikirim client. Akses operator diperiksa backend untuk setiap operasi terproteksi.
- Draft dan data privat tidak tersedia melalui API/cache publik. Konten admin, unggahan, dan tautan eksternal divalidasi; rahasia tidak masuk aplikasi mobile atau repository.
- Aksesibilitas: pembaca layar, target sentuh memadai, teks terbaca dengan pembesaran font, dan informasi konflik/status tidak hanya dibedakan warna.
- Privasi: minimalkan data akun/token, sediakan logout/penghapusan akun dan kebijakan sebelum distribusi. Penghapusan profil/pilihan bukan penghapusan buta ledger/pesanan berbayar atau penghalang penyelesaian refund; minimisasi, retensi wajib dan kanal dukungan mengikuti O-11/O-18. Jangan menjanjikan seluruh catatan transaksi hilang seketika.
- Konten bantuan berasal dari penyelenggara dan tersedia offline setelah unduhan; aplikasi tidak menggantikan layanan darurat atau menjamin pengiriman peringatan keselamatan.

## 8. Sumber konten dan dependensi

Konten resmi, jadwal, peta berlisensi, koordinat titik, tenant, FAQ, kontak bantuan, logo, dan identitas visual harus disediakan/disetujui penyelenggara. Panel admin bukan pengganti kepemilikan konten dan proses pemeriksaan di lapangan.

Dependensi belum terkonfirmasi dan gate tindak lanjut dicatat di [DECISIONS.md](DECISIONS.md). Baseline dapat dipakai memulai implementasi yang tidak bergantung pada data/akses tersebut; publikasi data palsu atau integrasi mock bukan penyelesaian deliverable.

## 9. Dokumen terkait dan pengendalian perubahan

- [UX.md](UX.md): struktur layar, perjalanan dan keadaan UI.
- [TECHNICAL.md](TECHNICAL.md): rancangan implementasi, data/API, serta gap terhadap kode saat ini.
- [DELIVERY.md](DELIVERY.md): urutan pekerjaan dan penerimaan terukur per FR.
- [DECISIONS.md](DECISIONS.md): keputusan final, dependensi terbuka, dan batas bukti.

PRD adalah acuan scope produk; fitur yang tercantum pada bagian 5 bukan tambahan opsional rilis pertama. Perubahan scope atau keputusan utama harus disepakati pengguna dan diterapkan serentak pada dokumen yang terdampak. Untuk konflik rincian interaksi/protokol atau perbedaan dengan kode, ikuti kepemilikan dan aturan penyelarasan pada README; keberadaan tabel, endpoint, layar, atau data contoh bukan persetujuan fitur.
