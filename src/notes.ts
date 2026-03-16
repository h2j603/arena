const STORAGE_KEY = 'arena_block_notes';

let cache: Record<string, string> | null = null;

function load(): Record<string, string> {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache!;
}

function save() {
  if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function getNote(blockId: number): string {
  return load()[String(blockId)] || '';
}

export function setNote(blockId: number, text: string) {
  const notes = load();
  if (text.trim()) {
    notes[String(blockId)] = text;
  } else {
    delete notes[String(blockId)];
  }
  cache = notes;
  save();
}

export function hasNote(blockId: number): boolean {
  return !!load()[String(blockId)];
}
