# Pespor — baseline pengalaman pengguna

Dokumen ini adalah **kontrak interaksi target** untuk [PRD](PRD.md), bukan proposal bebas, desain visual final, atau bukti implementasi. Rincian turunan adalah default implementasi baseline, bukan klaim semuanya dipilih langsung pengguna. TECHNICAL memiliki protokol/data; dokumen ini memiliki layar dan tindakan pengguna. Rekam keputusan/dependensi ada di [DECISIONS](DECISIONS.md), penerimaan di [DELIVERY](DELIVERY.md), dan aturan otoritas/konflik di [README](README.md).

## Batas pengalaman

- Aplikasi pengunjung berbahasa Indonesia, Android dahulu, satu edisi aktif; tidak ada pemilih atau arsip edisi.
- Pengunjung boleh menjelajah informasi festival, menyimpan favorit, dan menyusun jadwal lokal tanpa login. Google opsional untuk sinkronisasi/pemulihan festival, tetapi wajib untuk checkout dan riwayat pesanan shop.
- Jadwal, lineup, informasi penting, favorit, dan peta yang sudah diunduh tersedia offline. Pengumuman dan tenant yang tersimpan tetap terbaca offline; katalog/pesanan tersimpan hanya salinan terakhir, bukan jaminan harga, stok, pembayaran, atau hak pengambilan terkini. Tidak ada transaksi saat offline.
- Peta berupa ilustrasi interaktif, bukan lokasi GPS atau petunjuk rute. Tiket rilis pertama membuka kanal resmi di luar aplikasi; QR pengambilan pesanan shop terpisah dari tiket/akses gerbang dan stamp.
- Shop merchandise resmi Pestapora satu toko/pengelola wajib rilis pertama (FR-11–FR-15): penjualan sebelum dan selama festival, QRIS dan virtual account (VA), serta pengambilan lengkap sekali di satu booth resmi. Bukan marketplace atau transaksi tenant; tidak ada pengiriman, pengambilan sebagian, pemindahan hak, promo/voucher, cicilan, COD, bayar di booth, retur, atau penukaran mandiri.
- Admin adalah web terpisah: operator mengelola konten dan commerce; petugas booth hanya akses operasional pengambilan terbatas. Stamp rally, iOS, dan tiket internal di luar scope rilis pertama.
- Tidak menetapkan logo, warna, tipografi, ilustrasi, atau menyalin identitas referensi. Aset dan identitas Pespor memerlukan keputusan tersendiri.

## Struktur navigasi target

Lima tab bawah selalu memakai label teks. Halaman detail memakai tombol kembali; berpindah tab mempertahankan posisi penelusuran selama sesi, bukan membuat tumpukan detail tanpa batas.

| Tab | Isi utama | Rute turunan dan pintasan | FR |
| --- | --- | --- | --- |
| **Beranda** | Identitas edisi aktif, ringkasan informasi penting, pengumuman/perubahan terbaru, pintasan jadwal, tiket resmi, dan **Shop Resmi** | Detail pengumuman, informasi penting, tautan tiket, katalog shop; status unduhan/sinkronisasi | FR-01, FR-05, FR-07, FR-09, FR-11 |
| **Jadwal** | Pilihan hari/panggung, waktu tampil, status slot | Detail slot/penampil; mode **Jadwal Saya**; konflik waktu; pintasan pengaturan pengingat perangkat | FR-03 |
| **Lineup** | Daftar penampil, pencarian, filter favorit | Detail penampil, slot tampil, tambah/hapus favorit | FR-02 |
| **Peta** | Ilustrasi, zoom/pan, pin panggung/fasilitas/tenant, pencarian | Detail lokasi dan daftar lokasi alternatif; status unduh peta | FR-04 |
| **Lainnya** | Direktori **Makanan & Merch**, **Shop Resmi**, **Pesanan Saya**, **Informasi & Bantuan**, **Pengumuman**, **Akun & Sinkronisasi**, **Unduhan & Pengingat** | Detail tenant/kategori/lokasi, katalog/keranjang/checkout/riwayat pesanan, FAQ/aturan/kontak bantuan, login Google, logout/penghapusan akun, status cache/izin | FR-05, FR-06, FR-07, FR-08, FR-11–FR-14 |

