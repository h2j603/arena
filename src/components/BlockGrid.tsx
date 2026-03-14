import { useState } from 'react';
import type { ArenaBlock, ViewMode } from '../types';
import { BlockDetail } from './BlockDetail';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  viewMode: ViewMode;
  loading: boolean;
}

export function BlockGrid({ blocks, viewMode, loading }: Props) {
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
        <p>No blocks found</p>
        <p className="grid-empty-sub">Select a channel from the sidebar to load references</p>
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
          />
        ))}
      </div>

      {selectedBlock && (
        <BlockDetail
          block={selectedBlock.block}
          channelTitle={selectedBlock.channelTitle}
          onClose={() => setSelectedBlock(null)}
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
}: {
  block: ArenaBlock;
  channelTitle: string;
  viewMode: ViewMode;
  onClick: () => void;
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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
      <div className="block-card-overlay">
        <div className="block-card-overlay-content">
          <span className="block-card-overlay-title">
            {block.title || block.source?.title || 'Untitled'}
          </span>
          <span className="block-card-overlay-channel">{channelTitle}</span>
        </div>
      </div>
    </div>
  );
}

const gridStyles = `
  .block-grid.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 3px;
    padding: 3px;
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
    padding: 80px 20px;
    color: var(--text-muted);
    font-size: 13px;
    gap: 6px;
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
    transition: opacity 0.3s, transform 0.4s;
  }
  .block-card:hover .block-card-visual img {
    transform: scale(1.03);
  }
  .block-card-placeholder {
    position: absolute;
    inset: 0;
    background: var(--tag-bg);
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }

  .block-card-text {
    padding: 16px;
    font-size: 11px;
    line-height: 1.6;
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
    gap: 8px;
    color: var(--text-muted);
    font-size: 11px;
    padding: 16px;
    text-align: center;
    word-break: break-all;
  }
  .block-card-fallback {
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Overlay on hover */
  .block-card-overlay {
    position: absolute;
    inset: 0;
    background: var(--hover-overlay);
    opacity: 0;
    transition: opacity 0.25s;
    display: flex;
    align-items: flex-end;
    padding: 14px;
  }
  .block-card:hover .block-card-overlay {
    opacity: 1;
  }
  .block-card-overlay-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .block-card-overlay-title {
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .block-card-overlay-channel {
    color: rgba(255,255,255,0.55);
    font-size: 10px;
  }

  /* List item */
  .block-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 24px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
  }
  .block-list-item:hover {
    background: var(--tag-bg);
  }
  .block-list-thumb {
    width: 40px;
    height: 40px;
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
    gap: 1px;
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
  .block-list-type {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .block-grid.grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 2px;
      padding: 2px;
    }
  }
`;
