import { pushToCloud } from './sync';

export type Tier = 'S' | 'A' | 'B' | 'C';

const STORAGE_KEY = 'arena_block_tiers';

let cache: Record<string, Tier> | null = null;

function load(): Record<string, Tier> {
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
  pushToCloud();
}

export function getTier(blockId: number): Tier | null {
  return load()[String(blockId)] || null;
}

export function setTier(blockId: number, tier: Tier | null) {
  const data = load();
  if (tier === null) {
    delete data[String(blockId)];
  } else {
    data[String(blockId)] = tier;
  }
  save();
}

export function getAllTiers(): Record<string, Tier> {
  return { ...load() };
}

export function getTierCount(): Record<Tier | 'unrated', number> {
  const data = load();
  const counts: Record<Tier | 'unrated', number> = { S: 0, A: 0, B: 0, C: 0, unrated: 0 };
  for (const tier of Object.values(data)) {
    counts[tier]++;
  }
  return counts;
}

export const TIER_COLORS: Record<Tier, string> = {
  S: '#e74c3c',
  A: '#e67e22',
  B: '#3498db',
  C: '#95a5a6',
};

export const TIERS: Tier[] = ['S', 'A', 'B', 'C'];
