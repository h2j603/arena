import { useEffect, useState } from 'react';
import type { ArenaBlock } from '../types';
import { findRelated } from '../recommend';
import { getTier, setTier as saveTier, TIERS, TIER_COLORS, type Tier } from '../tiers';
import { getNote, setNote } from '../notes';
import type { Board } from '../boards';
import { getChannelColor } from '../channelColors';

interface BlockItem {
  block: ArenaBlock;
  channelTitle: string;
}

interface Props {
  block: ArenaBlock;
  channelTitle: string;
  allBlocks: BlockItem[];
  onClose: () => void;
  onSelectBlock: (item: BlockItem) => void;
  onTierChange?: () => void;
  onNoteChange?: () => void;
  boards?: Board[];
  onAddToBoard?: (boardId: string, blockId: number) => void;
}

export function BlockDetail({ block, channelTitle, allBlocks, onClose, onSelectBlock, onTierChange, onNoteChange, boards, onAddToBoard }: Props) {
  const [related, setRelated] = useState<BlockItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [currentTier, setCurrentTier] = useState<Tier | null>(() => getTier(block.id));
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const [addedBoardId, setAddedBoardId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState(() => getNote(block.id));
  const [noteEditing, setNoteEditing] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    setCurrentTier(getTier(block.id));
    setNoteText(getNote(block.id));
    setNoteEditing(false);
    setShowBoardPicker(false);
    setAddedBoardId(null);
    setLoadingRelated(true);
    setRelated([]);
    findRelated({ block, channelTitle }, allBlocks)
      .then(setRelated)
      .catch(() => {})
      .finally(() => setLoadingRelated(false));
  }, [block.id, channelTitle, allBlocks]);

  const handleTier = (tier: Tier) => {
    const next = currentTier === tier ? null : tier;
    setCurrentTier(next);
    saveTier(block.id, next);
    onTierChange?.();
  };

  // Clean up ugly CDN filenames / long hashes for display
  const rawTitle = block.title || block.source?.title || 'Untitled';
  const isUglyFilename = /^[0-9a-f_\-]{20,}|stp=|_nc_|fbcdn/i.test(rawTitle);
  const displayTitle = isUglyFilename
    ? (block.description?.slice(0, 80) || block.source?.title || channelTitle)
    : rawTitle;

  const date = new Date(block.connected_at || block.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="detail-body">
          {block.image && (
            <div className="detail-visual">
              <img src={block.image.original.url} alt={block.title || ''} />
            </div>
          )}

          {block.class === 'Text' && block.content_html && (
            <div className={`detail-text-body ${(block.content || '').length < 200 ? 'detail-text-body--short' : ''}`}>
              {(block.content || '').length < 200 && <span className="detail-text-mark">&ldquo;</span>}
              <div dangerouslySetInnerHTML={{ __html: block.content_html }} />
            </div>
          )}

          <div className="detail-meta">
            <div className="detail-top-row">
              <h3 className="detail-heading">
                {displayTitle}
              </h3>
              <div className="detail-tier-buttons">
                {TIERS.map((t) => (
                  <button
                    key={t}
                    className={`tier-btn ${currentTier === t ? 'tier-btn--active' : ''}`}
                    style={{
                      '--tier-color': TIER_COLORS[t],
                    } as React.CSSProperties}
                    onClick={() => handleTier(t)}
                    title={`Tier ${t}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <dl className="detail-fields">
              <div className="detail-field">
                <dt>Channel</dt>
                <dd><span className="detail-ch-pill" style={{ background: getChannelColor(channelTitle) }} />{channelTitle}</dd>
              </div>
              <div className="detail-field">
                <dt>Type</dt>
                <dd>{block.class}</dd>
              </div>
              <div className="detail-field">
                <dt>Date</dt>
                <dd>{date}</dd>
              </div>
              {block.source?.url && (
                <div className="detail-field">
                  <dt>Source</dt>
                  <dd>
                    <a href={block.source.url} target="_blank" rel="noreferrer" className="detail-source-link">
                      {(() => { try { return new URL(block.source!.url).hostname; } catch { return block.source!.url; } })()}
                    </a>
                  </dd>
                </div>
              )}
              {currentTier && (
                <div className="detail-field">
                  <dt>Tier</dt>
                  <dd style={{ color: TIER_COLORS[currentTier], fontWeight: 600 }}>{currentTier}</dd>
                </div>
              )}
            </dl>

            {block.description && (
              <p className="detail-desc">{block.description}</p>
            )}

            <div className="detail-note">
              <div className="detail-note-header" onClick={() => setNoteEditing(true)}>
                <span className="detail-note-label">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 10h1.5L9.5 4l-1.5-1.5L2 8.5V10z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                    <path d="M7 3.5l1.5 1.5" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  Memo
                </span>
                {!noteEditing && noteText && (
                  <button className="detail-note-edit" onClick={(e) => { e.stopPropagation(); setNoteEditing(true); }}>Edit</button>
                )}
              </div>
              {noteEditing ? (
                <div className="detail-note-editor">
                  <textarea
                    className="detail-note-textarea"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note about this work..."
                    autoFocus
                    rows={3}
                  />
                  <div className="detail-note-actions">
                    <button
                      className="detail-note-save"
                      onClick={() => {
                        setNote(block.id, noteText);
                        setNoteEditing(false);
                        onNoteChange?.();
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="detail-note-cancel"
                      onClick={() => {
                        setNoteText(getNote(block.id));
                        setNoteEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : noteText ? (
                <p className="detail-note-text">{noteText}</p>
              ) : (
                <button className="detail-note-add" onClick={() => setNoteEditing(true)}>
                  + Add a note...
                </button>
              )}
            </div>

            <div className="detail-actions-row">
              {block.source?.url && (
                <a href={block.source.url} target="_blank" rel="noreferrer" className="detail-action">
                  Visit Source
                </a>
              )}
              {boards && boards.length > 0 && onAddToBoard && (
                <div className="detail-board-add-wrap">
                  <button
                    className="detail-action detail-action--secondary"
                    onClick={() => setShowBoardPicker(p => !p)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Board
                  </button>
                  {showBoardPicker && (
                    <div className="detail-board-picker">
                      {boards.map(b => {
                        const alreadyIn = b.blockIds.includes(block.id);
                        const justAdded = addedBoardId === b.id;
                        return (
                          <button
                            key={b.id}
                            className={`detail-board-option ${alreadyIn || justAdded ? 'detail-board-option--added' : ''}`}
                            onClick={() => {
                              if (!alreadyIn && !justAdded) {
                                onAddToBoard(b.id, block.id);
                                setAddedBoardId(b.id);
                                setTimeout(() => setAddedBoardId(null), 1200);
                              }
                            }}
                          >
                            <span className="detail-board-option-name">{b.name}</span>
                            <span className="detail-board-option-status">
                              {alreadyIn || justAdded ? 'Added' : `${b.blockIds.length}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related works */}
          <div className="detail-related">
            <h4 className="detail-related-title">Related in your archive</h4>
            {loadingRelated && (
              <div className="detail-related-loading">
                <div className="loading-spinner" />
              </div>
            )}
            {!loadingRelated && related.length > 0 && (
              <div className="detail-related-grid">
                {related.map((item) => (
                  <div
                    key={item.block.id}
                    className="detail-related-item"
                    onClick={() => onSelectBlock(item)}
                  >
                    {item.block.image ? (
                      <img
                        src={item.block.image.thumb.url}
                        alt=""
                        className="detail-related-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="detail-related-placeholder">
                        <span className="detail-related-placeholder-type">{item.block.class}</span>
                        <span className="detail-related-placeholder-title">
                          {(item.block.title || item.block.content || 'Untitled').slice(0, 60)}
                        </span>
                      </div>
                    )}
                    <span className="detail-related-label">
                      {item.block.title || item.channelTitle}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!loadingRelated && related.length === 0 && (
              <p className="detail-related-empty">No related works found</p>
            )}
          </div>
        </div>
      </div>

      <style>{detailStyles}</style>
    </div>
  );
}

const detailStyles = `
  .detail-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    animation: detailFadeIn 0.2s ease;
  }
  @keyframes detailFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .detail-panel {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    max-width: 760px;
    max-height: 85vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    animation: detailSlideUp 0.25s ease;
  }
  @keyframes detailSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .detail-close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    padding: 6px;
    border-radius: 50%;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
  }
  .detail-close:hover {
    color: var(--text);
    border-color: var(--border);
  }
  .detail-body {
    overflow-y: auto;
  }
  .detail-visual {
    background: var(--tag-bg);
    display: flex;
    justify-content: center;
  }
  .detail-visual img {
    max-width: 100%;
    max-height: 55vh;
    object-fit: contain;
  }
  .detail-text-body {
    padding: 36px 40px;
    font-size: 16px;
    line-height: 1.8;
    color: var(--text);
    max-height: 55vh;
    overflow-y: auto;
    font-family: var(--font-display);
  }
  .detail-text-body--short {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 56px 48px 48px;
    min-height: 220px;
    justify-content: center;
    background: var(--accent-soft);
  }
  .detail-text-body--short div {
    font-size: 28px;
    line-height: 1.35;
    font-weight: 400;
    letter-spacing: -0.5px;
  }
  .detail-text-mark {
    font-family: var(--font-display);
    font-size: 80px;
    line-height: 0.5;
    color: var(--text-muted);
    opacity: 0.15;
    margin-bottom: 20px;
    display: block;
    user-select: none;
  }
  .detail-meta {
    padding: 24px 28px 20px;
  }
  .detail-top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }
  .detail-heading {
    font-family: var(--font-display);
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.2;
    flex: 1;
    min-width: 0;
    word-break: break-word;
    overflow-wrap: break-word;
  }

  /* Tier buttons */
  .detail-tier-buttons {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    padding-top: 4px;
  }
  .tier-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: var(--tier-color);
    border: 1.5px solid var(--tier-color);
    background: transparent;
    opacity: 0.35;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tier-btn:hover {
    opacity: 0.7;
  }
  .tier-btn--active {
    opacity: 1;
    background: var(--tier-color);
    color: #fff;
  }

  .detail-fields {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .detail-field {
    display: flex;
    gap: 14px;
    font-size: 12px;
    line-height: 1.5;
  }
  .detail-field dt {
    color: var(--text-muted);
    width: 56px;
    flex-shrink: 0;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    padding-top: 1px;
  }
  .detail-field dd {
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .detail-ch-pill {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .detail-source-link {
    color: var(--text-secondary);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-color: var(--border);
    transition: text-decoration-color var(--transition-fast);
  }
  .detail-source-link:hover {
    text-decoration-color: var(--text-secondary);
  }
  .detail-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.65;
    margin-bottom: 18px;
  }
  /* Note / Memo */
  .detail-note {
    margin-bottom: 18px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 12px 14px;
    background: var(--accent-soft);
  }
  .detail-note-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }
  .detail-note-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .detail-note-edit {
    font-size: 10px;
    color: var(--text-muted);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .detail-note-edit:hover { color: var(--text-secondary); }
  .detail-note-text {
    font-size: 12px;
    line-height: 1.65;
    color: var(--text-secondary);
    margin-top: 8px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .detail-note-add {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 6px;
    display: block;
  }
  .detail-note-add:hover { color: var(--text-secondary); }
  .detail-note-editor {
    margin-top: 8px;
  }
  .detail-note-textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-card);
    color: var(--text);
    font-family: inherit;
    font-size: 12px;
    line-height: 1.6;
    padding: 8px 10px;
    resize: vertical;
    outline: none;
    min-height: 60px;
    transition: border-color var(--transition);
  }
  .detail-note-textarea:focus { border-color: var(--text-muted); }
  .detail-note-textarea::placeholder { color: var(--text-muted); }
  .detail-note-actions {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }
  .detail-note-save {
    padding: 4px 14px;
    font-size: 11px;
    background: var(--accent);
    color: var(--bg);
    border-radius: var(--radius);
    font-weight: 500;
  }
  .detail-note-save:hover { opacity: 0.85; }
  .detail-note-cancel {
    padding: 4px 14px;
    font-size: 11px;
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .detail-note-cancel:hover { color: var(--text-secondary); border-color: var(--text-muted); }

  .detail-actions-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .detail-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: var(--accent);
    color: var(--bg);
    border-radius: var(--radius);
    font-size: 12px;
    font-weight: 500;
    transition: opacity var(--transition);
    letter-spacing: 0.1px;
  }
  .detail-action:hover { opacity: 0.85; }
  .detail-action--secondary {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .detail-action--secondary:hover {
    border-color: var(--text-muted);
    color: var(--text);
    opacity: 1;
  }
  .detail-board-add-wrap {
    position: relative;
  }
  .detail-board-picker {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 0;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    min-width: 180px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
    padding: 4px;
  }
  .detail-board-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 10px;
    font-size: 11px;
    border-radius: var(--radius);
    transition: background var(--transition-fast);
    gap: 8px;
    text-align: left;
  }
  .detail-board-option:hover { background: var(--accent-soft); }
  .detail-board-option-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .detail-board-option-status {
    font-size: 10px;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  .detail-board-option--added .detail-board-option-status {
    color: #27ae60;
  }

  /* Related works */
  .detail-related {
    border-top: 1px solid var(--border-light);
    padding: 20px 28px 28px;
  }
  .detail-related-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
    margin-bottom: 14px;
  }
  .detail-related-loading {
    display: flex;
    justify-content: center;
    padding: 24px 0;
  }
  .detail-related-empty {
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
    padding: 16px 0;
  }
  .detail-related-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .detail-related-item {
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    transition: opacity var(--transition-fast);
  }
  .detail-related-item:hover {
    opacity: 0.8;
  }
  .detail-related-img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
    border-radius: 3px;
    background: var(--border-light);
  }
  .detail-related-placeholder {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    gap: 6px;
    text-align: center;
  }
  .detail-related-placeholder-type {
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-muted);
  }
  .detail-related-placeholder-title {
    font-size: 10px;
    color: var(--text-secondary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  .detail-related-label {
    display: block;
    font-size: 10px;
    color: var(--text-muted);
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    .detail-overlay {
      padding: 0;
      align-items: flex-end;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .detail-panel {
      max-height: none;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      animation: detailSlideUpMobile 0.3s ease;
      margin-top: auto;
    }
    @keyframes detailSlideUpMobile {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .detail-close {
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.5);
      color: #fff;
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      z-index: 20;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .detail-close:hover { color: #fff; }
    .detail-meta { padding: 18px 20px 16px; }
    .detail-heading {
      font-size: 18px;
      letter-spacing: -0.3px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }
    .detail-top-row {
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
    }
    .detail-tier-buttons {
      align-self: flex-start;
    }
    .tier-btn { width: 30px; height: 30px; font-size: 11px; }
    .detail-text-body { padding: 20px; font-size: 14px; }
    .detail-text-body--short div { font-size: 20px; }
    .detail-text-mark { font-size: 56px; }
    .detail-related { padding: 16px 20px 24px; }
    .detail-related-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .detail-board-picker {
      bottom: auto;
      top: calc(100% + 6px);
    }
  }
`;
