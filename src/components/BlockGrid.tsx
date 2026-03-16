import { useState, memo, useEffect, useRef, useMemo, useCallback } from 'react';
import type { ArenaBlock } from '../types';
import { BlockDetail } from './BlockDetail';
import type { Board } from '../boards';
import { getChannelColor } from '../channelColors';
import { hasNote, getNote, setNote } from '../notes';
import { getTier, TIER_COLORS } from '../tiers';

interface Props {
  blocks: { block: ArenaBlock; channelTitle: string }[];
  allBlocks: { block: ArenaBlock; channelTitle: string }[];
  loading: boolean;
  onTierChange: () => void;
  selectMode: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  boards: Board[];
  onAddToBoard: (boardId: string, blockId: number) => void;
  noteVersion: number;
  onNoteChange: () => void;
  tierVersion: number;
  columnCount: number;
}

export function BlockGrid({ blocks, allBlocks, loading, onTierChange, selectMode, selectedIds, onToggleSelect, boards, onAddToBoard, noteVersion, onNoteChange, tierVersion, columnCount }: Props) {
  const [selectedBlock, setSelectedBlock] = useState<{ block: ArenaBlock; channelTitle: string } | null>(null);
  const [memoBlockId, setMemoBlockId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedCols, setComputedCols] = useState(2);

  // Compute number of columns based on container width when columnCount is auto (0)
  const updateCols = useCallback(() => {
    if (columnCount > 0) {
      setComputedCols(columnCount);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width <= 480) setComputedCols(2);
    else if (width <= 768) setComputedCols(2);
    else if (width <= 1024) setComputedCols(3);
    else if (width <= 1440) setComputedCols(Math.max(2, Math.floor(width / 300)));
    else setComputedCols(Math.max(2, Math.floor(width / 320)));
  }, [columnCount]);

  useEffect(() => {
    updateCols();
    const ro = new ResizeObserver(() => updateCols());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateCols]);

  // Distribute items across columns in row-first (round-robin) order
  const columns = useMemo(() => {
    const cols: { block: ArenaBlock; channelTitle: string }[][] = Array.from({ length: computedCols }, () => []);
    blocks.forEach((item, i) => {
      cols[i % computedCols].push(item);
    });
    return cols;
  }, [blocks, computedCols]);

  if (loading) {
    return <div className="grid-loading"><div className="loading-spinner" /></div>;
  }

  if (blocks.length === 0) {
    return (
      <div className="grid-empty">
        <p className="grid-empty-title">No references found</p>
        <p className="grid-empty-sub">Select a channel from the sidebar to explore</p>
      </div>
    );
  }

  return (
    <>
      <div className="block-grid" ref={containerRef}>
        {columns.map((col, colIdx) => (
          <div className="block-grid-col" key={colIdx}>
            {col.map((item) => (
              <BlockCard
                key={`${item.block.id}-${item.channelTitle}`}
                block={item.block}
                channelTitle={item.channelTitle}
                onClick={() => selectMode ? onToggleSelect(item.block.id) : setSelectedBlock(item)}
                selected={selectMode && selectedIds.has(item.block.id)}
                selectMode={selectMode}
                noteVersion={noteVersion}
                tierVersion={tierVersion}
                memoOpen={memoBlockId === item.block.id}
                onMemoToggle={(id) => setMemoBlockId(prev => prev === id ? null : id)}
                onNoteChange={onNoteChange}
              />
            ))}
          </div>
        ))}
      </div>

      {selectedBlock && (
        <BlockDetail
          block={selectedBlock.block}
          channelTitle={selectedBlock.channelTitle}
          allBlocks={allBlocks}
          onClose={() => setSelectedBlock(null)}
          onSelectBlock={(item) => setSelectedBlock(item)}
          onTierChange={onTierChange}
          onNoteChange={onNoteChange}
          boards={boards}
          onAddToBoard={onAddToBoard}
        />
      )}
      <style>{gridStyles}</style>
    </>
  );
}

