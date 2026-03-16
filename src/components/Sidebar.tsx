import { useState } from 'react';
import type { ArenaChannel } from '../types';
import { clearToken } from '../api';
import type { Board } from '../boards';
import { getChannelColor } from '../channelColors';

interface Props {
  channels: ArenaChannel[];
  selectedChannel: string | null;
  onSelectChannel: (slug: string | null) => void;
  username: string;
  loadedChannels: Set<string>;
  hiddenChannels: Set<string>;
  onToggleHidden: (slug: string) => void;
  boards: Board[];
  viewingBoard: string | null;
  onViewBoard: (id: string | null) => void;
  onDeleteBoard: (id: string) => void;
}

export function Sidebar({ channels, selectedChannel, onSelectChannel, username, loadedChannels: _loadedChannels, hiddenChannels, onToggleHidden, boards, viewingBoard, onViewBoard, onDeleteBoard }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = channels.filter((ch) =>
    ch.title.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <>
        <aside className="sidebar sidebar-collapsed">
          <button className="sidebar-expand" onClick={() => setCollapsed(false)} title="Expand">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </aside>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="3" y1="5.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="3" y1="12.5" x2="15" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <style>{sidebarStyles}</style>
      </>
    );
  }

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <div className="sidebar-brand">
            <h1 className="sidebar-title">Archive</h1>
            <span className="sidebar-user">@{username}</span>
          </div>
          <button className="sidebar-collapse" onClick={() => { setCollapsed(true); setMobileOpen(false); }} title="Collapse">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="sidebar-search-wrap">
        <svg className="sidebar-search-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7.5 7.5L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          className="sidebar-search"
          placeholder="Find channel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item sidebar-item-all ${selectedChannel === null ? 'active' : ''}`}
          onClick={() => { onSelectChannel(null); setMobileOpen(false); }}
        >
          <span className="sidebar-item-label">All Channels</span>
          <span className="sidebar-item-num">{channels.length}</span>
        </button>

        {boards.length > 0 && (
          <>
            <div className="sidebar-sep" />
            <div className="sidebar-section-label">Boards</div>
            {boards.map((board) => (
              <div key={board.id} className="sidebar-row">
                <button
                  className={`sidebar-item ${viewingBoard === board.id ? 'active' : ''}`}
                  onClick={() => { onViewBoard(board.id); setMobileOpen(false); }}
                >
                  <span className="sidebar-item-label">
                    <span className="sidebar-board-icon">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <rect x="0.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/>
                        <rect x="5.5" y="0.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/>
                        <rect x="0.5" y="5.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/>
                        <rect x="5.5" y="5.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="0.8"/>
                      </svg>
                    </span>
                    {board.name}
                  </span>
                  <span className="sidebar-item-num">{board.blockIds.length}</span>
                </button>
                <button
                  className="sidebar-vis"
                  onClick={(e) => { e.stopPropagation(); onDeleteBoard(board.id); }}
                  title="Delete board"
                  style={{ opacity: 0.3 }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M3 3l5 5M8 3l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </>
        )}

        <div className="sidebar-sep" />

        {filtered.map((ch) => (
          <div key={ch.id} className="sidebar-row">
            <button
              className={`sidebar-item ${selectedChannel === ch.slug ? 'active' : ''} ${hiddenChannels.has(ch.slug) ? 'dimmed' : ''}`}
              onClick={() => { onSelectChannel(ch.slug); setMobileOpen(false); }}
            >
              <span className="sidebar-item-label">
                <span className="sidebar-ch-dot" style={{ background: getChannelColor(ch.title) }} />
                {ch.title}
              </span>
              <span className="sidebar-item-num">{ch.length}</span>
            </button>
            <button
              className={`sidebar-vis ${hiddenChannels.has(ch.slug) ? 'is-hidden' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleHidden(ch.slug); }}
              title={hiddenChannels.has(ch.slug) ? 'Show in All view' : 'Hide from All view'}
            >
              {hiddenChannels.has(ch.slug) ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 2l9 9M5.2 5.2a1.8 1.8 0 002.6 2.6M1.5 6.5s1.8-3.5 5-3.5c.7 0 1.3.15 1.8.4M11.5 6.5s-1.8 3.5-5 3.5c-.7 0-1.3-.15-1.8-.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1.5 6.5s1.8-3.5 5-3.5 5 3.5 5 3.5-1.8 3.5-5 3.5-5-3.5-5-3.5z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  <circle cx="6.5" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.1"/>
                </svg>
              )}
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-disconnect" onClick={() => { clearToken(); window.location.reload(); }}>
          Disconnect
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="sidebar sidebar-desktop">
        {sidebarContent}
      </aside>

      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <line x1="3" y1="5.5" x2="15" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <line x1="3" y1="12.5" x2="15" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>

      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)}>
          <aside className="sidebar sidebar-mobile" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </aside>
        </div>
      )}

      <style>{sidebarStyles}</style>
    </>
  );
}

const sidebarStyles = `
  .sidebar {
    width: var(--sidebar-width);
    height: 100vh;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .sidebar-desktop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
  }
  .sidebar-collapsed {
    position: fixed;
    top: 0;
    left: 0;
    width: 40px;
    height: 100vh;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 16px;
    z-index: 100;
  }
  .sidebar-expand {
    padding: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    border-radius: var(--radius);
    transition: color var(--transition-fast);
  }
  .sidebar-expand:hover { color: var(--text); }

  /* Header */
  .sidebar-header {
    padding: 20px 16px 0;
  }
  .sidebar-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .sidebar-brand {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .sidebar-title {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1;
  }
  .sidebar-user {
    font-size: 11px;
    color: var(--text-muted);
  }
  .sidebar-collapse {
    padding: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    border-radius: var(--radius);
    transition: color var(--transition-fast);
    margin-top: 2px;
  }
  .sidebar-collapse:hover { color: var(--text); }

  /* Search */
  .sidebar-search-wrap {
    position: relative;
    padding: 14px 16px 6px;
  }
  .sidebar-search-icon {
    position: absolute;
    left: 25px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    margin-top: 4px;
  }
  .sidebar-search {
    width: 100%;
    padding: 6px 10px 6px 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    font-size: 11px;
    font-family: inherit;
    outline: none;
    transition: border-color var(--transition);
  }
  .sidebar-search:focus { border-color: var(--text-muted); }
  .sidebar-search::placeholder { color: var(--text-muted); }

  /* Navigation */
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 6px 8px;
  }
  .sidebar-row {
    display: flex;
    align-items: center;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 5px 8px;
    border-radius: var(--radius);
    font-size: 12px;
    text-align: left;
    transition: all var(--transition-fast);
    gap: 8px;
  }
  .sidebar-item:hover {
    background: var(--accent-soft);
  }
  .sidebar-item.active {
    background: var(--tag-active);
    color: var(--tag-active-text);
  }
  .sidebar-item.dimmed { opacity: 0.4; }
  .sidebar-item-all {
    font-weight: 500;
    margin-bottom: 2px;
  }
  .sidebar-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sidebar-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text-muted);
    flex-shrink: 0;
  }
  .sidebar-ch-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .sidebar-item-num {
    color: var(--text-muted);
    font-size: 10px;
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
  }
  .sidebar-item.active .sidebar-item-num {
    color: var(--tag-active-text);
    opacity: 0.5;
  }
  .sidebar-vis {
    padding: 3px;
    border-radius: var(--radius);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity var(--transition-fast), color var(--transition-fast);
  }
  .sidebar-row:hover .sidebar-vis { opacity: 1; }
  .sidebar-vis.is-hidden { opacity: 0.5; }
  .sidebar-vis:hover { color: var(--text-secondary); }
  .sidebar-section-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-muted);
    padding: 6px 8px 2px;
  }
  .sidebar-board-icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }
  .sidebar-sep {
    height: 1px;
    background: var(--border);
    margin: 4px 8px;
  }

  /* Footer */
  .sidebar-footer {
    padding: 10px 16px;
    border-top: 1px solid var(--border);
  }
  .sidebar-disconnect {
    font-size: 11px;
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }
  .sidebar-disconnect:hover { color: var(--text); }

  /* Mobile */
  .mobile-menu-btn {
    display: none;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 90;
    padding: 6px;
    border-radius: var(--radius);
    color: var(--text);
    background: transparent;
  }
  .mobile-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 150;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(2px);
  }
  .sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    border-right: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 768px) {
    .sidebar-desktop { display: none; }
    .sidebar-collapsed { display: none; }
    .mobile-menu-btn { display: flex; }
    .mobile-backdrop { display: block; }
    .sidebar-mobile { display: flex; }
  }
`;
