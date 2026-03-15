import type { ArenaBlock } from './types';

interface BlockItem {
  block: ArenaBlock;
  channelTitle: string;
}

interface RecommendResult {
  relatedIds: number[];
  searchQuery: string;
}

const cache = new Map<number, RecommendResult>();

export async function findRelated(
  target: BlockItem,
  allBlocks: BlockItem[],
): Promise<{ related: BlockItem[]; searchQuery: string }> {
  const cached = cache.get(target.block.id);
  if (cached) {
    const related = cached.relatedIds
      .map(id => allBlocks.find(b => b.block.id === id))
      .filter((b): b is BlockItem => b !== undefined);
    return { related, searchQuery: cached.searchQuery };
  }

  const targetDesc = describeBlock(target);

  // Build a compact list of all other blocks
  const others = allBlocks
    .filter(b => b.block.id !== target.block.id)
    .slice(0, 120); // limit for token budget

  const othersList = others.map(b => {
    const title = b.block.title || 'Untitled';
    const type = b.block.class;
    const ch = b.channelTitle;
    const desc = b.block.description ? ` — ${b.block.description.slice(0, 40)}` : '';
    return `${b.block.id}: [${type}] "${title}" (${ch})${desc}`;
  }).join('\n');

  const prompt = `You are helping a graphic designer find related references in their personal archive.

The designer is viewing this reference:
${targetDesc}

Other references in their archive:
${othersList}

Tasks:
1. Pick the 6 most visually/thematically related references from the list above
2. Generate a concise Google search query (in English) to find the original source or similar external works for this reference. Think about what an art director would search for.

Return ONLY valid JSON:
{"relatedIds":[id1,id2,...],"searchQuery":"the search query"}`;

  const response = await fetch('/api/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');

  const parsed: RecommendResult = JSON.parse(jsonMatch[0]);

  cache.set(target.block.id, parsed);

  const related = parsed.relatedIds
    .map(id => allBlocks.find(b => b.block.id === id))
    .filter((b): b is BlockItem => b !== undefined);

  return { related, searchQuery: parsed.searchQuery };
}

function describeBlock(item: BlockItem): string {
  const b = item.block;
  const parts = [`Type: ${b.class}`, `Channel: ${item.channelTitle}`];
  if (b.title) parts.push(`Title: "${b.title}"`);
  if (b.description) parts.push(`Description: ${b.description.slice(0, 100)}`);
  if (b.content) parts.push(`Content: ${b.content.slice(0, 150)}`);
  if (b.source?.title) parts.push(`Source: ${b.source.title}`);
  if (b.source?.url) {
    try { parts.push(`URL: ${new URL(b.source.url).hostname}`); }
    catch { /* skip */ }
  }
  return parts.join('\n');
}
