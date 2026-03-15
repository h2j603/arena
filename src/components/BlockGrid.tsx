import { useState, memo } from 'react';
import type { ArenaBlock, ViewMode } from '../types';
import { BlockDetail } from './BlockDetail';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  viewMode: ViewMode;
  loading: boolean;
  categoryAssignments: Record<string, string[]> | null;
}

// Deterministic color from channel name
function channelColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 58%)`;
}

// Get display title based on block type
function getDisplayTitle(block: ArenaBlock): string | null {
  switch (block.class) {
    case 'Image':
      // Image filenames are meaningless - don't show
      return null;
    case 'Text':
      // Text blocks rarely have titles - show content preview
      return block.content?.slice(0, 120)?.replace(/\n/g, ' ') || null;
    case 'Link':
      return block.source?.title || block.title || null;
    default:
      return block.title || null;
  }
}

// Get list title
function getListTitle(block: ArenaBlock): string {
  switch (block.class) {
    case 'Image':
      return block.description || 'Image';
    case 'Text':
      return block.content?.slice(0, 80)?.replace(/\n/g, ' ') || 'Text';
    case 'Link':
      return block.source?.title || block.title || 'Link';
    default:
      return block.title || block.class;
  }
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
  const color = channelColor(channelTitle);
  const displayTitle = getDisplayTitle(block);

  if (viewMode === 'list') {
    const isLink = block.class === 'Link';
    return (
      <div className="block-list-item" onClick={onClick}>
        <div className={`block-list-thumb ${isLink ? 'block-list-thumb-lg' : ''}`}>
          {block.image ? (
            <img src={block.image.thumb.url} alt="" />
          ) : (
            <div className="block-type-icon">{block.class[0]}</div>
          )}
        </div>
        <div className="block-list-info">
          <span className="block-list-title">
            {getListTitle(block)}
          </span>
          <span className="block-list-channel">
            <span className="channel-dot" style={{ background: color }} />
            {channelTitle}
          </span>
        </div>
        {categories && categories.length > 0 && (
          <span className="block-list-cat">{categories[0]}</span>
        )}
        <span className="block-list-type">{block.class}</span>
      </div>
    );
  }

  // Grid card - visual part differs by type
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
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 8.5l3-3M6 3.5L7.5 2a2.83 2.83 0 114 4L10 7.5M8 10.5L6.5 12a2.83 2.83 0 11-4-4L4 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="block-card-link-title">{block.source?.title || block.title || 'Link'}</span>
          {block.source?.url && (
            <span className="block-card-link-host">{new URL(block.source.url).hostname}</span>
          )}
        </div>
      );
    }
    return (
      <div className="block-card-fallback">
        <span>{block.class}</span>
      </div>
    );
  };

  return (
    <div className="block-card" onClick={onClick}>
      <div className="block-card-visual">
        {renderVisual()}
      </div>
      <div className="block-card-meta">
        <span className="block-card-channel">
          <span className="channel-dot" style={{ background: color }} />
          {channelTitle}
        </span>
        {displayTitle && (
          <span className="block-card-title">{displayTitle}</span>
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
    padding: 20px 24px;
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

  /* Channel color dot */
  .channel-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

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
    color: var(--text-muted);
    padding: 20px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .block-card-link svg {
    display: none;
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
    letter-spacing: 0.2px;
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
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .block-card-channel {
    font-size: 10px;
    color: var(--text-muted);
    letter-spacing: 0.2px;
    display: flex;
    align-items: center;
    gap: 5px;
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
  .block-card-cats {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .block-card-cat {
    font-size: 10px;
    color: var(--text-muted);
    font-style: italic;
  }
  .block-card-cat::before {
    content: '';
  }

  /* List item */
  .block-list-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
    overflow: hidden;
  }
  .block-list-item:hover {
    background: var(--tag-bg);
  }
  .block-list-thumb {
    width: 44px;
    height: 44px;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--tag-bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .block-list-thumb-lg {
    width: 56px;
    height: 56px;
  }
  .block-list-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .block-type-icon {
    font-size: 13px;
    font-weight: 400;
    color: var(--text-muted);
    font-family: var(--font-serif);
  }
  .block-list-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .block-list-title {
    font-size: 13px;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .block-list-channel {
    font-size: 11px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .block-list-cat {
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
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
      column-gap: 10px;
      padding: 10px;
    }
    .block-card {
      margin-bottom: 12px;
    }
    .block-card-meta {
      padding: 5px 0;
    }
    .block-card-channel {
      font-size: 9px;
    }
    .block-card-title {
      font-size: 11px;
      -webkit-line-clamp: 1;
    }
    .block-card-text {
      padding: 8px 0;
      font-size: 11px;
    }
    .block-card-text p {
      -webkit-line-clamp: 5;
    }
    .block-card-link {
      padding: 12px 0;
    }
    .block-card-link-title {
      font-size: 13px;
    }
    .block-list-item {
      padding: 8px 12px;
      gap: 10px;
    }
    .block-list-thumb {
      width: 36px;
      height: 36px;
    }
    .block-list-thumb-lg {
      width: 48px;
      height: 48px;
    }
  }
`;