Nama rute adalah label produk, bukan kontrak URL/API. Tetap lima tab: tidak menambahkan tab belanja, sosial, edisi lain, atau profil publik. Shop dicapai dari Beranda/Lainnya; keranjang dan Pesanan Saya berada dalam alur shop. Detail tenant membuka pin bila lokasinya tersedia; detail penampil dapat membuka slot terkait. Pengumuman dapat dicapai dari Beranda dan Lainnya tanpa tab keenam.

## Layar dan interaksi inti

| Layar | Informasi/tindakan minimum | Perilaku penting |
| --- | --- | --- |
| Beranda | Edisi aktif, informasi penting, pengumuman, **Lihat Jadwal**, **Tiket Resmi**, **Shop Resmi** | Tidak menampilkan tanggal/venue karangan. Jika data belum tersedia, tampilkan status, bukan konten contoh. |
| Daftar/detail lineup | Nama, informasi penampil yang diterbitkan, pencarian, favorit, jadwal terkait | Favorit penampil berbeda dari memilih slot; menandai penampil tidak otomatis memilih semua penampilannya. |
| Jadwal/Jadwal Saya | Hari, panggung, tanggal/waktu, penampil, pilih/batalkan pilihan, status batal/berubah | Konflik waktu diberi penanda dan rincian, bukan penolakan. Slot lintas tengah malam menampilkan tanggal berakhir; zona waktu festival harus eksplisit setelah dikonfirmasi. |
| Detail slot | Waktu/panggung terkini, status slot pada data terbit, pilihan pribadi, status pengingat perangkat | Slot dipindah memperlihatkan data terbaru setelah sinkronisasi. Slot dibatalkan/dihapus tetap terlihat sebagai pilihan tidak tersedia dan pengingatnya dibatalkan. Tidak ada toggle pengingat per slot. |
| Peta/detail lokasi | Ilustrasi, kontrol zoom, pin, pencarian, nama/kategori lokasi, daftar hasil | Bisa digunakan dari aset lokal yang lengkap. Tidak ada titik “lokasi saya”, estimasi perjalanan, atau navigasi GPS. |
| Makanan & Merch | Kategori, pencarian, nama/detail tenant, lokasi bila diterbitkan | Direktori tenant tidak menyediakan keranjang/pembayaran/stok tenant. Shop Resmi merupakan alur terpisah, bukan transaksi dari setiap tenant. Lokasi yang belum diisi dinyatakan belum tersedia. |
| Informasi & Bantuan | FAQ, aturan, informasi penting, kontak resmi yang telah ditetapkan | Bedakan konten tersimpan dengan informasi terkini. Kontak belum ditetapkan tidak diganti nomor contoh. |
| Pengumuman | Daftar/detail pengumuman dan perubahan jadwal yang diterbitkan | Dapat dibuka tanpa push. Push bukan sumber kebenaran atau kanal darurat terjamin. |
| Akun & Sinkronisasi | Mode tamu/akun aktif, login Google, status perubahan lokal, **Pesanan Saya**, coba lagi, logout/penghapusan akun | Login tidak wajib untuk fitur festival/katalog/keranjang lokal; checkout dan riwayat pesanan memerlukan Google. Tidak mengklaim tersinkron sebelum server mengakui. Jangan tampilkan data akun lain. |
| Unduhan & Pengingat | Status data/peta tersedia offline, pembaruan terakhir, aksi unduh/perbarui, satu toggle pengingat perangkat dan status izin | “Tersedia offline” hanya setelah komponen lengkap. Pengingat awalnya nonaktif; saat diaktifkan berlaku 15 menit sebelum semua slot pilihan yang masih memenuhi syarat. Toggle ini tidak mengatur push pengumuman. |
| Shop Resmi/detail produk | Merchandise resmi, foto/deskripsi yang tersedia, varian ukuran/warna, SKU, harga dan ketersediaan per kombinasi | Guest dapat menjelajah dan mengubah keranjang lokal tanpa membuat pesanan. Harga/stok dari cache berlabel waktu terakhir; pilihan varian tidak tersedia tidak dapat dilanjutkan checkout. |
| Keranjang/checkout | SKU/varian, jumlah, ringkasan harga, total rupiah utuh dari server, metode QRIS/VA, batas pembayaran dan aturan pengambilan/pembatalan | Perubahan harga/stok ditampilkan sebelum konfirmasi ulang; tidak mengganti varian atau menaikkan total diam-diam. Checkout memerlukan login dan jaringan; keranjang lokal bukan reservasi stok. |
| Pesanan Saya/detail pesanan | Riwayat akun, referensi pesanan, rincian/total saat pembelian, status pembayaran/pengambilan/refund terpisah, petunjuk/batas booth, QR atau referensi pengambilan | Status terkini berasal dari server. Pembayaran tertunda tidak membuka pengambilan. Salinan offline berlabel terakhir diketahui, bukan bukti yang boleh disahkan petugas. |

