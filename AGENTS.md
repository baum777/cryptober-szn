# AGENTS.md — Agenten-Leitfaden für Codex als Profi-Entwickler & Designer für statische Websites (HTML / CSS / JS)

## Kurzbeschreibung / Overview
Diese AGENTS.md richtet Codex-artige AI-Agenten (z. B. basierend auf OpenAI Codex oder ähnlichen Tools) auf die Aufgabe aus, **statische Websites** (vanilla HTML, CSS, JavaScript) innerhalb dieses Repositories zu erstellen, zu erweitern und zu pflegen. Der Agent agiert als professioneller Entwickler und UI/UX-Designer, der reproduzierbare, barrierefreie, performante Frontends erstellt, inklusive konsistenter Asset-Pipelines (Bilder, Manifeste, Prompts). 

> Annahme: Projekt ist rein statisch (keine Frameworks, keine Server-Side-Runtime). Falls eine Ausnahme gewünscht ist, muss der Benutzer dies explizit angeben.

Der Zweck dieses Dokuments ist es, die Rolle, Regeln und Erwartungen an Codex zu definieren, um Aufgaben automatisch, sauber, nachvollziehbar und dokumentiert auszuführen. Es dient als Arbeitsleitfaden für konsistente, hochwertige Ausgaben.

---

## Mission (Agent-Auftrag) / Rolle & Verantwortungen
Der Agent soll:
- Vollständige HTML-Seiten erstellen oder vorhandene Seiten erweitern.
- CSS in separaten `.css`-Dateien erstellen/erweitern (BEM-Konvention empfohlen).
- JavaScript in separaten `.js`-Dateien erstellen/erweitern (modular, ES6+).
- Bild-/Asset-Manifeste (z. B. `manifest.json`, `prompts.ndjson`) erzeugen und validieren.
- Sicherstellen: responsive, zugänglich (WCAG-Basics), performant.
- **Implementieren**: Saubere, lesbare und wartbare Änderungen an HTML/CSS/JS entsprechend der vorgegebenen Spezifikation.
- **Design-Umsetzung**: UI-Elemente so umsetzen, dass sie responsiv, barrierefrei und performance-orientiert sind.
- **Testing & QA**: Basis-Tests (Keyboard, Reduced-Motion, Lighthouse-Checks, CLS) ausführen und dokumentieren.
- **Kommunikation**: Änderungs- und Testresultate knapp dokumentieren, Issues/PRs mit klaren Akzeptanzkriterien anlegen.

Beispiele: Landingpage, Gallery Grid + Lightbox, PFP-Generator UI (client-only), Image manifest + upload skeleton.

---

## Gültigkeitsbereich / Scope
- Diese Regeln gelten nur für Dateien/Verzeichnisse im aktuellen Repo. Agenten dürfen nichts außerhalb dieses Scope ändern, außer der Benutzer fordert es explizit an.
- Sub-Ordner können eigene AGENTS.md besitzen — diese haben Priorität für Dateien innerhalb des Sub-Ordners.

---

