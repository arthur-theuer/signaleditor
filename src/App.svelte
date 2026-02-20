<script lang="ts">
  import type { Editordaten } from './lib/types'

  let data: Editordaten = $state({
    strecke: { id: '', name: '', linie: '', streckenvideos: [] },
    signale: [],
  })
</script>

<main>
  <h1>Signal Editor</h1>
  <p>Phase 1 — scaffold complete. {data.signale.length} Einträge.</p>
</main>