## Alur pengunjung

### 1. Masuk sebagai tamu dan menyiapkan offline

1. Buka aplikasi tanpa kewajiban login; tampilkan edisi aktif yang sudah diterbitkan.
2. Jelajah lineup/jadwal; favorit dan pilihan slot langsung tersimpan lokal.
3. Buka **Unduhan & Pengingat**, unduh data dan aset peta. Tampilkan progres/hasil per komponen; unduhan sebagian tidak disebut lengkap.
4. Setelah unduhan lengkap, tutup aplikasi dan buka kembali tanpa internet: data inti dan peta tetap dapat dibaca.
5. Jika instalasi pertama langsung offline tanpa cache, tampilkan **Belum ada data tersimpan. Hubungkan internet untuk mengunduh.** Tidak ada layar kosong yang menyiratkan festival tidak punya jadwal.

### 2. Login Google dan penggabungan data

1. Dari **Akun & Sinkronisasi** atau saat melanjutkan checkout/membuka **Pesanan Saya**, jelaskan manfaat dan batas akun. Login shop tidak mewajibkan impor pilihan festival. Jika ada pilihan guest yang akan diimpor, tampilkan akun tujuan dan minta konfirmasi terpisah setelah identitas diketahui. Menolak/membatalkan impor mempertahankan pilihan guest; tidak mengimpor diam-diam atau menjadikan login syarat menjelajah festival/katalog/keranjang.
2. Login berhasil hanya setelah identitas diverifikasi backend; pembatalan/penolakan login kembali ke mode sebelumnya tanpa menghapus pilihan.
3. Setelah konfirmasi, impor guest sekali dengan menggabungkan favorit dan slot berdasarkan ID stabil tanpa duplikasi; benturan waktu tetap boleh. Impor tertunda terikat pada akun tujuan dan tidak boleh dialihkan ke akun lain. Setelah berhasil, sumber guest ditandai dikonsumsi. Sinkronisasi akun berikutnya memakai revisi dasar dan rebase TECHNICAL, bukan union berulang yang menghidupkan pilihan terhapus.
4. Saat gagal mengirim, pilihan tetap lokal dengan status **Belum tersinkron** dan **Coba lagi**. Kegagalan autentikasi meminta login ulang, bukan melaporkan berhasil.
5. Logout selalu bisa dilakukan offline: hentikan sinkronisasi/pengingat akun, hapus token dan data personal akun termasuk cache pesanan/QR dari perangkat; cache publik tetap, tamu baru kosong. Jika ada perubahan atau impor belum terkirim, tampilkan **Batal** atau **Keluar & Hapus Perubahan Lokal**, termasuk dampak pada salinan impor tertunda. Penghapusan harus dikonfirmasi dan tidak boleh membiarkan data impor/pesanan tersisa sebagai guest yang nanti dikirim ke akun lain. Keranjang guest lokal bukan riwayat pesanan dan tidak boleh memuat identitas pembeli. Logout tidak membatalkan pesanan/pembayaran/refund; logout offline tidak menjamin sesi remote sudah dicabut.
6. Penghapusan akun perlu online dan autentikasi ulang, dengan konfirmasi dampak. Hanya konfirmasi server yang terverifikasi boleh disebut selesai; respons hilang mengikuti pemeriksaan receipt TECHNICAL tanpa membuat akun baru. Kegagalan/offline tidak boleh ditampilkan sebagai akun terhapus. Profil/pilihan/sesi dibersihkan; catatan transaksi minimum dapat dipertahankan dan data pribadi diminimalkan sesuai O-11/O-18, bukan penghapusan seluruh buku transaksi otomatis. Pesanan berbayar/pembatalan/refund yang belum selesai harus tetap dapat ditangani melalui dukungan resmi tanpa transaksi kehilangan penanggung jawab; jalur dan retensi perlu ditetapkan sebelum penjualan, bukan alasan menolak penghapusan secara menyeluruh.

