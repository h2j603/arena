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

const CACHE_KEY = 'arena_categories';

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

  // Text-only metadata — no images, fast
  const blockList = blocks.map((b) => {
    const title = b.title || 'Untitled';
    const desc = b.description ? ` — ${b.description.slice(0, 60)}` : '';
    return `${b.id}: [${b.type}] "${title}" (ch: ${b.channelTitle})${desc}`;
  }).join('\n');

  const prompt = `You are a creative art curator organizing a personal Are.na archive into an exhibition.

References:
${blockList}

Create 8-12 evocative categories and assign every reference to 1-2 categories.

Category naming guidelines:
- Poetic, specific, editorial — NOT generic (not "Design", "Art", "Misc")
- Think exhibition section titles: "Systematic Color", "Found Typography", "Quiet Structures", "Digital Rituals"
- Based on themes you infer from titles, channels, and descriptions
- Every reference MUST be assigned

Return ONLY valid JSON:
{"categories":["Category One","Category Two",...],"assignments":{"blockId":["Category One"],...}}`;

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
  const result: CategoryResult = {
    categories: parsed.categories || [],
    assignments: parsed.assignments || {},
  };

  if (!result.categories.length) {
    throw new Error('No categories generated');
  }

  setCachedCategories(result);
  return result;
}
