Nuvora: Langkah dari Nol sampai Vibe Coding
Panduan berurutan: dari membuat akun GitHub, menamai repo, menyiapkan proyek, sampai mulai vibe coding Fase 1
Panduan pendamping dokumen Rencana Produk dan PRD Nuvora · Versi 1.0 · 25 November 2026
Gambaran Urutan
Ikuti urutan ini dari atas ke bawah. Jangan lompat, karena setiap tahap menjadi dasar tahap berikutnya.
1.  Persiapan laptop
2.  Akun GitHub dan keamanannya
3.  Git di laptop
4.  Menamai dan membuat repo
5.  Akun layanan pendukung (Supabase, Vercel, Resend)
6.  Membuat proyek Next.js
7.  Struktur folder dan file penting
8.  Menghubungkan Supabase
9.  Deploy pertama ke Vercel
10.  Menyiapkan tool vibe coding
11.  Alur kerja Git harian
12.  Pengaturan testing dan GitHub Actions
13.  Mulai vibe coding Fase 1
14.  Urutan prompt tiap fase
15.  Aturan aman dan pemecahan masalah
Tampilan situs dan tombol di layanan online bisa berubah. Kalau ada langkah yang tampilannya berbeda dari yang tertulis, cari tombol dengan nama serupa atau lihat dokumentasi resmi layanan itu.
1. Persiapan Laptop
Yang perlu terpasang:
Kebutuhan
Fungsi
Cara cek
Node.js versi LTS
Menjalankan Next.js
node -v
Git
Menyimpan riwayat kode
git --version
VS Code (atau editor lain)
Membaca dan mengedit kode
Buka aplikasinya
Browser Chrome
Menguji tampilan
-
Unduh Node.js dari situs resminya (pilih versi LTS) dan Git dari git-scm.com. Setelah dipasang, tutup dan buka lagi terminal, lalu jalankan perintah cek di atas. Kalau muncul nomor versi, berarti berhasil.
Terminal: di Windows gunakan Git Bash atau PowerShell, di Mac gunakan Terminal. Terminal bawaan VS Code (menu Terminal, New Terminal) juga bisa dipakai.
2. Akun GitHub dan Keamanannya
1.  Buka github.com dan pilih Sign up.
2.  Daftar dengan email yang kamu pakai jangka panjang (bukan email sementara).
3.  Pilih username dengan hati-hati, karena akan terlihat di alamat repo dan sulit diganti kalau sudah dipakai orang. Saran: nama sendiri atau nama brand yang profesional, huruf kecil, tanpa angka acak. Contoh: namakamu atau namakamu-dev.
4.  Verifikasi email dari GitHub.
5.  Aktifkan autentikasi dua langkah (2FA) di Settings, Password and authentication. Gunakan aplikasi authenticator, dan simpan recovery codes di tempat aman. Ini penting karena akun GitHub akan menyimpan kode produkmu.
6.  Lengkapi profil sederhana (foto dan nama) agar terlihat profesional saat nanti berhubungan dengan pelanggan.
3. Git di Laptop
Beri tahu Git siapa kamu. Gunakan email yang sama dengan akun GitHub:
git config --global user.name "Nama Kamu"
git config --global user.email "emailkamu@contoh.com"
git config --global init.defaultBranch main
Cara login ke GitHub dari laptop (pilih salah satu):
• GitHub CLI (disarankan untuk pemula): pasang gh dari cli.github.com, lalu jalankan gh auth login dan ikuti petunjuk di layar.
• Git Credential Manager: biasanya sudah ikut terpasang bersama Git di Windows. Saat pertama kali git push, jendela login GitHub akan muncul.
Jangan pernah menempel password atau token GitHub ke dalam prompt AI atau ke file di repo.
4. Menamai dan Membuat Repo
Aturan penamaan
• Huruf kecil semua, kata dipisah tanda hubung (kebab-case).
• Tanpa spasi, tanpa huruf besar, tanpa karakter khusus.
• Pendek dan jelas, sama dengan nama produk.
Hal
Nama yang disarankan
Repo utama
nuvora
Branch utama
main
Branch fitur
feat/nama-fitur (contoh: feat/halaman-booking)
Branch perbaikan
fix/nama-bug (contoh: fix/slot-bentrok)
Pesan commit
feat: tambah halaman booking publik
Awalan pesan commit yang umum: feat (fitur baru), fix (perbaikan), test (testing), docs (dokumen), chore (urusan teknis lain).
Membuat repo
1.  Di GitHub, klik tombol + di kanan atas, lalu New repository.
2.  Repository name: nuvora.
3.  Visibility: Private (kode produk komersial sebaiknya tidak publik di awal).
4.  Centang Add a README file.
5.  Add .gitignore: pilih template Node.
6.  License: kosongkan dulu untuk proyek komersial.
7.  Klik Create repository.
Mengambil repo ke laptop
Di terminal, masuk ke folder tempat kamu menyimpan proyek (misalnya Documents/proyek), lalu:
git clone https://github.com/USERNAME-KAMU/nuvora.git
cd nuvora
Ganti USERNAME-KAMU dengan username GitHub-mu.
5. Akun Layanan Pendukung
Daftar semuanya dengan email yang sama. Untuk Vercel, pilih Continue with GitHub agar langsung terhubung ke repo.
Layanan
Fungsi
Catatan
Supabase
Database, login, keamanan data (RLS)
Saat membuat project, pilih region terdekat dengan penggunamu (misalnya Singapore)
Vercel
Hosting dan deploy otomatis
Login dengan GitHub
Resend
Mengirim email konfirmasi dan pengingat
Nanti perlu domain sendiri agar email tidak masuk spam
Domain
Alamat situs
Beli di registrar pilihanmu setelah nama final
Batas paket gratis tiap layanan bisa berubah, jadi cek halaman harga resminya sebelum bergantung padanya.
Simpan semua password di password manager, bukan di catatan biasa.
6. Membuat Proyek Next.js
Di dalam folder nuvora hasil clone, jalankan:
npx create-next-app@latest .
Tanda titik berarti membuat proyek di folder saat ini. Kalau ada pertanyaan bahwa folder tidak kosong (karena ada README dan .gitignore), pilih lanjut. Saat ditanya opsi, pilih:
• TypeScript: Yes
• ESLint: Yes
• Tailwind CSS: Yes
• App Router: Yes
• Opsi lain: ikuti pilihan bawaan
Jalankan untuk memastikan berhasil:
npm run dev
Buka http://localhost:3000. Kalau halaman bawaan Next.js tampil, proyek siap. Hentikan dengan Ctrl + C.
Commit pertama:
git add .
git commit -m "chore: inisialisasi proyek next.js"
git push
7. Struktur Folder dan File Penting
Buat folder dan file berikut:
nuvora/
  docs/
    PRD.md            <- salin isi dokumen Rencana Produk dan PRD ke sini
  tests/
    e2e/              <- test Playwright
  .env.local          <- rahasia, JANGAN di-commit
  .env.example        <- contoh tanpa nilai asli, boleh di-commit
  AGENTS.md           <- aturan untuk AI coding
