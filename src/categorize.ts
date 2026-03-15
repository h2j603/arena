interface BlockMeta {
  id: number;
  title: string | null;
  type: string;
  description: string | null;
  channelTitle: string;
}

export interface CategoryResult {
  categories: string[];
  assignments: Record<string, string[]>;
}

// Fixed categories — always the same, UI can render them immediately
export const FIXED_CATEGORIES = [
  'Visual Systems',
  'Typography & Language',
  'Space & Architecture',
  'Color & Material',
  'Digital & Interface',
  'Nature & Organic',
  'Culture & Society',
  'Photography & Film',
  'Objects & Artifacts',
  'Abstract & Pattern',
] as const;

const CACHE_KEY = 'arena_categories_v2';

export function getCachedCategories(): CategoryResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function setCachedCategories(result: CategoryResult) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch { /* ignore */ }
}

export function clearCategoryCache() {
  localStorage.removeItem(CACHE_KEY);
}

export async function categorizeBlocks(
  blocks: BlockMeta[],
  useCache = true
): Promise<CategoryResult> {
  if (useCache) {
    const cached = getCachedCategories();
    if (cached) return cached;
  }

  const blockList = blocks.map((b) => {
    const title = b.title || 'Untitled';
    const desc = b.description ? ` — ${b.description.slice(0, 60)}` : '';
    return `${b.id}: [${b.type}] "${title}" (ch: ${b.channelTitle})${desc}`;
  }).join('\n');

  const categoryList = FIXED_CATEGORIES.join(', ');

  const prompt = `You are organizing a personal Are.na archive. Assign every reference below to 1-2 of these EXACT categories:

Categories: ${categoryList}

References:
${blockList}

Rules:
- Use ONLY the categories listed above (exact spelling)
- Every reference MUST be assigned to 1 or 2 categories
- Choose the most relevant categories based on the reference's title, type, channel, and description

Return ONLY valid JSON:
{"assignments":{"blockId":["Category One","Category Two"],...}}`;

  const response = await fetch('/api/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${body.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response format');

  const parsed = JSON.parse(jsonMatch[0]);
  const assignments: Record<string, string[]> = parsed.assignments || {};

  // Filter to only valid fixed categories
  const validCats = new Set<string>(FIXED_CATEGORIES);
  for (const [id, cats] of Object.entries(assignments)) {
    assignments[id] = (cats as string[]).filter(c => validCats.has(c));
  }

  // Only include categories that have at least one assignment
  const usedCategories = FIXED_CATEGORIES.filter(cat =>
    Object.values(assignments).some(cats => cats.includes(cat))
  );

  const result: CategoryResult = {
    categories: usedCategories,
    assignments,
  };

  if (!result.categories.length) {
    throw new Error('No categories assigned');
  }

  setCachedCategories(result);
  return result;
}
