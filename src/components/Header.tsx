import { useRef, useEffect } from 'react';
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
  const catScrollRef = useRef<HTMLDivElement>(null);

  // Scroll active category into view
  useEffect(() => {
    if (!catScrollRef.current || !selectedCategory) return;
    const active = catScrollRef.current.querySelector('.cat-tab.active') as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  return (
    <header className="header">
      {/* Primary bar: title + controls */}
      <div className="header-bar">
        <div className="header-identity">
          <h2 className="header-title">
            {selectedChannelTitle || 'All References'}
          </h2>
          <span className="header-count">{totalBlocks}</span>
        </div>

        <div className="header-controls">
          <div className="header-types">
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
      </div>

      {/* Category navigation strip */}
      {hasBlocks && (
        <div className="header-cat-strip">
          {categories ? (
            <div className="cat-scroll" ref={catScrollRef}>
              <button
                className={`cat-tab ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => onSelectCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cat-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
                >
                  {cat}
                </button>
              ))}
              <div className="cat-actions">
                <button
                  className="cat-refresh"
                  onClick={onCategorize}
                  disabled={isCategorizing}
                  title="Re-curate"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={isCategorizing ? 'spinning' : ''}>
                    <path d="M10.5 2v3h-3M1.5 10V7h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2.3 4.5A4.5 4.5 0 0 1 10 3.5M9.7 7.5A4.5 4.5 0 0 1 2 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="cat-clear" onClick={onClearCategories} title="Clear curation">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2.5 2.5l6 6M8.5 2.5l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="cat-loading-state">
              {isCategorizing ? (
                <div className="cat-curating">
                  <div className="cat-curating-spinner" />
                  <span>Curating your archive...</span>
                </div>
              ) : categorizeError ? (
                <div className="cat-error-state">
                  <span className="cat-error-msg">{categorizeError.slice(0, 60)}</span>
                  <button className="cat-retry-btn" onClick={onCategorize}>Retry</button>
                </div>
              ) : null}
            </div>
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

  /* Primary bar */
  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 0 28px;
    height: var(--header-height);
  }
  .header-identity {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-shrink: 0;
    min-width: 0;
  }
  .header-title {
    font-family: var(--font-serif);
    font-size: 20px;
    font-weight: 400;
    letter-spacing: -0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .header-count {
    font-size: 11px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  /* Type filters */
  .header-types {
    display: flex;
    gap: 1px;
    background: var(--border-light);
    border-radius: var(--radius);
    padding: 2px;
  }
  .type-btn {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--text-muted);
    border-radius: 3px;
    transition: all var(--transition-fast);
    letter-spacing: 0.2px;
  }
  .type-btn:hover {
    color: var(--text-secondary);
  }
  .type-btn.active {
    color: var(--text);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
    font-weight: 500;
  }

  /* Search */
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

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* View toggle */
  .view-toggle {
    display: flex;
    gap: 2px;
    background: var(--border-light);
    border-radius: var(--radius);
    padding: 2px;
  }
  .view-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 6px;
    color: var(--text-muted);
    border-radius: 3px;
    transition: all var(--transition-fast);
  }
  .view-btn:hover { color: var(--text-secondary); }
  .view-btn.active {
    color: var(--text);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  /* Category strip */
  .header-cat-strip {
    border-top: 1px solid var(--border-light);
    min-height: 36px;
    display: flex;
    align-items: center;
  }
  .cat-scroll {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px 28px;
    overflow-x: auto;
    scrollbar-width: none;
    flex: 1;
  }
  .cat-scroll::-webkit-scrollbar { display: none; }

  .cat-tab {
    font-size: 11px;
    padding: 4px 12px;
    color: var(--text-muted);
    white-space: nowrap;
    border-radius: 20px;
    transition: all var(--transition-fast);
    letter-spacing: 0.1px;
  }
  .cat-tab:hover {
    color: var(--text-secondary);
    background: var(--accent-soft);
  }
  .cat-tab.active {
    color: var(--tag-active-text);
    background: var(--tag-active);
    font-weight: 500;
  }

  .cat-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: 8px;
    padding-left: 8px;
    border-left: 1px solid var(--border-light);
    flex-shrink: 0;
  }
  .cat-refresh, .cat-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    color: var(--text-muted);
    border-radius: var(--radius);
    transition: all var(--transition-fast);
  }
  .cat-refresh:hover, .cat-clear:hover {
    color: var(--text-secondary);
    background: var(--accent-soft);
  }
  .cat-refresh:disabled { opacity: 0.4; cursor: wait; }
  .cat-refresh .spinning {
    animation: spin 0.8s linear infinite;
  }

  /* Loading/error states */
  .cat-loading-state {
    padding: 0 28px;
    display: flex;
    align-items: center;
    height: 36px;
  }
  .cat-curating {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--text-muted);
  }
  .cat-curating-spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--border);
    border-top-color: var(--text-muted);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .cat-error-state {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cat-error-msg {
    font-size: 11px;
    color: #b55;
  }
  .cat-retry-btn {
    font-size: 11px;
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .cat-retry-btn:hover { color: var(--text); }

  @media (max-width: 768px) {
    .header-bar {
      padding: 0 14px 0 48px;
      gap: 8px;
      height: 46px;
      flex-wrap: wrap;
    }
    .header-identity {
      flex: 1;
      min-width: 0;
    }
    .header-title { font-size: 17px; }
    .header-types { display: none; }
    .header-search { width: 100px; font-size: 11px; }
    .header-search:focus { width: 140px; }
    .cat-scroll {
      padding: 4px 14px;
    }
    .cat-tab { font-size: 10px; padding: 3px 10px; }
    .cat-loading-state { padding: 0 14px; }
  }
`;
