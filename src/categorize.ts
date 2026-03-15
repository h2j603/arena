interface BlockMeta {
  id: number;
  title: string | null;
  type: string;
  description: string | null;
  channelTitle: string;
  imageUrl: string | null;
}

export interface CategoryResult {
  categories: string[];
  assignments: Record<string, string[]>;
  descriptions: Record<string, string>;
}

const CACHE_KEY = 'arena_categories';

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

  // Split into image blocks (vision) and text-only blocks
  const imageBlocks = blocks.filter((b) => b.imageUrl);
  const textBlocks = blocks.filter((b) => !b.imageUrl);

  // Send up to 40 images via vision, rest as text metadata
  const visionBlocks = imageBlocks.slice(0, 40);
  const remainingImageBlocks = imageBlocks.slice(40);

  const content: Array<Record<string, unknown>> = [];
  const nonImageParts: string[] = [];

  for (const b of visionBlocks) {
    content.push({
      type: 'image',
      source: { type: 'url', url: b.imageUrl },
    });
    content.push({
      type: 'text',
      text: `[Block ${b.id}: "${b.title || 'Untitled'}" — ch: "${b.channelTitle}"]`,
    });
  }

  // Remaining image blocks as text only
  for (const b of remainingImageBlocks) {
    const title = b.title || 'Untitled';
    const desc = b.description ? ` | ${b.description.slice(0, 80)}` : '';
    nonImageParts.push(`${b.id}: [Image] "${title}" (ch: ${b.channelTitle})${desc}`);
  }

  for (const b of textBlocks) {
    const title = b.title || 'Untitled';
    const desc = b.description ? ` | ${b.description.slice(0, 80)}` : '';
    nonImageParts.push(`${b.id}: [${b.type}] "${title}" (ch: ${b.channelTitle})${desc}`);
  }

  const promptText = `You are a creative art curator with a poetic sensibility. Above are images and references from a personal inspiration archive on Are.na.

Your task:
1. LOOK at each image carefully — analyze colors, composition, subject, mood, texture, style
2. Create evocative, artistic CATEGORIES to group ALL references based on what you actually SEE
3. Write a brief visual DESCRIPTION for each image block (what you see, the mood, the aesthetic)

${nonImageParts.length > 0 ? `Non-image references:\n${nonImageParts.join('\n')}\n` : ''}
Guidelines for categories:
- Create 6-15 categories depending on the diversity of content
- Category names should be poetic, evocative, and specific — not generic
- Think like an art curator naming sections of an exhibition
- Base categories on VISUAL content you actually see, not just titles/metadata
- Examples: "Light & Atmosphere", "Digital Rituals", "Sonic Textures", "Found Typography", "Organic Machines", "Color Fields", "Invisible Systems", "Body & Space"
- Each reference should be assigned to 1-2 categories
- Categories should feel cohesive but surprising

Return ONLY valid JSON (no markdown, no explanation):
{"categories":["Category One","Category Two",...],"assignments":{"blockId":["Category One"],...},"descriptions":{"blockId":"Brief visual description of what you see in this image",...}}`;

  content.push({ type: 'text', text: promptText });

  const response = await fetch('/api/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content }],
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
    descriptions: parsed.descriptions || {},
  };

  if (!result.categories.length) {
    throw new Error('No categories generated');
  }

  setCachedCategories(result);
  return result;
}
