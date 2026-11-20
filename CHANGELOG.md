# Changelog

Semua perubahan penting pada proyek ini didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/),
dan proyek ini mematuhi [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] — 2026-11-20

### Added
- Plugin bundle DSH lengkap untuk EGM (Elephant-Goldfish Model)
- 8 skills EGM: `egm-bootstrap`, `egm-brainstorm`, `egm-draft`, `egm-drift-report`, `egm-lite`, `egm-resolve`, `egm-review`, `egm-review-loop`
- 10 Goldfish persona agents di `agents/`
- 5 document standards di `resources/document_standards/`
- Dokumentasi integrasi DSH di `docs/dsh.md`
- README dalam Bahasa Indonesia
- Skill ZIP bundle di `/mnt/d/Project/zip_skill/nk-egm-dsh-bundle.zip`

### Fixed
- Mengganti referensi `${CLAUDE_PLUGIN_ROOT}` dengan pasangan DSH-equivalent
- Menambahkan `DeepSeek Harness: subagent` ke daftar delegasi harness
- Memastikan `cordis.patch.yml` mendaftar `dsh-skill-filesystem` di rank 600
- Trimming egm-bootstrap, egm-review, egm-lite agar lolos batas 24KB Antigravity

### Changed
- `package.json`: name `dsh-elephant-goldfish-model`, engines `dsh: 0.2.1-rc.2`
- `index.mjs`: entry point ekspor `name`, `version`, `dshTarget`

## [0.1.0] — 2026-11-20

### Added
- Konversi awal repo upstream `google/elephant-goldfish-model` ke format DSH bundle
- Struktur plugin dasar: `package.json`, `index.mjs`, `cordis.patch.yml`
- Pipeline verifikasi: `--dump-config` 0 skip, unit tests 385/389 lulus

[0.1.1]: https://github.com/mulqizamzam/dsh-elephant-goldfish-model/releases/tag/v0.1.1
[0.1.0]: https://github.com/mulqizamzam/dsh-elephant-goldfish-model/releases/tag/v0.1.0
