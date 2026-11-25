Nuvora: Rencana Produk dan PRD
Sistem booking dan pengingat otomatis untuk bisnis jasa kecil di Indonesia
Dokumen perencanaan sebelum mulai coding · Versi 1.0 · 25 November 2026
1. Ringkasan Produk
Nuvora adalah aplikasi web SaaS multi-tenant yang membantu bisnis jasa kecil (barbershop, salon, klinik gigi, bimbel, studio foto) menerima booking online dan mengurangi pelanggan yang tidak datang (no-show) lewat pengingat otomatis.
Satu kalimat: “Link booking untuk bisnis jasa kecil, lengkap dengan pengingat otomatis, siap dipakai dalam 10 menit.”
Cara kerja singkat: pemilik bisnis mendaftar, mengisi layanan dan jam buka, lalu membagikan satu link booking (misalnya nuvora.id/barbershop-andi) di bio Instagram atau WhatsApp. Pelanggan memilih layanan, tanggal, dan jam. Sistem mengirim konfirmasi dan pengingat otomatis.
2. Nama dan Branding
Nama terpilih: Nuvora
Nuvora adalah nama rekaan yang terdengar modern dan mudah diucapkan, serta tidak terikat pada satu jenis bisnis sehingga bisa tumbuh ke salon, klinik, dan bisnis jasa lain. Pendek, mudah diingat, dan mudah dieja.
Alternatif nama: Gunting, Kursi, Rapi
Tagline: “Jadwal rapi, pelanggan datang.”
Arah visual: bersih dan ramah, warna utama biru atau hijau toska (kesan tepercaya dan segar), font sans-serif sederhana seperti Inter atau Plus Jakarta Sans. Logo cukup teks dengan ikon kalender atau jam kecil.
Yang perlu dicek sebelum final: ketersediaan domain (nuvora.id, nuvora.app, atau nuvora.co.id), akun Instagram dengan nama yang sama, dan apakah sudah ada produk dengan nama mirip. Saya sudah mencari sekilas: untuk Nuvora tidak ketemu aplikasi booking dengan nama sama, tetapi ada proyek kesehatan digital bernama Nuvora di MIT Solve, jadi nama ini sudah dipakai di bidang lain. Pencarian ini tidak lengkap: periksa sendiri domain, akun sosial media, dan merek terdaftar.
3. Masalah dan Peluang
Masalah
• Jadwal diatur lewat chat WhatsApp atau buku catatan, sehingga rawan bentrok.
• Pemilik harus membalas chat satu per satu hanya untuk menanyakan jam kosong.
• Pelanggan lupa datang, dan slot yang sudah dipesan terbuang.
• Tidak ada data: pemilik tidak tahu jam tersibuk atau layanan terlaris.
Peluang
• Jutaan UMKM jasa di Indonesia sudah terbiasa dengan WhatsApp dan Instagram, tetapi belum punya sistem jadwal.
• Tools booking global (Calendly, Setmore, Fresha) umumnya berbahasa Inggris, berbayar dalam dolar, dan tidak disesuaikan dengan kebiasaan lokal.
• Pengingat otomatis adalah fitur yang langsung terasa nilainya (mengurangi no-show), sehingga mudah dijadikan alasan untuk membayar.
Kompetitor yang perlu dipelajari
Pelajari sendiri produk berikut sebelum membangun, terutama harga dan kekurangannya: Calendly, Setmore, Fresha, Square Appointments, serta aplikasi booking lokal yang bisa kamu temukan lewat pencarian “aplikasi booking salon/klinik Indonesia”. Catat apa yang tidak mereka tawarkan untuk pasar kecil di Indonesia.
4. Target Pengguna
Pengguna utama: Pemilik bisnis jasa kecil
• Bisnis dengan 1 sampai 10 pegawai.
• Contoh: barbershop, salon, klinik gigi atau kecantikan kecil, bimbel, studio foto, tukang pijat atau spa, bengkel kecil.
• Sudah memakai WhatsApp Business dan Instagram.
• Tidak teknis, ingin sesuatu yang cepat dipahami.
Pengguna kedua: Pelanggan bisnis tersebut
• Membuka link dari HP, biasanya dari Instagram atau WhatsApp.
• Tidak mau membuat akun atau menginstal aplikasi.
• Ingin booking dalam kurang dari satu menit.
Persona
Andi, 32 tahun, pemilik barbershop dengan 3 kapster. Sekarang semua booking masuk lewat WhatsApp. Sering bentrok jam dan 2 sampai 3 pelanggan per minggu tidak datang. Ingin pelanggan booking sendiri tanpa harus ia balas satu per satu.
Sinta, 25 tahun, pelanggan. Ingin potong rambut Sabtu sore. Malas chat dan menunggu balasan. Lebih suka klik link, pilih jam, selesai.
5. Keputusan Awal (Tanpa Wawancara)
Wawancara dilewati sesuai permintaan, jadi keputusan di bawah diambil sekarang sebagai asumsi kerja. Asumsi ini diuji lewat pemakaian nyata setelah MVP rilis, bukan lewat riset di awal.
1.  Niche awal: barbershop. Pemiliknya biasanya punya 1 sampai 3 kapster, aktif di Instagram dan WhatsApp, jadwalnya padat, dan satu no-show langsung terasa sebagai kerugian. Fitur MVP tidak berubah, hanya contoh layanan dan teks yang dibuat bernuansa barbershop.
2.  Pengingat: email plus tombol WhatsApp manual. WhatsApp resmi ditunda sampai ada pelanggan berbayar.
3.  Harga awal: Gratis (30 booking per bulan), Starter Rp49.000, Pro Rp99.000. Paket Bisnis menyusul setelah fitur banyak pegawai tersedia.
4.  Link bisnis memakai path (nuvora.id/nama-bisnis), bukan subdomain.
5.  Validasi setelah rilis: tawarkan versi gratis ke 3 sampai 5 barbershop di sekitarmu begitu MVP jalan, lalu ukur jumlah booking dan penurunan no-show.
Asumsi yang harus dibuktikan setelah rilis:
• Apakah pengingat otomatis benar-benar mengurangi no-show di bisnis mereka?
• Apakah mereka mau pelanggan booking lewat link, atau tetap ingin lewat chat?
• Berapa harga bulanan yang masuk akal bagi mereka?
• Apakah pengingat harus lewat WhatsApp, atau email sudah cukup?
6. Ruang Lingkup MVP
Masuk MVP (wajib ada)
1.  Pendaftaran dan login pemilik bisnis
2.  Pengaturan profil bisnis (nama, slug link, zona waktu)
3.  Pengaturan layanan (nama, durasi, harga)
4.  Pengaturan jam buka mingguan dan hari libur
5.  Halaman booking publik per bisnis
6.  Dashboard jadwal (tampilan harian dan mingguan)
7.  Konfirmasi booking dan pengingat otomatis lewat email
8.  Pembatalan dan penjadwalan ulang oleh pelanggan lewat link di email
9.  Batas paket (gratis vs berbayar)
Tidak masuk MVP (ditunda)
• Pembayaran atau DP online
• Pengingat WhatsApp otomatis penuh (butuh WhatsApp Business API berbayar)
• Banyak pegawai dengan jadwal masing-masing
• Aplikasi mobile native
• Integrasi Google Calendar
• Laporan dan analitik lanjutan
• Domain kustom
• Multi-bahasa (cukup Bahasa Indonesia dulu)
Catatan soal WhatsApp: pengingat otomatis lewat WhatsApp resmi memerlukan WhatsApp Business API yang berbiaya. Untuk MVP, gunakan email sebagai pengingat otomatis, ditambah tombol “Kirim pengingat via WhatsApp” di dashboard yang membuka link wa.me dengan pesan sudah terisi (pemilik tinggal menekan kirim). Ini murah dan cukup untuk menguji minat.
7. User Stories
Pemilik bisnis
• Sebagai pemilik, saya ingin mendaftar dengan email dan password agar bisa membuat akun bisnis saya.
• Sebagai pemilik, saya ingin menambahkan layanan beserta durasi dan harganya agar pelanggan tahu apa yang bisa dipesan.
• Sebagai pemilik, saya ingin mengatur jam buka tiap hari agar pelanggan hanya bisa memesan di jam yang tersedia.
• Sebagai pemilik, saya ingin menutup tanggal tertentu agar tidak ada booking saat saya libur.
• Sebagai pemilik, saya ingin melihat semua booking hari ini dan minggu ini agar saya siap.
• Sebagai pemilik, saya ingin membatalkan atau memindahkan booking agar bisa menangani perubahan mendadak.
• Sebagai pemilik, saya ingin membagikan link booking agar pelanggan bisa memesan sendiri.
Pelanggan
• Sebagai pelanggan, saya ingin melihat layanan dan jam kosong tanpa membuat akun agar bisa booking dengan cepat.
• Sebagai pelanggan, saya ingin menerima konfirmasi lewat email agar yakin booking saya tercatat.
• Sebagai pelanggan, saya ingin menerima pengingat sebelum jadwal agar tidak lupa.
• Sebagai pelanggan, saya ingin membatalkan atau mengubah jadwal lewat link agar tidak perlu chat.
8. Kebutuhan Fungsional
FR-1: Autentikasi pemilik
• Daftar dan login dengan email dan password (opsional: login Google).
• Verifikasi email.
• Lupa password.
FR-2: Profil bisnis
• Nama bisnis, deskripsi singkat, alamat, nomor WhatsApp, logo (opsional).
• Slug unik untuk link publik (huruf kecil, angka, tanda hubung).
• Zona waktu bisnis (WIB, WITA, atau WIT).
FR-3: Layanan
• Tambah, ubah, hapus, dan nonaktifkan layanan.
• Field: nama, deskripsi, durasi (menit), harga (opsional ditampilkan).
FR-4: Ketersediaan
• Jam buka per hari dalam seminggu (bisa lebih dari satu rentang per hari, misalnya istirahat siang).
• Penutupan tanggal tertentu (libur).
• Jeda antar booking (buffer) opsional.
• Batas minimal waktu booking (misalnya minimal 2 jam sebelumnya) dan batas maksimal ke depan (misalnya 30 hari).
FR-5: Halaman booking publik
• Alur: pilih layanan, pilih tanggal, pilih jam, isi nama dan kontak, konfirmasi.
• Hanya menampilkan slot yang benar-benar kosong.
• Tampilan nyaman di HP (mobile-first).
• Tidak perlu akun pelanggan.
FR-6: Pencegahan bentrok
• Dua pelanggan tidak boleh memesan slot yang sama. Pengecekan dilakukan di sisi server dan di level database, bukan hanya di tampilan.
FR-7: Dashboard
• Daftar booking hari ini dan tampilan kalender mingguan.
• Status booking: dipesan, selesai, dibatalkan, tidak hadir.
• Aksi: batalkan, pindahkan jadwal, tandai selesai atau tidak hadir.
• Tombol salin link booking.
FR-8: Notifikasi
• Email konfirmasi ke pelanggan dan notifikasi booking baru ke pemilik.
• Pengingat otomatis ke pelanggan (default H-1 dan 2 jam sebelumnya, bisa diatur).
• Email berisi link batalkan dan jadwalkan ulang.
• Tombol pengingat WhatsApp manual (lihat catatan di bagian 6).
FR-9: Paket dan batas
• Paket Gratis dibatasi jumlah booking per bulan.
• Penerapan batas di sisi server.
9. Kebutuhan Non-Fungsional
Aspek
Target
Kecepatan
Halaman booking terbuka di bawah 2 detik pada koneksi 4G
Perangkat
Mobile-first, diuji di Chrome Android dan Safari iOS
Keamanan
Data antar bisnis terisolasi, HTTPS, password di-hash, validasi input
Ketersediaan
Memanfaatkan hosting terkelola, tanpa server sendiri
Zona waktu
Waktu disimpan dalam UTC, ditampilkan sesuai zona waktu bisnis
Privasi
Mematuhi UU Pelindungan Data Pribadi (UU PDP); kumpulkan data seminimal mungkin
Bahasa
Bahasa Indonesia
Skala awal
Nyaman untuk 100 bisnis dan 10.000 booking per bulan
10. Alur Pengguna
Alur pemilik bisnis (onboarding)
1.  Daftar dan verifikasi email
2.  Isi nama bisnis dan pilih slug link
3.  Tambah minimal satu layanan
4.  Atur jam buka
5.  Salin link booking dan bagikan
Target: selesai dalam 10 menit.
Alur pelanggan (booking)
1.  Buka link nuvora.id/nama-bisnis
2.  Pilih layanan
3.  Pilih tanggal, lalu pilih jam yang tersedia
4.  Isi nama dan email atau nomor WhatsApp
5.  Konfirmasi, lalu menerima email konfirmasi
6.  Menerima pengingat, dan bisa membatalkan atau pindah jadwal lewat link
Daftar halaman
• Publik: landing page Nuvora, halaman booking per bisnis, halaman kelola booking pelanggan (batal atau pindah)
• Pemilik: daftar dan login, onboarding, dashboard jadwal, layanan, jam buka dan libur, profil bisnis, langganan
11. Arsitektur dan Tech Stack
Konsep multi-tenant
Satu aplikasi dan satu database untuk semua bisnis. Setiap data penting menyimpan business_id, dan akses dibatasi sehingga pemilik hanya melihat data bisnisnya sendiri.
Stack yang disarankan
Kebutuhan
Pilihan
Alasan
Frontend dan backend
Next.js (TypeScript)
Satu proyek untuk halaman dan API, banyak contoh
Database dan auth
Supabase (PostgreSQL)
Auth bawaan, Row Level Security, tier gratis
Styling
Tailwind CSS
Cepat dibuat, cocok dengan AI coding
Email
Resend atau Brevo
Mudah dipakai, ada tier gratis (cek batas terbaru)
Pengingat terjadwal
Supabase Cron atau Vercel Cron
Menjalankan pengiriman pengingat berkala
Hosting
Vercel
Deploy otomatis dari Git, ada tier gratis
Testing
Playwright, Vitest
E2E dan unit test
Repo
GitHub
Sekaligus untuk CI dengan GitHub Actions
Harga dan batas tier gratis tiap layanan dapat berubah, jadi cek halaman resmi masing-masing sebelum memutuskan.
Pendekatan link bisnis
Untuk MVP gunakan path (nuvora.id/barbershop-andi) dan bukan subdomain. Lebih sederhana untuk dibuat dan diuji. Subdomain atau domain kustom bisa menyusul sebagai fitur paket berbayar.
12. Struktur Database
businesses
id, owner_id, name, slug (unik), description, phone, address, timezone, plan, created_at
services
id, business_id, name, description, duration_minutes, price, is_active
availability_rules
id, business_id, weekday (0 sampai 6), start_time, end_time
closed_dates
id, business_id, date, reason
bookings
id, business_id, service_id, customer_name, customer_email, customer_phone, starts_at (UTC), ends_at (UTC), status (booked, completed, cancelled, no_show), manage_token (acak, untuk link batal atau pindah), created_at
reminders
id, booking_id, type (h1, h2), send_at, sent_at, status
Aturan penting
• Semua tabel milik bisnis memiliki business_id.
• Cegah bentrok dengan constraint di database (misalnya exclusion constraint pada rentang waktu di PostgreSQL), bukan hanya pengecekan di aplikasi.
• manage_token harus panjang dan acak agar tidak bisa ditebak.
13. Keamanan dan Isolasi Data
Ini bagian paling kritis pada aplikasi multi-tenant.
• Row Level Security (RLS) aktif di semua tabel. Pemilik hanya bisa membaca dan mengubah baris dengan business_id miliknya.
• Halaman publik hanya boleh membaca data yang memang untuk publik (profil, layanan, slot kosong) dan membuat booking, tidak boleh membaca booking pelanggan lain.
• Jangan pernah memakai service key Supabase di kode sisi browser.
• Validasi semua input di server (nama, email, nomor telepon, slug).
• Terapkan rate limiting pada pembuatan booking untuk mencegah spam.
• Simpan secret (API key) di environment variable, jangan di repo.
• Siapkan halaman kebijakan privasi dan syarat layanan sebelum peluncuran. Karena ada data pribadi pelanggan, sebaiknya konsultasikan ke ahli hukum untuk kepatuhan UU PDP; saya bukan penasihat hukum.
• Saat memakai model AI gratis untuk vibe coding, jangan tempel kredensial atau data pelanggan asli ke dalam prompt.
14. Strategi Testing
Sesuai minatmu pada automation testing, berikut yang diuji.
Unit test (Vitest)
• Perhitungan slot kosong dari jam buka, durasi layanan, buffer, dan libur
• Konversi zona waktu
• Aturan batas paket
E2E test (Playwright)
• Pemilik mendaftar, membuat layanan, mengatur jam, lalu mendapat link
• Pelanggan memilih slot dan booking berhasil
• Dua pelanggan memesan slot yang sama: hanya satu yang berhasil
• Pembatalan dan pindah jadwal lewat link
• Tampilan HP (viewport mobile)
Test keamanan dan isolasi data
• Login sebagai bisnis A, lalu coba membaca atau mengubah data bisnis B (harus ditolak)
• Akses dashboard tanpa login (harus diarahkan ke login)
• Tebak manage_token acak (harus gagal)
Otomasi
Jalankan semua test di GitHub Actions setiap ada push. Gunakan database terpisah untuk testing agar data asli tidak rusak.
15. Model Bisnis dan Harga
Paket
Harga per bulan
Isi
Gratis
Rp0
1 bisnis, hingga 30 booking per bulan, pengingat email
Starter
Rp49.000
Booking tak terbatas, pengingat email, tombol WhatsApp manual
Pro
Rp99.000
Semua Starter, logo dan warna kustom, laporan sederhana
Bisnis
Rp149.000
Semua Pro, banyak pegawai, prioritas dukungan (setelah fitur tersedia)
Angka di atas adalah titik awal untuk diuji lewat wawancara, bukan harga final. Sesuaikan dengan kesediaan bayar calon pengguna.
Perhitungan kasar
• 50 bisnis berbayar dengan rata-rata Rp70.000 per bulan menghasilkan sekitar Rp3,5 juta per bulan.
• Biaya awal bisa mendekati nol selama memakai tier gratis, lalu naik seiring pemakaian (email, database, hosting).
• Pembayaran langganan bisa memakai Midtrans, Xendit, atau Lemon Squeezy. Untuk MVP, penagihan manual lewat transfer ke 10 pelanggan pertama pun sah.
16. Strategi Mendapatkan Pelanggan
1.  Pelanggan pertama dari lingkunganmu: datangi bisnis jasa di sekitar rumah atau kantor, tawarkan gratis 2 sampai 3 bulan dengan imbalan masukan.
2.  Bantu mereka mengatur: bantu isi layanan dan jam buka. Pada awal, ini jauh lebih menentukan daripada iklan.
3.  Manfaatkan link: setiap halaman booking bisa memuat tulisan kecil “Dibuat dengan Nuvora”.
4.  Konten Instagram dan TikTok: tips mengurangi no-show dan merapikan jadwal untuk pemilik barbershop dan salon.
5.  Komunitas pelaku usaha: grup Facebook, WhatsApp, dan komunitas UMKM lokal.
6.  Referral: gratis satu bulan untuk pemilik yang mengajak bisnis lain.
17. Roadmap
Fase 0: Persiapan (minggu 1 sampai 2)
Beli domain, buat akun GitHub, Vercel, Supabase, dan email, siapkan repo, lalu buat landing page dengan daftar tunggu.
Fase 1: Fondasi (minggu 3 sampai 4)
Setup repo, Next.js, Supabase, auth, skema database dengan RLS, dan test isolasi data sejak awal.
Fase 2: Inti produk (minggu 5 sampai 6)
Layanan, jam buka, halaman booking publik, perhitungan slot, pencegahan bentrok, dashboard jadwal.
Fase 3: Notifikasi dan penyempurnaan (minggu 7)
Email konfirmasi dan pengingat, link batal atau pindah jadwal, batas paket, tampilan mobile.
Fase 4: Uji coba dan peluncuran (minggu 8)
Pakai bersama 3 sampai 5 bisnis nyata, perbaiki bug, siapkan kebijakan privasi, lalu luncurkan terbatas.
Setelah MVP
Pembayaran DP, WhatsApp resmi, banyak pegawai, Google Calendar, laporan, domain kustom.
18. Risiko dan Mitigasi
Risiko
Dampak
Mitigasi
Data antar bisnis bocor
Sangat tinggi
RLS di semua tabel, test isolasi otomatis
Booking bentrok
Tinggi
Constraint di database, test balapan (race condition)
Pelanggan tidak mau pindah dari WhatsApp
Tinggi
Tawarkan tombol WhatsApp, jadikan link booking pelengkap, bukan pengganti total
Email pengingat masuk spam
Sedang
Atur domain pengirim dengan benar (SPF, DKIM), pakai layanan email terpercaya
Salah zona waktu
Sedang
Simpan UTC, tampilkan sesuai zona bisnis, uji WIB, WITA, WIT
Terlalu banyak fitur sebelum ada pengguna
Tinggi
Patuhi batas MVP, tambah fitur hanya dari permintaan pengguna nyata
Ketergantungan pada model AI gratis
Sedang
Simpan kode di Git, siapkan model cadangan, pahami kode yang dihasilkan
Aturan pelindungan data pribadi
Sedang
Kumpulkan data minimal, buat kebijakan privasi, konsultasi ahli
19. Metrik Keberhasilan
Selama uji coba (bulan 1 sampai 2)
• Jumlah bisnis aktif yang membagikan link booking: target 5
• Booking yang masuk lewat link per bisnis per minggu: target 10 atau lebih
• Penurunan no-show dibanding sebelumnya: target turun minimal separuh (ukur lewat wawancara)
Setelah peluncuran (bulan 3 sampai 6)
• Waktu onboarding sampai link siap: di bawah 10 menit
• Bisnis berbayar: target awal 20
• Retensi bulanan: di atas 80 persen
• Skor kepuasan sederhana dari pemilik (tanya langsung)
20. Checklist Sebelum Mulai Proyek
Validasi dan keputusan
[ ] Wawancara minimal 8 pemilik bisnis jasa
[ ] Tentukan niche awal (misalnya barbershop saja atau salon saja)
[ ] Pelajari 3 kompetitor dan catat harga serta kekurangannya
[ ] Tentukan kriteria lanjut atau berhenti
[ ] Cari 3 sampai 5 bisnis uji coba
Identitas dan legal
[ ] Finalkan nama dan cek domain serta akun sosial media
[ ] Beli domain
[ ] Draf kebijakan privasi dan syarat layanan
[ ] Putuskan bentuk usaha dan cara menerima pembayaran
Teknis
[ ] Buat akun GitHub, Vercel, Supabase, dan layanan email
[ ] Siapkan Node.js dan editor kode di laptop
[ ] Pilih tool vibe coding dan model cadangan
[ ] Buat repo dengan struktur awal dan file .env.example
[ ] Siapkan database terpisah untuk testing
[ ] Atur GitHub Actions untuk menjalankan test
Desain
[ ] Gambar sketsa kasar tiap halaman (cukup di kertas)
[ ] Tentukan warna dan font
[ ] Tulis teks halaman booking dalam Bahasa Indonesia
21. Panduan untuk Vibe Coding
Supaya hasil dari AI konsisten, bangun bertahap dan beri konteks yang sama setiap kali.
Aturan kerja
1.  Simpan dokumen ini di repo sebagai PRD.md dan jadikan acuan di setiap sesi.
2.  Minta AI mengerjakan satu fitur kecil per sesi, lalu uji sebelum lanjut.
3.  Selalu mulai dari skema database dan RLS, baru halaman.
4.  Tulis test bersamaan dengan fitur, terutama untuk isolasi data dan bentrok jadwal.
5.  Commit ke Git setelah setiap fitur berhasil.
6.  Baca dan pahami kode yang dihasilkan, terutama bagian keamanan.
Contoh prompt pembuka
Saya membangun SaaS multi-tenant bernama Nuvora (booking untuk bisnis jasa kecil di Indonesia) dengan Next.js, TypeScript, Tailwind, dan Supabase. Berikut PRD-nya: [tempel PRD]. Mulai dari fase 1: buat skema database PostgreSQL untuk tabel businesses, services, availability_rules, closed_dates, bookings, dan reminders, lengkap dengan Row Level Security sehingga pemilik hanya bisa mengakses data bisnisnya sendiri, serta constraint untuk mencegah dua booking di slot yang sama. Jelaskan setiap kebijakan RLS yang kamu buat.
Urutan pengerjaan yang disarankan
1.  Skema database, RLS, dan test isolasi data
2.  Autentikasi dan onboarding bisnis
3.  Layanan dan jam buka
4.  Fungsi perhitungan slot kosong (dengan unit test)
5.  Halaman booking publik dan pencegahan bentrok
6.  Dashboard jadwal
7.  Email konfirmasi dan pengingat
8.  Batal dan pindah jadwal
9.  Batas paket dan halaman langganan
10.  E2E test lengkap, lalu uji coba dengan bisnis nyata
