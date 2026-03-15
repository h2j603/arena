import { useState, useEffect, useCallback } from 'react';
import { setToken, getToken, setSlug, getSlug, getUserChannels, getChannelContents } from './api';
import type { ArenaChannel, ArenaBlock, ViewMode } from './types';
import { Sidebar } from './components/Sidebar';
import { BlockGrid } from './components/BlockGrid';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import './App.css';

interface ChannelData {
  channel: ArenaChannel;
  blocks: ArenaBlock[];
}

function App() {
  const [authenticated, setAuthenticated] = useState(() => {
    const hasToken = !!getToken();
    const hasSlug = !!getSlug();
    if (hasToken && hasSlug) {
      setToken(getToken());
      setSlug(getSlug());
      return true;
    }
    return false;
  });
  const [username, setUsername] = useState(() => getSlug());
  const [channels, setChannels] = useState<ArenaChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelData, setChannelData] = useState<Map<string, ChannelData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [blockTypeFilter, setBlockTypeFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const loadChannels = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const ch = await getUserChannels(slug);
      setChannels(ch);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Failed to load: ${msg}`);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated && username) {
      loadChannels(username);
    }
  }, [authenticated, username, loadChannels]);

  const handleLogin = (token: string, slug: string) => {
    setToken(token);
    setSlug(slug);
    setUsername(slug);
    setAuthenticated(true);
  };

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

  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} error={error} />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your Are.na...</p>
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
    </div>
  );
}

export default App;
