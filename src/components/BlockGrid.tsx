import { useState, memo } from 'react';
import type { ArenaBlock, ViewMode } from '../types';
import { BlockDetail } from './BlockDetail';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  viewMode: ViewMode;
  loading: boolean;
  categoryAssignments: Record<string, string[]> | null;
}

export function BlockGrid({ blocks, viewMode, loading, categoryAssignments }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<{ block: ArenaBlock; channelTitle: string } | null>(null);

  if (loading) {
    return (
      <div className="grid-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="grid-empty">
        <p>No references found</p>
        <p className="grid-empty-sub">Select a channel from the sidebar to explore</p>
      </div>
    );
  }

  return (
    <>
      <div className={`block-grid ${viewMode}`}>
        {blocks.map((item) => (
          <BlockCard
            key={`${item.block.id}-${item.channelTitle}`}
            block={item.block}
            channelTitle={item.channelTitle}
            viewMode={viewMode}
            onClick={() => setSelectedBlock(item)}
            categories={categoryAssignments?.[String(item.block.id)] || null}
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
  viewMode,
  onClick,
  categories,
}: {
  block: ArenaBlock;
  channelTitle: string;
  viewMode: ViewMode;
  onClick: () => void;
  categories: string[] | null;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="block-list-item" onClick={onClick}>
        <div className="block-list-thumb">
          {block.image ? (
            <img src={block.image.thumb.url} alt="" />
          ) : (
            <div className="block-type-icon">{block.class[0]}</div>
          )}
        </div>
        <div className="block-list-info">
          <span className="block-list-title">
            {block.title || block.source?.title || 'Untitled'}
          </span>
          <span className="block-list-channel">{channelTitle}</span>
        </div>
        {categories && categories.length > 0 && (
          <span className="block-list-cat">{categories[0]}</span>
        )}
        <span className="block-list-type">{block.class}</span>
      </div>
    );
  }

  return (
    <div className="block-card" onClick={onClick}>
      <div className="block-card-visual">
        {block.image ? (
          <>
            {!imgLoaded && <div className="block-card-placeholder" />}
            <img
              src={block.image.display.url}
              alt={block.title || ''}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              style={imgLoaded ? undefined : { opacity: 0, position: 'absolute' }}
            />
          </>
        ) : block.class === 'Text' ? (
          <div className="block-card-text">
            <p>{block.content?.slice(0, 200)}</p>
          </div>
        ) : block.class === 'Link' ? (
          <div className="block-card-link">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 8.5l3-3M6 3.5L7.5 2a2.83 2.83 0 114 4L10 7.5M8 10.5L6.5 12a2.83 2.83 0 11-4-4L4 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>{block.source?.title || block.title || 'Link'}</span>
          </div>
        ) : (
          <div className="block-card-fallback">
            <span>{block.class}</span>
          </div>
        )}
      </div>
      <div className="block-card-meta">
        <span className="block-card-channel">{channelTitle}</span>
        {block.title && (
          <span className="block-card-title">{block.title}</span>
        )}
        {categories && categories.length > 0 && (
          <div className="block-card-cats">
            {categories.map(c => (
              <span key={c} className="block-card-cat">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const gridStyles = `
  .block-grid.grid {
    columns: 260px;
    column-gap: 16px;
    padding: 16px 20px;
  }
  .block-grid.list {
    display: flex;
    flex-direction: column;
    padding: 0;
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
  .grid-empty-sub {
    font-size: 12px;
  }

  .block-card {
    break-inside: avoid;
    margin-bottom: 16px;
    display: inline-block;
    width: 100%;
    cursor: pointer;
    background: var(--bg-card);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .block-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
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
  .block-card-placeholder {
    width: 100%;
    padding-bottom: 75%;
    background: var(--tag-bg);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }

  .block-card-text {
    padding: 16px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--text-secondary);
    min-height: 80px;
  }
  .block-card-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--text-muted);
    font-size: 11px;
    padding: 24px 16px;
    text-align: center;
    word-break: break-all;
    line-height: 1.5;
    min-height: 80px;
  }
  .block-card-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 24px;
    min-height: 80px;
  }

  .block-card-meta {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    border-top: 1px solid var(--border);
  }
  .block-card-channel {
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .block-card-title {
    font-size: 12px;
    color: var(--text);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .block-card-cats {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .block-card-cat {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 10px;
    background: var(--ai-accent-soft);
    color: var(--ai-accent);
    letter-spacing: 0.2px;
  }

  .block-list-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
  }
  .block-list-item:hover {
    background: var(--tag-bg);
  }
  .block-list-thumb {
    width: 44px;
    height: 44px;
    border-radius: var(--radius);
    overflow: hidden;
    flex-shrink: 0;
    background: var(--tag-bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .block-list-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .block-type-icon {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .block-list-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .block-list-title {
    font-size: 12px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .block-list-channel {
    font-size: 11px;
    color: var(--text-muted);
  }
  .block-list-cat {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 10px;
    background: var(--ai-accent-soft);
    color: var(--ai-accent);
    flex-shrink: 0;
  }
  .block-list-type {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .block-grid.grid {
      columns: 2;
      column-gap: 8px;
      padding: 8px;
    }
    .block-card {
      margin-bottom: 8px;
    }
    .block-card-meta {
      padding: 8px 10px;
    }
    .block-list-item {
      padding: 8px 12px;
      gap: 10px;
    }
    .block-list-thumb {
      width: 36px;
      height: 36px;
    }
  }
  @media (max-width: 480px) {
    .block-grid.grid {
      columns: 1;
      padding: 8px;
    }
  }
`;
