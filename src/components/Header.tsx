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

      {/* AI Categorize action */}
      {(hasBlocks || categories) && (
        <div className="header-categories">
          {!categories ? (
            <>
              <button
                className="categorize-btn"
                onClick={onCategorize}
                disabled={isCategorizing}
              >
                {isCategorizing ? 'Curating...' : 'Curate'}
              </button>
              {categorizeError && (
                <span className="categorize-error">{categorizeError.slice(0, 60)}</span>
              )}
            </>
          ) : (
            <button className="clear-categories" onClick={onClearCategories}>
              Reset curation
            </button>
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
        }
        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
          min-width: 0;
        }
        .header-filters {
          display: flex;
          gap: 2px;
        }
        .filter-tag {
          padding: 4px 10px;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .filter-tag:hover { color: var(--text); }
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

        .header-categories {
          padding: 0 24px 10px;
        }
        .categorize-btn {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
          text-transform: uppercase;
          transition: color 0.15s;
        }
        .categorize-btn:hover:not(:disabled) { color: var(--text); }
        .categorize-btn:disabled { opacity: 0.5; cursor: wait; }
        .clear-categories {
          font-size: 11px;
          color: var(--text-muted);
          transition: color 0.15s;
        }
        .clear-categories:hover { color: var(--text); }
        .categorize-error {
          font-size: 11px;
          color: #b55;
          margin-left: 8px;
        }

        @media (max-width: 768px) {
          .header-top {
            padding: 10px 12px 10px 52px;
            flex-wrap: wrap;
            gap: 6px;
          }
          .header-left { width: 100%; order: 1; }
          .header-title { font-size: 17px; }
          .header-center {
            order: 3;
            width: 100%;
            justify-content: flex-start;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .header-center::-webkit-scrollbar { display: none; }
          .header-right { order: 2; width: 100%; }
          .header-search { flex: 1; width: auto; }
          .header-search:focus { width: auto; }
          .header-categories { padding: 0 12px 8px 52px; }
        }
      `}</style>
    </header>
  );
}