File .env.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
Salin file ini menjadi .env.local lalu isi nilai aslinya nanti. Pastikan .env.local tercantum di .gitignore (template Node dan Next.js biasanya sudah memasukkannya, tetap periksa). Jalankan git status sebelum commit: kalau .env.local muncul, hentikan dan perbaiki.
File AGENTS.md (aturan untuk AI)
Isi dengan aturan singkat yang akan dibaca tool AI di setiap sesi:
Proyek: Nuvora, SaaS booking multi-tenant untuk bisnis jasa kecil di Indonesia.
Stack: Next.js (App Router, TypeScript), Tailwind, Supabase, Resend.
Acuan: baca docs/PRD.md sebelum mengerjakan fitur.
Aturan:
- Kerjakan satu fitur kecil per permintaan.
- Semua tabel milik bisnis wajib punya business_id dan Row Level Security.
- Simpan waktu dalam UTC, tampilkan sesuai zona waktu bisnis.
- Jangan pernah memakai service role key di kode browser.
- Validasi semua input di server.
- Tulis test untuk setiap fitur, terutama isolasi data dan bentrok jadwal.
- Jangan mengubah file di luar yang diminta tanpa memberi tahu.
- Bahasa antarmuka: Bahasa Indonesia.
8. Menghubungkan Supabase
1.  Di Supabase, buat project baru (nama nuvora, region terdekat, simpan password database di password manager).
2.  Di pengaturan API project, salin Project URL dan anon (publishable) key, lalu isi ke .env.local.
3.  Salin juga service role key ke .env.local. Kunci ini sangat sensitif: hanya untuk kode server, tidak pernah dipakai di browser dan tidak pernah ditempel ke AI.
4.  Pasang library:
npm install @supabase/supabase-js @supabase/ssr
5.  Skema tabel dan RLS akan dibuat lewat prompt Fase 1 (bagian 13), bukan dibuat manual satu per satu.
9. Deploy Pertama ke Vercel
Deploy sedini mungkin, walau halamannya masih kosong, supaya masalah deploy ketahuan lebih awal.
1.  Di Vercel, pilih Add New, lalu Project.
2.  Import repo nuvora dari GitHub.
3.  Di bagian Environment Variables, isi variabel yang sama seperti .env.local.
4.  Klik Deploy.
5.  Setelah selesai, kamu mendapat alamat percobaan dari Vercel. Setiap git push ke main akan men-deploy ulang otomatis.
Nanti, saat domain sudah dibeli, sambungkan lewat pengaturan Domains di proyek Vercel.
10. Menyiapkan Tool Vibe Coding
Pilihan tool
Tool
Cocok untuk
Catatan
OpenCode (terminal)
Mengerjakan kode langsung di repo, bisa memakai model gratis
Pasang, jalankan /connect, lalu pilih model dengan /models
Claude Code
Pengerjaan kode lebih mendalam di repo
Berbayar, cek kebutuhan akun di dokumentasi resmi
Editor berbasis AI (misalnya Cursor)
Edit kode lewat antarmuka editor
Cek paket dan batasnya
Untuk mulai hemat, OpenCode dengan model gratis seperti Iceman Free bisa dipakai, tetapi ingat dua hal yang sudah dibahas sebelumnya: batasnya tidak dipublikasikan dan data pada masa gratis dapat dipakai untuk meningkatkan model. Karena itu:
• Jangan tempel kunci rahasia, isi .env.local, atau data pelanggan asli ke prompt.
• Siapkan satu model cadangan kalau model gratis dibatasi atau dihentikan.
• Untuk bagian paling sensitif (RLS dan keamanan), pertimbangkan memakai model yang lebih andal, lalu periksa hasilnya dua kali.
Cara memulai sesi
1.  Buka terminal di folder nuvora.
2.  Jalankan tool AI-mu dari folder itu agar ia bisa membaca AGENTS.md dan docs/PRD.md.
3.  Mulai dengan satu tugas kecil dan jelas.
11. Alur Kerja Git Harian
Ulangi siklus ini untuk setiap fitur:
1.  Pastikan berada di main dan terbaru: git checkout main lalu git pull.
2.  Buat branch fitur: git checkout -b feat/halaman-booking.
3.  Minta AI mengerjakan satu fitur kecil.
4.  Jalankan npm run dev dan coba sendiri hasilnya.
5.  Jalankan test: npm test dan npx playwright test.
6.  Baca perubahan kode dengan git diff (terutama bagian keamanan).
7.  Commit: git add . lalu git commit -m "feat: tambah halaman booking publik".
8.  Push: git push -u origin feat/halaman-booking.
9.  Di GitHub, buat Pull Request ke main. Tunggu GitHub Actions lulus, lalu Merge.
10.  Vercel otomatis men-deploy hasil merge.
Kalau AI merusak sesuatu, kamu bisa kembali ke commit sebelumnya. Itulah gunanya commit kecil dan sering.
12. Pengaturan Testing dan GitHub Actions
Pasang tool testing:
npm install -D vitest
npm init playwright@latest
Tambahkan skrip di package.json bagian scripts:
"test": "vitest run"
Buat file .github/workflows/ci.yml agar test jalan otomatis setiap push dan Pull Request:
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm ci
      - run: npm run lint
      - run: npm test
