import { useState } from 'react';
import { addBlockToChannel } from '../api';

interface Props {
  channelSlug: string;
  channelTitle: string;
  onClose: () => void;
  onAdded: () => void;
}

export function AddBlockModal({ channelSlug, channelTitle, onClose, onAdded }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const value = input.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      await addBlockToChannel(channelSlug, value);
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add block');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addblock-overlay" onClick={onClose}>
      <div className="addblock-panel" onClick={e => e.stopPropagation()}>
        <h3 className="addblock-title">Add to {channelTitle}</h3>
        <p className="addblock-hint">Paste a URL to add a link, or type text content.</p>
        <textarea
          className="addblock-input"
          placeholder="https://... or text content"
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={4}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
        />
        {error && <p className="addblock-error">{error}</p>}
        <div className="addblock-actions">
          <button className="addblock-cancel" onClick={onClose}>Cancel</button>
          <button
            className="addblock-submit"
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
          >
            {loading ? 'Adding...' : 'Add Block'}
          </button>
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .addblock-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .addblock-panel {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px;
    width: 100%;
    max-width: 440px;
    box-shadow: var(--shadow-lg);
  }
  .addblock-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
  }
  .addblock-hint {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 16px;
  }
  .addblock-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    font-family: inherit;
    font-size: 13px;
    outline: none;
    resize: vertical;
    transition: border-color var(--transition);
  }
  .addblock-input:focus { border-color: var(--text-muted); }
  .addblock-input::placeholder { color: var(--text-muted); }
  .addblock-error {
    font-size: 12px;
    color: #c0392b;
    margin-top: 8px;
  }
  .addblock-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }
  .addblock-cancel {
    padding: 7px 16px;
    font-size: 12px;
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all var(--transition-fast);
  }
  .addblock-cancel:hover { border-color: var(--text-muted); }
  .addblock-submit {
    padding: 7px 18px;
    font-size: 12px;
    font-weight: 500;
    background: var(--accent);
    color: var(--bg);
    border-radius: var(--radius);
    transition: opacity var(--transition);
  }
  .addblock-submit:hover { opacity: 0.85; }
  .addblock-submit:disabled { opacity: 0.4; pointer-events: none; }
`;
