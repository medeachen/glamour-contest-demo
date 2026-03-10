import { useState, useRef } from 'react';

const CORRECT_PASSWORD = '1206';
const SESSION_KEY = 'glamour_auth';

interface PasswordPageProps {
  onAuthenticated: () => void;
}

export function PasswordPage({ onAuthenticated }: PasswordPageProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    if (value === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onAuthenticated();
    } else {
      setError(true);
      setShaking(true);
      setValue('');
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fce4ec 0%, #e8d5f5 40%, #d1e8ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div
        className={shaking ? 'shake' : ''}
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 28,
          padding: '48px 40px',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(180,140,220,0.18)',
          minWidth: 320,
          maxWidth: 380,
          width: '90%',
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 8 }}>🔐</div>
        <h1 style={{
          margin: '0 0 8px',
          fontSize: 26,
          fontWeight: 800,
          color: '#5a3e8c',
          letterSpacing: 2,
        }}>华丽大赛</h1>
        <p style={{ margin: '0 0 28px', color: '#999', fontSize: 14 }}>请输入密码以进入游戏</p>

        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false); }}
          onKeyDown={handleKeyDown}
          placeholder="输入密码"
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 18,
            border: `2px solid ${error ? '#f48fb1' : '#e0c8f8'}`,
            borderRadius: 12,
            outline: 'none',
            background: '#faf6ff',
            color: '#444',
            letterSpacing: 4,
            textAlign: 'center',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
        />

        {error && (
          <p style={{
            margin: '10px 0 0',
            color: '#e57373',
            fontSize: 13,
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease',
          }}>密码错误，请重试 😅</p>
        )}

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '13px 0',
            fontSize: 16,
            fontWeight: 700,
            color: 'white',
            background: 'linear-gradient(135deg, #c97ef5 0%, #7ba7f7 100%)',
            border: 'none',
            borderRadius: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(180,140,230,0.35)',
            transition: 'opacity 0.2s, transform 0.1s',
            letterSpacing: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          进入游戏 ✨
        </button>
      </div>
    </div>
  );
}

export { SESSION_KEY };
