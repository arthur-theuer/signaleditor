# Refactor Plan

Remaining refactor opportunities. Items 1 (highlight system), 2 (Stationssuche merge),
4 (input attributes), 5 (CSS architecture / Tailwind removal), 6 (Signalzelle extraction),
8 (overflow management), and 10 (constants / signal registry) from the original plan are done.

---

## Completed

| # | Area | Status |
|---|------|--------|
| 1 | Focus highlight → `.btn` + `.hl-field` | ✅ Done |
| 2 | Stationssuche/Stationsname → `Stationsfeld` | ✅ Done |
| 4 | Input attributes standardized | ✅ Done |
| 5 | CSS architecture: Tailwind removed, scoped CSS only | ✅ Done |
| 6 | Signalzelle: TypeAhead + Signalname extracted | ✅ Done |
| 8 | Overflow management | ✅ Done |
| 10 | Signal registry in `signals.config.ts` | ✅ Done |

---

## Open

### 3. Dropdown / Popover Pattern

Four components implement dropdown/popover behavior independently:
- `Signalzelle` — signal type dropdown
- `Stationsfeld` — station search dropdown
- `Zeilenaktionen` — ellipsis action menu
- `Zwischenaktionen` — expandable insert zone

Each reimplements open/close state, click-outside handling, and keyboard navigation.
Click-outside uses different patterns: `document.addEventListener` (Zeilenaktionen, Zwischenaktionen),
`handleBlur` with `setTimeout` (Stationsfeld), cooldown timer (Signalzelle).

**Proposal**: Extract a `useClickOutside` action or utility. Standardize the open/close lifecycle.

### 7. Row Component Structure

Notizzeile (~35 lines) and Knotenzeile (~30 lines) are structurally similar: a `.row-cell`
with a single interactive child, differing only in background color and child component.

Abzweigungszeile's sub-field separator pattern (`.abzweigung-field` with border separators)
is similar to Signalzelle's multi-section layout but implemented differently.

**Proposal**: Consider a `CellWrapper` component for the `.row-cell` container with background
color as a prop. Harmonize the sub-field separator pattern.

### 9. Responsive Breakpoint Strategy

Container queries and media queries coexist without documented guidelines.

**Proposal**: Document the rule: container queries for component-internal responsive behavior,
media queries for app-level layout changes. Already partially documented in COMPONENTS.md.
