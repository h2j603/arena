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

      {/* AI Category Row */}
      <div className="header-categories">
        {!categories && hasBlocks && (
          <button
            className="categorize-btn"
            onClick={onCategorize}
            disabled={isCategorizing}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15"/>
              <path d="M11 1l.5 1.5L13 3l-1.5.5L11 5l-.5-1.5L9 3l1.5-.5L11 1z" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15"/>
            </svg>
            {isCategorizing ? 'Analyzing...' : 'Categorize with AI'}
          </button>
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

      <style>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(12, 14, 9, 0.85);
          border-bottom: 1px solid var(--border);
          padding: 0;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 28px;
        }
        .header-left {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-shrink: 0;
        }
        .header-title {
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 400;
          color: var(--text);
          letter-spacing: 0.2px;
        }
        .header-count {
          font-size: 11px;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .header-filters {
          display: flex;
          gap: 2px;
        }
        .filter-tag {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--text-muted);
          transition: all 0.2s;
          letter-spacing: 0.2px;
        }
        .filter-tag:hover {
          color: var(--text-secondary);
          background: var(--tag-bg);
        }
        .filter-tag.active {
          background: var(--tag-active);
          color: var(--tag-active-text);
        }
        .header-search {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: transparent;
          color: var(--text);
          font-size: 12px;
          font-family: inherit;
          outline: none;
          width: 150px;
          transition: border-color 0.2s, width 0.3s;
        }
        .header-search::placeholder {
          color: var(--text-muted);
        }
        .header-search:focus {
          border-color: var(--accent);
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
          padding: 5px 7px;
          border-radius: 4px;
          color: var(--text-muted);
          transition: all 0.2s;
        }
        .view-btn.active {
          background: var(--bg-card);
          color: var(--accent);
          box-shadow: var(--shadow);
        }

        /* Category row */
        .header-categories {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 28px 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .header-categories::-webkit-scrollbar {
          display: none;
        }
        .header-categories:empty {
          display: none;
        }
        .categorize-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--accent);
          border: 1px solid var(--accent);
          background: var(--accent-soft);
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.2px;
        }
        .categorize-btn:hover:not(:disabled) {
          background: rgba(196, 165, 90, 0.2);
        }
        .categorize-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .category-tag {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--text-secondary);
          background: var(--tag-bg);
          transition: all 0.2s;
          white-space: nowrap;
          border: 1px solid transparent;
          letter-spacing: 0.2px;
        }
        .category-tag:hover {
          color: var(--text);
          background: rgba(255,255,255,0.08);
        }
        .category-tag.active {
          background: var(--accent-soft);
          color: var(--accent);
          border-color: var(--accent);
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

        @media (max-width: 768px) {
          .header-top {
            padding: 10px 16px;
            flex-wrap: wrap;
          }
          .header-filters {
            order: 3;
            width: 100%;
            overflow-x: auto;
          }
          .header-search {
            width: 120px;
          }
          .header-categories {
            padding: 0 16px 10px;
          }
        }
      `}</style>
    </header>
  );
}
