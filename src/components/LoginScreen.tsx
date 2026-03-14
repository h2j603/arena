import { useState } from 'react';

interface Props {
  onLogin: (token: string) => void;
  error: string | null;
}

export function LoginScreen({ onLogin, error }: Props) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) onLogin(token.trim());
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1 className="login-title">Are.na Archive</h1>
        <p className="login-subtitle">
          Connect your Are.na to browse references by category
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="login-input"
            placeholder="Are.na Access Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoFocus
          />
          <button type="submit" className="login-button">
            Connect
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}
        <p className="login-help">
          Get your token at{' '}
          <a href="https://dev.are.na/oauth/applications" target="_blank" rel="noreferrer">
            dev.are.na/oauth/applications
          </a>
        </p>
      </div>

      <style>{`
        .login-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .login-box {
          max-width: 360px;
          width: 100%;
        }
        .login-title {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .login-subtitle {
          color: var(--text-secondary);
          margin-bottom: 28px;
          font-size: 13px;
        }
        .login-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg-card);
          color: var(--text);
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 10px;
        }
        .login-input:focus {
          border-color: var(--accent);
        }
        .login-button {
          width: 100%;
          padding: 10px;
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: var(--radius);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .login-button:hover {
          opacity: 0.85;
        }
        .login-error {
          color: #e55;
          font-size: 12px;
          margin-top: 12px;
        }
        .login-help {
          color: var(--text-muted);
          font-size: 11px;
          margin-top: 20px;
        }
        .login-help a {
          color: var(--text-secondary);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
