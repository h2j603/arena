import { useState } from 'react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  blockTypeFilter: string;
  onBlockTypeFilterChange: (t: string) => void;
  tierFilter: string;
  onTierFilterChange: (t: string) => void;
  sortOrder: string;
  onSortOrderChange: (s: string) => void;
  totalBlocks: number;
  selectedChannelTitle?: string;
  selectMode: boolean;
  selectedCount: number;
  onToggleSelectMode: () => void;
  onCreateBoard: (name: string) => void;
  onShowAddBlock: () => void;
  hasSelectedChannel: boolean;
  viewingBoard?: boolean;
  viewingBoardId?: string | null;
  boardDescription?: string;
  onUpdateBoardDescription?: (id: string, desc: string) => void;
  onExportBoard?: () => void;
  onRefresh?: () => void;
  columnCount: number;
  onColumnCountChange: (n: number) => void;
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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'tier', label: 'By Tier' },
  { value: 'random', label: 'Random' },
];

const COLUMN_OPTIONS = [
  { value: 0, label: 'Auto', icon: 'Auto' },
  { value: 2, label: '2 columns', icon: '2' },
  { value: 3, label: '3 columns', icon: '3' },
  { value: 4, label: '4 columns', icon: '4' },
  { value: 5, label: '5 columns', icon: '5' },
];

export function Header({
  searchQuery,
  onSearchChange,
  blockTypeFilter,
  onBlockTypeFilterChange,
  tierFilter,
  onTierFilterChange,
  sortOrder,
  onSortOrderChange,
  totalBlocks,
  selectedChannelTitle,
  selectMode,
  selectedCount,
  onToggleSelectMode,
  onCreateBoard,
  onShowAddBlock,
  hasSelectedChannel,
  viewingBoard,
  onExportBoard,
  onRefresh,
  columnCount,
  onColumnCountChange,
  viewingBoardId,
  boardDescription,
  onUpdateBoardDescription,
}: Props) {
  const [boardName, setBoardName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descText, setDescText] = useState(boardDescription || '');

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
          <div className="header-title-wrap">
            <h2 className="header-title">
              {selectedChannelTitle || 'All References'}
            </h2>
            <span className="header-count">{totalBlocks}</span>
          </div>
          {viewingBoard && viewingBoardId && (
            <div className="header-board-desc">
              {editingDesc ? (
                <input
                  className="header-board-desc-input"
                  value={descText}
                  onChange={e => setDescText(e.target.value)}
                  placeholder="Add a description..."
                  autoFocus
                  onBlur={() => {
                    onUpdateBoardDescription?.(viewingBoardId, descText);
                    setEditingDesc(false);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      onUpdateBoardDescription?.(viewingBoardId, descText);
                      setEditingDesc(false);
                    }
                    if (e.key === 'Escape') {
                      setDescText(boardDescription || '');
                      setEditingDesc(false);
                    }
                  }}
                />
              ) : (
                <span
                  className="header-board-desc-text"
                  onClick={() => { setDescText(boardDescription || ''); setEditingDesc(true); }}
                >
                  {boardDescription || 'Add a description...'}
                </span>
              )}
            </div>
          )}
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
              {viewingBoard && onExportBoard && (
                <button className="header-btn" onClick={onExportBoard} title="Save board as PNG">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 9v2.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M7 2v7M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  PNG
                </button>
              )}
              {hasSelectedChannel && (
                <button className="header-btn" onClick={onShowAddBlock} title="Add a block to this channel">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Add
                </button>
              )}
              {onRefresh && (
                <button className="header-btn header-btn--refresh" onClick={onRefresh} title="Refresh">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11.5 7a4.5 4.5 0 11-1.3-3.2M10.2 2v1.8H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
        <span className="filter-divider" />
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.value}
            className={`type-btn ${sortOrder === s.value ? 'active' : ''}`}
            onClick={() => onSortOrderChange(s.value)}
          >
            {s.label}
          </button>
        ))}
        <span className="filter-divider" />
        {COLUMN_OPTIONS.map((c) => (
          <button
            key={c.value}
            className={`type-btn col-btn ${columnCount === c.value ? 'active' : ''}`}
            onClick={() => onColumnCountChange(c.value)}
            title={c.label}
          >
            {c.icon}
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
    flex-direction: column;
    min-width: 0;
    flex: 1;
    gap: 0;
  }
  .header-title-wrap {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .header-board-desc {
    margin-top: -2px;
  }
  .header-board-desc-text {
    font-size: 11px;
    color: var(--text-muted);
    cursor: pointer;
    transition: color var(--transition-fast);
  }
  .header-board-desc-text:hover { color: var(--text-secondary); }
  .header-board-desc-input {
    font-size: 11px;
    font-family: inherit;
    color: var(--text);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border);
    outline: none;
    padding: 0 0 2px;
    width: 240px;
  }
  .header-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
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
  .col-btn {
    font-variant-numeric: tabular-nums;
    min-width: 28px;
    text-align: center;
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
