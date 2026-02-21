# Signaleditor Feature Inventory

Exhaustive list of behaviors in the original `editor.html`, with port status.

Legend: ✅ = ported, ❌ = missing, ⚠️ = partial

## Layout & Chrome

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Sticky toolbar with fade-out gradient below | ✅ | |
| 2 | Toolbar: title "Signaleditor" | ✅ | |
| 3 | Toolbar: Undo/Redo buttons with disabled state | ✅ | |
| 4 | Toolbar: "Neue Signaldatei" button | ✅ | |
| 5 | Toolbar: "Signaldatei laden" (file picker, .yaml/.yml/.html) | ✅ | |
| 6 | Toolbar: "Signaldatei exportieren" (download .yaml) | ✅ | In YamlPanel instead of toolbar (by design) |
| 7 | Toolbar: "Meldungen exportieren" (download .html) | ✅ | |
| 8 | Toolbar: spacer pushes toggle buttons right | ✅ | |
| 9 | Toolbar: "Kilometer" toggle (red/green) | ✅ | |
| 10 | Toolbar: "Signaldatei" toggle (shows YAML panel) | ✅ | |
| 11 | Toolbar: "Meldungen" toggle (shows meldungen panel) | ✅ | |
| 12 | Meta section: 4 fields (ID, Name, Linie, Videos) | ✅ | |
| 13 | Meta section: header "Strecke" | ✅ | |
| 14 | Signals container: header "Signale" | ✅ | |
| 15 | Meldungen panel: header "Meldungen" | ✅ | |
| 16 | Meldungen panel aligned vertically with signals panel | ✅ | |

## Row Types

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 17 | Signal row: signal_1, optional signal_1b, signal_2, optional signal_2b | ✅ | |
| 18 | Note row: yellow background, single text input | ✅ | |
| 19 | Knoten row: uppercase code input + resolved name preview, teal | ✅ | |
| 20 | Abzweigung row: arrow + strecke + von/nach + richtung + arrow, purple | ✅ | |
| 21 | Quelle row: datei + file picker + info bar + expand, blue, double height | ⚠️ | Missing double height CSS |
| 22 | Row index cell | ✅ | |
| 23 | Km cell: hidden by default, shown on toggle | ✅ | |
| 24 | Row actions: clear (←) and delete (×) | ✅ | |

## Signal Cell Behavior

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 25 | Arrow Up/Down cycles through signal enum | ✅ | |
| 26 | Enum order context-dependent (Vorsignal/Hauptsignal priority) | ✅ | |
| 27 | signal_2/signal_2b always use VORSIGNAL_ENUM | ✅ | |
| 28 | Type-ahead with 1s timeout | ✅ | |
| 29 | Backspace removes last type-ahead character | ✅ | |
| 30 | Escape clears signal value | ✅ | |
| 31 | Prev/next signal previews on focus | ✅ | |
| 32 | Previews hidden when field empty | ✅ | |
| 33 | Name sub-field for signals requiring name | ✅ | |
| 34 | Bahnhof sub-field for Einfahr-Vorsignal | ✅ | |
| 35 | Bahnhof field yellow background | ✅ | |
| 36 | has-bahnhof: 50/50 split, no previews | ✅ | |
| 37 | ± alt toggle on hover (not on Wiederholungssignal) | ✅ | |
| 38 | Alt toggle adds/removes signal_Xb | ✅ | |
| 39 | Wiederholungssignal: signal_2 disabled, alts removed | ✅ | |
| 40 | Bahnhof auto-prefill: focus empty bahnhof copies name value | ✅ | |
| 41 | Bahnhof sync across cells in same row | ✅ | Via shared binding |
| 42 | Signal input readonly | ✅ | |
| 43 | Signal input deselects text on focus | ❌ | |
| 44 | Block chain: signal_1 away from Blocksignal clears signal_2 Block-Vorsignal | ✅ | |

## Km Cell Behavior

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 45 | Arrow Up/Down increments/decrements by 0.1 | ✅ | |
| 46 | Arrow keys use placeholder if input empty | ✅ | |
| 47 | Escape clears km value | ✅ | |
| 48 | Prev/next km previews on focus | ✅ | |
| 49 | Placeholder from previous row | ✅ | |

## Keyboard Navigation

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 50 | Tab last field of last row: new row with autofill | ✅ | |
| 51 | Tab last field of non-last row: next row, autofill if empty | ✅ | |
| 52 | Shift+Tab first field: last field of previous row | ✅ | |
| 53 | Tab across all row types | ✅ | |
| 54 | All interactive elements focusable | ✅ | |
| 55 | Disabled cells excluded | ✅ | |

## Autofill / Prediction

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 56 | Autofill on add signal | ✅ | |
| 57 | Walk back past Wiederholungssignal/note rows | ✅ | |
| 58 | Vorsignal→Hauptsignal mapping (7 pairs) | ✅ | |
| 59 | Alt prediction from source alts | ✅ | |
| 60 | Block chain prediction (signal_2 = Block-Vorsignal) | ✅ | |
| 61 | Bahnhof from name | ✅ | |
| 62 | Km auto-increment (+0.1) | ✅ | |
| 63 | Autofill on tab into empty row | ✅ | |

