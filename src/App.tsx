import { useState, useEffect, useCallback } from 'react';
import { getSlug, getUserChannels, getChannelContents } from './api';
import { categorizeBlocks, clearCategoryCache } from './categorize';
import type { ArenaChannel, ArenaBlock, ViewMode } from './types';
import type { CategoryResult } from './categorize';
import { Sidebar } from './components/Sidebar';
import { BlockGrid } from './components/BlockGrid';
import { Header } from './components/Header';
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
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(getHiddenChannels);
  const [categoryResult, setCategoryResult] = useState<CategoryResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [categorizeError, setCategorizeError] = useState<string | null>(null);

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

  useEffect(() => {
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

  const handleToggleHidden = (slug: string) => {
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
  };

  const getAllBlocks = (): { block: ArenaBlock; channelTitle: string }[] => {
    const results: { block: ArenaBlock; channelTitle: string }[] = [];

    if (selectedChannel) {
      const data = channelData.get(selectedChannel);
      if (data) {
        data.blocks.forEach((b) => results.push({ block: b, channelTitle: data.channel.title }));
      }
    } else {
      channelData.forEach((data, slug) => {
        if (hiddenChannels.has(slug)) return;
        data.blocks.forEach((b) => results.push({ block: b, channelTitle: data.channel.title }));
      });
    }

    return results
      .filter((item) => {
        if (blockTypeFilter !== 'all' && item.block.class.toLowerCase() !== blockTypeFilter) return false;
        if (selectedCategory && categoryResult) {
          const assigned = categoryResult.assignments[String(item.block.id)];
          if (!assigned || !assigned.includes(selectedCategory)) return false;
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

  const handleCategorize = async () => {
    setIsCategorizing(true);
    setCategorizeError(null);
    try {
      const allBlocks: { id: number; title: string | null; type: string; description: string | null; channelTitle: string }[] = [];
      channelData.forEach((data) => {
        data.blocks.forEach((b) => {
          allBlocks.push({
            id: b.id,
            title: b.title,
            type: b.class,
            description: b.description,
            channelTitle: data.channel.title,
          });
        });
      });
      const result = await categorizeBlocks(allBlocks);
      setCategoryResult(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.error('Categorization failed:', msg);
      setCategorizeError(msg);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleClearCategories = () => {
    clearCategoryCache();
    setCategoryResult(null);
    setSelectedCategory(null);
  };

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

  const blocks = getAllBlocks();

  return (
    <div className="app-layout">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={handleSelectChannel}
        username={username}
        loadedChannels={new Set(channelData.keys())}
        hiddenChannels={hiddenChannels}
        onToggleHidden={handleToggleHidden}
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
          categories={categoryResult?.categories || null}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onCategorize={handleCategorize}
          onClearCategories={handleClearCategories}
          isCategorizing={isCategorizing}
          categorizeError={categorizeError}
          hasBlocks={channelData.size > 0}
        />
        <BlockGrid
          blocks={blocks}
          viewMode={viewMode}
          loading={loadingBlocks && blocks.length === 0}
          categoryAssignments={categoryResult?.assignments || null}
        />
      </main>
    </div>
  );
}

export default App;
