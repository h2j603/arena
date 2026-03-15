import type { ViewMode } from '../types';

interface Props {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalBlocks: number;
  selectedChannelTitle?: string;
  categories: string[] | null;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onCategorize: () => void;
  onClearCategories: () => void;
  isCategorizing: boolean;
  categorizeError: string | null;
  hasBlocks: boolean;
}

export function Header({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  totalBlocks,
  selectedChannelTitle,
  categories,
  selectedCategory,
  onSelectCategory,
  onCategorize,
  onClearCategories,
  isCategorizing,
  categorizeError,
  hasBlocks,
}: Props) {
  return (
    <header className="header">
      <div className="header-top">
        <div className="header-left">
          <h2 className="header-title">
            {selectedChannelTitle || 'All References'}
          </h2>
          <span className="header-count">{totalBlocks}</span>
        </div>

        <div className="header-right">
          <input
            type="text"
            className="header-search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Grid view"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => onViewModeChange('graph')}
              title="Graph view"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="3" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="11" cy="3" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="7" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="4.5" y1="4.8" x2="6" y2="9.5" stroke="currentColor" strokeWidth="1"/>
                <line x1="9.5" y1="4" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1"/>
                <line x1="4.8" y1="3.5" x2="9.2" y2="3" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category navigation — always visible when blocks loaded */}
      {hasBlocks && (
        <div className="header-categories">
          {categories ? (
            <>
              <button
                className={`cat-btn ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => onSelectCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                >
                  {cat}
                </button>
              ))}
              <button className="cat-reset" onClick={onClearCategories}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </>
          ) : (
            <button
              className="cat-curate-btn"
              onClick={onCategorize}
              disabled={isCategorizing}
            >
              {isCategorizing ? 'Curating...' : 'Curate with AI'}
            </button>
          )}
          {categorizeError && (
            <span className="cat-error">{categorizeError.slice(0, 50)}</span>
          )}
        </div>
      )}

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
  }
  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 24px;
  }
  .header-left {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-shrink: 0;
  }
  .header-title {
    font-family: var(--font-serif);
    font-size: 24px;
    font-weight: 300;
    letter-spacing: -0.5px;
  }
  .header-count {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 300;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .header-search {
    padding: 5px 0;
    border: none;
    border-bottom: 1px solid var(--border);
    border-radius: 0;
    background: transparent;
    color: var(--text);
    font-size: 12px;
    font-family: inherit;
    outline: none;
    width: 140px;
    transition: border-color 0.2s, width 0.2s;
  }
  .header-search::placeholder { color: var(--text-muted); }
  .header-search:focus {
    border-color: var(--text);
    width: 180px;
  }
  .view-toggle {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    color: var(--text-muted);
    transition: color 0.15s;
  }
  .view-btn.active { color: var(--text); }

  /* Category bar */
  .header-categories {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 24px 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .header-categories::-webkit-scrollbar { display: none; }

  .cat-btn {
    font-size: 11px;
    padding: 4px 10px;
    color: var(--text-muted);
    white-space: nowrap;
    transition: color 0.15s;
    border-bottom: 1.5px solid transparent;
  }
  .cat-btn:hover { color: var(--text); }
  .cat-btn.active {
    color: var(--text);
    font-weight: 500;
    border-bottom-color: var(--text);
  }
  .cat-reset {
    display: flex;
    align-items: center;
    padding: 4px;
    color: var(--text-muted);
    flex-shrink: 0;
    transition: color 0.15s;
    margin-left: 4px;
  }
  .cat-reset:hover { color: var(--text); }

  .cat-curate-btn {
    font-family: var(--font-serif);
    font-size: 13px;
    font-style: italic;
    color: var(--text-muted);
    transition: color 0.15s;
    white-space: nowrap;
  }
  .cat-curate-btn:hover:not(:disabled) { color: var(--text); }
  .cat-curate-btn:disabled { opacity: 0.5; cursor: wait; }

  .cat-error {
    font-size: 11px;
    color: #b55;
    white-space: nowrap;
    margin-left: 8px;
  }

  @media (max-width: 768px) {
    .header-top {
      padding: 10px 12px 10px 52px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .header-left {
      width: 100%;
      order: 1;
      justify-content: center;
      text-align: center;
    }
    .header-title { font-size: 20px; }
    .header-right { order: 2; width: 100%; }
    .header-search { flex: 1; width: auto; }
    .header-search:focus { width: auto; }
    .header-categories {
      padding: 0 12px 8px;
      gap: 2px;
    }
    .cat-btn { font-size: 10px; padding: 3px 8px; }
  }
`;
