import { useState } from 'react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  blockTypeFilter: string;
  onBlockTypeFilterChange: (t: string) => void;
  tierFilter: string;
  onTierFilterChange: (t: string) => void;
  totalBlocks: number;
  selectedChannelTitle?: string;
  selectMode: boolean;
  selectedCount: number;
  onToggleSelectMode: () => void;
  onCreateBoard: (name: string) => void;
  onShowAddBlock: () => void;
  hasSelectedChannel: boolean;
}

const BLOCK_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'text', label: 'Text' },
  { value: 'media', label: 'Media' },
  { value: 'attachment', label: 'File' },
];

const TIER_FILTERS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'S', label: 'S' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'rated', label: 'Rated' },
  { value: 'unrated', label: 'Unrated' },
];

export function Header({
  searchQuery,
  onSearchChange,
  blockTypeFilter,
  onBlockTypeFilterChange,
  tierFilter,
  onTierFilterChange,
  totalBlocks,
  selectedChannelTitle,
  selectMode,
  selectedCount,
  onToggleSelectMode,
  onCreateBoard,
  onShowAddBlock,
  hasSelectedChannel,
}: Props) {
  const [boardName, setBoardName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleCreateBoard = () => {
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }
    const name = boardName.trim() || `Board ${new Date().toLocaleDateString('ko-KR')}`;
    onCreateBoard(name);
    setBoardName('');
    setShowNameInput(false);
  };

  return (
    <header className="header">
      <div className="header-bar">
        <div className="header-identity">
          <h2 className="header-title">
            {selectedChannelTitle || 'All References'}
          </h2>
          <span className="header-count">{totalBlocks}</span>
        </div>

        <div className="header-actions">
          {selectMode ? (
            <div className="select-bar">
              <span className="select-count">{selectedCount} selected</span>
              {showNameInput && (
                <input
                  className="board-name-input"
                  placeholder="Board name..."
                  value={boardName}
                  onChange={e => setBoardName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateBoard(); }}
                  autoFocus
                />
              )}
              <button
                className="header-btn header-btn--primary"
                onClick={handleCreateBoard}
                disabled={selectedCount === 0}
              >
                {showNameInput ? 'Save' : 'Create Board'}
              </button>
              <button className="header-btn" onClick={() => { onToggleSelectMode(); setShowNameInput(false); }}>
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button className="header-btn" onClick={onToggleSelectMode} title="Select blocks to create a moodboard">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Board
              </button>
              {hasSelectedChannel && (
                <button className="header-btn" onClick={onShowAddBlock} title="Add a block to this channel">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Add
                </button>
              )}
              <div className="search-wrap">
                <svg className="search-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8.5 8.5L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="header-search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="header-types-strip">
        {BLOCK_TYPES.map((t) => (
          <button
            key={t.value}
            className={`type-btn ${blockTypeFilter === t.value ? 'active' : ''}`}
            onClick={() => onBlockTypeFilterChange(t.value)}
          >
            {t.label}
          </button>
        ))}
        <span className="filter-divider" />
        {TIER_FILTERS.map((t) => (
          <button
            key={t.value}
            className={`type-btn ${tierFilter === t.value ? 'active' : ''}`}
            onClick={() => onTierFilterChange(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <style>{headerStyles}</style>
    </header>
  );
}

const headerStyles = `
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    max-width: 100vw;
    overflow: hidden;
  }

  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 28px;
    height: 60px;
  }
  .header-identity {
    display: flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .header-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 400;
    letter-spacing: -0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
  }
  .header-count {
    font-size: 12px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .header-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    font-size: 11px;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all var(--transition-fast);
    white-space: nowrap;
  }
  .header-btn:hover {
    border-color: var(--text-muted);
    color: var(--text);
  }
  .header-btn--primary {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
  }
  .header-btn--primary:hover {
    opacity: 0.85;
    color: var(--bg);
  }
  .header-btn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .select-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .select-count {
    font-size: 11px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .board-name-input {
    padding: 5px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    font-size: 11px;
    font-family: inherit;
    outline: none;
    width: 140px;
    transition: border-color var(--transition);
  }
  .board-name-input:focus { border-color: var(--text-muted); }
  .board-name-input::placeholder { color: var(--text-muted); }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-icon {
    position: absolute;
    left: 8px;
    color: var(--text-muted);
    pointer-events: none;
  }
  .header-search {
    padding: 5px 10px 5px 26px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    font-size: 12px;
    font-family: inherit;
    outline: none;
    width: 150px;
    transition: all var(--transition);
  }
  .header-search::placeholder { color: var(--text-muted); }
  .header-search:focus {
    border-color: var(--text-muted);
    width: 200px;
    background: var(--bg-card);
  }

  .header-types-strip {
    display: flex;
    gap: 1px;
    padding: 0 28px;
    border-top: 1px solid var(--border-light);
    height: 32px;
    align-items: center;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .header-types-strip::-webkit-scrollbar { display: none; }
  .type-btn {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--text-muted);
    border-radius: 3px;
    transition: all var(--transition-fast);
    letter-spacing: 0.2px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .filter-divider {
    width: 1px;
    height: 14px;
    background: var(--border);
    margin: 0 6px;
    flex-shrink: 0;
  }
  .type-btn:hover { color: var(--text-secondary); }
  .type-btn.active {
    color: var(--text);
    font-weight: 500;
    background: var(--accent-soft);
  }

  @media (max-width: 768px) {
    .header-bar {
      padding: 0 14px 0 48px;
      gap: 8px;
      height: 52px;
    }
    .header-title { font-size: 18px; letter-spacing: -0.3px; }
    .header-search { width: 90px; font-size: 11px; padding-left: 24px; }
    .header-search:focus { width: 120px; }
    .search-icon { left: 6px; }
    .header-btn { font-size: 10px; padding: 4px 8px; gap: 3px; }
    .board-name-input { width: 100px; font-size: 10px; }

    .header-types-strip {
      padding: 0 14px;
      height: 30px;
      gap: 0;
    }
    .type-btn { font-size: 10px; padding: 2px 8px; }
  }
`;