### 3. Menyusun jadwal dan pengingat

1. Pilih hari/panggung, buka slot, tekan **Tambahkan ke Jadwal Saya**; hasil tersimpan lokal tanpa login.
2. Jika bertabrakan, tampilkan slot yang bentrok beserta waktunya; keduanya tetap tersimpan.
3. Aktifkan **Pengingat Jadwal** di pengaturan perangkat aplikasi; jelaskan satu toggle berlaku untuk seluruh slot pilihan, **15 menit sebelum mulai**, dan minta izin saat dibutuhkan. Default nonaktif; login/pemulihan akun tidak menyalakannya. Tidak ada pengaturan lead time lain atau toggle per slot pada baseline.
4. Izin ditolak: pilihan tetap tersimpan; tampilkan status pengingat tidak aktif dan cara membuka pengaturan perangkat. Tidak mengulang dialog izin di setiap pembukaan.
5. Saat perubahan jadwal diterima, jadwal pribadi memperlihatkan revisi baru dan pengingat diselaraskan; pembatalan/penghapusan menghapus pengingat lama. Saat masih offline, tampilkan usia data dan jangan menjanjikan mengetahui perubahan terbaru.
6. Slot yang sudah melewati waktu pengingat tidak membuat notifikasi retroaktif. Toggle off membatalkan seluruh pengingat lokal pada perangkat tanpa menghapus pilihan atau mematikan langganan push pengumuman. Pengiriman tetap mengikuti izin dan pembatasan Android.

### 4. Mencari lokasi saat offline

1. Buka **Peta**; jika sudah diunduh, gunakan ilustrasi lokal beserta pin dan pencarian.
2. Cari fasilitas/panggung/tenant, pilih hasil untuk fokus ke pin dan detail lokasi.
3. Gunakan daftar lokasi bila interaksi spasial sulit; pan/zoom bukan satu-satunya jalan ke informasi.
4. Jika data lokasi ada tetapi aset peta belum lengkap/rusak, tampilkan daftar yang masih valid dan pesan aset peta tidak tersedia. Sediakan unduh ulang saat online, bukan gambar kosong yang dianggap peta berhasil dimuat.

### 5. Membuka tiket resmi

1. Tekan **Tiket Resmi** dari Beranda.
2. Tampilkan bahwa pengguna akan berpindah ke kanal resmi eksternal; hanya buka URL resmi yang dikonfigurasi dan tervalidasi.
3. Bila URL belum ada/tidak aman, jangan buka tujuan karangan; tampilkan kanal belum tersedia. Ini keadaan gagal/pengembangan, bukan pengganti syarat minimal satu kanal resmi sebelum rilis (FR-09/O-06). Bila perangkat offline atau pembukaan gagal, tampilkan pesan dan coba lagi.
4. Kembali ke aplikasi tidak dianggap pembelian berhasil. Tidak ada janji QR tiket, validitas tiket offline, saldo, atau dompet tiket internal. QR pengambilan shop bukan tiket dan tidak memberi akses venue.

### 6. Memilih merchandise dan membayar (FR-11, FR-12)

