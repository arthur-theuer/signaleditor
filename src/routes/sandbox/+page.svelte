<script lang="ts">
  let showKm = $state(true);
  let showMel = $state(false);
  let hasAlt1b = $state(false);
  let hasAlt2b = $state(false);
  let rowType: 'signal' | 'notiz' | 'knoten' | 'abzweigung' | 'import' = $state('signal');

  // Debug visibility toggles
  let show = $state({
    container: true,
    header: true,
    listInner: true,
    insertWrapper: true,
    signalRow: true,
    signalId: true,
    kmCell: true,
    contentArea: true,
    actions: true,
    meldungCol: true,
    plusleiste: true,
    gridOverlay: false,
  });

  type ShowKey = keyof typeof show;

  const labels: Record<ShowKey, string> = {
    container: '.signals-container',
    header: '.header-row',
    listInner: '.signal-list-inner',
    insertWrapper: '.insert-wrapper',
    signalRow: '.signal-row',
    signalId: '.signal-id',
    kmCell: '.km-cell',
    contentArea: 'content area',
    actions: '.signal-actions',
    meldungCol: '.meldung-col',
    plusleiste: 'Plusleiste',
    gridOverlay: 'grid columns',
  };

  const colors: Record<ShowKey, string> = {
    container: '#ef444440',
    header: '#f9731640',
    listInner: '#22c55e40',
    insertWrapper: '#06b6d440',
    signalRow: '#3b82f640',
    signalId: '#8b5cf640',
    kmCell: '#ec489940',
    contentArea: '#f4364040',
    actions: '#64748b40',
    meldungCol: '#14b8a640',
    plusleiste: '#a855f740',
    gridOverlay: '#ff00ff40',
  };
</script>

