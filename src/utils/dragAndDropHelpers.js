// dragAndDropHelpers.js - helpers for drag-and-drop logic

export function handleDragStart(setDraggedIdx, idx) {
  setDraggedIdx(idx);
}

export function handleDragOver(e) {
  e.preventDefault();
}

export function handleDrop(instruments, draggedIdx, idx) {
  if (draggedIdx === null || draggedIdx === idx) return instruments;
  const updated = [...instruments];
  const [removed] = updated.splice(draggedIdx, 1);
  updated.splice(idx, 0, removed);
  return updated;
}

export function handlePaletteDragStart(setPaletteDrag, name) {
  setPaletteDrag(name);
}

export function handlePaletteDragEnd(setPaletteDrag) {
  setPaletteDrag(null);
}

export function handleEffectDragStart(setEffectDrag, name) {
  setEffectDrag(name);
}

export function handleEffectDragEnd(setEffectDrag) {
  setEffectDrag(null);
}
