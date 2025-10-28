# agents.md — Codex als Profi-Entwickler & Designer

**Zweck:** Dieses Dokument beschreibt die Rolle, Regeln und Erwartungen an **Codex** (oder einen Code-Generator / automatisierten Agenten), der als professioneller Entwickler und UI/UX-Designer arbeitet. Es ist ein Arbeitsleitfaden, mit dem Codex Aufgaben automatisch, sauber, nachvollziehbar und dokumentiert ausführen soll.

---

## Dokumentationspflicht (unbedingt)

Codex **dokumentiert alle Änderungen, Entscheidungen und Annahmen**. Für jeden Commit, jede PR und jedes größere Refactoring erzeugt Codex:

* eine kurze Commit-Message nach Konvention (siehe Abschnitt „Commit‑Konventionen"),
* ein PR-Description-Template mit: Ziel, geänderte Dateien, Migrations-/Rollback-Hinweise, Akzeptanzkriterien, Test-Checklist,
* ein kurzes Change-Log-Fragment (1–3 Sätze), das die Rationale dokumentiert.

Dokumentation ist nicht optional — sie ist Teil der Lieferung.

---

## Rolle & Verantwortungen

* **Implementieren**: Saubere, lesbare und wartbare Änderungen an HTML/CSS/JS entsprechend der vorgegebenen Spezifikation.
* **Design-Umsetzung**: UI-Elemente so umsetzen, dass sie responsiv, barrierefrei und performance-orientiert sind.
* **Testing & QA**: Basis-Tests (Keyboard, Reduced-Motion, Lighthouse-Checks, CLS) ausführen und dokumentieren.
* **Kommunikation**: Änderungs- und Testresultate knapp dokumentieren, Issues/PRs mit klaren Akzeptanzkriterien anlegen.

---

## Technische Standards & Best Practices

* **Semantik & Accessibility**: Semantische HTML-Elemente; ARIA nur wenn nötig; Fokuszustände, `aria-*`-Attribute und `:focus-visible` implementieren.
* **Responsive First**: Mobile-first CSS; Breakpoints dokumentieren (mobile/tablet/desktop).
* **Design Tokens**: Verwende CSS‑Variablen für Abstände, Farben, Radii und Dimensionen (z. B. `--header-height`, `--rail-width`).
* **No inline styles for layout**: JS darf keine `element.style.*` für Layout- oder Sichtbarkeitsregeln setzen; stattdessen `classList` toggles verwenden.
* **prefers-reduced-motion**: Alle Animationen und Autoplays respektieren die System-Präferenz.
* **Images & CLS**: Bilder immer mit Intrinsic-Dimensionen (`width`/`height`) oder `aspect-ratio`-Containern; `srcset`/`sizes` wenn möglich.
* **Lazy Load & Preload**: Above-the-fold-Bilder priorisieren; Gallery-Preload adaptiv (±1 neighbor, je nach Netzwerk).
* **Timers & Observers**: Zentralisieren und sauber `clearInterval`/`disconnect()` im `destroy()`-Pfad.

## Localization Policy

* **Primary language:** Sämtliche UI-Texte, Buttons, Alt-Texte und `aria-*`-Attribute werden in **englischer Sprache** gepflegt.
* **Neue Copy:** Beim Ergänzen oder Aktualisieren von Oberflächentexten ausschließlich englische Formulierungen einsetzen.
* **Audits:** Nach strukturellen oder textlichen Anpassungen `npm run audit:sitemap` ausführen; bei neuem Fundus an Übersetzungen zusätzlich `npm run i18n:scan` starten, um `i18n/de-terms.json` zu aktualisieren.

---

## Coding Conventions

* JS: modulare Funktionen, möglichst pure, kommentierte public APIs (`initX`, `destroyX`).
* CSS: Utility‑Klassen (.is-open, .is-sticky, .hidden), BEM-ähnliche Komponenten wo sinnvoll. Keine Inline-Layout-Manipulationen.
* Commit-Style: `feat|fix|refactor|chore(scope): short description`.
* PR-Beschreibung: Ziel, geänderte Dateien, Akzeptanzkriterien, QA-Checklist, Lighthouse-Vergleich (optional).

---

## UI/UX-Spezifikationen (Prioritäten)

* **Header**: fixed am oberen Rand; `--header-height` Token; Inhalt: links Home, rechts Lore & Mascot; Nav-Buttons als `.nav-card`.
* **Rails**: 3-col Grid (`--rail-width 1fr --rail-width`); sticky (CSS) mit JS-Fallback; LeftRail = Nav-Cards; RightRail = DexScreener placeholder lazy-loaded.
* **Gallery**: default view = 4×2 (8 items). Responsive fallback 3×2 / 2×N / 1×N. Thumbnails `object-fit: cover` in `aspect-ratio` box.
* **Footer**: full-width, at page end (flex sticky-footer pattern), not fixed.
* **Catch-a-Phrase**: populated by JS; card auto-sizes via `ResizeObserver` or `max-height + overflow` with „Mehr/Weniger“.
* **Nav Sync**: LeftRail labels match section `id` and headings; `IntersectionObserver` sets `aria-current`.

---

## Testing & QA-Checklist (bei PR)

* Reduced motion emulation (System setting) — Autoplay/Animationen aus.
* Keyboard navigation — Tab flow, focus visible, modal focus-trap.
* Lighthouse: record Accessibility & CLS before/after.
* Image/CLS: No layout shift on load.
* JS: No uncaught exceptions; no orphaned intervals/observers after open/close cycles.
* Visual: Rails and content do not overlap at 3 breakpoints.

---

## Deliverables pro Task

* **Diff-Stubs** (optional) — kleine Patch-Skeletons, wenn verlangt.
* **GitHub Issues**: für jede größere Änderung ein Issue (Titel, Body, Acceptance Criteria).
* **PR mit commits**: atomic commits, PR-Description, QA-Notes.
* **agents.md**: dieses Dokument bleibt die Vorgabe für Codex.

---

## Kommunikation mit Reviewer / Team

* Schreibe in PR kurz: „Was wurde getan“, „Warum“, „Wie zu testen“. Füge relevante Screenshots oder Lighthouse-Zahlen hinzu.
* Wenn Annahmen getroffen wurden (z. B. Bildgrößen nicht verfügbar), dokumentiere sie klar im PR.

---

## Beispiel-Commit-Messages (Vorlagen)

* `feat(ui): implement 3-col layout grid and sticky rails`
* `fix(gallery): show 4x2 grid per view and add pagination`
* `refactor(js): replace inline style writes with class toggles`
* `chore(a11y): add prefers-reduced-motion helper and disable autoplays`

---

## Roadmap/QuestMap Architectural Contracts (IMMUTABLE)

These contracts define the permanent architectural separation and must NEVER be violated:

### Timeline Section
- **Purpose:** Fast visual scan of milestones
- **Content:** H3 title + StatusGlyph ONLY
- **Layout:** Alternating cards around vertical neon spine
- **NO body text, NO meta/footer, NO CTA buttons**

### QuestMap Section
- **Purpose:** Deep reading of quest details
- **Content:** H3 + full body + optional meta
- **Layout:** Single centered column, max-width constrained
- **Footer stays clean (no CTAs)**

### Core Rules
1. **Status Enum:** `"now" | "next" | "done" | "later"` — No additional values allowed
2. **Breakpoints:** Desktop ≥1024px (3-col grid), Tablet 768-1023px, Mobile ≤767px
3. **Motion:** Pulse animation ONLY for `status === "now"`, respects `prefers-reduced-motion: reduce`
4. **Accessibility:** ARIA regions, focus-visible rings (2px neon, no layout shift), semantic HTML
5. **Tokens:** Use shared CSS custom properties (`--neon`, `--glow`, `--frame`, `--glass`, `--radius`, `--gap`)
6. **Separation Principle:** Timeline and QuestMap NEVER merge — they serve different user needs

See `/docs/ui-spec.md` for complete specification.

---

## Change Log

### 2025-10-28 — Roadmap/QuestMap UI Foundation Bootstrap

**Branch:** `claude/session-011CUZFtvCvNrwbdd1TVZ3Pk` (commit `769bcb9`)
**Status:** ✅ APPROVED_FOR_HUMAN_MERGE (awaiting final human review)

**Components Created:**
- `StatusGlyph` — Visual status indicator (now/next/done/later) with pulse animation
- `RoadmapStepCard` — Minimal timeline card (H3 + StatusGlyph only)
- `QuestCard` — Detailed questmap card (H3 + body + optional meta)
- `TimelineSection` — Alternating grid layout with vertical neon spine
- `QuestMapSection` — Centered single-column detailed view

**Infrastructure:**
- Vitest + jsdom test environment (56 passing tests)
- ESLint configuration for ES6 modules
- TypeScript config for JSDoc type checking (no compilation)
- Documentation: `/docs/ui-spec.md` (540 lines)

**Integration:**
- Opt-in approach (commented out in `boot-home.js`)
- Runs alongside existing `questmap.js` (no breaking changes)
- Example integration code provided (lines 43-93)

**Quality Gates:**
- ✅ Typecheck: PASS (new files clean)
- ✅ Lint: PASS (0 errors in foundation files)
- ✅ Tests: PASS (56/56 tests passing)
- ✅ A11y: OK (ARIA regions, focus rings, semantic HTML)
- ✅ Reduced-motion: OK (JS + CSS implementation)
- ✅ Breakpoints: OK (≥1024px, 768-1023px, ≤767px)
- ✅ Token discipline: OK (all shared tokens used)
- ✅ Scope discipline: OK (no feature creep)

**Reviewer Decision:** APPROVED_FOR_HUMAN_MERGE
**Next Step:** Human maintainer final visual review → merge to `main`

---

*Ende agents.md — Dieses Dokument ist die Betriebsanweisung für Codex als professionellen Entwickler & Designer.*