## Add / Insert / Delete

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 64 | Add bar: 5 buttons | ✅ | |
| 65 | Insert zones between rows | ✅ | |
| 66 | Insert zone before first row | ✅ | |
| 67 | Insert signal: autofills km | ✅ | |
| 68 | Insert note/abzweigung/quelle: autofills km | ❌ | Non-signal inserts don't autofill km |
| 69 | Insert knoten: no km autofill | ✅ | |
| 70 | Delete row | ✅ | |
| 71 | Clear row: resets to empty signal regardless of type | ✅ | |
| 72 | Clear focuses first field | ✅ | |
| 73 | New row focuses first field | ✅ | |
| 74 | Scroll to anchor after add | ✅ | |

## Undo / Redo

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 75 | JSON snapshot undo (MAX_UNDO = 50) | ✅ | |
| 76 | State saved on focus (not per keystroke) | ⚠️ | Saved on every change, not on focus |
| 77 | Focus position saved/restored with undo/redo | ❌ | |
| 78 | Meta field focus saved/restored | ❌ | |
| 79 | Redo stack cleared on new edit | ✅ | |
| 80 | Duplicate state detection | ✅ | |
| 81 | Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z | ✅ | |
| 82 | Undo/redo button flash animation | ❌ | |

## YAML

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 83 | Live YAML preview panel | ✅ | |
| 84 | Copy button with "Kopiert!" feedback | ✅ | |
| 85 | YAML download (filename from strecke.id) | ✅ | In YamlPanel |
| 86 | YAML format matches original | ✅ | |
| 87 | YAML parsing: all row types | ✅ | |
| 88 | HTML import: embedded YAML extraction | ✅ | |
| 89 | Auto-enable km toggle on file load if data has km | ✅ | |

## Meldungen

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 90 | Signal type detection | ✅ | |
| 91 | Bahnhof state machine (green/orange alternation) | ✅ | |
| 92 | Color rules per signal type | ✅ | |
| 93 | Meldung row height matches signal row | ✅ | |
| 94 | Non-signal rows as grey placeholders | ✅ | |
| 95 | Quelle meldung row double-height | ❌ | |
| 96 | Empty signal row as empty grey box | ✅ | |
| 97 | Error rows red | ✅ | |
| 98 | Multi-segment gradient + averaged border | ✅ | |
| 99 | Alt segments as additional line | ✅ | |
| 100 | Export HTML table | ✅ | |
| 101 | Export resolves quelle rows | ✅ | |
| 102 | Export deduplicates shared knoten | ✅ | |
| 103 | Export embeds YAML | ✅ | |

## Quelle System

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 104 | Datei input | ✅ | |
| 105 | File picker loads into cache | ✅ | |
| 106 | Fetch from strecken/ directory, cache | ✅ | |
| 107 | Info bar: counts + stitch info | ✅ | |
| 108 | Expand button shows resolved signals | ✅ | |
| 109 | Von/bis slicing by knoten | ✅ | |
| 110 | Auto-stitch adjacent quellen | ✅ | |
| 111 | File picker handles HTML | ✅ | |

## Abzweigung Behavior

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 112 | Arrow button toggles seite on click | ✅ | |
| 113 | Arrow keys (Left/Right) toggle seite | ✅ | |
| 114 | Von/nach: Arrow Up/Down cycles, type-ahead | ✅ | |
| 115 | Von/nach Escape clears | ✅ | |
| 116 | Strecke/richtung text inputs | ✅ | |
| 117 | Arrow glyph depends on seite AND von_nach | ✅ | |

## Highlight System

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 118 | `.hl` hover overlay | ✅ | |
| 119 | `.hl-wrap` focus-within overlay | ✅ | |
| 120 | Focus-within separator borders on previews | ❌ | |
| 121 | `.hl-primary` variant | ✅ | |
| 122 | `.hl-flash` variant | ❌ | |
| 123 | Click wrapper focuses input | ⚠️ | CSS-based, no explicit JS handler |

## File Operations

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 124 | New file starts with empty signal list | ✅ | Intentionally empty (differs from original) |
| 125 | Load file: .yaml, .yml, .html | ✅ | |
| 126 | Dirty flag: beforeunload warning | ✅ | |
| 127 | Export clears dirty flag | ✅ | |

## Miscellaneous

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 128 | newFile() starts with empty signal list | ✅ | Same as #124 |
| 129 | Meldungen spacer syncs on resize | ✅ | N/A — layout restructured |
| 130 | Insert zone single-letter labels (S, N, A, K, Q) | ❌ | Uses "+ Signal" etc. (cosmetic) |

---

## Summary

- **Total features**: 130
- **Ported (✅)**: 117
- **Partial (⚠️)**: 4
- **Missing (❌)**: 9

### Remaining missing features:

1. **#68** Insert note/abzweigung/quelle: autofill km from previous row
2. **#77-78** Undo/redo focus position save/restore
3. **#21, #95** Quelle row double height

### Low-priority / cosmetic:

- #43 Signal input deselect on focus
- #76 Save state on focus vs on change
- #82 Undo/redo flash animation
- #120 Preview separator borders
- #123 Click wrapper explicit JS handler (CSS-based currently)
- #130 Insert zone button labels
