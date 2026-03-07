# Signalzelle behavior spec

## Cards

A Signalzelle renders up to 3 cards as siblings inside the parent `.signal-group-*` flex container:

| Card | Class | Condition | Content |
|------|-------|-----------|---------|
| **Signal** | `.signal-cell.row-cell.hl-field` | Always | Search input + dropdown + alt-toggle |
| **Name** | `.name-cell.row-cell.hl-field` | `needsName && !signalFocused` | Text input or Stationsfeld |
| **Bahnhof** | `.bahnhof-cell.row-cell.hl-field` | `needsBahnhof && bahnhofRevealed && !signalFocused` | Text input |

## Focus highlight

Each card is an `.hl-field`. Focus outline (`2px solid var(--color-focus)`) appears on `:focus-within`, matching the pattern used by Notizzeile and all other row types. No special handling — the base `.hl-field` rule in `components.css` handles it.

## Signal input

The signal input is a visible, editable text field (not readonly). It replaces the previous invisible-buffer type-ahead.

### Input states

| State | Input shows | Dropdown |
|-------|-------------|----------|
| **Idle, empty** | Empty, placeholder visible | Closed |
| **Idle, has value** | Full signal name (e.g. "Einfahrsignal") | Closed |
| **Focused, has value** | Full signal name | Closed (until user types) |
| **Typing** | User's search query | Open, filtered matches |
| **Navigating dropdown** | Highlighted match name | Open |

### Keyboard behavior

| Key | Dropdown closed | Dropdown open |
|-----|----------------|---------------|
| **Letter/hyphen** | Opens dropdown, filters by typed query | Filters by updated query |
| **Backspace** | Deletes last character from input. If input becomes empty, clears signal value | Deletes last character, updates filter |
| **Arrow Down** | Selects next enum value (wrapping). No dropdown. | Moves highlight down |
| **Arrow Up** | Selects previous enum value (wrapping). No dropdown. | Moves highlight up |
| **Enter** | No-op | Confirms highlighted match, closes dropdown |
| **Tab** | Normal tab to next field | Confirms highlighted match, closes dropdown, moves focus |
| **Escape** | Clears signal value, resets `bahnhofRevealed` | Closes dropdown, keeps current value, stays focused |

### Matching

- Prefix-anchored fuzzy match: first character must match at position 0, remaining characters match in order.
- Results sorted: prefix matches first, then fuzzy-only matches.
- Dropdown shows when there are matches and input is non-empty.

### Arrow cycling (no dropdown)

When the input is focused but the dropdown is closed (no active search query), Arrow Up/Down cycle through the full enum list sequentially. This allows fast browsing without typing. The input shows the selected signal name immediately. No dropdown appears.

## Field visibility lifecycle

### State: `signalFocused`

True while the signal-cell has focus (input focused, dropdown open). Derived from DOM focus, not from internal state.

### State: `bahnhofRevealed`

Latching flag. Once set to true, stays true until the signal value is cleared. Prevents layout shift during selection where `needsBahnhof` flickers as the user cycles through enum values.

### Rules

1. **Signal cell receives focus** → `signalFocused = true`. Name and bahnhof cards are hidden. The signal cell expands to fill the available space (only `flex: 1` child).

2. **User types / navigates dropdown** → `signalFocused` remains true. Name and bahnhof stay hidden. No layout shift during selection.

3. **Signal cell loses focus** (Tab, click elsewhere) → `signalFocused = false`. If `needsName` is true, the name card appears. If `needsBahnhof && bahnhofRevealed`, the bahnhof card appears. The signal cell shrinks as siblings take space.

4. **Escape pressed, dropdown open** → dropdown closes, signal cell stays focused. `signalFocused` remains true. No visibility change.

5. **Escape pressed, dropdown closed** → signal value is cleared. `bahnhofRevealed = false`. Name and bahnhof disappear (`needsName`/`needsBahnhof` become false with empty base).

6. **Name cell receives focus** → if `needsBahnhof`, set `bahnhofRevealed = true`. Bahnhof card appears (if not already visible).

7. **Signal value changed to type that doesn't need name/bahnhof** → cards disappear naturally (`needsName`/`needsBahnhof` become false).

## Signal cell sizing

- **When `signalFocused`**: signal cell is the only card → `flex: 1`, fills the group. Full signal name visible.
- **When not focused, alone** (no name/bahnhof): `flex: 1`, fills the group. Full signal name visible.
- **When not focused, with siblings**: `flex: 1` shared with name (`flex: 1`) and optionally bahnhof (`flex: 1`). Container query `@container (max-width: 170px)` switches to abbreviation when the cell gets narrow.

## Sizing decision

All cards share space equally (`flex: 1`). The existing container query `@container (max-width: 170px)` on `.signal-cell` switches to abbreviation when the cell gets narrow enough.

### Future consideration

A fixed-width signal cell (e.g. showing a short abbreviation like "EVS") when name/bahnhof are present would give more space to the text fields. This can be reintroduced later using container queries to drive the collapse, rather than conditional classes.
