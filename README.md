# dsh-elephant-goldfish-model

Plugin DeepSeek Harness yang membawa workflows [Elephant-Goldfish Model](https://github.com/google/elephant-goldfish-model) karya Google ke DSH.

## Ringkasan

**Gajah** memegang konteks proyek dan menyusun spesifikasi. **Ikan emas** (reviewer) memeriksa draf tanpa ingatan percakapan sebelumnya, sehingga menemukan asumsi tersembunyi dan titik buta. **Kamu** yang memutuskan perdagangan arsitektur dan menyetujui spesifikasi sebelum implementasi.

- 🐘 **Tahap Desain**: Kembangkan ide dan rancang dokumen dengan pola pikir gajah
- 🐟 **Tahap Review**: Uji desain dan kode dengan sudut pandang ikan emas yang segar
- 🔍 **Deteksi Drift**: Bandingkan kode sumber dengan dokumen desain untuk menemukan penyimpangan

## Instalasi

### Dari repo lokal (pengembangan)

Gunakan ketika ingin menguji plugin dari direktori kerja sebelum dipublikasikan:

```sh
dsh plugin --profile web add ./dsh-elephant-goldfish-model
```

Perintah ini menyalin dependensi ke profile, membuat symlink `link:`, dan menambahkan bundle ke `dsh.profile.bundles`.

### Dari GitHub (stabil)

Gunakan ketika plugin sudah dirilis di repository personal/publik:

```sh
dsh plugin --profile web add github:mulqizamzam/dsh-elephant-goldfish-model#main
```

### Dari npm (terbitan resmi)

Jika plugin sudah dipublikasikan ke registry:

```sh
dsh plugin --profile web add dsh-elephant-goldfish-model@0.1.1
```

### Verifikasi pemasangan

Setelah salah satu cara di atas, pastikan plugin termuat tanpa kesalahan:

```sh
# Cek baris plugin muncul di config (harus ada prefix "# ==")
dsh --profile web --dump-config | grep elephant-goldfish

# Hitung jumlah bundle yang di-skip (harus 0)
dsh --profile web --dump-config 2>&1 | grep -c "skipping profile bundle"
```

Hasil yang diharapkan: baris plugin muncul dan jumlah skip adalah **0**. Jika muncul peringatan `peerDependencies` dari pnpm, itu hanya saran — bukan kegagalan, karena DSH menyediakan `@deepseek-ai/dsh-skill-filesystem` lewat layer `dsh-base`.

## Cara Pakai

Setelah terpasang, panggil skill EGM melalui alat `skill`:

```
skill("egm-brainstorm")   # Menuangkan ide dan possibility
skill("egm-draft")        # Menyusun draf dokumen desain
skill("egm-review")       # Review Goldfish pada dokumen
skill("egm-review-loop")  # Siklus review multi putaran
skill("egm-resolve")      # Menyelesaikan temuan review
skill("egm-drift-report") # Cek ketidaksesuaian kode vs desain
skill("egm-bootstrap")    # Generate README compliant EGM
skill("egm-lite")         # Workflow ringan EGM
```

### Subagent di DSH

Skill review membutuhkan agent baru dengan konteks terpisah. Gunakan `subagent` bawaan DSH:

```javascript
// Contoh: panggil reviewer zoom-out
subagent({
  description: "EGM zoom-out review",
  prompt: "Baca agents/zoom_out.md dulu, lalu review desain ini..."
})
```

Setiap persona tersimpan di `agents/<nama>.md`. Field `name` di frontmatter menandai tipe reviewer.

## Struktur Plugin

```
dsh-elephant-goldfish-model/
├── package.json              # Metadata bundle DSH
├── index.mjs                 # Titik masuk
├── cordis.patch.yml          # Injeksi Cordis (daftar skill-filesystem)
├── skills/                   # 8 Skill EGM
│   ├── egm-bootstrap/
│   ├── egm-brainstorm/
│   ├── egm-draft/
│   ├── egm-drift-report/
│   ├── egm-lite/
│   ├── egm-resolve/
│   ├── egm-review/
│   └── egm-review-loop/
├── agents/                   # Definisi persona Goldfish reviewer
├── resources/                # Standar dokumen & instruksi eksekusi
├── assets/                   # Ikon plugin
└── docs/
    └── dsh.md               # Panduan integrasi DSH
```

## Detail Teknis

- **Versi DSH target**: `0.2.1-rc.2`
- **Node.js minimum**: `>=22.5.0`
- **Lisensi**: Apache-2.0 (disalin dari upstream EGM)
- **Skill Provider**: Mendaftar `@deepseek-ai/dsh-skill-filesystem` lewat `bundledSkillDir` pada rank 600

## Perbedaan dengan Asli

Plugin ini adalah lapisan adaptasi DSH dari [google/elephant-goldfish-model](https://github.com/google/elephant-goldfish-model):

1. Menggunakan ulang semua skills, persona agents, dan resources dari upstream
2. Mendaftar provider skill via `cordis.patch.yml` dengan mekanisme `bundledSkillDir`
3. Mengganti referensi `${CLAUDE_PLUGIN_ROOT}` (spesifik Claude Code) dengan panduan DSH
4. Menyesuaikan petunjuk delegasi subagent dari `Agent` menjadi `subagent`

Upstream dikembangkan oleh Google LLC; lapisan adaptasi DSH ini dikelola komunitas DeepSeek Harness.

## Lisensi

Apache-2.0 — sesuai dengan lisensi upstream EGM.