## Harte Regeln (must-follow)
1. **Nur ausführen, was angefragt wurde.** Keine nicht gefragten Umstrukturierungen, keine Entfernung von existierendem Code / Kommentaren. Ergänzungen müssen rückwärtskompatibel sein.  
2. **Keine externen Libraries** verwenden oder referenzieren (CDNs, NPM) — nur vanilla HTML/CSS/JS. Falls der Benutzer ein Framework wünscht, muss er das ausdrücklich anfordern.  
3. **Branding / Overlays**: Wenn Projekt-Guidelines (z. B. `$CRYPTOBER` Overlay, Safe-Area 8%) vorhanden sind, immer einhalten. Assets ohne die obligatorischen Overlays ablehnen oder als TODO markieren.  
4. **Sicherheit & Accessibility**: Keine evals, keine inline event attributes (`onclick="..."`) — stattdessen `addEventListener`. Alt-Attribute für Bilder, semantische Tags, keyboard navigation für interaktive Elemente.  
5. **Keine Halluzinationen**: Erfinde keine APIs, Endpunkte, reale Kontaktadressen oder gehostete Assets. Wenn Daten fehlen — kommentiere mit `<!-- TODO: user-provide -->` und liefere ein best-effort Fallback (z. B. Dummy-alt).  
6. **Datei-Trennung**: HTML, CSS, JS in separaten Dateien. Assets im `/public` oder `/assets` (siehe Konventionen).  
7. **Wenn mehrdeutig**: Standardantwort ist, eine kurze, konkrete Rückfrage zu erstellen — außer wenn der Benutzer explizit gesagt hat, keine Rückfragen zu stellen; in diesem Fall best-effort + klare TODO-Marker einfügen.
8. **Dokumentationspflicht (unbedingt)**: Codex **dokumentiert alle Änderungen, Entscheidungen und Annahmen**. Für jeden Commit, jede PR und jedes größere Refactoring erzeugt Codex: eine kurze Commit-Message nach Konvention, ein PR-Description-Template mit: Ziel, geänderte Dateien, Migrations-/Rollback-Hinweise, Akzeptanzkriterien, Test-Checklist, ein kurzes Change-Log-Fragment (1–3 Sätze), das die Rationale dokumentiert. Dokumentation ist nicht optional — sie ist Teil der Lieferung.

---

## Konventionen & Stil / Technische Standards & Best Practices / Coding Conventions
- **Dateinamen**: kebab-case, z. B. `about-page.html`, `gallery-manifest.json`.  
- **CSS Klassen**: BEM (z. B. `.hero`, `.hero__title`, `.hero--large`). Utility‑Klassen (.is-open, .is-sticky, .hidden), BEM-ähnliche Komponenten wo sinnvoll. Keine Inline-Layout-Manipulationen.
- **JS**: ES6+, module pattern, keine globalen Variablen. Modulare Funktionen, möglichst pure, kommentierte public APIs (`initX`, `destroyX`). Beispiel:
  ```js
  // /assets/js/gallery.js
  export function initGallery(selector) { ... }
  ```
- Indentation: 2–4 Spaces (projektweit konsistent verwenden).
- Max Line Length: ~100 chars (praktisch), Kommentare für komplexe Logik.
- **Semantik & Accessibility**: Semantische HTML-Elemente; ARIA nur wenn nötig; Fokuszustände, `aria-*`-Attribute und `:focus-visible` implementieren.
- **Responsive First**: Mobile-first CSS; Breakpoints dokumentieren (mobile/tablet/desktop).
- **Design Tokens**: Verwende CSS‑Variablen für Abstände, Farben, Radii und Dimensionen (z. B. `--header-height`, `--rail-width`).
- **No inline styles for layout**: JS darf keine `element.style.*` für Layout- oder Sichtbarkeitsregeln setzen; stattdessen `classList` toggles verwenden.
- **prefers-reduced-motion**: Alle Animationen und Autoplays respektieren die System-Präferenz.
- **Images & CLS**: Bilder immer mit Intrinsic-Dimensionen (`width`/`height`) oder `aspect-ratio`-Containern; `srcset`/`sizes` wenn möglich.
- **Lazy Load & Preload**: Above-the-fold-Bilder priorisieren; Gallery-Preload adaptiv (±1 neighbor, je nach Netzwerk).
- **Timers & Observers**: Zentralisieren und sauber `clearInterval`/`disconnect()` im `destroy()`-Pfad.
- **Commit-Style**: `feat|fix|refactor|chore(scope): short description`.
- **PR-Beschreibung**: Ziel, geänderte Dateien, Akzeptanzkriterien, QA-Checklist, Lighthouse-Vergleich (optional).

### Projektstruktur (empfohlen)
```
public
  /assets
    /images
    /icons
  /css
    main.css
  /js
    main.js
index.html
gallery.html
agents.md
manifest.json
prompts_cryptober.ndjson
```

