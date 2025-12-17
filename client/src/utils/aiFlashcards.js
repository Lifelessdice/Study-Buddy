export function normalizeAiFlashcards(payload) {
  const list = Array.isArray(payload) ? payload : [];
  return list.map((fc) => ({
    ...fc,
    flipped: false
  }));
}

export function toggleFlashcard(list, index) {
  if (!Array.isArray(list) || !list[index]) return;
  list[index].flipped = !list[index].flipped;
}
