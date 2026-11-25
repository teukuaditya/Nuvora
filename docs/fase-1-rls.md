# Fase 1: Skema, RLS, dan Constraint

## File utama

- Migrasi SQL: `supabase/migrations/0001_init.sql`
- Test isolasi: `tests/fase1/isolation.test.ts`

## Tabel

Semua tabel milik bisnis memiliki `business_id` (langsung atau lewat relasi bisnis). Waktu booking disimpan sebagai `timestamptz` (UTC).

- `businesses` - profil bisnis, `owner_id` mengacu ke `auth.users`.
- `services` - layanan per bisnis.
- `availability_rules` - jam buka mingguan per bisnis.
- `closed_dates` - tanggal libur per bisnis.
- `bookings` - booking pelanggan; punya `manage_token` acak untuk link kelola.
- `reminders` - jadwal pengingat per booking.

## Constraint anti-bentrok

`bookings_no_overlap` menggunakan exclusion constraint:

- `business_id with =`
- `tstzrange(starts_at, ends_at, '[)') with &&`
- hanya berlaku untuk booking dengan `status <> 'cancelled'`

Artinya, dua booking aktif di bisnis yang sama tidak boleh punya rentang waktu yang bertumpuk. Database akan menolak insert/update kedua.

## Kebijakan RLS (bahasa sederhana)

### businesses
- **Pemilik baca bisnisnya sendiri**: user login hanya bisa melihat baris bisnis yang `owner_id`-nya adalah dirinya.
- **Publik baca profil bisnis**: halaman booking publik perlu menampilkan profil bisnis, jadi anon/authenticated boleh select.
- **Pemilik insert/update/delete miliknya**: hanya pemilik yang bisa membuat/mengubah/menghapus bisnisnya.

### services
- **Publik baca layanan aktif**: pelanggan perlu melihat layanan yang bisa dipesan.
- **Pemilik baca semua layanan bisnisnya**: termasuk layanan nonaktif.
- **Pemilik kelola layanan bisnisnya**: insert/update/delete hanya jika pemilik bisnis tersebut.

### availability_rules & closed_dates
- **Publik bisa baca**: dibutuhkan untuk menghitung slot kosong di halaman booking.
- **Pemilik bisa kelola**: hanya pemilik bisnis yang bisa tambah/ubah/hapus.

### bookings
- **Tidak ada select untuk anon**: pelanggan anonim tidak bisa membaca booking siapa pun. Ini mencegah kebocoran data pelanggan.
- **Pemilik bisa baca booking bisnisnya**: untuk dashboard jadwal.
- **Publik bisa insert booking**: hanya jika status `booked` dan service aktif milik business yang sama.
- **Pemilik bisa update/delete booking bisnisnya**: untuk ubah status, pindah jadwal, atau batalkan dari dashboard.

### reminders
- **Hanya pemilik** yang bisa select/insert/update/delete reminder di bisnisnya.
- Insert reminder juga dicek bahwa booking terkait milik bisnis yang sama.

## RPC publik (security definer)

Karena anon tidak boleh select tabel `bookings`, dibuat fungsi:

- `create_public_booking(...)` - membuat booking publik dan mengembalikan data aman termasuk `manage_token`. Fungsi memvalidasi input dan memastikan service aktif milik bisnis yang benar.
- `get_booking_by_manage_token(p_token)` - mengambil data booking terbatas berdasarkan token kelola.

## Cara menjalankan

1. Buat project Supabase **testing** terpisah (jangan produksi).
2. Jalankan migrasi `supabase/migrations/0001_init.sql` lewat SQL editor Supabase atau Supabase CLI.
3. Isi env test: `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_TEST_SERVICE_ROLE_KEY`.
4. Jalankan test:

```bash
npm test -- tests/fase1/isolation.test.ts
```

Catatan: test memakai service role key untuk setup data. Jangan pakai key produksi.