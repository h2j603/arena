import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { getSlug, getUserChannels, getChannelContents } from './api';
import type { ArenaChannel, ArenaBlock } from './types';
import { getTier } from './tiers';
import { getBoards, createBoard, deleteBoard, addToBoard, updateBoardDescription, moveBlockInBoard, type Board } from './boards';
import { pullFromCloud, pushToCloud } from './sync';
import { Sidebar } from './components/Sidebar';
import { BlockGrid } from './components/BlockGrid';
import { Header } from './components/Header';
import { AddBlockModal } from './components/AddBlockModal';
import './App.css';

interface ChannelData {
  channel: ArenaChannel;
  blocks: ArenaBlock[];
}

function getHiddenChannels(): Set<string> {
  try {
    const raw = localStorage.getItem('arena_hidden_channels');
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveHiddenChannels(set: Set<string>) {
  localStorage.setItem('arena_hidden_channels', JSON.stringify([...set]));
  pushToCloud();
}

function App() {
  const username = getSlug();
  const [channels, setChannels] = useState<ArenaChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<Map<string, ChannelData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [blockTypeFilter, setBlockTypeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [tierVersion, setTierVersion] = useState(0);
  const [noteVersion, setNoteVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(getHiddenChannels);

  // Select mode for moodboards
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [boards, setBoards] = useState<Board[]>(getBoards);
  const [viewingBoard, setViewingBoard] = useState<string | null>(null);

  // Add block modal
  const [showAddBlock, setShowAddBlock] = useState(false);

  // Theme: 'auto' | 'light' | 'dark'
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('arena_theme') || 'auto';
  });

  useEffect(() => {
    if (theme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('arena_theme', theme);
  }, [theme]);

  // Column count (0 = auto)
  const [columnCount, setColumnCount] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('arena_col_count') || '0', 10); } catch { return 0; }
  });
  const handleColumnCountChange = useCallback((n: number) => {
    setColumnCount(n);
    localStorage.setItem('arena_col_count', String(n));
  }, []);

  const channelDataRef = useRef(channelData);
  channelDataRef.current = channelData;

  const loadingChannelsRef = useRef(new Set<string>());
  const channelLoadedAtRef = useRef(new Map<string, number>());

  const CHANNEL_TTL = 2 * 60 * 1000; // 2 minutes

  const loadChannels = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const ch = await getUserChannels(slug);
      setChannels(ch);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Failed to load: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync from Supabase on mount
  useEffect(() => {
    pullFromCloud().then((found) => {
      if (found) {
        setHiddenChannels(getHiddenChannels());
        setBoards(getBoards());
        setTierVersion(v => v + 1);
        setNoteVersion(v => v + 1);
      }
    });
  }, []);

  useEffect(() => {
    if (username) loadChannels(username);
  }, [username, loadChannels]);

  const loadChannel = useCallback(async (slug: string, force = false) => {
    if (!force && channelDataRef.current.has(slug)) {
      const loadedAt = channelLoadedAtRef.current.get(slug) || 0;
      if (Date.now() - loadedAt < CHANNEL_TTL) return;
    }
    if (loadingChannelsRef.current.has(slug)) return;
    loadingChannelsRef.current.add(slug);
    try {
      if (!channelDataRef.current.has(slug)) setLoadingBlocks(true);
      const data = await getChannelContents(slug);
      channelLoadedAtRef.current.set(slug, Date.now());
      setChannelData((prev) => new Map(prev).set(slug, data));
    } catch {
      // silently fail
    } finally {
      loadingChannelsRef.current.delete(slug);
      setLoadingBlocks(false);
    }
  }, []);

  const handleSelectChannel = useCallback((slug: string | null) => {
    setSelectedChannel(slug);
    setViewingBoard(null);
    if (slug) loadChannel(slug);
    window.scrollTo({ top: 0 });
  }, [loadChannel]);

  // Auto-refresh selected channel every 2 minutes
  useEffect(() => {
    if (!selectedChannel) return;
    const interval = setInterval(() => {
      loadChannel(selectedChannel, true);
    }, CHANNEL_TTL);
    return () => clearInterval(interval);
  }, [selectedChannel, loadChannel]);

  const handleRefresh = useCallback(() => {
    if (selectedChannel) {
      loadChannel(selectedChannel, true);
    } else if (username) {
      // Refresh all loaded channels
      channelLoadedAtRef.current.clear();
      setChannelData(new Map());
      loadChannels(username);
    }
  }, [selectedChannel, loadChannel, username, loadChannels]);

  const handleToggleHidden = useCallback((slug: string) => {
    setHiddenChannels(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      saveHiddenChannels(next);
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback((blockId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }, []);

  const handleCreateBoard = useCallback((name: string) => {
    if (selectedIds.size === 0) return;
    createBoard(name, [...selectedIds]);
    setBoards(getBoards());
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [selectedIds]);

  const handleDeleteBoard = useCallback((id: string) => {
    if (!window.confirm('Delete this board? This cannot be undone.')) return;
    deleteBoard(id);
    setBoards(getBoards());
    if (viewingBoard === id) setViewingBoard(null);
  }, [viewingBoard]);

  const handleUpdateBoardDescription = useCallback((id: string, desc: string) => {
    updateBoardDescription(id, desc);
    setBoards(getBoards());
  }, []);

  const handleMoveBlockInBoard = useCallback((boardId: string, blockId: number, direction: 'up' | 'down') => {
    moveBlockInBoard(boardId, blockId, direction);
    setBoards(getBoards());
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setBlockTypeFilter('all');
    setTierFilter('all');
    setSortOrder('newest');
  }, []);

  const handleExportBoard = useCallback(async () => {
    const grid = document.querySelector('.block-grid') as HTMLElement | null;
    if (!grid) return;
    const boardName = viewingBoard
      ? boards.find(b => b.id === viewingBoard)?.name || 'board'
      : 'board';
    try {
      const canvas = await html2canvas(grid, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f5f4f0',
        useCORS: true,
        allowTaint: true,
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${boardName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // silently fail
    }
  }, [viewingBoard, boards]);

  const handleAddToBoard = useCallback((boardId: string, blockId: number) => {
    addToBoard(boardId, [blockId]);
    setBoards(getBoards());
  }, []);

  const handleViewBoard = useCallback((id: string | null) => {
    setViewingBoard(id);
    if (id) {
      setSelectedChannel(null);
    }
    window.scrollTo({ top: 0 });
  }, []);

  // All blocks, deduplicated
  const allBlocks = useMemo(() => {
    const results: { block: ArenaBlock; channelTitle: string }[] = [];
    channelData.forEach((data, slug) => {
      if (hiddenChannels.has(slug)) return;
      data.blocks.forEach((b) => results.push({ block: b, channelTitle: data.channel.title }));
    });
    const seen = new Set<number>();
    return results.filter((item) => {
      if (seen.has(item.block.id)) return false;
      seen.add(item.block.id);
      return true;
    });
  }, [channelData, hiddenChannels]);

  const blocks = useMemo(() => {
    let source = allBlocks;

    // If viewing a board, filter to board blocks and preserve board order
    if (viewingBoard) {
      const board = boards.find(b => b.id === viewingBoard);
      if (board) {
        const blockMap = new Map(allBlocks.map(item => [item.block.id, item]));
        source = board.blockIds
          .map(id => blockMap.get(id))
          .filter((item): item is { block: ArenaBlock; channelTitle: string } => !!item);
      }
    } else if (selectedChannel) {
      const data = channelData.get(selectedChannel);
      if (data) {
        const seen = new Set<number>();
        source = data.blocks
          .map((b) => ({ block: b, channelTitle: data.channel.title }))
          .filter((item) => {
            if (seen.has(item.block.id)) return false;
            seen.add(item.block.id);
            return true;
          });
      } else {
        source = [];
      }
    }

    return source
      .filter((item) => {
        if (blockTypeFilter !== 'all' && item.block.class.toLowerCase() !== blockTypeFilter) return false;
        if (tierFilter !== 'all') {
          const t = getTier(item.block.id);
          if (tierFilter === 'rated' && !t) return false;
          if (tierFilter === 'unrated' && t) return false;
          if (['S', 'A', 'B', 'C'].includes(tierFilter) && t !== tierFilter) return false;
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const title = (item.block.title || '').toLowerCase();
          const desc = (item.block.description || '').toLowerCase();
          const content = (item.block.content || '').toLowerCase();
          const sourceTitle = (item.block.source?.title || '').toLowerCase();
          return title.includes(q) || desc.includes(q) || content.includes(q) || sourceTitle.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'oldest') {
          return new Date(a.block.connected_at || a.block.created_at).getTime() -
            new Date(b.block.connected_at || b.block.created_at).getTime();
        }
        if (sortOrder === 'tier') {
          const tierRank: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
          const ta = getTier(a.block.id);
          const tb = getTier(b.block.id);
          const ra = ta ? tierRank[ta] : 99;
          const rb = tb ? tierRank[tb] : 99;
          if (ra !== rb) return ra - rb;
        }
        if (sortOrder === 'random') {
          return Math.random() - 0.5;
        }
        // default: newest
        return new Date(b.block.connected_at || b.block.created_at).getTime() -
          new Date(a.block.connected_at || a.block.created_at).getTime();
      });
  }, [selectedChannel, channelData, allBlocks, blockTypeFilter, tierFilter, tierVersion, searchQuery, viewingBoard, boards, sortOrder]);

  // Batch-load first channels in parallel on initial load
  useEffect(() => {
    if (channels.length > 0 && channelData.size === 0) {
      const toLoad = channels.slice(0, 6);
      Promise.allSettled(
        toLoad.map((ch) => getChannelContents(ch.slug))
      ).then((results) => {
        setChannelData((prev) => {
          const next = new Map(prev);
          results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
              next.set(toLoad[i].slug, r.value);
            }
          });
          return next;
        });
      });
    }
  }, [channels, channelData.size]);

  const loadedChannels = useMemo(() => new Set(channelData.keys()), [channelData]);

  const currentTitle = viewingBoard
    ? boards.find(b => b.id === viewingBoard)?.name || 'Board'
    : selectedChannel
      ? channelData.get(selectedChannel)?.channel.title
      : undefined;

  const handleBlockAdded = useCallback(() => {
    // Reload the selected channel to pick up new block
    if (selectedChannel) {
      loadingChannelsRef.current.delete(selectedChannel);
      setChannelData(prev => {
        const next = new Map(prev);
        next.delete(selectedChannel);
        return next;
      });
      loadChannel(selectedChannel);
    }
    setShowAddBlock(false);
  }, [selectedChannel, loadChannel]);

  // Global keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('header-search-input')?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  if (error) {
    return (
      <div className="loading-screen">
        <p className="login-error">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-title">Everything That Inspires</p>
        <div className="loading-spinner" />
        <p className="loading-sub">Loading your archive...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
        username={username}
        loadedChannels={loadedChannels}
        hiddenChannels={hiddenChannels}
        onToggleHidden={handleToggleHidden}
        boards={boards}
        viewingBoard={viewingBoard}
        onViewBoard={handleViewBoard}
        onDeleteBoard={handleDeleteBoard}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          blockTypeFilter={blockTypeFilter}
          onBlockTypeFilterChange={setBlockTypeFilter}
          tierFilter={tierFilter}
          onTierFilterChange={setTierFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          totalBlocks={blocks.length}
          selectedChannelTitle={currentTitle}
          selectMode={selectMode}
          selectedCount={selectedIds.size}
          onToggleSelectMode={() => { setSelectMode(m => !m); setSelectedIds(new Set()); }}
          onCreateBoard={handleCreateBoard}
          onShowAddBlock={() => setShowAddBlock(true)}
          hasSelectedChannel={!!selectedChannel}
          viewingBoard={!!viewingBoard}
          viewingBoardId={viewingBoard}
          boardDescription={viewingBoard ? boards.find(b => b.id === viewingBoard)?.description : undefined}
          onUpdateBoardDescription={handleUpdateBoardDescription}
          onExportBoard={handleExportBoard}
          onRefresh={handleRefresh}
          columnCount={columnCount}
          onColumnCountChange={handleColumnCountChange}
        />
        <BlockGrid
          blocks={blocks}
          allBlocks={allBlocks}
          loading={loadingBlocks && blocks.length === 0}
          onTierChange={() => setTierVersion(v => v + 1)}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          boards={boards}
          onAddToBoard={handleAddToBoard}
          noteVersion={noteVersion}
          onNoteChange={() => setNoteVersion(v => v + 1)}
          tierVersion={tierVersion}
          columnCount={columnCount}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          viewingBoardId={viewingBoard}
          onMoveBlockInBoard={handleMoveBlockInBoard}
          onClearFilters={handleClearFilters}
          hasActiveFilters={searchQuery !== '' || blockTypeFilter !== 'all' || tierFilter !== 'all'}
        />
      </main>

      {showAddBlock && selectedChannel && (
        <AddBlockModal
          channelSlug={selectedChannel}
          channelTitle={channelData.get(selectedChannel)?.channel.title || selectedChannel}
          onClose={() => setShowAddBlock(false)}
          onAdded={handleBlockAdded}
        />
      )}
    </div>
  );
}

export default App;
