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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
