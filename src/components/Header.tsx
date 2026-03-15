import type { ViewMode } from '../types';

interface Props {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  blockTypeFilter: string;
  onBlockTypeFilterChange: (t: string) => void;
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

const BLOCK_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'text', label: 'Text' },
  { value: 'media', label: 'Media' },
  { value: 'attachment', label: 'File' },
];

export function Header({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  blockTypeFilter,
  onBlockTypeFilterChange,
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

        <div className="header-center">
          <div className="header-filters">
            {BLOCK_TYPES.map((t) => (
              <button
                key={t.value}
                className={`filter-tag ${blockTypeFilter === t.value ? 'active' : ''}`}
                onClick={() => onBlockTypeFilterChange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
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
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
              title="List view"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
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

      {/* AI Categories */}
      {(hasBlocks || categories) && (
        <div className="header-categories">
          {!categories && (
            <>
              <button
                className="categorize-btn"
                onClick={onCategorize}
                disabled={isCategorizing}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15"/>
                </svg>
                {isCategorizing ? 'Analyzing...' : 'Categorize with AI'}
              </button>
              {categorizeError && (
                <span className="categorize-error">Failed: {categorizeError.slice(0, 60)}</span>
              )}
            </>
          )}

          {categories && (
            <>
              <button
                className={`category-tag ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => onSelectCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-tag ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                >
                  {cat}
                </button>
              ))}
              <button className="clear-categories" onClick={onClearCategories} title="Clear categories">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
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
          font-size: 20px;
          font-weight: 400;
          letter-spacing: -0.3px;
        }
        .header-count {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 400;
        }
        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }
        .header-filters {
          display: flex;
          gap: 2px;
        }
        .filter-tag {
          padding: 4px 10px;
          border-radius: 2px;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .filter-tag:hover {
          color: var(--text);
        }
        .filter-tag.active {
          color: var(--text);
          font-weight: 500;
          border-bottom: 1.5px solid var(--text);
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
        .header-search::placeholder {
          color: var(--text-muted);
        }
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
        .view-btn.active {
          color: var(--text);
        }

        /* AI Categories row */
        .header-categories {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 24px 12px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .header-categories::-webkit-scrollbar {
          display: none;
        }
        .categorize-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          font-size: 11px;
          color: var(--text-muted);
          border: none;
          background: none;
          transition: color 0.15s;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .categorize-btn:hover:not(:disabled) {
          color: var(--text);
        }
        .categorize-btn:disabled {
          opacity: 0.5;
          cursor: wait;
        }
        .category-tag {
          padding: 0;
          font-size: 12px;
          color: var(--text-muted);
          background: none;
          transition: color 0.15s;
          white-space: nowrap;
          border: none;
        }
        .category-tag:hover {
          color: var(--text);
        }
        .category-tag.active {
          color: var(--text);
          font-weight: 500;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .clear-categories {
          padding: 2px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .clear-categories:hover {
          color: var(--text);
        }
        .categorize-error {
          font-size: 11px;
          color: #b55;
          white-space: nowrap;
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
          }
          .header-title {
            font-size: 17px;
          }
          .header-center {
            order: 3;
            width: 100%;
            justify-content: flex-start;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .header-center::-webkit-scrollbar {
            display: none;
          }
          .header-right {
            order: 2;
            width: 100%;
          }
          .header-search {
            flex: 1;
            width: auto;
          }
          .header-search:focus {
            width: auto;
          }
          .header-categories {
            padding: 0 12px 8px 52px;
          }
        }
      `}</style>
    </header>
  );
}
