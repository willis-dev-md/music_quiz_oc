import { useNavigate } from 'react-router-dom';

const rounds = [
  {
    path: '/connections',
    emoji: '🔗',
    title: 'Connections',
    desc: 'What connects four clues? Fewer clues = more points.',
    color: '#8b5cf6',
  },
  {
    path: '/sequences',
    emoji: '▶️',
    title: 'Sequences',
    desc: "What comes next? Three items revealed — guess the fourth.",
    color: '#3b82f6',
  },
  {
    path: '/connecting-wall',
    emoji: '🧱',
    title: 'Connecting Wall',
    desc: 'Group 16 tiles into four sets of four.',
    color: '#f59e0b',
  },
  {
    path: '/missing-vowels',
    emoji: '❓',
    title: 'Missing Vowels',
    desc: 'Vowels removed — buzz in before anyone else!',
    color: '#22c55e',
  },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-logo">🎵</div>
        <h1 className="home-title">Music Quiz</h1>
        <p className="home-tagline">September 2026</p>
      </header>

      <div className="home-grid">
        {rounds.map((r) => (
          <button
            key={r.path}
            className="round-card"
            style={{ '--accent': r.color }}
            onClick={() => navigate(r.path)}
          >
            <span className="rc-emoji">{r.emoji}</span>
            <h2 className="rc-title">{r.title}</h2>
            <p className="rc-desc">{r.desc}</p>
            <span className="rc-arrow">→</span>
          </button>
        ))}
      </div>

      <style>{`
        .home-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 3rem;
        }
        .home-header { text-align: center; }
        .home-logo { font-size: 4rem; line-height: 1; margin-bottom: .5rem; }
        .home-title {
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 900;
          letter-spacing: .05em;
          text-transform: uppercase;
          background: linear-gradient(135deg, #1d4ed8, #6d28d9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .home-tagline {
          font-size: 1.1rem;
          color: var(--muted);
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-top: .25rem;
        }
        .home-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(260px, 1fr));
          gap: 1.5rem;
          width: 100%;
          max-width: 820px;
        }
        @media (max-width: 640px) {
          .home-grid { grid-template-columns: 1fr; }
        }
        .round-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: 2rem 1.5rem;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          color: var(--text);
          transition: border-color .2s, transform .15s, box-shadow .2s;
          position: relative;
          overflow: hidden;
        }
        .round-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--accent);
          opacity: 0;
          transition: opacity .2s;
        }
        .round-card:hover {
          border-color: var(--accent);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(17, 24, 39, .12);
        }
        .round-card:hover::before { opacity: 1; }
        .rc-emoji { font-size: 2.5rem; display: block; margin-bottom: .75rem; }
        .rc-title {
          font-size: 1.4rem;
          font-weight: 900;
          letter-spacing: .03em;
          color: var(--accent);
          margin-bottom: .5rem;
        }
        .rc-desc { font-size: .9rem; color: var(--muted); line-height: 1.5; }
        .rc-arrow {
          position: absolute;
          bottom: 1.2rem; right: 1.5rem;
          font-size: 1.5rem;
          color: var(--border);
          transition: color .2s, transform .2s;
        }
        .round-card:hover .rc-arrow {
          color: var(--accent);
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
