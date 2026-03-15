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
    <div className="detail-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="detail-content">
          {block.image && (
            <div className="detail-image">
              <img src={block.image.original.url} alt={block.title || ''} />
            </div>
          )}

          {block.class === 'Text' && block.content_html && (
            <div
              className="detail-text-content"
              dangerouslySetInnerHTML={{ __html: block.content_html }}
            />
          )}

          <div className="detail-meta">
            <h3 className="detail-title">
              {block.title || block.source?.title || 'Untitled'}
            </h3>

            <div className="detail-info">
              <div className="detail-info-row">
                <span className="detail-label">Channel</span>
                <span>{channelTitle}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-label">Type</span>
                <span>{block.class}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-label">Date</span>
                <span>{date}</span>
              </div>
              {block.source?.url && (
                <div className="detail-info-row">
                  <span className="detail-label">Source</span>
                  <a href={block.source.url} target="_blank" rel="noreferrer" className="detail-link">
                    {new URL(block.source.url).hostname}
                  </a>
                </div>
              )}
            </div>

            {categories && categories.length > 0 && (
              <div className="detail-categories">
                {categories.map(c => (
                  <span key={c} className="detail-cat-tag">{c}</span>
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
                className="detail-open-btn"
              >
                Open Source
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .detail-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .detail-modal {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          max-width: 800px;
          max-height: 85vh;
          width: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          border: 1px solid var(--border);
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
          transition: color 0.15s;
        }
        .detail-close:hover {
          color: var(--text);
        }
        .detail-content {
          overflow-y: auto;
        }
        .detail-image {
          background: var(--tag-bg);
          display: flex;
          justify-content: center;
        }
        .detail-image img {
          max-width: 100%;
          max-height: 55vh;
          object-fit: contain;
        }
        .detail-text-content {
          padding: 24px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text);
          max-height: 50vh;
          overflow-y: auto;
        }
        .detail-meta {
          padding: 20px 24px 24px;
        }
        .detail-title {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 300;
          letter-spacing: -0.5px;
          margin-bottom: 16px;
        }
        .detail-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .detail-info-row {
          display: flex;
          gap: 12px;
          font-size: 12px;
        }
        .detail-label {
          color: var(--text-muted);
          width: 60px;
          flex-shrink: 0;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .detail-link {
          color: var(--text-secondary);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .detail-categories {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .detail-cat-tag {
          font-family: var(--font-serif);
          font-size: 13px;
          font-style: italic;
          color: var(--text-secondary);
        }
        .detail-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .detail-open-btn {
          display: inline-block;
          padding: 7px 16px;
          background: var(--accent);
          color: var(--bg);
          border-radius: var(--radius);
          font-size: 12px;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .detail-open-btn:hover {
          opacity: 0.85;
        }

        @media (max-width: 768px) {
          .detail-backdrop {
            padding: 0;
            align-items: flex-end;
          }
          .detail-modal {
            max-height: 95vh;
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          }
          .detail-close {
            top: 10px;
            right: 10px;
            padding: 8px;
            background: rgba(0,0,0,0.55);
            color: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          .detail-meta {
            padding: 16px;
          }
          .detail-title {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
