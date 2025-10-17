
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

*Ende agents.md — Dieses Dokument ist die Betriebsanweisung für Codex als profess

