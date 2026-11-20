# Security Policy

## Supported Versi

Versi plugin saat ini yang mendapat dukungan keamanan:

| Versi | Didukung |
|-------|-----------|
| 0.1.x | ✅ Ya |
| < 0.1.0 | ❌ Tidak |

## Melaporkan Vulnerability

Kami menganggap keamanan sebagai prioritas utama. Jika Anda menemukan kerentanan:

1. **JANGAN buka issue publik** — gunakan jalur privat
2. Kirim laporan ke: **https://github.com/mulqizamzam/dsh-elephant-goldfish-model/security/advisories/new**
3. Sertakan: deskripsi masalah, langkah reproduksi, dampak yang diperkirakan, dan versi plugin yang terdampak
4. Kami akan merespons dalam **72 jam**

## Prinsip Keamanan Plugin

Plugin ini tidak menyimpan:
- Credentials atau API keys
- Data pribadi pengguna
- Token autentikasi

Skill-skill EGM bersifat **read-only** terhadap workspace dan tidak mengeksekusi kode berbahaya.

## Dependensi

Plugin hanya bergantung pada:
- `@deepseek-ai/dsh-skill-filesystem` (disediakan oleh DSH host)

Tidak ada dependensi eksternal tambahan yang diunduh dari npm.

## License

Apache-2.0 — sama dengan upstream Elephant-Goldfish Model karya Google LLC.