1. Buka **Shop Resmi** dari Beranda/Lainnya tanpa login. Pilih produk, kombinasi ukuran/warna, dan jumlah berdasarkan SKU; tambah/ubah/hapus pada keranjang lokal yang bertahan saat aplikasi dibuka kembali. Keranjang bukan pesanan, tidak menahan stok, dan tidak dijanjikan tersinkron lintas perangkat.
2. **Lanjutkan Checkout** memerlukan jaringan dan Google. Pembatalan login mempertahankan keranjang serta hak guest; sesi aktif tetap diverifikasi backend. Login tidak otomatis mengirim pesanan atau mengimpor pilihan festival.
3. Server memeriksa masa penjualan, varian, jumlah, stok, harga dan total rupiah utuh. Jika harga/stok berubah, tampilkan perubahan dan minta tinjau/konfirmasi ulang; jumlah kurang tidak dipotong diam-diam. Rincian harga/biaya/pajak yang berlaku dan total server ditampilkan sebelum membayar; nilai yang belum ditetapkan tidak boleh diganti janji tanpa biaya.
4. Setelah checkout diterima server, stok ditahan sampai batas pembayaran yang ditampilkan. Pilih **QRIS** atau **Virtual Account**, tampilkan instruksi/referensi dan waktu kedaluwarsa dari server melalui alur gateway di dalam aplikasi yang disepakati. Tidak ada bayar di booth atau metode tambahan; Pespor tidak menyimpan data pembayaran mentah. Pembayaran tertunda/kedaluwarsa/gagal dibedakan dari lunas; membuka UI pembayaran atau kembali ke aplikasi bukan bukti lunas.
5. Jika respons checkout/pembayaran hilang, tampilkan **Status belum dapat dipastikan**, periksa pesanan yang sama dan lanjutkan pemulihan idempoten; jangan menyarankan membuat pesanan baru sebelum hasil lama diketahui. Tutup/buka aplikasi atau coba lagi tidak membuat debit, pesanan, atau reservasi ganda. Detail pesanan dapat ditemukan melalui **Pesanan Saya**.
6. Hanya verifikasi gateway tepercaya di server yang mengubah status lunas. Reservasi berakhir melepaskan stok secara aman. Pembayaran berhasil terlambat setelah stok dilepas tidak mengambil stok milik pesanan lain: pengambilan diblokir, tampilkan penanganan/rekonsiliasi dan pengembalian dana, bukan jaminan barang tersedia.

### 7. Riwayat dan pengambilan lengkap (FR-13)

1. Login Google untuk membuka **Pesanan Saya** dari Lainnya, akun, atau alur shop. Tampilkan hanya pesanan akun aktif dengan rincian pembelian tetap: produk/SKU/varian/jumlah, harga/total saat transaksi, referensi, status pembayaran, status pengambilan, serta status pembatalan/refund yang berbeda.
2. Pesanan yang sudah dibayar dan memenuhi syarat memperlihatkan booth resmi, jam/batas pengambilan dan zona waktu yang telah ditetapkan, serta QR/referensi pengambilan. Pesanan tertunda, dibatalkan, menunggu keputusan pembatalan, refund, kedaluwarsa, atau sudah diambil tidak ditampilkan sebagai siap diserahkan. QR ini bukan QR tiket/stamp; tidak memberi hak masuk festival.
3. Backend hanya memberikan token pengambilan acak berentropi tinggi melalui akses pemilik yang login Google; QR membawa token khusus, bukan ID pesanan publik atau data pribadi sensitif. Pembeli menunjukkan QR ke petugas; salinan boleh ditampilkan saat perangkat pembeli offline dengan label **Status terakhir diketahui — wajib validasi online di booth**. QR/tangkapan layar tidak membuktikan status terkini atau membuka rincian tanpa sesi staf berwenang. Referensi pesanan teks hanya untuk pencarian: alternatif tanpa QR wajib verifikasi pemilik sesuai SOP O-17, bukan tebakan ID atau izin menyerahkan otomatis. Tidak mensyaratkan ponsel pembeli online maupun konfirmasi live tambahan.
4. Petugas harus online, memeriksa pesanan dan seluruh barang, lalu mengonfirmasi satu pengambilan lengkap. Tidak ada pengambilan sebagian, transfer penerima, atau penyerahan berdasarkan cache/manual saat sistem offline. Bila koneksi petugas terputus, tampilkan **Belum dapat memvalidasi — jangan serahkan barang**; pemulihan hasil ambigu memeriksa tindakan yang sama sebelum ada penyerahan ulang.
5. Setelah server mengakui, pembeli/petugas melihat **Sudah diambil**; scan ulang/perangkat petugas lain menampilkan hasil sudah diambil, bukan memberi pengambilan kedua. Persaingan dengan pembatalan/refund diselesaikan server sebagai satu hasil, bukan dua tindakan berhasil.

