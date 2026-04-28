import { useState } from 'react';
import { Link } from 'react-router-dom';

// Points for guessing after N clues revealed (1 = 5pts, 2 = 3pts, 3 = 2pts, 4 = 1pt)
const POINTS = [5, 3, 2, 1];

export default function ConnectionsRound({ data = [] }) {
  const [qIndex, setQIndex]       = useState(0);
  const [revealed, setRevealed]   = useState(1);   // how many clues shown (1–4)
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores]       = useState(Array(data.length).fill(null)); // null=unanswered

  const q = data[qIndex];
  const total = data.length;
  const totalScore = scores.reduce((s, v) => s + (v ?? 0), 0);

  function nextClue() {
    if (revealed < 4) setRevealed(revealed + 1);
  }

  function revealAnswer() {
    setShowAnswer(true);
  }

  function markCorrect() {
    const pts = POINTS[revealed - 1];
    const next = [...scores];
    next[qIndex] = pts;
    setScores(next);
    goNext();
  }

  function markWrong() {
    const next = [...scores];
    next[qIndex] = 0;
    setScores(next);
    goNext();
  }

  function goNext() {
    if (qIndex < total - 1) {
      setQIndex(qIndex + 1);
      setRevealed(1);
      setShowAnswer(false);
    }
  }

  function restart() {
    setQIndex(0);
    setRevealed(1);
    setShowAnswer(false);
    setScores(Array(data.length).fill(null));
  }

  const allDone = scores.every((s) => s !== null);

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
          Question {qIndex + 1} / {total}
        </span>
        <span className="score-badge">Score: {totalScore}</span>
      </div>

      {/* Progress dots */}
      <div className="progress-dots mb-3">
        {data.map((_, i) => (
          <div
            key={i}
            className={`progress-dot ${
              scores[i] !== null ? 'done' : i === qIndex ? 'active' : ''
            }`}
          />
        ))}
      </div>

      {/* Main area */}
      <div className="round-body">
        {allDone ? (
          /* ── Final scoreboard ── */
          <div className="final-screen animate-pop">
            <h2 className="final-title">Round Complete!</h2>
            <div className="final-score">{totalScore}</div>
            <p className="final-sub">points from {total} questions</p>
            <div className="final-breakdown">
              {data.map((d, i) => (
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
                  <span className="clue-val">{i < revealed ? clue : '?'}</span>
                  <span className="clue-pts-hint">{i < revealed ? `${POINTS[i]} pts if correct` : ''}</span>
                </div>
              ))}
            </div>

            {/* Answer box */}
            {showAnswer && (
              <div className="answer-box animate-fade">
                <div className="answer-label">The Connection</div>
                <div className="answer-text">{q.connection}</div>
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
          border-color: var(--purple);
          background: #1a1630;
        }
        .clue-tile.hidden { opacity: .35; }
        .clue-num {
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--purple);
        }
        .clue-val {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--text);
        }
        .clue-pts-hint {
          font-size: .7rem;
          color: var(--amber);
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