Test Playwright (E2E) memerlukan aplikasi dan database testing yang berjalan, jadi tambahkan ke alur CI setelah fitur intinya ada. Gunakan project Supabase terpisah (atau database lokal) khusus untuk testing, jangan memakai database produksi.
13. Mulai Vibe Coding Fase 1
Fase 1 adalah fondasi: skema database, keamanan data (RLS), dan test isolasi. Kerjakan bagian ini paling hati-hati.
Prompt 1: skema dan RLS
Tempel ke tool AI-mu (pastikan docs/PRD.md sudah ada di repo):
Baca AGENTS.md dan docs/PRD.md. Kerjakan Fase 1.

Buat file migrasi SQL untuk Supabase (PostgreSQL) berisi tabel: businesses, services, availability_rules, closed_dates, bookings, reminders, sesuai bagian Struktur Database di PRD.

Syarat:
1. Semua tabel milik bisnis punya kolom business_id.
2. Aktifkan Row Level Security di semua tabel.
3. Pemilik bisnis hanya bisa membaca dan mengubah baris milik bisnisnya sendiri.
4. Akses publik hanya untuk: membaca profil bisnis dan layanan aktif, serta membuat booking. Publik tidak boleh membaca data booking orang lain.
5. Tambahkan constraint di database agar dua booking tidak bisa bertabrakan pada bisnis yang sama (pakai exclusion constraint pada rentang waktu).
6. Waktu disimpan dalam UTC.