### 8. Pembatalan, refund, dan tidak diambil (FR-14)

1. Sebelum pengambilan, pembeli pesanan lunas dapat **Ajukan Pembatalan** online; tampilkan aturan yang disetujui dan konfirmasi dampak. Permintaan masuk ke peninjauan operator, bukan langsung disebut refund. Default pengaman target: pengambilan diblokir selama peninjauan; ini rincian implementasi, bukan keputusan eksplisit pengguna tentang seluruh kebijakan pembatalan.
2. Operator menyetujui atau menolak berdasarkan aturan yang ditetapkan. Persetujuan membatalkan pemenuhan dan memulai **refund penuh seluruh total yang dibayar pembeli tanpa potongan**; biaya provider tidak dikurangkan dari refund pembeli. Persetujuan keuangan tidak berarti dana sudah kembali. Penolakan memperlihatkan hasil/alasan dan hanya membuka kembali kelayakan pengambilan bila server menyatakan masih memenuhi syarat.
3. UI memisahkan **Diajukan**, **Ditinjau/Disetujui/Ditolak**, serta refund **Belum diproses/Diproses/Berhasil/Gagal atau perlu rekonsiliasi** sesuai pemetaan TECHNICAL/gateway yang dipilih, bukan menamai status vendor yang belum ada. **Dana dikembalikan** hanya setelah bukti gateway terverifikasi di server; timeout/gagal tetap menyatakan belum selesai dan pengambilan tetap diblokir untuk pesanan yang dibatalkan. Tidak ada pengulangan refund buta.
4. Pesanan lunas yang belum diambil saat batas no-show terlewati diblokir dari pengambilan lebih dahulu, lalu menjalani refund penuh. Waktu server/zona festival menjadi acuan; proses refund tertunda/gagal tidak mengizinkan pengambilan kembali. Tidak ada refund sebagian, retur, atau penukaran mandiri.
5. Gateway, batas waktu/jam penjualan dan pengambilan, durasi reservasi/pembayaran, rincian biaya/pajak, aturan peninjauan/cutoff, SLA/kanal refund, dan retensi/jalur dukungan penghapusan akun masih terbuka di O-14–O-18 bersama O-11. Semua harus ditetapkan dan dijelaskan sebelum penjualan, tanpa tanggal, biaya, atau janji dana instan karangan.

## Alur operator web

Alur konten berikut memenuhi **FR-10**; tindakan pengumuman/push juga terkait **FR-05**. Operator memiliki kemampuan commerce **FR-15** di bawah; petugas booth tidak otomatis mendapat akses konten. Kontrak otorisasi dan publikasi rinci berada di TECHNICAL.