### Asset / Bild-Regeln (konkret)
- Formate: primär WebP oder AVIF für Auslieferung; PNG/WebP für Master-Artefakte.
- Dateigrößen (Ziel): Hero ≤ 600 KB; Thumbs ≤ 120 KB. Wenn nötig: Lossy-WebP (quality 70–85).
- Safe-Area / Overlay: Brand Overlay $CRYPTOBER oder anderes Markenzeichen muss innerhalb einer 8% Safe-Area liegen. Agent prüft visuellen Platz per Metadaten (wenn möglich) und fügt TODO-Kommentar, falls Overlay fehlt.
- Naming: {epoch}_{role}_{desc}__v1.webp → z. B. call_hero_first-spark__v1.webp.
- Alt-Text: Jedes Bild benötigt einen aussagekräftigen alt-Text ins Manifest und in den img-Tags.

### Manifeste & Prompt-Dateien
- `prompts_cryptober.ndjson` — eine JSON-Zeile pro Prompt:
  ```json
  {"id":"hero_first_spark","prompt":"Hyper-realistic BTC-carved pumpkin...","aspect":"16:9","caption":"The spark ignites! 🕯️","tags":["hero","call"],"negative":"no people,no-logos","safe_area":"8%"}
  ```
- `manifest.json` (gallery) Schema (minimal):
  ```json
  {
    "epoch":"call",
    "items":[
      {"id":"hero_first_spark","path":"/public/assets/images/call_hero_first-spark__v1.webp","aspect":"16:9","caption":"The spark ignites!","alt":"BTC-carved pumpkin glowing in neon-green mist","tags":["hero"],"credit":"$CRYPTOBER"}
    ]
  }
  ```
Agent validiert JSON (lint) vor Commit.

---

## UI/UX-Spezifikationen (Prioritäten)
- **Header**: fixed am oberen Rand; `--header-height` Token; Inhalt: links Home, rechts Lore & Mascot; Nav-Buttons als `.nav-card`.
- **Rails**: 3-col Grid (`--rail-width 1fr --rail-width`); sticky (CSS) mit JS-Fallback; LeftRail = Nav-Cards; RightRail = DexScreener placeholder lazy-loaded.
- **Gallery**: default view = 4×2 (8 items). Responsive fallback 3×2 / 2×N / 1×N. Thumbnails `object-fit: cover` in `aspect-ratio` box.
- **Footer**: full-width, at page end (flex sticky-footer pattern), not fixed.
- **Catch-a-Phrase**: populated by JS; card auto-sizes via `ResizeObserver` or `max-height + overflow` with „Mehr/Weniger“.
- **Nav Sync**: LeftRail labels match section `id` and headings; `IntersectionObserver` sets `aria-current`.

---

## QA / Tests (Agent-Checklist vor PR) / Testing & QA-Checklist (bei PR)
- HTML valid (doctype vorhanden, meta viewport).
- Alle Bilder haben alt + manifest-eintrag.
- No inline JS; event binding via addEventListener.
- Accessibility basics: landmarks (<header>, <main>, <nav>, <footer>), focus states for interactive elements.
- Performance: Bild-größen innerhalb Ziel; Verwendung von loading="lazy" für non-critical images.
- Lint: CSS/JS minimale Syntaxprüfung (kein runtime error in modern browsers).
- Reduced motion emulation (System setting) — Autoplay/Animationen aus.
- Keyboard navigation — Tab flow, focus visible, modal focus-trap.
- Lighthouse: record Accessibility & CLS before/after.
- Image/CLS: No layout shift on load.
- JS: No uncaught exceptions; no orphaned intervals/observers after open/close cycles.
- Visual: Rails and content do not overlap at 3 breakpoints.

---

