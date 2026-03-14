import { useState } from 'react';
import type { ArenaChannel } from '../types';
import { clearToken } from '../api';

interface Props {
  channels: ArenaChannel[];
  selectedChannel: string | null;
  onSelectChannel: (slug: string | null) => void;
  username: string;
  loadedChannels: Set<string>;
}

export function Sidebar({ channels, selectedChannel, onSelectChannel, username, loadedChannels }: Props) {
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
          <h1 className="sidebar-title">Are.na Archive</h1>
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
          <button
            key={ch.id}
            className={`sidebar-item ${selectedChannel === ch.slug ? 'active' : ''}`}
            onClick={() => onSelectChannel(ch.slug)}
          >
            <span className="sidebar-item-title">{ch.title}</span>
            <span className="sidebar-item-count">
              {loadedChannels.has(ch.slug) ? '●' : ch.length}
            </span>
          </button>
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
    padding: 20px 16px 0;
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
    padding: 7px 10px;
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
    border-color: var(--text-muted);
  }
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px;
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
    transition: background 0.15s;
    gap: 8px;
  }
  .sidebar-item:hover {
    background: var(--hover, var(--tag-bg));
  }
  .sidebar-item.active {
    background: var(--tag-bg);
    font-weight: 500;
  }
  .sidebar-item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .sidebar-item-count {
    color: var(--text-muted);
    font-size: 10px;
    flex-shrink: 0;
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

  @media (max-width: 768px) {
    .sidebar {
      display: none;
    }
  }
`;
