import { useState } from 'react';
import { Link } from 'react-router-dom';
import { normalizeSlot } from '../quiz/clueItem';

// Points for guessing after N clues revealed (1 = 5pts, 2 = 3pts, 3 = 2pts, 4 = 1pt)
const POINTS = [5, 3, 2, 1];
const TILE_COUNT = 6;
const TILE_ICONS = ['🎧', '🎤', '🎸', '🥁', '🎹', '🎼'];

function ClueSlotContent({ raw }) {
  const slot = normalizeSlot(raw);
  const [imgBroken, setImgBroken] = useState(false);

  if (slot.kind === 'text') {
    return <span className="clue-val">{slot.text || '?'}</span>;
  }

  const imgBlock =
    slot.src && !imgBroken ? (
      <div className="clue-media">
        <img
          className="clue-img"
          src={slot.src}
          alt={slot.alt || ''}
          loading="lazy"
          decoding="async"
          onError={() => setImgBroken(true)}
        />
      </div>
    ) : slot.src ? (
      <span className="clue-img-fallback text-muted">Image unavailable</span>
    ) : null;

  if (slot.kind === 'image') {
    return (
      <div className="clue-slot-inner">
        {imgBlock}
        {slot.caption ? <span className="clue-caption">{slot.caption}</span> : null}
      </div>
    );
  }

  return (
    <div className="clue-slot-inner">
      {imgBlock}
      {slot.text ? <span className="clue-val clue-val-text">{slot.text}</span> : null}
      {slot.caption ? <span className="clue-caption">{slot.caption}</span> : null}
    </div>
  );
}

