import type { ArenaBlock } from './types';

interface BlockItem {
  block: ArenaBlock;
  channelTitle: string;
}

const cache = new Map<number, number[]>();

export async function findRelated(
  target: BlockItem,
  allBlocks: BlockItem[],
): Promise<BlockItem[]> {
  const cached = cache.get(target.block.id);
  if (cached) {
    return cached
      .map(id => allBlocks.find(b => b.block.id === id))
      .filter((b): b is BlockItem => b !== undefined);
  }

  const targetDesc = describeBlock(target);
  const others = allBlocks
    .filter(b => b.block.id !== target.block.id)
    .slice(0, 120);

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

Pick the 6 most visually/thematically related references from the list above.

Return ONLY valid JSON:
{"relatedIds":[id1,id2,...]}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const response = await fetch('/api/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  clearTimeout(timeout);

  if (!response.ok) throw new Error(`API ${response.status}`);

  const data = await response.json();
  const text = data.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');

  const parsed: { relatedIds: number[] } = JSON.parse(jsonMatch[0]);
  cache.set(target.block.id, parsed.relatedIds);

  return parsed.relatedIds
    .map(id => allBlocks.find(b => b.block.id === id))
    .filter((b): b is BlockItem => b !== undefined);
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
