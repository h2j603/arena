import { useRef, useEffect } from 'react';
import { FIXED_CATEGORIES } from '../categorize';

interface Props {
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

  useEffect(() => {
    if (!catScrollRef.current || !selectedCategory) return;
    const active = catScrollRef.current.querySelector('.cat-tab.active') as HTMLElement;
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  const displayCategories = categories || [...FIXED_CATEGORIES];
  const isLoaded = categories !== null;

  return (
    <header className="header">
      {/* Row 1: Title + search + view toggle */}
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

      {/* Row 2: Type filters — always visible, scrollable */}
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

      {/* Row 3: Category tabs — fixed structure, scrollable */}
      {hasBlocks && (
        <div className="header-cat-strip">
          <div className="cat-scroll" ref={catScrollRef}>
            <button
              className={`cat-tab ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => onSelectCategory(null)}
            >
              All
            </button>
            {displayCategories.map((cat) => (
              <button
                key={cat}
                className={`cat-tab ${selectedCategory === cat ? 'active' : ''} ${!isLoaded ? 'cat-tab--pending' : ''}`}
                onClick={() => isLoaded ? onSelectCategory(selectedCategory === cat ? null : cat) : undefined}
                disabled={!isLoaded}
              >
                {cat}
              </button>
            ))}
            {isLoaded && (
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
            )}
            {isCategorizing && (
              <div className="cat-loading-inline">
                <div className="cat-curating-spinner" />
              </div>
            )}
          </div>
          {categorizeError && (
            <div className="cat-error-inline">
              <span className="cat-error-msg">{categorizeError.slice(0, 40)}</span>
              <button className="cat-retry-btn" onClick={onCategorize}>Retry</button>
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
    max-width: 100vw;
    overflow: hidden;
  }

  /* Row 1 */
  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 28px;
    height: var(--header-height);
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
    flex-shrink: 0;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
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

  /* Row 2: Type filters — always visible, horizontally scrollable */
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

  /* Row 3: Category strip */
  .header-cat-strip {
    border-top: 1px solid var(--border-light);
    height: 36px;
    display: flex;
    align-items: center;
    max-width: 100%;
    overflow: hidden;
  }
  .cat-scroll {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 28px;
    overflow-x: auto;
    scrollbar-width: none;
    flex: 1;
    min-width: 0;
    height: 100%;
    -webkit-overflow-scrolling: touch;
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
    flex-shrink: 0;
  }
  .cat-tab:hover:not(:disabled) {
    color: var(--text-secondary);
    background: var(--accent-soft);
  }
  .cat-tab.active {
    color: var(--tag-active-text);
    background: var(--tag-active);
    font-weight: 500;
  }
  .cat-tab--pending {
    opacity: 0.35;
    cursor: default;
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

  .cat-loading-inline {
    display: flex;
    align-items: center;
    margin-left: 8px;
    flex-shrink: 0;
  }
  .cat-curating-spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--border);
    border-top-color: var(--text-muted);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .cat-error-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 28px;
    flex-shrink: 0;
  }
  .cat-error-msg {
    font-size: 10px;
    color: #b55;
    white-space: nowrap;
  }
  .cat-retry-btn {
    font-size: 10px;
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
  }
  .cat-retry-btn:hover { color: var(--text); }

  @media (max-width: 768px) {
    .header-bar {
      padding: 0 14px 0 48px;
      gap: 8px;
      height: 44px;
    }
    .header-title { font-size: 17px; }
    .header-search { width: 90px; font-size: 11px; padding-left: 24px; }
    .header-search:focus { width: 120px; }
    .search-icon { left: 6px; }

    .header-types-strip {
      padding: 0 14px;
      height: 30px;
      gap: 0;
    }
    .type-btn { font-size: 10px; padding: 2px 8px; }

    .header-cat-strip { height: 34px; }
    .cat-scroll { padding: 0 14px; gap: 3px; }
    .cat-tab { font-size: 10px; padding: 3px 10px; }
  }
`;
