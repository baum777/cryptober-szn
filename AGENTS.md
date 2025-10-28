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

## Workflow State — 2025-10-28

### Task: Roadmap/QuestMap UI Foundation Bootstrap

**Context:**
Established modular UI foundation for Sparkfined roadmap/questmap features. Created architectural separation between Timeline (minimal scanning) and QuestMap (detailed reading) as permanent design contracts. Components are available but opt-in, running alongside existing implementations for safety.

**Implementation:**
- **5 Core Components Created:**
  - `StatusGlyph` — Visual status indicator with 4 states, pulse animation, reduced-motion support
  - `RoadmapStepCard` — Minimal timeline card (H3 + StatusGlyph only)
  - `QuestCard` — Detailed questmap card (H3 + body + meta)
  - `TimelineSection` — Orchestrator for alternating grid layout with neon spine
  - `QuestMapSection` — Orchestrator for centered single-column detailed view

- **Test Infrastructure:**
  - Vitest + jsdom environment configured
  - 6 test files with 50+ test cases
  - Smoke, props, accessibility, and motion tests for all components
  - Mock utilities for `prefers-reduced-motion` testing

- **Documentation:**
  - `/docs/ui-spec.md` — Complete component specification (45+ sections)
  - Component API contracts, props, and examples
  - Design tokens, breakpoints, and motion policies
  - Integration guide and maintenance procedures

- **Code Quality:**
  - ESLint configuration for ES6 modules
  - TypeScript config for JSDoc type checking (no compilation)
  - npm scripts for test, lint, typecheck workflows

**Architectural Contracts (IMMUTABLE):**
1. **Timeline Section:** Minimal cards (H3 + StatusGlyph) for fast visual scanning
2. **QuestMap Section:** Detailed cards (H3 + body + meta) for deep reading
3. **Separation Principle:** NEVER merge Timeline and QuestMap — they serve different user needs
4. **Status States:** `now | next | done | later` (normalized from existing data schema)
5. **Motion Policy:** Pulse animation only for "now" status, disabled when `prefers-reduced-motion: reduce`
6. **Accessibility:** ARIA regions, focus-visible rings, screen reader announcements, semantic HTML

**Tech Stack Clarification:**
- Vanilla JavaScript ES6 modules (NOT React/TypeScript)
- Plain CSS with custom properties (NOT Tailwind/SCSS)
- No build step — direct HTML/CSS/JS serving
- Progressive enhancement — JSON data + DOM fallback

**Integration Status:**
Components are **opt-in** and run alongside existing `questmap.js` implementation. Example integration code available in `boot-home.js` (lines 43-93). Future PRs can migrate to new components incrementally.

**Branch:** `claude/session-011CUZFtvCvNrwbdd1TVZ3Pk`

**Next Steps:**
1. Install dependencies: `npm install`
2. Run validation: `npm run test && npm run lint && npm run typecheck`
3. Manual browser testing (keyboard nav, reduced motion, screen readers)
4. When ready to adopt: uncomment integration code in `boot-home.js`

---

*Ende agents.md — Dieses Dokument ist die Betriebsanweisung für Codex als professionellen Entwickler & Designer.*
