import { useState, memo } from 'react';
import type { ArenaBlock } from '../types';
import { BlockDetail } from './BlockDetail';
import { getTier, TIER_COLORS } from '../tiers';
import type { Board } from '../boards';
import { getChannelColor } from '../channelColors';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  allBlocks: { block: ArenaBlock; channelTitle: string }[];
  loading: boolean;
  onTierChange: () => void;
  selectMode: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  boards: Board[];
  onAddToBoard: (boardId: string, blockId: number) => void;
}

export function BlockGrid({ blocks, allBlocks, loading, onTierChange, selectMode, selectedIds, onToggleSelect, boards, onAddToBoard }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<{ block: ArenaBlock; channelTitle: string } | null>(null);

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

  return (
    <>
      <div className="block-grid">
        {blocks.map((item) => (
          <BlockCard
            key={`${item.block.id}-${item.channelTitle}`}
            block={item.block}
            channelTitle={item.channelTitle}
            onClick={() => selectMode ? onToggleSelect(item.block.id) : setSelectedBlock(item)}
            selected={selectMode && selectedIds.has(item.block.id)}
            selectMode={selectMode}
          />
        ))}
      </div>

      {selectedBlock && (
        <BlockDetail
          block={selectedBlock.block}
          channelTitle={selectedBlock.channelTitle}
          allBlocks={allBlocks}
          onClose={() => setSelectedBlock(null)}
          onSelectBlock={(item) => setSelectedBlock(item)}
          onTierChange={onTierChange}
          boards={boards}
          onAddToBoard={onAddToBoard}
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
  selected,
  selectMode,
}: {
  block: ArenaBlock;
  channelTitle: string;
  onClick: () => void;
  selected?: boolean;
  selectMode?: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const content = block.content || '';
  const isShortText = block.class === 'Text' && content.length < 140;
  const tier = getTier(block.id);
  const chColor = getChannelColor(channelTitle);

  const tierBadge = tier ? (
    <span className="b-tier" style={{ background: TIER_COLORS[tier] }}>{tier}</span>
  ) : null;

  const selectCheck = selectMode ? (
    <span className={`b-select ${selected ? 'b-select--on' : ''}`}>
      {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </span>
  ) : null;

  // Image block
  if (block.image) {
    return (
      <div className={`b ${selected ? 'b--selected' : ''}`} onClick={onClick}>
        <img
          src={block.image.display.url}
          alt=""
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`b-img ${imgLoaded ? 'b-img--loaded' : ''}`}
        />
        {tierBadge}
        {selectCheck}
        <span className="b-ch"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}</span>
      </div>
    );
  }

  // Text block
  if (block.class === 'Text') {
    return (
      <div className={`b b-text ${isShortText ? 'b-text--short' : 'b-text--long'} ${selected ? 'b--selected' : ''}`} onClick={onClick}>
        {tierBadge}
        {selectCheck}
        <p className="b-text-content">{content.slice(0, isShortText ? 140 : 360)}</p>
        {!isShortText && <div className="b-text-fade" />}
        <span className="b-ch b-ch--inside"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}</span>
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
      <div className={`b b-link ${selected ? 'b--selected' : ''}`} onClick={onClick}>
        {selectCheck}
        <div className="b-link-header">
          <span className="b-link-title">{block.source?.title || block.title || 'Untitled'}</span>
          {tier && <span className="b-tier-inline" style={{ background: TIER_COLORS[tier] }}>{tier}</span>}
        </div>
        {domain && <span className="b-link-domain">{domain}</span>}
        <span className="b-ch b-ch--inside"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}</span>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`b b-fallback ${selected ? 'b--selected' : ''}`} onClick={onClick}>
      {tierBadge}
      {selectCheck}
      <span className="b-fallback-type">{block.class}</span>
      {block.title && <span className="b-fallback-title">{block.title}</span>}
      <span className="b-ch b-ch--inside"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}</span>
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
    font-family: var(--font-display);
    font-size: 24px;
    color: var(--text-secondary);
    font-weight: 400;
    letter-spacing: -0.3px;
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

  /* --- Select mode --- */
  .b--selected {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-radius: 4px;
  }
  .b-select {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.7);
    background: rgba(0,0,0,0.2);
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .b-select--on {
    background: var(--accent);
    border-color: var(--accent);
  }
  .b-text .b-select, .b-link .b-select, .b-fallback .b-select {
    border-color: var(--border);
    background: var(--bg-card);
  }
  .b-text .b-select--on, .b-link .b-select--on, .b-fallback .b-select--on {
    background: var(--accent);
    border-color: var(--accent);
  }

  /* --- Tier badge --- */
  .b-tier {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 9px;
    font-weight: 700;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
    line-height: 1;
  }
  .b-text .b-tier, .b-fallback .b-tier {
    position: absolute;
  }
  .b-tier-inline {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 9px;
    font-weight: 700;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 1;
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
  .b-ch-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    margin-right: 4px;
    vertical-align: middle;
  }
  .b:hover .b-ch { opacity: 1; }

  /* Channel label inside text/link blocks */
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
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    transition: border-color 0.2s ease;
    background: var(--bg-card);
  }
  .b-text:hover { border-color: var(--text-muted); }

  .b-text--short {
    padding: 16px 18px 10px;
  }
  .b-text--short .b-text-content {
    font-size: 13px;
    line-height: 1.55;
    color: var(--text);
  }

  .b-text--long {
    padding: 16px 18px 10px;
    max-height: 200px;
  }
  .b-text--long .b-text-content {
    font-size: 12px;
    line-height: 1.65;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 8;
    overflow: hidden;
  }

  .b-text-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 36px;
    background: linear-gradient(transparent, var(--bg-card));
    pointer-events: none;
  }

  /* --- Link block --- */
  .b-link {
    padding: 16px 18px 10px;
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: border-color 0.2s ease;
  }
  .b-link:hover { border-color: var(--text-muted); }
  .b-link-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    justify-content: space-between;
  }
  .b-link-title {
    display: block;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text);
    word-break: break-word;
    flex: 1;
    min-width: 0;
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
    padding: 16px 18px 10px;
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: border-color 0.2s ease;
  }
  .b-fallback:hover { border-color: var(--text-muted); }
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

  /* --- Mobile --- */
  @media (max-width: 768px) {
    .block-grid {
      columns: 2;
      column-gap: 10px;
      padding: 10px;
    }
    .b { margin-bottom: 10px; }
    .b-ch { opacity: 1; font-size: 8px; }
    .b-text--short { padding: 12px 14px 8px; }
    .b-text--short .b-text-content { font-size: 12px; }
    .b-text--long { padding: 12px 14px 8px; max-height: 160px; }
    .b-text--long .b-text-content { font-size: 11px; -webkit-line-clamp: 6; }
    .b-link { padding: 12px 14px 8px; }
    .b-link-title { font-size: 11px; }
    .grid-empty-title { font-size: 18px; }
    .b-ch--inside { font-size: 8px; margin-top: 6px; }
  }
`;
