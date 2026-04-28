import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Colour config matches Only Connect convention: yellow=easiest, purple=hardest
const COLOR_CONFIG = {
  yellow: { bg: '#854d0e', bgSolved: '#ca8a04', text: '#fef9c3', border: '#ca8a04' },
  green:  { bg: '#14532d', bgSolved: '#16a34a', text: '#dcfce7', border: '#16a34a' },
  blue:   { bg: '#1e3a8a', bgSolved: '#2563eb', text: '#dbeafe', border: '#2563eb' },
  purple: { bg: '#581c87', bgSolved: '#9333ea', text: '#f3e8ff', border: '#9333ea' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ConnectingWall({ data }) {
  const wallKeys = data?.walls ? Object.keys(data.walls) : [];
  const defaultWallKey = wallKeys.includes('A') ? 'A' : wallKeys[0] || 'A';
  const [wallKey, setWallKey] = useState(defaultWallKey);

  const wallData = data?.walls?.[wallKey] || (data?.groups ? data : null);

  const [tiles, setTiles]           = useState([]);
  const [selected, setSelected]     = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [lives, setLives]           = useState(4);
  const [shake, setShake]           = useState(false);
  const [flash, setFlash]           = useState(null); // 'correct' | 'wrong' | 'one-away'
  const [gameOver, setGameOver]     = useState(false);
  const [won, setWon]               = useState(false);

  // Build a flat shuffled tile list on mount / data change
  useEffect(() => {
    if (!wallData?.groups) return;
    const allTiles = wallData.groups.flatMap((g) =>
      g.tiles.map((t) => ({ text: t, group: g.name, color: g.color }))
    );
    setTiles(shuffle(allTiles));
    setSelected([]);
    setSolvedGroups([]);
    setLives(4);
    setGameOver(false);
    setWon(false);
  }, [wallData]);

  function toggleTile(tile) {
    if (gameOver) return;
    if (solvedGroups.some((g) => g.tiles.some((t) => t.text === tile.text))) return;

    setSelected((prev) => {
      const exists = prev.find((t) => t.text === tile.text);
      if (exists) return prev.filter((t) => t.text !== tile.text);
      if (prev.length >= 4) return prev; // max 4 selected
      return [...prev, tile];
    });
  }

  function submitGuess() {
    if (selected.length !== 4) return;

    const groupName = selected[0].group;
    const allSameGroup = selected.every((t) => t.group === groupName);

    if (allSameGroup) {
      // Correct!
      const groupData = wallData.groups.find((g) => g.name === groupName);
      const newSolved = [...solvedGroups, groupData];
      setSolvedGroups(newSolved);
      setSelected([]);
      setFlash('correct');
      setTimeout(() => setFlash(null), 900);

      if (newSolved.length === wallData.groups.length) {
        setWon(true);
        setGameOver(true);
      }
    } else {
      // Check if one away (3 of selected are in the same group)
      const groups = selected.map((t) => t.group);
      const counts = groups.reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {});
      const maxCount = Math.max(...Object.values(counts));
      const isOneAway = maxCount === 3;

      const newLives = lives - 1;
      setLives(newLives);
      setShake(true);
      setFlash(isOneAway ? 'one-away' : 'wrong');
      setTimeout(() => { setShake(false); setFlash(null); }, 900);

      if (newLives <= 0) {
        // Game over — reveal everything
        setGameOver(true);
        setWon(false);
      }
    }
  }

  function resetGame() {
    if (!wallData?.groups) return;
    const allTiles = wallData.groups.flatMap((g) =>
      g.tiles.map((t) => ({ text: t, group: g.name, color: g.color }))
    );
    setTiles(shuffle(allTiles));
    setSelected([]);
    setSolvedGroups([]);
    setLives(4);
    setGameOver(false);
    setWon(false);
  }

  if (!wallData?.groups) {
    return (
      <div className="round-page">
        <div className="round-header">
          <Link to="/" className="btn-back">← Back</Link>
          <h1 className="round-title">🧱 Connecting Wall</h1>
        </div>
        <div className="round-body">
          <p className="text-muted">No wall data found in quiz.json.</p>
        </div>
      </div>
    );
  }

  // Tiles not yet in a solved group
  const unsolved = tiles.filter(
    (t) => !solvedGroups.some((g) => g.name === t.group)
  );

  return (
    <div className="round-page">
      <div className="round-header">
        <Link to="/" className="btn-back">← Back</Link>
        <h1 className="round-title">🧱 Connecting Wall</h1>
        <span className="round-subtitle">{wallData?.prompt || 'Find four groups of four'}</span>
        {/* Lives */}
        <div className="lives-row">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={`life ${i < lives ? 'alive' : 'lost'}`}>♥</span>
          ))}
        </div>
      </div>

      {/* Wall selector */}
      {data?.walls && (
        <div className="wall-selector">
          {Object.keys(data.walls).sort().map((k) => (
            <button
              key={k}
              className={`btn btn-secondary btn-sm ${k === wallKey ? 'active' : ''}`}
              onClick={() => { setWallKey(k); }}
              disabled={k === wallKey}
              title={data.walls[k]?.prompt || `Wall ${k}`}
            >
              Wall {k}
            </button>
          ))}
        </div>
      )}

      {/* Flash banner */}
      {flash && (
        <div className={`flash-banner flash-${flash} animate-fade`}>
          {flash === 'correct'   && '✓ Correct!'}
          {flash === 'wrong'     && '✗ Not quite — try again'}
          {flash === 'one-away'  && '🔥 One away!'}
        </div>
      )}

      <div className="round-body">
        <div className="wall-container">
          {/* Solved groups at top */}
          {solvedGroups.map((g) => {
            const cfg = COLOR_CONFIG[g.color] || COLOR_CONFIG.purple;
            return (
              <div
                key={g.name}
                className="wall-solved-row animate-pop"
                style={{ background: cfg.bgSolved, borderColor: cfg.border }}
              >
                <span className="solved-name" style={{ color: cfg.text }}>{g.name}</span>
                <div className="solved-tiles">
                  {g.tiles.map((t) => (
                    <span key={t} className="solved-tile" style={{ color: cfg.text }}>{t}</span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Game over — reveal remaining groups */}
          {gameOver && !won && wallData.groups
            .filter((g) => !solvedGroups.find((s) => s.name === g.name))
            .map((g) => {
              const cfg = COLOR_CONFIG[g.color] || COLOR_CONFIG.purple;
              return (
                <div
                  key={g.name}
                  className="wall-solved-row animate-fade"
                  style={{ background: cfg.bg, borderColor: cfg.border, opacity: .7 }}
                >
                  <span className="solved-name" style={{ color: cfg.text }}>{g.name}</span>
                  <div className="solved-tiles">
                    {g.tiles.map((t) => (
                      <span key={t} className="solved-tile" style={{ color: cfg.text }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Active tile grid */}
          {!gameOver && (
            <div className={`wall-grid ${shake ? 'shake' : ''}`}>
              {unsolved.map((tile) => {
                const isSel = selected.find((t) => t.text === tile.text);
                return (
                  <button
                    key={tile.text}
                    className={`wall-tile ${isSel ? 'selected' : ''}`}
                    onClick={() => toggleTile(tile)}
                  >
                    {tile.text}
                  </button>
                );
              })}
            </div>
          )}

          {/* Controls */}
          {!gameOver ? (
            <div className="wall-controls">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelected([])}
                disabled={selected.length === 0}
              >
                Deselect All
              </button>
              <button
                className="btn btn-amber"
                onClick={submitGuess}
                disabled={selected.length !== 4}
              >
                Submit ({selected.length}/4)
              </button>
            </div>
          ) : (
            <div className="wall-end animate-fade">
              {won
                ? <p className="wall-end-msg win">🎉 Solved! Well done!</p>
                : <p className="wall-end-msg lose">😬 Out of lives — better luck next time!</p>
              }
              <button className="btn btn-primary mt-2" onClick={resetGame}>Play Again</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .lives-row { display: flex; gap: .35rem; }
        .life { font-size: 1.4rem; transition: opacity .2s; }
        .life.alive { color: #ef4444; }
        .life.lost  { color: var(--border); }

        .flash-banner {
          text-align: center;
          font-size: 1rem;
          font-weight: 700;
          padding: .5rem 1rem;
          border-radius: 8px;
          margin-bottom: .5rem;
          align-self: center;
        }
        .flash-correct  { background: #15803d; color: #dcfce7; }
        .flash-wrong    { background: #991b1b; color: #fee2e2; }
        .flash-one-away { background: #92400e; color: #fef3c7; }

        .wall-selector {
          display: flex;
          justify-content: center;
          gap: .5rem;
          margin: -.5rem 0 1rem;
          flex-wrap: wrap;
        }
        .wall-selector .btn.active {
          border-color: var(--purple);
          color: var(--text);
          background: rgba(139, 92, 246, .08);
        }

        .wall-container {
          display: flex;
          flex-direction: column;
          gap: .75rem;
          width: 100%;
          max-width: 680px;
        }

        /* Solved row */
        .wall-solved-row {
          border: 2px solid;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .solved-name {
          font-size: .8rem;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          min-width: 120px;
        }
        .solved-tiles { display: flex; gap: .5rem; flex-wrap: wrap; flex: 1; }
        .solved-tile {
          background: rgba(0,0,0,.25);
          border-radius: 6px;
          padding: .25rem .6rem;
          font-size: .9rem;
          font-weight: 700;
        }

        /* Tile grid */
        .wall-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: .6rem;
        }
        .wall-grid.shake { animation: wallShake .35s ease; }
        @keyframes wallShake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }
        .wall-tile {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          font-family: inherit;
          font-size: clamp(.75rem, 1.5vw, 1rem);
          font-weight: 700;
          padding: 1rem .5rem;
          cursor: pointer;
          text-align: center;
          transition: background .15s, border-color .15s, transform .1s;
          line-height: 1.3;
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wall-tile:hover { background: rgba(139, 92, 246, .06); border-color: var(--purple); }
        .wall-tile.selected {
          background: rgba(109, 40, 217, .14);
          border-color: var(--purple);
          transform: scale(1.04);
        }

        .wall-controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: .5rem;
        }
        .wall-end { text-align: center; }
        .wall-end-msg { font-size: 1.4rem; font-weight: 900; }
        .wall-end-msg.win  { color: var(--green); }
        .wall-end-msg.lose { color: var(--red); }
      `}</style>
    </div>
  );
}
