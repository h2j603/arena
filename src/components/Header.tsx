interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  blockTypeFilter: string;
  onBlockTypeFilterChange: (t: string) => void;
  totalBlocks: number;
  selectedChannelTitle?: string;
}

const BLOCK_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'text', label: 'Text' },
  { value: 'media', label: 'Media' },
  { value: 'attachment', label: 'File' },
];

export function Header({
  searchQuery,
  onSearchChange,
  blockTypeFilter,
  onBlockTypeFilterChange,
  totalBlocks,
  selectedChannelTitle,
}: Props) {
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
    font-family: var(--font-serif);
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
    .header-title { font-size: 22px; }
    .header-search { width: 90px; font-size: 11px; padding-left: 24px; }
    .header-search:focus { width: 120px; }
    .search-icon { left: 6px; }

    .header-types-strip {
      padding: 0 14px;
      height: 30px;
      gap: 0;
    }
    .type-btn { font-size: 10px; padding: 2px 8px; }
  }
`;