Jelaskan setiap kebijakan RLS yang kamu buat dengan bahasa sederhana. Jangan membuat fitur lain dulu.
Prompt 2: test isolasi data
Buat test untuk membuktikan isolasi data antar bisnis: pemilik bisnis A tidak bisa membaca, mengubah, atau menghapus data bisnis B, dan pengguna anonim tidak bisa membaca booking siapa pun. Buat juga test yang membuktikan dua booking di slot yang sama tidak bisa sama-sama berhasil. Jelaskan cara menjalankan test-nya.
Cara memeriksa hasilnya
• Jalankan migrasi di project Supabase testing dulu, bukan produksi.
• Jalankan test isolasi. Kalau ada yang gagal, minta AI memperbaiki sampai semua lulus.
• Di dasbor Supabase, pastikan setiap tabel menunjukkan RLS aktif.
• Commit hanya setelah semua test lulus.
14. Urutan Prompt Tiap Fase
Gunakan pola yang sama: satu permintaan kecil, jalankan, uji, commit. Urutan ini mengikuti PRD.
Urutan
Tugas
Yang diuji
1
Skema database, RLS, test isolasi
Isolasi data, tidak ada bentrok
2
Login, daftar, dan onboarding bisnis
Pendaftaran sampai link siap
3
Pengaturan layanan dan jam buka
Simpan dan ubah data
4
Fungsi hitung slot kosong
Unit test dengan banyak kasus, termasuk libur dan zona waktu
5
Halaman booking publik
Booking berhasil, tampilan HP, dua pelanggan di slot sama
6
Dashboard jadwal
Daftar harian dan mingguan, ubah status
7
Email konfirmasi dan pengingat
Email terkirim, jadwal pengingat benar
8
Batal dan pindah jadwal lewat link
Token valid, token acak ditolak
9
Batas paket gratis
Batas ditegakkan di server
10
E2E lengkap dan uji coba dengan barbershop
Seluruh alur pemilik dan pelanggan
Pola prompt yang baik
Konteks: kita di fitur [nama fitur] (urutan N di PRD).
Tugas: [satu hal spesifik].
Batasan: jangan ubah file lain; ikuti AGENTS.md.
Selesai jika: [kriteria yang bisa dicek, misalnya test X lulus].
Setelah selesai: ringkas apa yang diubah dan file mana saja.
15. Aturan Aman dan Pemecahan Masalah
Aturan aman
• Jangan pernah commit file .env.local atau menempel kunci rahasia ke prompt AI.
• Kunci yang pernah bocor (ter-commit ke GitHub atau tertempel ke AI) dianggap rusak: buat ulang di dasbor layanannya.
• Baca git diff sebelum commit, terutama kode terkait login, RLS, dan pembayaran.
• Jangan menerima kode yang tidak kamu pahami di bagian keamanan. Minta AI menjelaskan.
• Backup: kode aman di GitHub, dan database punya fitur backup di Supabase (cek ketentuan paketnya).
Masalah umum
Masalah
Kemungkinan penyebab
Solusi
npm atau node tidak dikenali
Node belum terpasang atau terminal belum dibuka ulang
Pasang Node.js, tutup dan buka terminal
git push ditolak
Belum login GitHub atau salah akun
Jalankan gh auth login
Halaman error soal environment variable
.env.local belum diisi atau server belum dimulai ulang
Isi nilainya, jalankan ulang npm run dev
Deploy Vercel gagal
Variabel lingkungan belum diisi di Vercel
Isi di pengaturan proyek, lalu deploy ulang
AI mengubah banyak file sekaligus
Permintaan terlalu besar
Batalkan dengan git restore ., ulangi dengan tugas lebih kecil
Test gagal setelah perubahan AI
Fitur lama ikut rusak
Minta AI memperbaiki tanpa mengubah test, atau kembali ke commit sebelumnya
