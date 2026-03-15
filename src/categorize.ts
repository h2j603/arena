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

const CACHE_KEY = 'arena_categories_v5';

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

  // Collect channel names for context
  const channelNames = [...new Set(blocks.map(b => b.channelTitle))];

  const blockList = blocks.map((b) => {
    const title = b.title || 'Untitled';
    const desc = b.description ? ` — ${b.description.slice(0, 60)}` : '';
    return `${b.id}: [${b.type}] "${title}" (ch: ${b.channelTitle})${desc}`;
  }).join('\n');

  const prompt = `You are curating a graphic designer's personal Are.na archive into a browsable collection.

Their channels: ${channelNames.join(', ')}

References:
${blockList}

Your task:
1. Study the references and channels above carefully
2. Create 6–8 categories that meaningfully group this specific collection
3. Assign every reference to exactly 1 category

Category naming rules:
- Use short, evocative labels (1–3 words max)
- Think like a creative director organizing a mood wall, not a librarian
- Be specific to THIS collection — no generic labels like "Other" or "Miscellaneous"
- Categories should feel like exhibition room titles or chapter names
- Mix of concrete and poetic is good (e.g. "Black Letters", "Wet Ink", "Grid Tension")

Return ONLY valid JSON:
{"categories":["Cat A","Cat B",...],"assignments":{"blockId":"Category",...}}`;

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

  // Handle both formats: assignments as string (single cat) or array
  const rawAssignments = parsed.assignments || {};
  const categories: string[] = parsed.categories || [];
  const assignments: Record<string, string[]> = {};

  for (const [id, cat] of Object.entries(rawAssignments)) {
    if (Array.isArray(cat)) {
      assignments[id] = cat as string[];
    } else if (typeof cat === 'string') {
      assignments[id] = [cat];
    }
  }

  // Only include categories that have at least one assignment
  const usedCategories = categories.filter(cat =>
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
