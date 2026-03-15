import { useState } from 'react';
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
        <p className="grid-empty-icon">&#10022;</p>
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

function BlockCard({
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
            <div className={`block-type-icon ${block.class.toLowerCase()}`}>
              {block.class[0]}
            </div>
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
              style={{ opacity: imgLoaded ? 1 : 0 }}
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
      {/* Always-visible channel label */}
      <div className="block-card-label">
        <span className="block-card-label-channel">{channelTitle}</span>
      </div>
      {/* Hover overlay with more details */}
      <div className="block-card-overlay">
        <div className="block-card-overlay-content">
          <span className="block-card-overlay-title">
            {block.title || block.source?.title || 'Untitled'}
          </span>
          <span className="block-card-overlay-channel">{channelTitle}</span>
          {categories && categories.length > 0 && (
            <div className="block-card-overlay-cats">
              {categories.map(c => (
                <span key={c} className="block-card-overlay-cat">{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const gridStyles = `
  .block-grid.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 4px;
    padding: 4px;
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
  .grid-empty-icon {
    font-size: 24px;
    color: var(--accent);
    opacity: 0.4;
  }
  .grid-empty-sub {
    font-size: 12px;
  }

  /* Grid card */
  .block-card {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    cursor: pointer;
    background: var(--bg-card);
    border-radius: var(--radius);
  }
  .block-card-visual {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .block-card-visual img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.4s ease, transform 0.6s ease;
  }
  .block-card:hover .block-card-visual img {
    transform: scale(1.04);
  }
  .block-card-placeholder {
    position: absolute;
    inset: 0;
    background: var(--bg-card);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }

  .block-card-text {
    padding: 20px;
    font-size: 11px;
    line-height: 1.7;
    color: var(--text-secondary);
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .block-card-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--text-muted);
    font-size: 11px;
    padding: 20px;
    text-align: center;
    word-break: break-all;
    line-height: 1.5;
  }
  .block-card-fallback {
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Always-visible channel label */
  .block-card-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 28px 12px 8px;
    background: linear-gradient(transparent, rgba(0,0,0,0.65));
    pointer-events: none;
    transition: opacity 0.25s;
  }
  .block-card-label-channel {
    font-size: 10px;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.3px;
  }

  /* Hover overlay */
  .block-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 20%, rgba(0,0,0,0.8));
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    align-items: flex-end;
    padding: 16px;
  }
  .block-card:hover .block-card-overlay {
    opacity: 1;
  }
  .block-card:hover .block-card-label {
    opacity: 0;
  }
  .block-card-overlay-content {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .block-card-overlay-title {
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .block-card-overlay-channel {
    color: rgba(255,255,255,0.5);
    font-size: 10px;
    letter-spacing: 0.3px;
  }
  .block-card-overlay-cats {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .block-card-overlay-cat {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 10px;
    background: rgba(196, 165, 90, 0.25);
    color: rgba(255, 230, 150, 0.85);
    letter-spacing: 0.2px;
  }

  /* List item */
  .block-list-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 28px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.2s;
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
    background: var(--bg-card);
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
    background: var(--accent-soft);
    color: var(--accent);
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
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 3px;
      padding: 3px;
    }
    .block-list-item {
      padding: 8px 16px;
    }
  }
`;
