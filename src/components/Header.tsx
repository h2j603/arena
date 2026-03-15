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
          backdrop-filter: blur(8px);
        }
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 24px;
        }
        .header-left {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-shrink: 0;
        }
        .header-title {
          font-size: 14px;
          font-weight: 600;
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
        }
        .header-filters {
          display: flex;
          gap: 4px;
        }
        .filter-tag {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--text-secondary);
          transition: all 0.15s;
        }
        .filter-tag:hover {
          background: var(--tag-bg);
        }
        .filter-tag.active {
          background: var(--tag-active);
          color: var(--tag-active-text);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .header-search {
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: transparent;
          color: var(--text);
          font-size: 12px;
          font-family: inherit;
          outline: none;
          width: 160px;
          transition: border-color 0.2s, width 0.2s;
        }
        .header-search::placeholder {
          color: var(--text-muted);
        }
        .header-search:focus {
          border-color: var(--text-muted);
          width: 200px;
        }
        .view-toggle {
          display: flex;
          gap: 2px;
          background: var(--tag-bg);
          border-radius: var(--radius);
          padding: 2px;
        }
        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 6px;
          border-radius: 3px;
          color: var(--text-muted);
          transition: all 0.15s;
        }
        .view-btn.active {
          background: var(--bg-card);
          color: var(--text);
          border: 1px solid var(--border);
        }

        /* AI Categories row */
        .header-categories {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 24px 10px;
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
          gap: 6px;
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--ai-accent);
          border: 1px solid var(--ai-accent);
          background: var(--ai-accent-soft);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .categorize-btn:hover:not(:disabled) {
          background: rgba(107, 92, 231, 0.15);
        }
        .categorize-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .category-tag {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--text-secondary);
          background: var(--tag-bg);
          transition: all 0.15s;
          white-space: nowrap;
          border: 1px solid transparent;
        }
        .category-tag:hover {
          color: var(--text);
          background: var(--border);
        }
        .category-tag.active {
          background: var(--ai-accent-soft);
          color: var(--ai-accent);
          border-color: var(--ai-accent);
        }
        .clear-categories {
          padding: 4px;
          border-radius: 50%;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .clear-categories:hover {
          color: var(--text);
        }
        .categorize-error {
          font-size: 11px;
          color: #c45a5a;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .header {
            padding-top: 0;
          }
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
            font-size: 13px;
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
          .header-filters {
            flex-wrap: nowrap;
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