function InlineMemo({ blockId, onNoteChange, onClose }: { blockId: number; onNoteChange?: () => void; onClose: () => void }) {
  const [text, setText] = useState(() => getNote(blockId));
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('.b-memo-popup');
      if (!el) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const save = () => {
    setNote(blockId, text);
    onNoteChange?.();
    onClose();
  };

  return (
    <div className="b-memo-popup" onClick={(e) => e.stopPropagation()}>
      <textarea
        ref={ref}
        className="b-memo-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a memo..."
        rows={3}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); }}
      />
      <div className="b-memo-actions">
        <button className="b-memo-save" onClick={save}>Save</button>
        <button className="b-memo-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

const BlockCard = memo(function BlockCard({
  block,
  channelTitle,
  onClick,
  selected,
  selectMode,
  noteVersion,
  tierVersion,
  memoOpen,
  onMemoToggle,
  onNoteChange,
}: {
  block: ArenaBlock;
  channelTitle: string;
  onClick: () => void;
  selected?: boolean;
  selectMode?: boolean;
  noteVersion?: number;
  tierVersion?: number;
  memoOpen?: boolean;
  onMemoToggle?: (id: number) => void;
  onNoteChange?: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const content = block.content || '';
  const isShortText = block.class === 'Text' && content.length < 140;
  const chColor = getChannelColor(channelTitle);
  void noteVersion;
  void tierVersion;
  const blockHasNote = hasNote(block.id);
  const blockTier = getTier(block.id);

  const selectCheck = selectMode ? (
    <span className={`b-select ${selected ? 'b-select--on' : ''}`}>
      {selected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </span>
  ) : null;

  const memoBtn = !selectMode ? (
    <button
      className={`b-memo-btn ${blockHasNote ? 'b-memo-btn--has' : ''}`}
      onClick={(e) => { e.stopPropagation(); onMemoToggle?.(block.id); }}
      title={blockHasNote ? 'Edit memo' : 'Add memo'}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2 10h1.5L9.5 4l-1.5-1.5L2 8.5V10z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <path d="M7 3.5l1.5 1.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    </button>
  ) : null;

  const memoPopup = memoOpen ? (
    <InlineMemo blockId={block.id} onNoteChange={onNoteChange} onClose={() => onMemoToggle?.(block.id)} />
  ) : null;

  // Image block
  if (block.image) {
    return (
      <div className={`b ${selected ? 'b--selected' : ''}`} onClick={onClick}>
        <div className="b-img-wrap">
          <img
            src={block.image.display.url}
            alt=""
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`b-img ${imgLoaded ? 'b-img--loaded' : ''}`}
          />
          {selectCheck}
          {memoBtn}
        </div>
        <div className="b-info">
          <span className="b-info-ch"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}{blockHasNote && <span className="b-note-inline" />}</span>
          {blockTier && <span className="b-info-tier" style={{ color: TIER_COLORS[blockTier] }}>{blockTier}</span>}
        </div>
        {memoPopup}
      </div>
    );
  }

  // Text block
  if (block.class === 'Text') {
    return (
      <div className={`b b-text ${isShortText ? 'b-text--short' : 'b-text--long'} ${selected ? 'b--selected' : ''}`} onClick={onClick}>
        {selectCheck}
        {memoBtn}
        <p className="b-text-content">{content.slice(0, isShortText ? 140 : 360)}</p>
        {!isShortText && <div className="b-text-fade" />}
        <div className="b-info b-info--inside">
          <span className="b-info-ch"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}{blockHasNote && <span className="b-note-inline" />}</span>
          {blockTier && <span className="b-info-tier" style={{ color: TIER_COLORS[blockTier] }}>{blockTier}</span>}
        </div>
        {memoPopup}
      </div>
    );
  }

  // Link block
  if (block.class === 'Link') {
    const domain = (() => {
      try { return block.source?.url ? new URL(block.source.url).hostname.replace('www.', '') : null; }
      catch { return null; }
    })();
    return (
      <div className={`b b-link ${selected ? 'b--selected' : ''}`} onClick={onClick}>
        {selectCheck}
        {memoBtn}
        <span className="b-link-title">{block.source?.title || block.title || 'Untitled'}</span>
        {domain && <span className="b-link-domain">{domain}</span>}
        <div className="b-info b-info--inside">
          <span className="b-info-ch"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}{blockHasNote && <span className="b-note-inline" />}</span>
          {blockTier && <span className="b-info-tier" style={{ color: TIER_COLORS[blockTier] }}>{blockTier}</span>}
        </div>
        {memoPopup}
      </div>
    );
  }

  // Fallback
  return (
    <div className={`b b-fallback ${selected ? 'b--selected' : ''}`} onClick={onClick}>
      {selectCheck}
      {memoBtn}
      <span className="b-fallback-type">{block.class}</span>
      {block.title && <span className="b-fallback-title">{block.title}</span>}
      <div className="b-info b-info--inside">
        <span className="b-info-ch"><span className="b-ch-dot" style={{ background: chColor }} />{channelTitle}{blockHasNote && <span className="b-note-inline" />}</span>
        {blockTier && <span className="b-info-tier" style={{ color: TIER_COLORS[blockTier] }}>{blockTier}</span>}
      </div>
      {memoPopup}
    </div>
  );
});

