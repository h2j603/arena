import { pushToCloud } from './sync';

const STORAGE_KEY = 'arena_boards';

export interface Board {
  id: string;
  name: string;
  description?: string;
  blockIds: number[];
  createdAt: string;
}

let cache: Board[] | null = null;

function load(): Board[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function save() {
  if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  pushToCloud();
}

export function getBoards(): Board[] {
  return [...load()];
}

export function createBoard(name: string, blockIds: number[]): Board {
  const boards = load();
  const board: Board = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    blockIds,
    createdAt: new Date().toISOString(),
  };
  boards.unshift(board);
  cache = boards;
  save();
  return board;
}

export function deleteBoard(id: string) {
  cache = load().filter(b => b.id !== id);
  save();
}

export function addToBoard(boardId: string, blockIds: number[]) {
  const boards = load();
  const board = boards.find(b => b.id === boardId);
  if (board) {
    const existing = new Set(board.blockIds);
    for (const id of blockIds) {
      if (!existing.has(id)) board.blockIds.push(id);
    }
    cache = boards;
    save();
  }
}

export function removeFromBoard(boardId: string, blockId: number) {
  const boards = load();
  const board = boards.find(b => b.id === boardId);
  if (board) {
    board.blockIds = board.blockIds.filter(id => id !== blockId);
    cache = boards;
    save();
  }
}

export function updateBoardDescription(boardId: string, description: string) {
  const boards = load();
  const board = boards.find(b => b.id === boardId);
  if (board) {
    board.description = description;
    cache = boards;
    save();
  }
}

export function moveBlockInBoard(boardId: string, blockId: number, direction: 'up' | 'down') {
  const boards = load();
  const board = boards.find(b => b.id === boardId);
  if (!board) return;
  const idx = board.blockIds.indexOf(blockId);
  if (idx === -1) return;
  const newIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= board.blockIds.length) return;
  [board.blockIds[idx], board.blockIds[newIdx]] = [board.blockIds[newIdx], board.blockIds[idx]];
  cache = boards;
  save();
}