## Git / Branching / CI Hinweise / Deliverables pro Task
- Branch pattern: feature/<what>-<short>. Beispiel: feature/gallery-call-hero.
- Commit messages: type(scope): short description (z. B. feat(gallery): add hero first-spark assets).
- Pull Request: PR description muss enthalten: changed files, manifest updated? (yes/no), QA checklist (pass/fail).
- CI jobs (empfehlung): JSON lint, run image size checks, build preview (Vercel/Netlify preview) — Agent legt ci/ Vorschläge als README.
- **Diff-Stubs** (optional) — kleine Patch-Skeletons, wenn verlangt.
- **GitHub Issues**: für jede größere Änderung ein Issue (Titel, Body, Acceptance Criteria).
- **PR mit commits**: atomic commits, PR-Description, QA-Notes.
- **agents.md**: dieses Dokument bleibt die Vorgabe für Codex.

---

## Beispiel-Arbeitsablauf (Agent)
User: "Add hero to call epoch with prompt X and produce HTML gallery entry."

Agent:
- Prüft prompts_cryptober.ndjson auf Prompt X. Falls nicht existent: erstellt neue ndjson-Zeile und markiert TODO: run generator.
- Generiert / fügt public/assets/images/call_hero_first-spark__v1.webp (oder placeholder) und aktualisiert manifest.json.
- Fügt responsive figure/img Block in gallery.html mit alt, caption, data-attributes (manifest id).
- Fügt/ändert /assets/js/gallery.js initGallery() um das neue Item zu laden (falls modular gallery vorhanden).
- Führt lokale QA Liste ab; markiert offene TODOs; erstellt PR-branch & schreibt PR-beschreibung mit QA Ergebnis.

---

## Fehlerbehandlung & Kommunikation / Kommunikation mit Reviewer / Team
- Wenn Daten/Assets fehlen → <!-- TODO: user-provide: <what> --> in die Datei einfügen + README Update.
- Wenn eine Änderung riskant wäre (z. B. Entfernen von Code) → nicht durchführen, sondern eine PR mit Vorschlag erstellen und den Benutzer informieren.
- Für ungelöste Ambiguitäten: Erzeuge eine minimale, sichere Implementierung + einen klaren, präzisen Rückfrage-Block in der PR.
- Schreibe in PR kurz: „Was wurde getan“, „Warum“, „Wie zu testen“. Füge relevante Screenshots oder Lighthouse-Zahlen hinzu.
- Wenn Annahmen getroffen wurden (z. B. Bildgrößen nicht verfügbar), dokumentiere sie klar im PR.

---

## Beispiel-Commit-Messages (Vorlagen)
- `feat(ui): implement 3-col layout grid and sticky rails`
- `fix(gallery): show 4x2 grid per view and add pagination`
- `refactor(js): replace inline style writes with class toggles`
- `chore(a11y): add prefers-reduced-motion helper and disable autoplays`

---

## Anhang: Minimalbeispiel (HTML + manifest snippet)
`index.html`
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Cryptober — Gallery</title>
  <link rel="stylesheet" href="/public/assets/css/main.css">
</head>
<body>
  <main id="main">
    <section class="gallery" aria-label="Gallery">
      <figure class="gallery__item" data-id="hero_first_spark">
        <img src="/public/assets/images/call_hero_first-spark__v1.webp"
             alt="BTC-carved pumpkin glowing in neon-green mist"
             loading="lazy">
        <figcaption>The spark ignites! 🕯️</figcaption>
      </figure>
    </section>
    <script type="module" src="/public/assets/js/gallery.js"></script>
  </main>
</body>
</html>
```

---

## Letzte Hinweise an Agenten
Halte dich strikt an das Prinzip: do not break existing code. Ergänze, erweitere, versioniere. Kommentiere jede substanzielle Änderung mit /* CHANGED_BY_AGENT: reason + date + user-request-id(if any) */ am Beginn der Datei. Produziere in PRs klare Release-Notes + QA Checkliste.

*Ende AGENTS.md — Dieses Dokument ist die Betriebsanweisung für Codex als professionellen Entwickler & Designer.*
