import { useState, memo, useMemo } from 'react';
import type { ArenaBlock } from '../types';
import { BlockDetail } from './BlockDetail';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  loading: boolean;
  categoryAssignments: Record<string, string[]> | null;
  categories: string[] | null;
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

  const renderGrid = (items: { block: ArenaBlock; channelTitle: string }[], className = 'block-grid') => (
    <div className={className}>
      {items.map((item) => (
        <BlockCard
          key={`${item.block.id}-${item.channelTitle}`}
          block={item.block}
          channelTitle={item.channelTitle}
          onClick={() => setSelectedBlock(item)}
        />
      ))}
    </div>
  );

  if (groupedBlocks) {
    return (
      <>
        <div className="curated-sections">
          {[...groupedBlocks.entries()].map(([cat, items]) => (
            <section key={cat} className="curated-section">
              <div className="curated-section-header">
                <h2 className="curated-section-title">{cat}</h2>
                <span className="curated-section-count">{items.length}</span>
              </div>
              {renderGrid(items, 'block-grid')}
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

  return (
    <>
      {renderGrid(blocks)}
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
  const content = block.content || '';
  const isShortText = block.class === 'Text' && content.length < 140;

  // Image block — just the image, nothing else
  if (block.image) {
    return (
      <div className="b" onClick={onClick}>
        <img
          src={block.image.display.url}
          alt=""
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`b-img ${imgLoaded ? 'b-img--loaded' : ''}`}
        />
        <span className="b-ch">{channelTitle}</span>
      </div>
    );
  }

  // Text block
  if (block.class === 'Text') {
    return (
      <div className={`b b-text ${isShortText ? 'b-text--short' : 'b-text--long'}`} onClick={onClick}>
        <p className="b-text-content">{content.slice(0, isShortText ? 140 : 360)}</p>
        {!isShortText && <div className="b-text-fade" />}
        <span className="b-ch b-ch--inside">{channelTitle}</span>
      </div>
    );
  }

  // Link block
  if (block.class === 'Link') {
    const domain = (() => {
      try { return block.source?.url ? new URL(block.source.url).hostname.replace('www.', '') : null; }
      catch { return null; }
    })();
    return (
      <div className="b b-link" onClick={onClick}>
        <span className="b-link-title">{block.source?.title || block.title || 'Untitled'}</span>
        {domain && <span className="b-link-domain">{domain}</span>}
        <span className="b-ch b-ch--inside">{channelTitle}</span>
      </div>
    );
  }

  // Fallback (Media, Attachment, etc.)
  return (
    <div className="b b-fallback" onClick={onClick}>
      <span className="b-fallback-type">{block.class}</span>
      {block.title && <span className="b-fallback-title">{block.title}</span>}
      <span className="b-ch b-ch--inside">{channelTitle}</span>
    </div>
  );
});

const gridStyles = `
  .block-grid {
    columns: 300px;
    column-gap: 16px;
    padding: 20px 28px 80px;
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

  /* --- Block (base) --- */
  .b {
    break-inside: avoid;
    margin-bottom: 16px;
    display: inline-block;
    width: 100%;
    cursor: pointer;
    position: relative;
  }

  /* --- Image --- */
  .b-img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.4s ease;
    background: var(--border-light);
    min-height: 40px;
  }
  .b-img--loaded { opacity: 1; }

  /* Channel label — appears on hover over image */
  .b-ch {
    position: absolute;
    bottom: 6px;
    left: 8px;
    font-size: 9px;
    letter-spacing: 0.3px;
    color: rgba(255,255,255,0.85);
    opacity: 0;
    transition: opacity 0.2s ease;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    pointer-events: none;
    max-width: calc(100% - 16px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .b:hover .b-ch { opacity: 1; }

  /* Channel label inside text/link blocks — always visible, muted */
  .b-ch--inside {
    position: relative;
    bottom: auto;
    left: auto;
    display: block;
    color: var(--text-muted);
    opacity: 0.5;
    text-shadow: none;
    margin-top: 10px;
    font-size: 9px;
    letter-spacing: 0.3px;
  }
  .b:hover .b-ch--inside { opacity: 0.8; }

  /* --- Text block --- */
  .b-text {
    border-radius: 3px;
    overflow: hidden;
  }

  .b-text--short {
    padding: 28px 22px 16px;
  }
  .b-text--short .b-text-content {
    font-family: var(--font-serif);
    font-size: 22px;
    line-height: 1.3;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .b-text--long {
    padding: 20px 20px 14px;
    max-height: 240px;
  }
  .b-text--long .b-text-content {
    font-size: 12px;
    line-height: 1.7;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 10;
    overflow: hidden;
  }

  .b-text-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(transparent, var(--bg));
    pointer-events: none;
  }

  /* --- Link block --- */
  .b-link {
    padding: 20px 20px 14px;
    border-radius: 3px;
  }
  .b-link-title {
    display: block;
    font-size: 14px;
    line-height: 1.4;
    color: var(--text);
    word-break: break-word;
  }
  .b-link-domain {
    display: block;
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 4px;
    letter-spacing: 0.2px;
  }

  /* --- Fallback --- */
  .b-fallback {
    padding: 20px;
    border-radius: 3px;
  }
  .b-fallback-type {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    display: block;
  }
  .b-fallback-title {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 6px;
    line-height: 1.4;
  }

  /* --- Curated sections --- */
  .curated-sections {
    padding: 0 28px 80px;
  }
  .curated-section {
    padding-top: 36px;
  }
  .curated-section-header {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 18px;
  }
  .curated-section-title {
    font-family: var(--font-serif);
    font-size: 26px;
    font-weight: 400;
    letter-spacing: -0.3px;
    color: var(--text);
  }
  .curated-section-count {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* --- Mobile --- */
  @media (max-width: 768px) {
    .block-grid {
      columns: 2;
      column-gap: 10px;
      padding: 10px;
    }
    .b { margin-bottom: 10px; }
    .b-ch { opacity: 1; font-size: 8px; }
    .b-text--short { padding: 18px 14px 12px; }
    .b-text--short .b-text-content { font-size: 17px; }
    .b-text--long { padding: 14px 14px 10px; max-height: 180px; }
    .b-text--long .b-text-content { font-size: 11px; -webkit-line-clamp: 8; }
    .b-link { padding: 14px 14px 10px; }
    .b-link-title { font-size: 13px; }
    .b-ch--inside { font-size: 8px; margin-top: 6px; }

    .curated-sections { padding: 0 10px 60px; }
    .curated-section { padding-top: 28px; }
    .curated-section-title { font-size: 20px; }
    .curated-section-header { margin-bottom: 12px; }
  }
`;
