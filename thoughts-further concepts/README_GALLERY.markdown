# Quest Grid+ × Hero’s Journey: README

## Ziel & Überblick
Dieses System erstellt kapitelbasierte Bildserien (Hero + Thumbs) für thematische Epochen (z. B. Cryptober, Uptober), die den **Hero’s Journey** (Call, Trials, Apotheosis, Return) widerspiegeln. Es liefert konsistente Assets für ein responsives Grid mit Lightbox, Filterchips und Share-Funktionen. Fokus: **Cryptober – Call to Adventure**.

### Struktur
- **Hero**: 1× Bild (16:9, 1280×720, WebP, ≤600 KB).
- **Thumbs**: 6–12× Bilder (Höhe 280 px Desktop/180 px Mobil, 4:5 oder 1:1, AVIF, ≤120 KB).
- **Formate**: WebP (Hero), AVIF (Thumbs); Frames: Base, Minimal, Glitch, Trophy.
- **Brand-Konstanten**: Palette (#1a1a1a, #FF6200, #00FF66), Overlay ($CRYPTOBER, BR), Safe-Area ≥8%.
- **Metadaten**: Captions (≤80 Zeichen), Tags (meme, art, tools, lore, alpha), Alt-Texte.

## Ordnerstruktur
```
/public/gallery/{epoch}/{act}/
  hero/16x9/{slug}__v{n}.webp
  thumbs/4x5/{slug}__v{n}.avif
  thumbs/1x1/{slug}__v{n}.avif
/manifests/
  GALLERY_THEME_MAP.json
  PROMPTS.ndjson
/docs/
  README_GALLERY.md
```
**Beispiel**:
- `public/gallery/cryptober/call/hero/first-spark__v1.webp`
- `public/gallery/cryptober/call/thumbs/4x5/rune-glow__v1.avif`

## Produktionsablauf
1. **Moodboard**: Kernmotive (z. B. Kürbis, grüne Kerze, Runen, Nebel) und Memes („Answer the call“, „Wake the bulls“) definieren.
2. **Prompts**: Tool-agnostische Prompts (siehe `PROMPTS.ndjson`) mit Varianten, Negatives, Brand-Overlays.
3. **Frames**:
   - **Base**: Kontrastreich, Neon-Glow, feines Grain.
   - **Minimal**: Klare Silhouette, viel Negativraum.
   - **Glitch**: Chromatic Aberration, Scanlines.
   - **Trophy**: Emblem-Stil, Spotlight-Halo.
4. **Export**: Batch-Benennung (`{theme}_{series}_{title}__v{n}.{format}`), WebP/AVIF-Presets.
5. **QA**: Schärfe, Dateigröße, Palette, Safe-Area, Erzählfluss, Barrierefreiheit (WCAG AA).

## Integration
- **Grid**: Kapitel-Header (z. B. „Cryptober: Call“), 4×2 Thumbs, 16 px Gutter, feste Höhe (280/180 px).
- **Lightbox**: Preload (Hero + Thumb[n±1]), Swipe/Pfeile, Alt-Texte aus `PROMPTS.ndjson:title+subject`.
- **Filterchips**: Multi-select (`meme`, `art`, `tools`, `lore`, `alpha`), URL-Params (`?filter=meme+art`).
- **Share**: OG-Asset (Hero), Deep-Link (`/gallery/cryptober/call#first-spark`).

## Wartung
- **Manifeste aktualisieren**: Neue Epochen/Acts in `GALLERY_THEME_MAP.json` und `PROMPTS.ndjson` ergänzen.
- **Drops**: 2–3 Drops/Woche (2–3 Thumbs/Drop, Hero in der Mitte).
- **Archivierung**: Alte Versionen (`__v{n}`) behalten, nur aktuelle in Grid/Lightbox.

## QA-Checkliste
- **Technik**: Hero ≤600 KB, Thumbs ≤120 KB, keine Artefakte.
- **Marke**: Palette (#1a1a1a, #FF6200, #00FF66), $CRYPTOBER-Overlay (BR), Safe-Area ≥8%.
- **Erzählfluss**: Klarer Akt (z. B. Call: Kürbis → Kerze → Runen → Bullen).
- **Barrierefreiheit**: Alt-Texte vollständig, Kontrast ≥WCAG AA.

## Nutzung
1. **Prompts ausführen**: `PROMPTS.ndjson` in ein Bildgenerierungstool (z. B. MidJourney, DALL·E) einfügen.
2. **Assets exportieren**: WebP (Hero), AVIF (Thumbs) mit angegebenen Presets.
3. **Grid einbinden**: Ordnerstruktur in Webplattform hochladen, Manifeste für Filter/Share verwenden.
4. **Drops planen**: Teaser-Thumb → Hero → Thumbs in Waves (Mo/Mi/Fr).