export default function ConnectionsRound({ data = [] }) {
  const [qIndex, setQIndex]       = useState(0);
  const [mode, setMode]           = useState('pick'); // 'pick' | 'play'
  const [revealed, setRevealed]   = useState(1);   // how many clues shown (1–4)
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores]       = useState(Array(TILE_COUNT).fill(null)); // null=unanswered

  const q = data[qIndex];
  const playableCount = Math.min(TILE_COUNT, data.length);
  const totalScore = scores.slice(0, playableCount).reduce((s, v) => s + (v ?? 0), 0);

  function nextClue() {
    if (revealed < 4) setRevealed(revealed + 1);
  }

  function revealAnswer() {
    setShowAnswer(true);
  }

  function revealAllClues() {
    setRevealed(4);
  }

  function markCorrect() {
    const pts = POINTS[revealed - 1];
    const next = [...scores];
    next[qIndex] = pts;
    setScores(next);
    setShowAnswer(false);
    setRevealed(1);
    setMode('pick');
  }

  function markWrong() {
    const next = [...scores];
    next[qIndex] = 0;
    setScores(next);
    setShowAnswer(false);
    setRevealed(1);
    setMode('pick');
  }

  function restart() {
    setQIndex(0);
    setMode('pick');
    setRevealed(1);
    setShowAnswer(false);
    setScores(Array(TILE_COUNT).fill(null));
  }

  const allDone = scores.slice(0, playableCount).every((s) => s !== null);

  function pickTile(i) {
    if (i >= playableCount) return;
    if (scores[i] !== null) return;
    setQIndex(i);
    setRevealed(1);
    setShowAnswer(false);
    setMode('play');
  }

  if (!data.length) {
    return (
      <div className="round-page">
        <div className="round-header">
          <Link to="/" className="btn-back">← Back</Link>
          <h1 className="round-title">🔗 Connections</h1>
        </div>
        <div className="round-body">
          <p className="text-muted">No connections questions found in quiz.json.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="round-page">
      {/* Header */}
      <div className="round-header">
        <Link to="/" className="btn-back">← Back</Link>
        <h1 className="round-title">🔗 Connections</h1>
        <span className="round-subtitle">
          {mode === 'pick'
            ? 'Pick a tile'
            : `${TILE_ICONS[qIndex] || '⬤'} Tile ${qIndex + 1} / ${playableCount}`
          }
        </span>
        <span className="score-badge">Score: {totalScore}</span>
      </div>

      {/* Main area */}
      <div className="round-body">
        {allDone ? (
          /* ── Final scoreboard ── */
          <div className="final-screen animate-pop">
            <h2 className="final-title">Round Complete!</h2>
            <div className="final-score">{totalScore}</div>
            <p className="final-sub">points from {playableCount} tiles</p>
            <div className="final-breakdown">
              {data.slice(0, playableCount).map((d, i) => (
                <div key={i} className={`fb-row ${scores[i] > 0 ? 'correct' : 'wrong'}`}>
                  <span className="fb-num">Q{i + 1}</span>
                  <span className="fb-conn">{d.connection}</span>
                  <span className="fb-pts">{scores[i]} pt{scores[i] !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-3" onClick={restart}>
              Play Again
            </button>
          </div>
        ) : mode === 'pick' ? (
          <div className="conn-pick">
            <div className="pick-grid">
              {Array.from({ length: TILE_COUNT }).map((_, i) => {
                const playable = i < playableCount;
                const done = scores[i] !== null;
                return (
                  <button
                    key={i}
                    className={`pick-tile ${done ? 'done' : ''}`}
                    onClick={() => pickTile(i)}
                    disabled={!playable || done}
                  >
                    <span className="pick-num">
                      <span className="pick-icon" aria-hidden="true">{TILE_ICONS[i] || '⬤'}</span>
                      Tile {i + 1}
                    </span>
                    <span className="pick-status">
                      {!playable ? 'Not set' : done ? 'Used' : 'Play'}
                    </span>
                    {done ? <span className="pick-used-mark" aria-hidden="true">✓</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Active question ── */
          <div className="conn-layout">
            {/* Clue grid */}
            <div className="clue-grid">
              {q.clues.map((clue, i) => (
                <div
                  key={i}
                  className={`clue-tile ${i < revealed ? 'revealed animate-fade' : 'hidden'}`}
                >
                  <span className="clue-num">Clue {i + 1}</span>
                  {i < revealed ? (
                    <ClueSlotContent raw={clue} />
                  ) : (
                    <span className="clue-val">?</span>
                  )}
                  <span className="clue-pts-hint">{i < revealed ? `${POINTS[i]} pts if correct` : ''}</span>
                </div>
              ))}
            </div>

            {/* Answer box */}
            {showAnswer && (
              <div className="answer-box animate-fade">
                <div className="answer-label">The Connection</div>
                <div className="answer-text">{q.connection}</div>
                {revealed < 4 && (
                  <div className="flex flex-center mt-2">
                    <button className="btn btn-secondary btn-sm" onClick={revealAllClues}>
                      Reveal remaining clues
                    </button>
                  </div>
                )}
                <div className="flex flex-center flex-gap-1 mt-2">
                  <button className="btn btn-secondary btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={markWrong}>
                    ✗ Wrong
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ borderColor: '#22c55e', color: '#22c55e' }} onClick={markCorrect}>
                    ✓ Correct (+{POINTS[revealed - 1]} pts)
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            {!showAnswer && (
              <div className="conn-controls">
                <button
                  className="btn btn-secondary"
                  onClick={nextClue}
                  disabled={revealed >= 4}
                >
                  {revealed < 4 ? `Reveal Clue ${revealed + 1}` : 'All Clues Shown'}
                </button>
                <button className="btn btn-amber" onClick={revealAnswer}>
                  Show Answer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .conn-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          width: 100%;
          max-width: 700px;
        }

        /* Pick screen */
        .conn-pick { width: 100%; max-width: 700px; }
        .pick-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
        }
        .pick-tile {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem 1rem;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: .35rem;
          transition: border-color .2s, background .2s, transform .1s;
          min-height: 92px;
          position: relative;
        }
        .pick-tile:hover:not(:disabled) { border-color: var(--purple); background: rgba(139, 92, 246, .06); transform: translateY(-1px); }
        .pick-tile:disabled { opacity: .45; cursor: not-allowed; transform: none; }
        .pick-tile.done {
          border-color: rgba(22, 163, 74, .35);
          background: var(--success-tint);
        }
        .pick-num {
          font-size: .75rem;
          font-weight: 900;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--primary);
          display: inline-flex;
          align-items: center;
          gap: .5rem;
        }
        .pick-icon { font-size: 1.05rem; line-height: 1; }
        .pick-status { font-size: 1.1rem; font-weight: 800; color: var(--text); }
        .pick-used-mark {
          position: absolute;
          top: .6rem;
          right: .75rem;
          font-weight: 900;
          font-size: 1rem;
          color: var(--success);
        }
        .clue-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          width: 100%;
        }
        .clue-tile {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 14px;
          padding: 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: .35rem;
          min-height: 120px;
          justify-content: center;
          transition: border-color .2s, background .2s;
        }
        .clue-tile.revealed {
          border-color: var(--primary);
          background: var(--primary-tint);
        }
        .clue-tile.hidden { opacity: .35; }
        .clue-num {
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--primary);
        }
        .clue-val {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--text);
        }
        .clue-tile.revealed .clue-val { color: var(--text); }
        .clue-slot-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .5rem;
          width: 100%;
          min-height: 3rem;
          justify-content: center;
        }
        .clue-media {
          width: 100%;
          max-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 10px;
          background: var(--surface-2, #f3f4f6);
        }
        .clue-img {
          max-width: 100%;
          max-height: 140px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .clue-img-fallback {
          font-size: .85rem;
          font-weight: 600;
        }
        .clue-val-text { font-size: 1.15rem !important; }
        .clue-caption {
          font-size: .75rem;
          font-weight: 600;
          color: var(--muted);
          line-height: 1.3;
        }
        .clue-pts-hint {
          font-size: .7rem;
          color: var(--warning);
          font-weight: 600;
        }
        .conn-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Final screen */
        .final-screen {
          text-align: center;
          max-width: 540px;
          width: 100%;
        }
        .final-title {
          font-size: 2rem;
          font-weight: 900;
          color: var(--amber);
          margin-bottom: .5rem;
        }
        .final-score {
          font-size: 5rem;
          font-weight: 900;
          color: var(--green);
          line-height: 1;
        }
        .final-sub { color: var(--muted); margin-bottom: 1.5rem; }
        .final-breakdown {
          display: flex;
          flex-direction: column;
          gap: .5rem;
          margin-bottom: 1rem;
        }
        .fb-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: .6rem 1rem;
          font-size: .9rem;
        }
        .fb-row.correct { border-color: #15803d; }
        .fb-row.wrong   { border-color: #7f1d1d; opacity: .7; }
        .fb-num { font-weight: 700; color: var(--muted); min-width: 2rem; }
        .fb-conn { flex: 1; text-align: left; font-weight: 600; }
        .fb-pts { font-weight: 700; color: var(--amber); }
      `}</style>
    </div>
  );
}
