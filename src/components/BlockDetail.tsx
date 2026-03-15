import { useEffect } from 'react';
import type { ArenaBlock } from '../types';

interface Props {
  block: ArenaBlock;
  channelTitle: string;
  onClose: () => void;
  categories: string[] | null;
}

export function BlockDetail({ block, channelTitle, onClose, categories }: Props) {
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
              {(block.content || '').length < 200 && <span className="detail-text-mark">"</span>}
              <div dangerouslySetInnerHTML={{ __html: block.content_html }} />
            </div>
          )}

          <div className="detail-meta">
            <h3 className="detail-heading">
              {block.title || block.source?.title || 'Untitled'}
            </h3>

            <dl className="detail-fields">
              <div className="detail-field">
                <dt>Channel</dt>
                <dd>{channelTitle}</dd>
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
            </dl>

            {categories && categories.length > 0 && (
              <div className="detail-tags">
                {categories.map(c => (
                  <span key={c} className="detail-tag">{c}</span>
                ))}
              </div>
            )}

            {block.description && (
              <p className="detail-desc">{block.description}</p>
            )}

            {block.source?.url && (
              <a
                href={block.source.url}
                target="_blank"
                rel="noreferrer"
                className="detail-action"
              >
                Visit Source
              </a>
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
    font-family: var(--font-serif);
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
    font-family: var(--font-serif);
    font-size: 80px;
    line-height: 0.5;
    color: var(--text-muted);
    opacity: 0.15;
    margin-bottom: 20px;
    display: block;
    user-select: none;
  }
  .detail-meta {
    padding: 24px 28px 28px;
  }
  .detail-heading {
    font-family: var(--font-serif);
    font-size: 30px;
    font-weight: 400;
    letter-spacing: -0.5px;
    margin-bottom: 20px;
    line-height: 1.2;
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
  .detail-field dd { color: var(--text-secondary); }
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
  .detail-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .detail-tag {
    font-family: var(--font-serif);
    font-size: 14px;
    color: var(--text-muted);
    padding: 3px 12px;
    background: var(--accent-soft);
    border-radius: 20px;
  }
  .detail-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.65;
    margin-bottom: 18px;
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

  @media (max-width: 768px) {
    .detail-overlay {
      padding: 0;
      align-items: flex-end;
    }
    .detail-panel {
      max-height: 92vh;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      animation: detailSlideUpMobile 0.3s ease;
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
    }
    .detail-close:hover { color: #fff; }
    .detail-meta { padding: 18px 20px 24px; }
    .detail-heading { font-size: 24px; }
    .detail-text-body { padding: 20px; }
  }
`;
