import { useState, useEffect, useCallback } from 'react';
import { getSlug, getToken, getUserChannels, getChannelContents } from './api';
import type { ArenaChannel, ArenaBlock, ViewMode } from './types';
import { Sidebar } from './components/Sidebar';
import { BlockGrid } from './components/BlockGrid';
import { Header } from './components/Header';
import './App.css';

interface ChannelData {
  channel: ArenaChannel;
  blocks: ArenaBlock[];
}

function App() {
  const username = getSlug();
  const [channels, setChannels] = useState<ArenaChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<Map<string, ChannelData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [blockTypeFilter, setBlockTypeFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState(`slug: "${username}" | token: "${getToken() ? getToken().slice(0, 8) + '...' : '(empty)'}"`);

  const loadChannels = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const ch = await getUserChannels(slug);
      setDebug(prev => prev + ` | channels: ${ch.length}`);
      setChannels(ch);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setDebug(prev => prev + ` | ERROR: ${msg}`);
      setError(`Failed to load: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[arena] slug:', username, 'token:', !!getSlug());
    if (username) {
      loadChannels(username);
    }
  }, [username, loadChannels]);

  const loadChannel = useCallback(async (slug: string) => {
    if (channelData.has(slug)) return;
    try {
      setLoadingBlocks(true);
      const data = await getChannelContents(slug);
      setChannelData((prev) => new Map(prev).set(slug, data));
    } catch {
      // silently fail for individual channels
    } finally {
      setLoadingBlocks(false);
    }
  }, [channelData]);

  const handleSelectChannel = (slug: string | null) => {
    setSelectedChannel(slug);
    if (slug) loadChannel(slug);
  };

  // Get all blocks across all loaded channels, or from selected channel
  const getAllBlocks = (): { block: ArenaBlock; channelTitle: string }[] => {
    const results: { block: ArenaBlock; channelTitle: string }[] = [];

    if (selectedChannel) {
      const data = channelData.get(selectedChannel);
      if (data) {
        data.blocks.forEach((b) => results.push({ block: b, channelTitle: data.channel.title }));
      }
    } else {
      channelData.forEach((data) => {
        data.blocks.forEach((b) => results.push({ block: b, channelTitle: data.channel.title }));
      });
    }

    return results
      .filter((item) => {
        if (blockTypeFilter !== 'all' && item.block.class.toLowerCase() !== blockTypeFilter) return false;
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
      .sort((a, b) => new Date(b.block.connected_at || b.block.created_at).getTime() - new Date(a.block.connected_at || a.block.created_at).getTime());
  };

  // Load first few channels on initial load for "all" view
  useEffect(() => {
    if (channels.length > 0 && channelData.size === 0) {
      const toLoad = channels.slice(0, 6);
      toLoad.forEach((ch) => {
        getChannelContents(ch.slug).then((data) => {
          setChannelData((prev) => new Map(prev).set(ch.slug, data));
        });
      });
    }
  }, [channels, channelData.size]);

  const debugBar = (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', color: '#0f0', fontSize: 11, padding: '6px 10px', zIndex: 9999, fontFamily: 'monospace', wordBreak: 'break-all' }}>
      {debug}
    </div>
  );

  if (error) {
    return (
      <div className="loading-screen">
        <p className="login-error">{error}</p>
        {debugBar}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your Are.na...</p>
        {debugBar}
      </div>
    );
  }

  const blocks = getAllBlocks();

  return (
    <div className="app-layout">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
        username={username}
        loadedChannels={new Set(channelData.keys())}
      />
      <main className="main-content">
        <Header
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          blockTypeFilter={blockTypeFilter}
          onBlockTypeFilterChange={setBlockTypeFilter}
          totalBlocks={blocks.length}
          selectedChannelTitle={selectedChannel ? channelData.get(selectedChannel)?.channel.title : undefined}
        />
        <BlockGrid
          blocks={blocks}
          viewMode={viewMode}
          loading={loadingBlocks && blocks.length === 0}
        />
      </main>
      {debugBar}
    </div>
  );
}

export default App;
