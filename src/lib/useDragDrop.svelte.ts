/**
 * Encapsulates drag-and-drop state and handlers for reorderable lists.
 * Supports both mouse (native HTML DnD) and touch devices.
 */
export class DragDrop {
  dragIdx: number | null = $state(null);
  dropTargetIdx: number | null = $state(null);
  indicatorY: number | null = $state(null);
  dragHandle: number | null = $state(null);

  private touchScrollRAF: number | null = null;
  private listEl: () => HTMLElement | undefined;
  private onReorder: (fromIdx: number, toIdx: number) => void;

  constructor(listEl: () => HTMLElement | undefined, onReorder: (fromIdx: number, toIdx: number) => void) {
    this.listEl = listEl;
    this.onReorder = onReorder;

    $effect(() => {
      if (this.dragIdx === null) return;
      if (!('ontouchstart' in window)) return;
      const move = (e: TouchEvent) => this.handleTouchMove(e);
      const end = () => this.handleTouchEnd();
      const cancel = () => this.reset();
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', end);
      document.addEventListener('touchcancel', cancel);
      return () => {
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
        document.removeEventListener('touchcancel', cancel);
      };
    });
  }

  // --- Mouse (native HTML DnD) ---

  handleDragStart(e: DragEvent, idx: number) {
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', String(idx));
    requestAnimationFrame(() => {
      this.dragIdx = idx;
    });
  }

  handleDragOver(e: DragEvent, idx: number) {
    const el = this.listEl();
    if (this.dragIdx === null || this.dragIdx === idx || !el) {
      this.dropTargetIdx = null;
      this.indicatorY = null;
      return;
    }
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    const row = el.querySelector<HTMLElement>(`[data-row-index="${idx}"]`);
    if (!row) return;
    const rowRect = row.getBoundingClientRect();
    const listRect = el.getBoundingClientRect();
    const midY = rowRect.top + rowRect.height / 2;
    if (e.clientY < midY) {
      this.dropTargetIdx = idx;
      this.indicatorY = rowRect.top - listRect.top;
    } else {
      this.dropTargetIdx = idx + 1;
      this.indicatorY = rowRect.bottom - listRect.top;
    }
  }

  handleDragLeave(e: DragEvent, idx: number) {
    const el = this.listEl();
    if (!el) return;
    const row = el.querySelector<HTMLElement>(`[data-row-index="${idx}"]`);
    if (row && !row.contains(e.relatedTarget as Node)) {
      this.dropTargetIdx = null;
      this.indicatorY = null;
    }
  }

  handleDrop(e: DragEvent) {
    e.preventDefault();
    this.commitMove();
  }

  handleDragEnd() {
    this.reset();
  }

  // --- Touch ---

  handleTouchStart(e: TouchEvent, idx: number) {
    e.preventDefault();
    this.dragIdx = idx;
    this.dragHandle = idx;
  }

  private handleTouchMove(e: TouchEvent) {
    if (this.dragIdx === null) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.updateDropTarget(touch.clientY);

    const edgeZone = 48;
    const speed = 8;
    if (this.touchScrollRAF) cancelAnimationFrame(this.touchScrollRAF);

    const scrollStep = () => {
      if (this.dragIdx === null) return;
      if (touch.clientY < edgeZone) {
        window.scrollBy(0, -speed);
        this.updateDropTarget(touch.clientY);
        this.touchScrollRAF = requestAnimationFrame(scrollStep);
      } else if (touch.clientY > window.innerHeight - edgeZone) {
        window.scrollBy(0, speed);
        this.updateDropTarget(touch.clientY);
        this.touchScrollRAF = requestAnimationFrame(scrollStep);
      }
    };
    if (touch.clientY < edgeZone || touch.clientY > window.innerHeight - edgeZone) {
      this.touchScrollRAF = requestAnimationFrame(scrollStep);
    }
  }

  private handleTouchEnd() {
    this.commitMove();
  }

  // --- Shared ---

  private updateDropTarget(clientY: number) {
    const el = this.listEl();
    if (this.dragIdx === null || !el) return;
    const listRect = el.getBoundingClientRect();
    const rows = el.querySelectorAll<HTMLElement>('[data-row-index]');
    let bestIdx: number | null = null;
    let bestY: number | null = null;

    for (const row of rows) {
      const idx = parseInt(row.dataset.rowIndex!);
      if (idx === this.dragIdx) continue;
      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (clientY < midY) {
        bestIdx = idx;
        bestY = rect.top - listRect.top;
        break;
      }
      bestIdx = idx + 1;
      bestY = rect.bottom - listRect.top;
    }

    if (bestIdx !== null) {
      this.dropTargetIdx = bestIdx;
      this.indicatorY = bestY;
    }
  }

  private commitMove() {
    if (this.dragIdx !== null && this.dropTargetIdx !== null) {
      let targetIdx = this.dropTargetIdx;
      if (targetIdx > this.dragIdx) targetIdx--;
      if (targetIdx !== this.dragIdx) {
        this.onReorder(this.dragIdx, targetIdx);
      }
    }
    this.reset();
  }

  reset() {
    this.dragIdx = null;
    this.dropTargetIdx = null;
    this.indicatorY = null;
    this.dragHandle = null;
    if (this.touchScrollRAF) cancelAnimationFrame(this.touchScrollRAF);
    this.touchScrollRAF = null;
  }
}
