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

  const filtered = channels.filter((ch) =>
    ch.title.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <aside className="sidebar sidebar-collapsed">
        <button className="sidebar-toggle" onClick={() => setCollapsed(false)} title="Expand">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <style>{sidebarStyles}</style>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <h1 className="sidebar-title">Inspirations</h1>
          <button className="sidebar-toggle" onClick={() => setCollapsed(true)} title="Collapse">
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
          onClick={() => onSelectChannel(null)}
        >
          <span className="sidebar-item-title">All Channels</span>
          <span className="sidebar-item-count">{channels.length}</span>
        </button>

        <div className="sidebar-divider" />

        {filtered.map((ch) => (
          <div key={ch.id} className="sidebar-item-row">
            <button
              className={`sidebar-item ${selectedChannel === ch.slug ? 'active' : ''}`}
              onClick={() => onSelectChannel(ch.slug)}
            >
              <span className="sidebar-item-title">
                {loadedChannels.has(ch.slug) && <span className="sidebar-item-dot">&#9679;</span>}
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

      <style>{sidebarStyles}</style>
    </aside>
  );
}

const sidebarStyles = `
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: var(--sidebar-width);
    height: 100vh;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 100;
    overflow: hidden;
  }
  .sidebar-collapsed {
    width: 40px;
    align-items: center;
    padding-top: 14px;
  }
  .sidebar-header {
    padding: 28px 20px 0;
  }
  .sidebar-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sidebar-title {
    font-family: var(--font-serif);
    font-size: 22px;
    font-weight: 400;
    font-style: italic;
    color: var(--accent);
    letter-spacing: 0.3px;
  }
  .sidebar-toggle {
    padding: 4px;
    border-radius: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .sidebar-toggle:hover {
    color: var(--text);
  }
  .sidebar-user {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 4px;
    letter-spacing: 0.3px;
  }
  .sidebar-search {
    padding: 18px 20px 10px;
  }
  .sidebar-search input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 12px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }
  .sidebar-search input:focus {
    border-color: var(--accent);
  }
  .sidebar-search input::placeholder {
    color: var(--text-muted);
  }
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 4px 10px;
  }
  .sidebar-item-row {
    display: flex;
    align-items: center;
    gap: 0;
  }
  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 7px 10px;
    border-radius: var(--radius);
    font-size: 12px;
    text-align: left;
    transition: all 0.15s;
    gap: 8px;
  }
  .sidebar-item:hover {
    background: var(--tag-bg);
  }
  .sidebar-item.active {
    background: var(--accent-soft);
    color: var(--accent);
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
    font-size: 6px;
    color: var(--accent-green);
    flex-shrink: 0;
  }
  .sidebar-item-count {
    color: var(--text-muted);
    font-size: 10px;
    flex-shrink: 0;
  }
  .sidebar-eye {
    padding: 4px;
    border-radius: 4px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;
  }
  .sidebar-item-row:hover .sidebar-eye {
    opacity: 1;
  }
  .sidebar-eye.hidden-ch {
    opacity: 0.6;
    color: var(--text-muted);
  }
  .sidebar-eye:hover {
    color: var(--text-secondary);
  }
  .sidebar-divider {
    height: 1px;
    background: var(--border);
    margin: 6px 10px;
  }
  .sidebar-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--border);
  }
  .sidebar-logout {
    font-size: 11px;
    color: var(--text-muted);
    transition: color 0.2s;
    letter-spacing: 0.3px;
  }
  .sidebar-logout:hover {
    color: var(--accent);
  }

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }
  }
`;
