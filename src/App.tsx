import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getSlug, getUserChannels, getChannelContents } from './api';
import type { ArenaChannel, ArenaBlock } from './types';
import { getTier } from './tiers';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [blockTypeFilter, setBlockTypeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [tierVersion, setTierVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(getHiddenChannels);

  const channelDataRef = useRef(channelData);
  channelDataRef.current = channelData;

  const loadingChannelsRef = useRef(new Set<string>());

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
    if (username) loadChannels(username);
  }, [username, loadChannels]);

  const loadChannel = useCallback(async (slug: string) => {
    if (channelDataRef.current.has(slug)) return;
    if (loadingChannelsRef.current.has(slug)) return;
    loadingChannelsRef.current.add(slug);
    try {
      setLoadingBlocks(true);
      const data = await getChannelContents(slug);
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
    if (slug) loadChannel(slug);
  }, [loadChannel]);

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

    if (selectedChannel) {
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
      .sort((a, b) =>
        new Date(b.block.connected_at || b.block.created_at).getTime() -
        new Date(a.block.connected_at || a.block.created_at).getTime()
      );
  }, [selectedChannel, channelData, allBlocks, blockTypeFilter, tierFilter, tierVersion, searchQuery]);

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
      />
      <main className="main-content">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          blockTypeFilter={blockTypeFilter}
          onBlockTypeFilterChange={setBlockTypeFilter}
          tierFilter={tierFilter}
          onTierFilterChange={setTierFilter}
          totalBlocks={blocks.length}
          selectedChannelTitle={selectedChannel ? channelData.get(selectedChannel)?.channel.title : undefined}
        />
        <BlockGrid
          blocks={blocks}
          allBlocks={allBlocks}
          loading={loadingBlocks && blocks.length === 0}
          onTierChange={() => setTierVersion(v => v + 1)}
        />
      </main>
    </div>
  );
}

export default App;
