import { useState } from 'react';
import type { ArenaChannel } from '../types';
import { clearToken } from '../api';

interface Props {
  channels: ArenaChannel[];
  selectedChannel: string | null;
  onSelectChannel: (slug: string | null) => void;
  username: string;
  loadedChannels: Set<string>;
  hiddenChannels: Set<string>;
  onToggleHidden: (slug: string) => void;
}

export function Sidebar({ channels, selectedChannel, onSelectChannel, username, loadedChannels, hiddenChannels, onToggleHidden }: Props) {
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
          <button className="sidebar-toggle" onClick={() => setCollapsed(false)} title="Expand">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </aside>
        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
          <h1 className="sidebar-title">Are.na Archive</h1>
          <button className="sidebar-toggle" onClick={() => { setCollapsed(true); setMobileOpen(false); }} title="Collapse">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="sidebar-user">@{username}</p>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${selectedChannel === null ? 'active' : ''}`}
          onClick={() => { onSelectChannel(null); setMobileOpen(false); }}
        >
          <span className="sidebar-item-title">All Channels</span>
          <span className="sidebar-item-count">{channels.length}</span>
        </button>

        <div className="sidebar-divider" />

        {filtered.map((ch) => (
          <div key={ch.id} className="sidebar-item-row">
            <button
              className={`sidebar-item ${selectedChannel === ch.slug ? 'active' : ''} ${hiddenChannels.has(ch.slug) ? 'dimmed' : ''}`}
              onClick={() => { onSelectChannel(ch.slug); setMobileOpen(false); }}
            >
              <span className="sidebar-item-title">
                {loadedChannels.has(ch.slug) && <span className="sidebar-item-dot" />}
                {ch.title}
              </span>
              <span className="sidebar-item-count">{ch.length}</span>
            </button>
            <button
              className={`sidebar-eye ${hiddenChannels.has(ch.slug) ? 'hidden-ch' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleHidden(ch.slug); }}
              title={hiddenChannels.has(ch.slug) ? 'Show in All view' : 'Hide from All view'}
            >
              {hiddenChannels.has(ch.slug) ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M5.6 5.6a2 2 0 002.8 2.8M1.5 7s2-4 5.5-4c.8 0 1.5.2 2.1.5M12.5 7s-2 4-5.5 4c-.8 0-1.5-.2-2.1-.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 7s2-4 5.5-4 5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              )}
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={() => { clearToken(); window.location.reload(); }}>
          Disconnect
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="mobile-sidebar-backdrop" onClick={() => setMobileOpen(false)}>
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
    padding-top: 14px;
    justify-content: center;
    z-index: 100;
  }
  .sidebar-header {
    padding: 24px 16px 0;
  }
  .sidebar-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sidebar-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }
  .sidebar-toggle {
    padding: 4px;
    border-radius: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }
  .sidebar-toggle:hover {
    color: var(--text);
  }
  .sidebar-user {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }
  .sidebar-search {
    padding: 14px 16px 8px;
  }
  .sidebar-search input {
    width: 100%;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    font-size: 12px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }
  .sidebar-search input:focus {
    border-color: var(--text-muted);
  }
  .sidebar-search input::placeholder {
    color: var(--text-muted);
  }
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px;
  }
  .sidebar-item-row {
    display: flex;
    align-items: center;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 8px;
    border-radius: var(--radius);
    font-size: 12px;
    text-align: left;
    transition: all 0.12s;
    gap: 8px;
  }
  .sidebar-item:hover {
    background: var(--tag-bg);
  }
  .sidebar-item.active {
    background: var(--tag-active);
    color: var(--tag-active-text);
  }
  .sidebar-item.dimmed {
    opacity: 0.45;
  }
  .sidebar-item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sidebar-item-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--ai-accent);
    flex-shrink: 0;
  }
  .sidebar-item-count {
    color: var(--text-muted);
    font-size: 10px;
    flex-shrink: 0;
  }
  .sidebar-item.active .sidebar-item-count {
    color: var(--tag-active-text);
    opacity: 0.5;
  }
  .sidebar-eye {
    padding: 4px;
    border-radius: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.12s, color 0.12s;
  }
  .sidebar-item-row:hover .sidebar-eye {
    opacity: 1;
  }
  .sidebar-eye.hidden-ch {
    opacity: 0.6;
  }
  .sidebar-eye:hover {
    color: var(--text-secondary);
  }
  .sidebar-divider {
    height: 1px;
    background: var(--border);
    margin: 4px 8px;
  }
  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }
  .sidebar-logout {
    font-size: 11px;
    color: var(--text-muted);
    transition: color 0.15s;
  }
  .sidebar-logout:hover {
    color: var(--text);
  }

  /* Mobile */
  .mobile-menu-btn {
    display: none;
    position: fixed;
    top: 11px;
    left: 10px;
    z-index: 90;
    padding: 6px;
    border-radius: var(--radius);
    color: var(--text);
    background: transparent;
  }
  .mobile-sidebar-backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 150;
    background: rgba(0,0,0,0.4);
  }
  .sidebar-mobile {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    border-right: 1px solid var(--border);
  }

  @media (max-width: 768px) {
    .sidebar-desktop {
      display: none;
    }
    .sidebar-collapsed {
      display: none;
    }
    .mobile-menu-btn {
      display: flex;
    }
    .mobile-sidebar-backdrop {
      display: block;
    }
    .sidebar-mobile {
      display: flex;
    }
  }
`;