const gridStyles = `
  .block-grid {
    display: flex;
    gap: 16px;
    padding: 20px 28px 80px;
  }
  .block-grid-col {
    flex: 1;
    min-width: 0;
  }

  .grid-loading, .grid-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 20px;
    color: var(--text-muted);
    gap: 8px;
    text-align: center;
  }
  .grid-empty-title {
    font-family: var(--font-display);
    font-size: 24px;
    color: var(--text-secondary);
    font-weight: 700;
    letter-spacing: -0.3px;
  }
  .grid-empty-sub { font-size: 12px; }

  /* --- Block (base) --- */
  .b {
    margin-bottom: 16px;
    display: block;
    width: 100%;
    cursor: pointer;
    position: relative;
  }

  /* --- Select mode --- */
  .b--selected {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-radius: 4px;
  }
  .b-select {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.7);
    background: rgba(0,0,0,0.2);
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .b-select--on {
    background: var(--accent);
    border-color: var(--accent);
  }
  .b-text .b-select, .b-link .b-select, .b-fallback .b-select {
    border-color: var(--border);
    background: var(--bg-card);
  }
  .b-text .b-select--on, .b-link .b-select--on, .b-fallback .b-select--on {
    background: var(--accent);
    border-color: var(--accent);
  }

  /* --- Image --- */
  .b-img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.4s ease;
    background: var(--border-light);
    min-height: 40px;
  }
  .b-img--loaded { opacity: 1; }

  /* Image wrapper */
  .b-img-wrap {
    position: relative;
  }

  .b-ch-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
    margin-right: 4px;
    vertical-align: middle;
  }

  /* Info row below image */
  .b-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 2px 0;
    gap: 6px;
  }
  .b-info-ch {
    font-size: 9px;
    letter-spacing: 0.3px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .b-info-tier {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }
  .b-note-inline {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text-muted);
    display: inline-block;
    margin-left: 5px;
    vertical-align: middle;
    opacity: 0.7;
  }

  /* Info row inside text/link/fallback blocks */
  .b-info--inside {
    margin-top: 10px;
    padding: 0;
    opacity: 0.5;
    transition: opacity 0.2s ease;
  }
  .b:hover .b-info--inside { opacity: 0.8; }

  /* --- Text block --- */
  .b-text {
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    transition: border-color 0.2s ease;
    background: var(--bg-card);
  }
  .b-text:hover { border-color: var(--text-muted); }

  .b-text--short {
    padding: 16px 18px 10px;
  }
  .b-text--short .b-text-content {
    font-size: 13px;
    line-height: 1.55;
    color: var(--text);
  }

  .b-text--long {
    padding: 16px 18px 10px;
    max-height: 200px;
  }
  .b-text--long .b-text-content {
    font-size: 12px;
    line-height: 1.65;
    color: var(--text-secondary);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 8;
    overflow: hidden;
  }

  .b-text-fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 36px;
    background: linear-gradient(transparent, var(--bg-card));
    pointer-events: none;
  }

  /* --- Link block --- */
  .b-link {
    padding: 16px 18px 10px;
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: border-color 0.2s ease;
  }
  .b-link:hover { border-color: var(--text-muted); }
  .b-link-title {
    display: block;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text);
    word-break: break-word;
  }
  .b-link-domain {
    display: block;
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 4px;
    letter-spacing: 0.2px;
  }

  /* --- Fallback --- */
  .b-fallback {
    padding: 16px 18px 10px;
    border: 1px solid var(--border);
    border-radius: 4px;
    transition: border-color 0.2s ease;
  }
  .b-fallback:hover { border-color: var(--text-muted); }
  .b-fallback-type {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    display: block;
  }
  .b-fallback-title {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 6px;
    line-height: 1.4;
  }

  /* --- Inline memo button --- */
  .b-memo-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0,0,0,0.35);
    color: rgba(255,255,255,0.85);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.15s ease;
    cursor: pointer;
    backdrop-filter: blur(4px);
  }
  .b:hover .b-memo-btn, .b-memo-btn--has { opacity: 1; }
  .b-memo-btn--has {
    background: var(--accent);
    color: var(--bg);
  }
  .b-text .b-memo-btn, .b-link .b-memo-btn, .b-fallback .b-memo-btn {
    background: var(--bg-card);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }
  .b-text .b-memo-btn--has, .b-link .b-memo-btn--has, .b-fallback .b-memo-btn--has {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
  }

  /* --- Inline memo popup --- */
  .b-memo-popup {
    margin-top: 6px;
    padding: 8px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md, 6px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10;
    position: relative;
  }
  .b-memo-textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: var(--bg);
    color: var(--text);
    font-family: inherit;
    font-size: 11px;
    line-height: 1.5;
    padding: 6px 8px;
    resize: vertical;
    outline: none;
    min-height: 48px;
    transition: border-color 0.15s;
  }
  .b-memo-textarea:focus { border-color: var(--text-muted); }
  .b-memo-textarea::placeholder { color: var(--text-muted); }
  .b-memo-actions {
    display: flex;
    gap: 4px;
    margin-top: 4px;
    justify-content: flex-end;
  }
  .b-memo-save {
    padding: 3px 10px;
    font-size: 10px;
    background: var(--accent);
    color: var(--bg);
    border-radius: 4px;
    font-weight: 500;
  }
  .b-memo-save:hover { opacity: 0.85; }
  .b-memo-cancel {
    padding: 3px 10px;
    font-size: 10px;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 4px;
  }
  .b-memo-cancel:hover { color: var(--text-secondary); }

  /* --- Responsive --- */
  @media (max-width: 480px) {
    .block-grid {
      gap: 8px;
      padding: 8px;
    }
    .b { margin-bottom: 8px; }
    .b-info-ch { font-size: 7px; }
    .b-info-tier { font-size: 8px; }
    .b-text--short { padding: 10px 12px 8px; }
    .b-text--short .b-text-content { font-size: 11px; }
    .b-text--long { padding: 10px 12px 8px; max-height: 140px; }
    .b-text--long .b-text-content { font-size: 10px; -webkit-line-clamp: 5; }
    .b-link { padding: 10px 12px 8px; }
    .b-link-title { font-size: 10px; }
    .grid-empty-title { font-size: 16px; }
    .b-info--inside { margin-top: 4px; }
  }
  @media (min-width: 481px) and (max-width: 768px) {
    .block-grid {
      gap: 10px;
      padding: 10px;
    }
    .b { margin-bottom: 10px; }
    .b-info-ch { font-size: 8px; }
    .b-info-tier { font-size: 9px; }
    .b-text--short { padding: 12px 14px 8px; }
    .b-text--short .b-text-content { font-size: 12px; }
    .b-text--long { padding: 12px 14px 8px; max-height: 160px; }
    .b-text--long .b-text-content { font-size: 11px; -webkit-line-clamp: 6; }
    .b-link { padding: 12px 14px 8px; }
    .b-link-title { font-size: 11px; }
    .grid-empty-title { font-size: 18px; }
    .b-info--inside { margin-top: 6px; }
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    .block-grid {
      gap: 14px;
      padding: 16px 20px 80px;
    }
  }
`;