1. Login Google ke admin terpisah. Backend memeriksa identitas dan allowlist; pengguna di luar allowlist melihat **Tidak memiliki akses**, tanpa data draft atau tombol admin yang berfungsi.
2. Pilih lineup, panggung/jadwal, peta/fasilitas, tenant, informasi, atau pengumuman; ubah dan **Simpan Draft**. Menyimpan bukan menerbitkan atau mengirim push.
3. **Pratinjau Draft** menampilkan konten/aset calon publikasi di konteks admin. Pratinjau tidak membuat URL draft/aset menjadi akses publik tanpa otorisasi.
4. **Terbitkan** memperlihatkan ringkasan perubahan dan dampak jadwal/peta. Versi editor kedaluwarsa menampilkan konflik, mempertahankan masukan operator, dan meminta muat ulang/bandingkan; jangan menimpa diam-diam.
5. Hasil sukses menyatakan revisi terbit; kegagalan tidak disebut sukses. Pengunjung membaca revisi lengkap, bukan kombinasi data dan aset parsial.
6. Pengiriman push adalah tindakan eksplisit yang terpisah dari simpan draft. Tampilkan hasil/ketidakpastian pengiriman; pengulangan identitas tindakan yang sama tidak memulai pengiriman kedua. Jangan menjanjikan delivery exactly-once dari provider/perangkat atau mengulang kirim secara buta saat respons provider ambigu. Konten pengumuman tetap tersedia di aplikasi walau push gagal.

### Commerce operator (FR-15)

1. Operator berwenang membuka produk/varian SKU, harga, stok dan pesanan; login Google/allowlist diperiksa server pada setiap tindakan. Kelola produk resmi beserta kombinasi ukuran/warna, harga/ketersediaan dan penyesuaian stok dengan validasi server. Konflik/perubahan stok harus ditampilkan, bukan menimpa atau membuat stok negatif.
2. Bedakan aksi commerce dari **Simpan Draft/Terbitkan** konten festival. Publikasi konten tidak mengubah stok/harga hidup, menciptakan pesanan, atau mengulangi pembayaran/refund; perubahan harga tidak mengubah rincian harga pesanan yang sudah dibayar.
3. Telusuri pesanan untuk penanganan operasional, tinjau permintaan pembatalan, dan beri keputusan eksplisit. Tampilkan terpisah keputusan pembatalan, hasil pengiriman refund, dan konfirmasi dana kembali dari gateway. Tidak ada tombol **Tandai lunas/refund berhasil** tanpa bukti tepercaya atau pengiriman ulang buta saat status ambigu.
4. Daftar masalah menampilkan pembayaran terlambat, refund gagal/tidak pasti dan no-show untuk rekonsiliasi. Kegagalan tetap terlihat sampai ditangani; jangan memperbaiki selisih dengan mengambil stok pesanan lain atau membuka pengambilan yang diblokir.

### Petugas booth terbatas (FR-13, FR-15)

1. Login Google ke area booth; server memeriksa allowlist/hak booth yang terpisah. Tidak ada akses berdasarkan kepemilikan kode saja. Petugas hanya dapat mencari referensi/memindai QR, membaca data minimum untuk menyerahkan seluruh pesanan, dan mengonfirmasi pengambilan online; tidak mendapat daftar/ekspor data pribadi pembeli.
2. Sebelum konfirmasi, tampilkan item/varian/jumlah dan hasil kelayakan server; kode salah, pesanan belum lunas/diblokir/sudah diambil, atau akses ditolak tidak membuka penyerahan maupun rincian sensitif kepada pihak tak berhak. Referensi publik bukan token pengambilan; jalur alternatif harus mengikuti verifikasi pemilik resmi O-17 tanpa membuka akses data pribadi berlebihan.
3. Tidak tersedia akses edit konten, produk, harga, stok, persetujuan pembatalan, atau refund. Endpoint langsung juga harus menolak, bukan sekadar menyembunyikan menu. Pencabutan akses berlaku pada permintaan berikutnya.
4. Tindakan pengambilan yang responsnya hilang harus dipulihkan berdasarkan referensi tindakan/pesanan yang sama. Petugas tidak menandai sukses lokal, menyerahkan saat offline, atau mengonfirmasi pengambilan kedua dari perangkat lain. SOP jaringan booth dan tanggung jawab penyerahan harus siap sebelum rilis (O-17).


## Keadaan bersama dan aksesibilitas

