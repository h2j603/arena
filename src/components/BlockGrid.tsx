import { useState, memo, useMemo } from 'react';
import type { ArenaBlock } from '../types';
import { BlockDetail } from './BlockDetail';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  loading: boolean;
  categoryAssignments: Record<string, string[]> | null;
  categories: string[] | null;
}

function channelColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 52%)`;
}

function getDisplayTitle(block: ArenaBlock): string | null {
  switch (block.class) {
    case 'Image': return null;
    case 'Text': return null; // text blocks show content as their visual — no separate title needed
    case 'Link': return block.source?.title || block.title || null;
    default: return block.title || null;
  }
}

function getTextLength(block: ArenaBlock): 'short' | 'medium' | 'long' {
  const len = (block.content || '').length;
  if (len < 100) return 'short';
  if (len < 280) return 'medium';
  return 'long';
}

function channelColorSoft(name: string, alpha: number): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsla(${hue}, 40%, 50%, ${alpha})`;
}

export function BlockGrid({ blocks, loading, categoryAssignments, categories }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<{ block: ArenaBlock; channelTitle: string } | null>(null);

  const groupedBlocks = useMemo(() => {
    if (!categories || !categoryAssignments) return null;
    const groups = new Map<string, { block: ArenaBlock; channelTitle: string }[]>();
    for (const cat of categories) groups.set(cat, []);
    for (const item of blocks) {
      const cats = categoryAssignments[String(item.block.id)];
      if (cats) {
        for (const cat of cats) groups.get(cat)?.push(item);
      }
    }
    for (const [cat, items] of groups) {
      if (items.length === 0) groups.delete(cat);
    }
    return groups;
  }, [blocks, categories, categoryAssignments]);

  if (loading) {
    return <div className="grid-loading"><div className="loading-spinner" /></div>;
  }

  if (blocks.length === 0) {
    return (
      <div className="grid-empty">
        <p className="grid-empty-title">No references found</p>
        <p className="grid-empty-sub">Select a channel from the sidebar to explore</p>
      </div>
    );
  }

  // Curated sections when categories exist
  if (groupedBlocks) {
    return (
      <>
        <div className="curated-sections">
          {[...groupedBlocks.entries()].map(([cat, items]) => (
            <section
              key={cat}
              className="curated-section"
            >
              <div className="curated-section-header">
                <h2 className="curated-section-title">{cat}</h2>
                <span className="curated-section-count">{items.length} items</span>
              </div>
              <div className="curated-grid">
                {items.map((item) => (
                  <BlockCard
                    key={`${item.block.id}-${cat}`}
                    block={item.block}
                    channelTitle={item.channelTitle}
                    onClick={() => setSelectedBlock(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {selectedBlock && (
          <BlockDetail
            block={selectedBlock.block}
            channelTitle={selectedBlock.channelTitle}
            onClose={() => setSelectedBlock(null)}
            categories={categoryAssignments?.[String(selectedBlock.block.id)] || null}
          />
        )}
        <style>{gridStyles}</style>
      </>
    );
  }

  // Default masonry grid
  return (
    <>
      <div className="block-grid">
        {blocks.map((item) => (
          <BlockCard
            key={`${item.block.id}-${item.channelTitle}`}
            block={item.block}
            channelTitle={item.channelTitle}
            onClick={() => setSelectedBlock(item)}
          />
        ))}
      </div>

      {selectedBlock && (
        <BlockDetail
          block={selectedBlock.block}
          channelTitle={selectedBlock.channelTitle}
          onClose={() => setSelectedBlock(null)}
          categories={categoryAssignments?.[String(selectedBlock.block.id)] || null}
        />
      )}
      <style>{gridStyles}</style>
    </>
  );
}

const BlockCard = memo(function BlockCard({
  block,
  channelTitle,
  onClick,
}: {
  block: ArenaBlock;
  channelTitle: string;
  onClick: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const color = channelColor(channelTitle);
  const displayTitle = getDisplayTitle(block);

  const renderVisual = () => {
    if (block.image) {
      return (
        <img
          src={block.image.display.url}
          alt=""
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />
      );
    }
    if (block.class === 'Text') {
      const textLen = getTextLength(block);
      const bgTint = channelColorSoft(channelTitle, 0.06);
      const accentLine = channelColorSoft(channelTitle, 0.25);

      if (textLen === 'short') {
        return (
          <div className="card-text card-text--short" style={{ background: bgTint }}>
            <span className="card-text-quote">"</span>
            <p>{block.content}</p>
          </div>
        );
      }
      if (textLen === 'medium') {
        return (
          <div className="card-text card-text--medium" style={{ borderLeftColor: accentLine, background: bgTint }}>
            <p>{block.content?.slice(0, 280)}</p>
          </div>
        );
      }
      return (
        <div className="card-text card-text--long" style={{ borderLeftColor: accentLine }}>
          <p>{block.content?.slice(0, 400)}</p>
          <div className="card-text-fade" />
        </div>
      );
    }
    if (block.class === 'Link') {
      return (
        <div className="card-link" style={{ borderLeftColor: color }}>
          <span className="card-link-title">{block.source?.title || block.title || 'Link'}</span>
          {block.source?.url && (() => {
            try { return <span className="card-link-domain">{new URL(block.source!.url).hostname}</span>; }
            catch { return null; }
          })()}
        </div>
      );
    }
    return <div className="card-fallback"><span>{block.class}</span></div>;
  };

  return (
    <div className="block-card" onClick={onClick}>
      <div className="card-visual">{renderVisual()}</div>
      <div className="card-info">
        <span className="card-channel" style={{ color }}>
          {channelTitle}
        </span>
        {displayTitle && <span className="card-title">{displayTitle}</span>}
      </div>
    </div>
  );
});

const gridStyles = `
  /* Masonry grid */
  .block-grid {
    columns: 280px;
    column-gap: 18px;
    padding: 22px 28px 60px;
  }

  .grid-loading, .grid-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 20px;
    color: var(--text-muted);
    gap: 8px;
    text-align: center;
  }
  .grid-empty-title {
    font-family: var(--font-serif);
    font-size: 18px;
    color: var(--text-secondary);
    font-weight: 400;
  }
  .grid-empty-sub { font-size: 12px; }

  /* Card */
  .block-card {
    break-inside: avoid;
    margin-bottom: 18px;
    display: inline-block;
    width: 100%;
    cursor: pointer;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    transition: border-color var(--transition), box-shadow var(--transition);
  }
  .block-card:hover {
    border-color: var(--border);
    box-shadow: var(--shadow-md);
  }

  .card-visual {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  .card-visual img {
    width: 100%;
    height: auto;
    display: block;
    transition: opacity var(--transition-slow);
    background: var(--border-light);
    min-height: 60px;
  }
  /* Text blocks — typographic treatment */
  .card-text {
    position: relative;
    overflow: hidden;
  }
  .card-text p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Short text: pull-quote style — large serif, centered, dramatic */
  .card-text--short {
    padding: 32px 24px 28px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 120px;
    justify-content: center;
  }
  .card-text--short p {
    font-family: var(--font-serif);
    font-size: 20px;
    font-weight: 400;
    line-height: 1.45;
    color: var(--text);
    letter-spacing: -0.2px;
    -webkit-line-clamp: 5;
  }
  .card-text-quote {
    font-family: var(--font-serif);
    font-size: 52px;
    line-height: 0.6;
    color: var(--text-muted);
    opacity: 0.3;
    margin-bottom: 8px;
    display: block;
    user-select: none;
  }

  /* Medium text: editorial excerpt — serif, left-bordered, warm bg */
  .card-text--medium {
    padding: 22px 20px;
    border-left: 3px solid transparent;
  }
  .card-text--medium p {
    font-family: var(--font-serif);
    font-size: 15px;
    font-weight: 400;
    line-height: 1.6;
    color: var(--text);
    letter-spacing: -0.1px;
    -webkit-line-clamp: 10;
  }

  /* Long text: reader-friendly with fade */
  .card-text--long {
    padding: 18px 20px 0;
    border-left: 3px solid transparent;
    max-height: 260px;
  }
  .card-text--long p {
    font-size: 12.5px;
    line-height: 1.75;
    color: var(--text-secondary);
    -webkit-line-clamp: 12;
  }
  .card-text-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: linear-gradient(transparent, var(--bg-card));
    pointer-events: none;
  }
  .card-link {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px 18px;
    border-left: 2.5px solid transparent;
  }
  .card-link-title {
    font-family: var(--font-serif);
    font-size: 15px;
    font-weight: 400;
    color: var(--text);
    line-height: 1.35;
    word-break: break-word;
  }
  .card-link-domain {
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 0.2px;
  }
  .card-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 28px;
    min-height: 64px;
  }

  /* Card info */
  .card-info {
    padding: 10px 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-top: 1px solid var(--border-light);
  }
  .card-channel {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.2px;
  }
  .card-title {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Curated sections */
  .curated-sections {
    padding: 0 28px 80px;
  }
  .curated-section {
    padding-top: 40px;
  }
  .curated-section-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
  }
  .curated-section-title {
    font-family: var(--font-serif);
    font-size: 28px;
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.3px;
    color: var(--text);
  }
  .curated-section-count {
    font-size: 11px;
    color: var(--text-muted);
  }
  .curated-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  .curated-grid .block-card {
    break-inside: unset;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
  }
  .curated-grid .card-visual img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    .block-grid {
      columns: 2;
      column-gap: 10px;
      padding: 12px;
    }
    .block-card {
      margin-bottom: 10px;
      border-radius: var(--radius);
    }
    .card-info {
      padding: 8px 10px 10px;
      align-items: center;
      text-align: center;
    }
    .card-channel { font-size: 9px; }
    .card-title { font-size: 11px; -webkit-line-clamp: 1; }
    .card-text--short { padding: 20px 16px 18px; min-height: 90px; }
    .card-text--short p { font-size: 16px; }
    .card-text-quote { font-size: 38px; margin-bottom: 4px; }
    .card-text--medium { padding: 16px 14px; }
    .card-text--medium p { font-size: 13px; }
    .card-text--long { padding: 14px 14px 0; max-height: 180px; }
    .card-text--long p { font-size: 11px; }
    .card-link { padding: 14px 12px; }
    .card-link-title { font-size: 14px; }

    .curated-sections { padding: 0 12px 60px; }
    .curated-section { padding-top: 32px; }
    .curated-section-header { margin-bottom: 14px; }
    .curated-section-title { font-size: 22px; }
    .curated-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .curated-grid .card-visual img { aspect-ratio: 1/1; }
    .curated-grid .card-info { text-align: center; align-items: center; }
  }
`;
