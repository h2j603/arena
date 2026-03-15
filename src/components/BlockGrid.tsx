import { useState, memo, useMemo, useRef, useCallback } from 'react';
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
  return `hsl(${hue}, 45%, 45%)`;
}

function getDisplayTitle(block: ArenaBlock): string | null {
  switch (block.class) {
    case 'Image': return null;
    case 'Text': return block.content?.slice(0, 120)?.replace(/\n/g, ' ') || null;
    case 'Link': return block.source?.title || block.title || null;
    default: return block.title || null;
  }
}

export function BlockGrid({ blocks, loading, categoryAssignments, categories }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<{ block: ArenaBlock; channelTitle: string } | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const scrollToSection = useCallback((cat: string) => {
    const el = sectionRefs.current.get(cat);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

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
        <p>No references found</p>
        <p className="grid-empty-sub">Select a channel from the sidebar to explore</p>
      </div>
    );
  }

  // Curated sections when categories exist
  if (groupedBlocks) {
    return (
      <>
        <div className="curated-nav">
          {[...groupedBlocks.keys()].map((cat) => (
            <button key={cat} className="curated-nav-item" onClick={() => scrollToSection(cat)}>
              {cat}
              <span className="curated-nav-count">{groupedBlocks.get(cat)?.length}</span>
            </button>
          ))}
        </div>
        <div className="curated-view">
          {[...groupedBlocks.entries()].map(([cat, items]) => (
            <section
              key={cat}
              className="curated-section"
              ref={(el) => { if (el) sectionRefs.current.set(cat, el); }}
            >
              <h2 className="curated-section-title">{cat}</h2>
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
      return (
        <div className="block-card-text">
          <p>{block.content?.slice(0, 300)}</p>
        </div>
      );
    }
    if (block.class === 'Link') {
      return (
        <div className="block-card-link">
          <span className="block-card-link-title">{block.source?.title || block.title || 'Link'}</span>
          {block.source?.url && (
            <span className="block-card-link-host">{new URL(block.source.url).hostname}</span>
          )}
        </div>
      );
    }
    return <div className="block-card-fallback"><span>{block.class}</span></div>;
  };

  return (
    <div className="block-card" onClick={onClick}>
      <div className="block-card-visual">{renderVisual()}</div>
      <div className="block-card-meta">
        <span className="block-card-channel" style={{ borderColor: color, color }}>
          {channelTitle}
        </span>
        {displayTitle && <span className="block-card-title">{displayTitle}</span>}
      </div>
    </div>
  );
});

const gridStyles = `
  .block-grid {
    columns: 260px;
    column-gap: 16px;
    padding: 20px 24px;
  }

  .grid-loading, .grid-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    color: var(--text-muted);
    font-size: 13px;
    gap: 8px;
  }
  .grid-empty-sub { font-size: 12px; }

  /* Grid card */
  .block-card {
    break-inside: avoid;
    margin-bottom: 20px;
    display: inline-block;
    width: 100%;
    cursor: pointer;
    overflow: hidden;
  }
  .block-card-visual {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  .block-card-visual img {
    width: 100%;
    height: auto;
    display: block;
    transition: opacity 0.3s ease;
  }
  .block-card-text {
    padding: 14px 0;
    font-size: 12px;
    line-height: 1.7;
    color: var(--text-secondary);
  }
  .block-card-text p {
    display: -webkit-box;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .block-card-link {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .block-card-link-title {
    font-family: var(--font-serif);
    font-size: 15px;
    font-weight: 400;
    color: var(--text);
    line-height: 1.3;
    word-break: break-word;
  }
  .block-card-link-host {
    font-size: 10px;
    color: var(--text-muted);
  }
  .block-card-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 24px;
    min-height: 60px;
    border: 1px solid var(--border);
  }

  /* Card meta */
  .block-card-meta {
    padding: 6px 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .block-card-channel {
    font-size: 10px;
    font-weight: 500;
    border: 1.5px solid;
    border-radius: 3px;
    padding: 1px 6px;
    width: fit-content;
  }
  .block-card-title {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Curated nav */
  .curated-nav {
    display: flex;
    gap: 20px;
    padding: 12px 24px;
    overflow-x: auto;
    scrollbar-width: none;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
    position: sticky;
    top: 52px;
    z-index: 40;
  }
  .curated-nav::-webkit-scrollbar { display: none; }
  .curated-nav-item {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    display: flex;
    align-items: baseline;
    gap: 4px;
    transition: color 0.15s;
  }
  .curated-nav-item:hover { color: var(--text); }
  .curated-nav-count {
    font-size: 9px;
    opacity: 0.5;
  }

  /* Curated sections */
  .curated-view {
    padding: 0 24px 80px;
  }
  .curated-section {
    padding-top: 48px;
  }
  .curated-section-title {
    font-family: var(--font-serif);
    font-size: 32px;
    font-weight: 300;
    letter-spacing: -0.5px;
    color: var(--text);
    margin-bottom: 24px;
  }
  .curated-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .curated-grid .block-card {
    break-inside: unset;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
  }
  .curated-grid .block-card-visual img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  .curated-grid .block-card-meta {
    padding: 6px 0;
  }

  @media (max-width: 768px) {
    .block-grid {
      columns: 2;
      column-gap: 10px;
      padding: 10px;
    }
    .block-card { margin-bottom: 14px; }
    .block-card-meta { padding: 4px 0; }
    .block-card-channel { font-size: 9px; }
    .block-card-title { font-size: 11px; -webkit-line-clamp: 1; }
    .block-card-text { padding: 8px 0; font-size: 11px; }
    .block-card-link { padding: 12px 0; }
    .block-card-link-title { font-size: 13px; }

    .curated-view { padding: 0 16px 60px; }
    .curated-section { padding-top: 36px; }
    .curated-section-title {
      font-size: 26px;
      margin-bottom: 16px;
      text-align: center;
    }
    .curated-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .curated-grid .block-card-visual img { height: 150px; }
    .curated-nav { padding: 10px 16px; gap: 16px; justify-content: center; }
  }
`;