| Keadaan | Respons antarmuka minimum |
| --- | --- |
| Memuat tanpa cache | Indikator berlabel, tidak menampilkan contoh seolah data resmi; kegagalan berakhir dengan pesan dan coba lagi. |
| Cache valid, online/offline | Baca cache dahulu; tampilkan pembaruan terakhir/status offline. Pembaruan gagal tidak menghapus cache valid atau pilihan lokal. |
| Cache lama | Tampilkan bahwa data tersimpan dapat berubah, termasuk jadwal/peta; sediakan perbarui. Tidak menetapkan ambang kedaluwarsa karangan. |
| Cache rusak/pembaruan terputus | Gunakan revisi lengkap terakhir jika tersedia; jika tidak ada, jelaskan komponen tidak tersedia. Pisahkan pemulihan cache konten dari pilihan pribadi agar unduh ulang tidak menghapusnya. |
| Kosong | Bedakan belum terbit, pencarian tanpa hasil, belum ada favorit, dan filter tanpa slot. Sediakan tindakan yang relevan, bukan pesan kesalahan umum. |
| Perubahan pribadi tertunda | Bedakan tersimpan di perangkat, sedang disinkron, gagal/perlu login ulang, dan sudah diakui server. |
| Data ditarik/dibatalkan | Tampilkan status pada pilihan terkait; jangan mengubahnya menjadi slot lain atau mengirim pengingat lama. |
| Push/pengingat ditolak | Informasi tetap dapat dicapai lewat layar aplikasi. Toggle pengingat lokal dan persetujuan push pengumuman berbeda; keduanya tetap tunduk pada izin/channel Android sehingga penolakan izin sistem bisa memengaruhi keduanya. Tidak ada klaim keduanya independen dari izin OS. |
| Commerce offline | Katalog/pesanan cache berlabel waktu/status terakhir. Keranjang lokal tetap dapat diedit; checkout/pembayaran/pembatalan/refund/pengambilan tidak dijalankan atau diantrekan untuk sukses nanti. Kode tersimpan bukan otorisasi penyerahan. |
| Status commerce ambigu | Jelaskan hasil belum pasti, pertahankan referensi tindakan, periksa server dan sediakan pemulihan; jangan mengklaim lunas, dana kembali, atau sudah diambil dari callback/cache. |
| Stok/harga berubah | Sebut SKU/varian/jumlah/harga yang berubah dan total baru, minta tinjau ulang; tidak mengganti pilihan atau menyatakan reservasi guest. |

- Semua tab, tombol ikon, favorit, status unduhan, dan pin punya label pembaca layar; status aktif/tidak aktif tidak hanya bergantung warna atau bentuk.
- Gunakan komponen native/platform yang aksesibel, ukuran sentuh memadai, fokus logis, skala teks sistem, kontras yang diperiksa pada desain final, serta teks yang tidak terpotong pada ukuran font besar.
- Sediakan kontrol zoom berlabel dan daftar hasil lokasi sebagai alternatif gesture/peta. Detail pin dapat dicapai melalui daftar dan pembaca layar.
- Hari, waktu, zona waktu festival, panggung, dan status batal dibaca sebagai informasi yang utuh. Konflik ditulis sebagai teks, bukan hanya garis warna.
- Dialog konfirmasi, error formulir admin, dan perubahan status dapat diketahui pembaca layar. Fokus kembali ke pemicu setelah dialog ditutup; navigasi keyboard web tidak terjebak.
- Varian ukuran/warna, jumlah, nominal rupiah, batas pembayaran/pengambilan beserta zona waktu, dan status keuangan/pengambilan terbaca sebagai teks. Secret pickup dapat ditampilkan sebagai kode teks setara QR untuk dimasukkan petugas terautentikasi online; **referensi pesanan publik bukan kode tersebut** dan memerlukan SOP verifikasi pemilik bila dipakai sebagai fallback. Kamera bukan satu-satunya input, tetapi validasi online tidak boleh dilewati.
- Kontak bantuan, tanggal/venue/zona waktu, aset berlisensi, dan redaksi privasi menunggu penetapan pemilik konten. Kriteria penerimaan tetap **belum dijalankan** sampai bukti pada [DELIVERY](DELIVERY.md) tersedia.
