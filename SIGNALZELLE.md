# Signalzelle behavior spec

## Cards

A Signalzelle renders up to 3 cards as siblings inside the parent `.signal-group-*` flex container:

| Card | Class | Condition | Content |
|------|-------|-----------|---------
| **Signal** | `.signal-cell.row-cell.hl-field` | Always | Search input + dropdown + alt-toggle |
| **Name** | `.name-cell.row-cell.hl-field` | `needsName && !signalFocused` | Text input or Stationsfeld |
| **Bahnhof** | `.bahnhof-cell.row-cell.hl-field` | `needsBahnhof && bahnhofRevealed && !signalFocused` | Text input |

## Focus highlight

Each card is an `.hl-field`. Focus outline (`2px solid var(--color-focus)`) appears on `:focus-within`, matching the pattern used by Notizzeile and all other row types. No special handling — the base `.hl-field` rule in `components.css` handles it.

## Signal input

The signal input is a visible, editable text field. Text is selected on focus so typing replaces the current value.

### Input states

| State | Input shows | Dropdown |
|-------|-------------|----------|
| **Idle, empty** | Empty, placeholder visible | Closed |
| **Idle, has value** | Full signal name (e.g. "Einfahrsignal") | Closed |
| **Focused, has value** | Full signal name (selected) | Closed |
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
| **Tab** | Sets `signalFocused = false`, lets event bubble to Signalpanel | Confirms highlighted match, closes dropdown, sets `signalFocused = false`, lets event bubble |
| **Escape** | Clears signal value, resets `bahnhofRevealed` | Closes dropdown, keeps current value, stays focused |

### Tab navigation contract

Signalzelle never calls `preventDefault` or `stopPropagation` on Tab. It only:
1. Commits the dropdown match (if open)
2. Closes the dropdown
3. Sets `signalFocused = false` (so name/bahnhof render)

Signalpanel's delegated Tab handler owns all focus movement. It calls `e.preventDefault()` synchronously, then `await tick()` to let Svelte render newly-visible fields before querying `getFocusableFields`.

### Matching

- Prefix-anchored fuzzy match: first character must match at position 0, remaining characters match in order.
- Results sorted: prefix matches first, then fuzzy-only matches.
- Dropdown opens only when the user types and there are matches. It does not open on focus.

### Arrow cycling (no dropdown)

When the input is focused but the dropdown is closed (no active search query), Arrow Up/Down cycle through the full enum list sequentially. This allows fast browsing without typing. The input shows the selected signal name immediately. No dropdown appears.

## Field visibility lifecycle

### State: `signalFocused`

Explicit `$state` boolean. Set to `true` on signal input focus, set to `false` on blur and in the Tab keydown handler (before the event bubbles).

### State: `bahnhofRevealed`

Latching flag. Once set to true, stays true until the signal value is cleared. Prevents layout shift during arrow-key cycling where `needsBahnhof` flickers.

### Rules

1. **Signal cell receives focus** → `signalFocused = true`. Name and bahnhof cards are hidden. The signal cell expands to fill the available space (only `flex: 1` child). Text is selected.

2. **User types / navigates dropdown** → `signalFocused` remains true. Name and bahnhof stay hidden. No layout shift during selection.

3. **Tab pressed** → `signalFocused = false` (synchronously in keydown). Event bubbles to Signalpanel, which awaits `tick()`, then queries fields. Name/bahnhof are now in the DOM if the signal type requires them.

4. **Signal cell loses focus** (click elsewhere) → `signalFocused = false` via blur handler. Name/bahnhof appear.

5. **Escape pressed, dropdown open** → dropdown closes, signal cell stays focused. `signalFocused` remains true. No visibility change.

6. **Escape pressed, dropdown closed** → signal value is cleared. `bahnhofRevealed = false`. Name and bahnhof disappear (`needsName`/`needsBahnhof` become false with empty base).

7. **Name cell receives focus** → if `needsBahnhof`, set `bahnhofRevealed = true`. Bahnhof card appears (if not already visible).

8. **Signal value changed to type that doesn't need name/bahnhof** → cards disappear naturally (`needsName`/`needsBahnhof` become false).

## Signal cell sizing

- **When `signalFocused`**: signal cell is the only card → `flex: 1`, fills the group. Full signal name visible.
- **When not focused, alone** (no name/bahnhof): `flex: 1`, fills the group. Full signal name visible.
- **When not focused, with siblings**: `flex: 1` shared with name (`flex: 1`) and optionally bahnhof (`flex: 1`).