<div class="sandbox">
  <div class="controls">
    <h3>Toggles</h3>
    <label><input type="checkbox" bind:checked={showKm} /> km column</label>
    <label><input type="checkbox" bind:checked={showMel} /> meldungen column</label>
    <label><input type="checkbox" bind:checked={hasAlt1b} /> signal_1b (alt)</label>
    <label><input type="checkbox" bind:checked={hasAlt2b} /> signal_2b (alt)</label>
    <div class="row-type">
      <span>Row 2 type:</span>
      {#each ['signal', 'notiz', 'knoten', 'abzweigung', 'import'] as t}
        <label><input type="radio" bind:group={rowType} value={t} /> {t}</label>
      {/each}
    </div>

    <h3>Debug outlines</h3>
    {#each Object.keys(show) as key}
      <label>
        <input type="checkbox" bind:checked={show[key as ShowKey]} />
        <span class="swatch" style="background: {colors[key as ShowKey]}"></span>
        {labels[key as ShowKey]}
      </label>
    {/each}
  </div>

  <div class="preview">
    <!-- .signals-container -->
    <div class="signals-container" class:debug={show.container}>
      <!-- .header-row -->
      <div class="header-row" class:debug-header={show.header}>
        <div class="section-header signale-header">Signale</div>
        {#if showMel}
          <div class="section-header meldungen-header">Meldungen</div>
        {/if}
      </div>

      <!-- .signal-list-inner (grid container) -->
        <div class="signal-list-inner"
          class:has-km={showKm}
          class:has-mel={showMel}
          class:debug-listInner={show.listInner}
        >
          <!-- Grid column overlay -->
          {#if show.gridOverlay}
            <div class="grid-overlay">
              <div class="grid-col" style="grid-column: id;">id</div>
              {#if showKm}<div class="grid-col" style="grid-column: km;">km</div>{/if}
              <div class="grid-col" style="grid-column: s1;">s1</div>
              <div class="grid-col" style="grid-column: s1b;">s1b</div>
              <div class="grid-col" style="grid-column: s2;">s2</div>
              <div class="grid-col" style="grid-column: s2b;">s2b</div>
              <div class="grid-col" style="grid-column: act;">act</div>
              {#if showMel}<div class="grid-col" style="grid-column: mel;">mel</div>{/if}
            </div>
          {/if}

          <!-- Zwischenaktionen (row 0) -->
          <div class="insert-wrapper" class:debug-insertWrapper={show.insertWrapper}>
            <div class="insert-trigger-placeholder">Zwischenaktionen (0 height when closed)</div>
          </div>

          <!-- Signal row 0 -->
          <div class="signal-row" class:debug-signalRow={show.signalRow}>
            <div class="signal-id" class:debug-signalId={show.signalId}>0</div>
            {#if showKm}
              <div class="km-cell" class:debug-kmCell={show.kmCell}>km</div>
            {/if}
            <div class="row-cell" data-field="signal_1"
              class:span2={!hasAlt1b}
              class:debug-contentArea={show.contentArea}
            >sig_1</div>
            {#if hasAlt1b}
              <div class="row-cell" data-field="signal_1b" class:debug-contentArea={show.contentArea}>sig_1b</div>
            {/if}
            <div class="row-cell" data-field="signal_2"
              class:span2={!hasAlt2b}
              class:debug-contentArea={show.contentArea}
            >sig_2</div>
            {#if hasAlt2b}
              <div class="row-cell" data-field="signal_2b" class:debug-contentArea={show.contentArea}>sig_2b</div>
            {/if}
            <div class="signal-actions" class:debug-actions={show.actions}>
              <div class="action-btn">clr</div>
              <div class="action-btn">del</div>
            </div>
            {#if showMel}
              <div class="meldung-col" class:debug-meldungCol={show.meldungCol}>
                <div class="meldung-inner">mel</div>
              </div>
            {/if}
          </div>

          <!-- Zwischenaktionen (row 1) -->
          <div class="insert-wrapper" class:debug-insertWrapper={show.insertWrapper}>
            <div class="insert-trigger-placeholder"></div>
          </div>

          <!-- Row 1 (variable type) -->
          <div class="signal-row" class:debug-signalRow={show.signalRow}>
            <div class="signal-id" class:debug-signalId={show.signalId}>1</div>
            {#if showKm && rowType !== 'import'}
              <div class="km-cell" class:debug-kmCell={show.kmCell}>km</div>
            {/if}

            {#if rowType === 'signal'}
              <div class="row-cell" data-field="signal_1" class:span2={!hasAlt1b} class:debug-contentArea={show.contentArea}>sig_1</div>
              {#if hasAlt1b}
                <div class="row-cell" data-field="signal_1b" class:debug-contentArea={show.contentArea}>sig_1b</div>
              {/if}
              <div class="row-cell" data-field="signal_2" class:span2={!hasAlt2b} class:debug-contentArea={show.contentArea}>sig_2</div>
              {#if hasAlt2b}
                <div class="row-cell" data-field="signal_2b" class:debug-contentArea={show.contentArea}>sig_2b</div>
              {/if}
            {:else if rowType === 'notiz'}
              <div class="row-cell note-cell" class:debug-contentArea={show.contentArea}>Notiz</div>
            {:else if rowType === 'knoten'}
              <div class="knoten-group" class:debug-contentArea={show.contentArea}>
                <div class="row-cell knoten-code-cell">Code</div>
                <div class="row-cell knoten-search-cell">Search</div>
              </div>
            {:else if rowType === 'abzweigung'}
              <div class="abzw-group" class:debug-contentArea={show.contentArea}>
                <div class="row-cell abzw-cell abzw-arrow">&#x2190;</div>
                <div class="row-cell abzw-cell abzw-text">Strecke</div>
                <div class="row-cell abzw-cell abzw-btn">von</div>
                <div class="row-cell abzw-cell abzw-text">Richtung</div>
                <div class="row-cell abzw-cell abzw-arrow">&#x2192;</div>
              </div>
            {:else if rowType === 'import'}
              <div class="import-group" class:debug-contentArea={show.contentArea}>
                <div class="row-cell import-file-cell">file.csv</div>
                <div class="row-cell import-info-cell">3 signals</div>
              </div>
            {/if}

            <div class="signal-actions" class:debug-actions={show.actions}>
              <div class="action-btn">clr</div>
              <div class="action-btn">del</div>
            </div>
            {#if showMel}
              <div class="meldung-col" class:debug-meldungCol={show.meldungCol}>
                <div class="meldung-inner">mel</div>
              </div>
            {/if}
          </div>

          <!-- Zwischenaktionen (row 2) -->
          <div class="insert-wrapper" class:debug-insertWrapper={show.insertWrapper}>
            <div class="insert-trigger-placeholder"></div>
          </div>

          <!-- Row 2 (always signal) -->
          <div class="signal-row" class:debug-signalRow={show.signalRow}>
            <div class="signal-id" class:debug-signalId={show.signalId}>2</div>
            {#if showKm}
              <div class="km-cell" class:debug-kmCell={show.kmCell}>km</div>
            {/if}
            <div class="row-cell" data-field="signal_1" class:span2={!hasAlt1b} class:debug-contentArea={show.contentArea}>sig_1</div>
            {#if hasAlt1b}
              <div class="row-cell" data-field="signal_1b" class:debug-contentArea={show.contentArea}>sig_1b</div>
            {/if}
            <div class="row-cell" data-field="signal_2" class:span2={!hasAlt2b} class:debug-contentArea={show.contentArea}>sig_2</div>
            {#if hasAlt2b}
              <div class="row-cell" data-field="signal_2b" class:debug-contentArea={show.contentArea}>sig_2b</div>
            {/if}
            <div class="signal-actions" class:debug-actions={show.actions}>
              <div class="action-btn">clr</div>
              <div class="action-btn">del</div>
            </div>
            {#if showMel}
              <div class="meldung-col" class:debug-meldungCol={show.meldungCol}>
                <div class="meldung-inner">mel</div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Plusleiste (sibling of .signal-list-inner) -->
        <div class="plusleiste" class:debug-plusleiste={show.plusleiste}>
          <div class="plus-btn">+ Signal</div>
          <div class="plus-btn">+ Notiz</div>
          <div class="plus-btn">+ Abzw</div>
          <div class="plus-btn">+ Knoten</div>
          <div class="plus-btn">+ Import</div>
        </div>
      </div>
    </div>
  </div>

<style>
  /* ── Layout ── */
  .sandbox {
    display: flex;
    gap: 24px;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    color: #424242;
  }
  .controls {
    flex-shrink: 0;
    width: 220px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .controls h3 {
    margin: 12px 0 4px;
    font-size: 12px;
    text-transform: uppercase;
    color: #9e9e9e;
  }
  .controls label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 12px;
  }
  .row-type {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    margin-top: 4px;
  }
  .row-type span {
    width: 100%;
    font-size: 12px;
    color: #9e9e9e;
  }
  .swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid #0002;
  }
  .preview {
    flex: 1;
    min-width: 0;
  }

  /* ── Replica of actual CSS (using same tokens) ── */
  .signals-container {
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
  }
  .header-row {
    display: flex;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 48px;
    padding: 0 12px;
    font-weight: 600;
    font-size: 14px;
    background: #fafafa;
    border-bottom: 1px solid #e0e0e0;
    border-radius: 12px 12px 0 0;
  }
  .signale-header {
    flex: 1;
    min-width: 0;
  }
  .signale-header:not(:last-child) {
    border-radius: 12px 0 0 0;
  }
  .meldungen-header {
    flex-shrink: 0;
    width: 220px;
    border-radius: 0 12px 0 0;
    border-left: 1px solid #e0e0e0;
  }
  /* Grid container */
  .signal-list-inner {
    position: relative;
    display: grid;
    column-gap: 4px;
    grid-template-columns:
      [id] 40px
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto;
  }
  .signal-list-inner.has-km {
    grid-template-columns:
      [id] 40px
      [km] 60px
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto;
  }
  .signal-list-inner.has-mel {
    grid-template-columns:
      [id] 40px
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto
      [mel] 220px;
  }
  .signal-list-inner.has-km.has-mel {
    grid-template-columns:
      [id] 40px
      [km] 60px
      [s1] minmax(0, 1fr) [s1b] minmax(0, 1fr)
      [s2] minmax(0, 1fr) [s2b] minmax(0, 1fr)
      [act] auto
      [mel] 220px;
  }

  .insert-wrapper {
    grid-column: 1 / -1;
    position: relative;
  }
  .insert-trigger-placeholder {
    font-size: 10px;
    color: #9e9e9e;
    text-align: center;
    height: 0;
    overflow: hidden;
  }

  /* Subgrid rows */
  .signal-row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    padding: 4px 0;
    align-items: stretch;
    min-height: 48px;
    border-bottom: 1px solid #e0e0e0;
  }

  /* Cells */
  .signal-id {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: ui-monospace, monospace;
    color: #616161;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .km-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-family: ui-monospace, monospace;
  }
  .row-cell {
    display: flex;
    align-items: center;
    padding: 0 8px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    min-width: 0;
    height: 40px;
    font-family: ui-monospace, monospace;
  }

  /* Signal cell placement */
  [data-field='signal_1']       { grid-column: s1 / span 1; }
  [data-field='signal_1'].span2 { grid-column: s1 / span 2; }
  [data-field='signal_1b']      { grid-column: s1b / span 1; }
  [data-field='signal_2']       { grid-column: s2 / span 1; }
  [data-field='signal_2'].span2 { grid-column: s2 / span 2; }
  [data-field='signal_2b']      { grid-column: s2b / span 1; }

  /* Non-signal rows */
  .note-cell       { grid-column: s1 / act; background: #fff9c4; }
  .knoten-group    { grid-column: s1 / act; display: flex; gap: 4px; min-width: 0; }
  .abzw-group      { grid-column: s1 / act; display: flex; gap: 4px; min-width: 0; }
  .import-group    { grid-column: s1 / act; display: flex; gap: 4px; min-width: 0; }

  .knoten-code-cell   { flex: none; width: 80px; background: #e0f7fa; }
  .knoten-search-cell { flex: 1; background: #e0f7fa; }
  .abzw-cell          { background: #fce4ec; }
  .abzw-arrow         { flex: none; width: 40px; justify-content: center; }
  .abzw-text          { flex: 1; }
  .abzw-btn           { flex: 1; }
  .import-file-cell   { flex: 1; background: #e8eaf6; }
  .import-info-cell   { flex: 1; background: #e8eaf6; }

  /* Actions */
  .signal-actions {
    grid-column: act;
    display: flex;
    gap: 4px;
    height: 40px;
  }
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    font-size: 11px;
  }

  /* Meldung */
  .meldung-col {
    grid-column: mel;
    display: flex;
    padding: 2px 4px;
    border-left: 1px solid #e0e0e0;
  }
  .meldung-inner {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    font-size: 11px;
  }

  /* Plusleiste */
  .plusleiste {
    display: flex;
    gap: 4px;
    margin: 4px 4px;
  }
  .plus-btn {
    display: flex;
    align-items: center;
    padding: 0 12px;
    height: 32px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    font-size: 12px;
  }

  /* ── Grid overlay ── */
  .grid-overlay {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    pointer-events: none;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .grid-col {
    background: #ff00ff10;
    border-left: 1px dashed #ff00ff80;
    border-right: 1px dashed #ff00ff80;
    font-size: 9px;
    font-weight: 700;
    color: #ff00ff;
    text-align: center;
    padding: 2px 0;
    font-family: ui-monospace, monospace;
  }

  /* ── Debug outlines ── */
  .debug              { outline: 2px dashed #ef4444; outline-offset: -2px; }
  .debug-header       { outline: 2px dashed #f97316; outline-offset: -2px; }
  .debug-listInner    { outline: 2px dashed #22c55e; outline-offset: -2px; }
  .debug-insertWrapper { background: #06b6d420; outline: 1px dashed #06b6d4; min-height: 2px; }
  .debug-insertWrapper .insert-trigger-placeholder { height: auto; }
  .debug-signalRow    { outline: 2px dashed #3b82f6; outline-offset: -2px; }
  .debug-signalId     { background: #8b5cf640; }
  .debug-kmCell       { background: #ec489940; }
  .debug-contentArea  { background: #f4364020; outline: 1px dashed #f43640; }
  .debug-actions      { background: #64748b20; outline: 1px dashed #64748b; }
  .debug-meldungCol   { background: #14b8a620; outline: 1px dashed #14b8a6; }
  .debug-plusleiste   { background: #a855f720; outline: 1px dashed #a855f7; }
</style>
