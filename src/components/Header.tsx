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
}: Props) {
  return (
    <header className="header">
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

      <style>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          backdrop-filter: blur(8px);
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
          box-shadow: var(--shadow);
        }

        @media (max-width: 768px) {
          .header {
            padding: 10px 16px;
            flex-wrap: wrap;
          }
          .header-center {
            order: 3;
            width: 100%;
            justify-content: flex-start;
          }
          .header-search {
            width: 120px;
          }
        }
      `}</style>
    </header>
  );
}
