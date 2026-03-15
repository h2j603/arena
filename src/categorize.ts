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
const KEY_STORAGE = 'anthropic_api_key';
const API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey(): string {
  return localStorage.getItem(KEY_STORAGE) || '';
}

function promptApiKey(): string {
  const key = window.prompt('Enter your Anthropic API key (sk-ant-...)');
  if (key?.trim()) {
    localStorage.setItem(KEY_STORAGE, key.trim());
    return key.trim();
  }
  return '';
}

function getCachedCategories(): CategoryResult | null {
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

  let apiKey = getApiKey();
  if (!apiKey) {
    apiKey = promptApiKey();
    if (!apiKey) throw new Error('API key required');
  }

  const subset = blocks.slice(0, 200);

  const blockList = subset.map(b => {
    const title = b.title || 'Untitled';
    const desc = b.description ? ` | ${b.description.slice(0, 80)}` : '';
    return `${b.id}: [${b.type}] "${title}" (ch: ${b.channelTitle})${desc}`;
  }).join('\n');

  const prompt = `You are a creative art curator with a poetic sensibility. Below are references from a personal inspiration archive on Are.na. Your task is to analyze them and create evocative, artistic categories to group them.

Guidelines for categories:
- Create 6-15 categories depending on the diversity of content
- Category names should be poetic, evocative, and specific — not generic
- Think like an art curator naming sections of an exhibition
- Examples of good category names: "Light & Atmosphere", "Digital Rituals", "Sonic Textures", "Found Typography", "Organic Machines", "Color Fields", "Invisible Systems", "Body & Space"
- Each reference should be assigned to 1-2 categories
- Categories should feel cohesive but surprising

References:
${blockList}

Return ONLY valid JSON (no markdown, no explanation):
{"categories":["Category One","Category Two",...],"assignments":{"blockId":["Category One"],"blockId2":["Category One","Category Two"],...}}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    // If auth fails, clear stored key so user can re-enter
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(KEY_STORAGE);
    }
    const body = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${body.slice(0, 150)}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response format');

  const result: CategoryResult = JSON.parse(jsonMatch[0]);

  if (!result.categories || !result.assignments) {
    throw new Error('Invalid category data');
  }

  setCachedCategories(result);
  return result;
}
