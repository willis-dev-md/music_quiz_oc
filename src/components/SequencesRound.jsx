import { useState } from 'react';
import { Link } from 'react-router-dom';

const POINTS = [5, 3, 2, 1]; // points for guessing after 1, 2, 3 items revealed

export default function SequencesRound({ data = [] }) {
  const [qIndex, setQIndex]       = useState(0);
  const [revealed, setRevealed]   = useState(1);   // 1–3 items shown (4th is the answer)
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores]       = useState(Array(data.length).fill(null));

  const q = data[qIndex];
  const total = data.length;
  const totalScore = scores.reduce((s, v) => s + (v ?? 0), 0);
  const visibleItems = q ? q.items.slice(0, 3) : [];

  function nextItem() {
    if (revealed < 3) setRevealed(revealed + 1);
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
          <h1 className="round-title">▶️ Sequences</h1>
        </div>
        <div className="round-body">
          <p className="text-muted">No sequence questions found in quiz.json.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="round-page">
      <div className="round-header">
        <Link to="/" className="btn-back">← Back</Link>
        <h1 className="round-title">▶️ Sequences</h1>
        <span className="round-subtitle">Question {qIndex + 1} / {total}</span>
        <span className="score-badge">Score: {totalScore}</span>
      </div>

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

      <div className="round-body">
        {allDone ? (
          <div className="final-screen animate-pop">
            <h2 className="seq-final-title">Round Complete!</h2>
            <div className="seq-final-score">{totalScore}</div>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
              points from {total} sequences
            </p>
            <div className="seq-breakdown">
              {data.map((d, i) => (
                <div key={i} className={`seq-fb-row ${scores[i] > 0 ? 'correct' : 'wrong'}`}>
                  <span className="fb-num">Q{i + 1}</span>
                  <span className="seq-fb-ans">{d.answer}</span>
                  <span className="fb-pts">{scores[i]} pt{scores[i] !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-3" onClick={restart}>Play Again</button>
          </div>
        ) : (
          <div className="seq-layout">
            <p className="seq-instruction">What comes next in this sequence?</p>

            {/* Sequence chain */}
            <div className="seq-chain">
              {visibleItems.map((item, i) => (
                <div key={i} className={`seq-item ${i < revealed ? 'revealed animate-fade' : 'hidden'}`}>
                  <span className="seq-item-num">{i + 1}</span>
                  <span className="seq-item-val">{i < revealed ? item : '?'}</span>
                </div>
              ))}

              {/* Arrow + 4th slot */}
              <div className="seq-arrow">→</div>
              <div className={`seq-item fourth ${showAnswer ? 'answered animate-pop' : 'pending'}`}>
                <span className="seq-item-num">4</span>
                <span className="seq-item-val">
                  {showAnswer ? q.answer : '?'}
                </span>
              </div>
            </div>

            {/* Explanation (after answer revealed) */}
            {showAnswer && q.explanation && (
              <div className="seq-explanation animate-fade">
                <span className="seq-exp-label">Why?</span>
                {q.explanation}
              </div>
            )}

            {/* Mark correct / wrong after answer shown */}
            {showAnswer && (
              <div className="conn-controls animate-fade">
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: '#ef4444', color: '#ef4444' }}
                  onClick={markWrong}
                >
                  ✗ Wrong
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ borderColor: '#22c55e', color: '#22c55e' }}
                  onClick={markCorrect}
                >
                  ✓ Correct (+{POINTS[revealed - 1]} pts)
                </button>
              </div>
            )}

            {/* Controls */}
            {!showAnswer && (
              <div className="conn-controls">
                <button
                  className="btn btn-secondary"
                  onClick={nextItem}
                  disabled={revealed >= 3}
                >
                  {revealed < 3 ? `Reveal Item ${revealed + 1}` : 'All Items Shown'}
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
        .seq-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          width: 100%;
          max-width: 720px;
        }
        .seq-instruction {
          font-size: 1rem;
          color: var(--muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .1em;
        }
        .seq-chain {
          display: flex;
          align-items: center;
          gap: .75rem;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }
        .seq-item {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem 1rem;
          text-align: center;
          min-width: 130px;
          flex: 1;
          max-width: 160px;
          display: flex;
          flex-direction: column;
          gap: .4rem;
          transition: border-color .2s, background .2s;
        }
        .seq-item.revealed { border-color: #3b82f6; background: #0f1a30; }
        .seq-item.hidden   { opacity: .3; }
        .seq-item.fourth.pending { border-style: dashed; border-color: var(--amber); opacity: .6; }
        .seq-item.fourth.answered { border-color: var(--green); background: #0d2d1a; }
        .seq-item-num {
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #3b82f6;
        }
        .seq-item.fourth .seq-item-num { color: var(--amber); }
        .seq-item.fourth.answered .seq-item-num { color: var(--green); }
        .seq-item-val { font-size: 1.15rem; font-weight: 700; }
        .seq-arrow {
          font-size: 2rem;
          color: var(--muted);
          flex-shrink: 0;
        }
        .seq-explanation {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: .9rem 1.4rem;
          font-size: .95rem;
          color: var(--muted);
          text-align: center;
          max-width: 500px;
        }
        .seq-exp-label {
          display: block;
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--purple);
          margin-bottom: .3rem;
        }
        .conn-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Final */
        .final-screen, .seq-final-screen { text-align: center; max-width: 540px; width: 100%; }
        .seq-final-title { font-size: 2rem; font-weight: 900; color: var(--amber); margin-bottom: .5rem; }
        .seq-final-score { font-size: 5rem; font-weight: 900; color: var(--green); line-height: 1; margin-bottom: .25rem; }
        .seq-breakdown { display: flex; flex-direction: column; gap: .5rem; }
        .seq-fb-row {
          display: flex; align-items: center; gap: 1rem;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px; padding: .6rem 1rem; font-size: .9rem;
        }
        .seq-fb-row.correct { border-color: #15803d; }
        .seq-fb-row.wrong   { border-color: #7f1d1d; opacity: .7; }
        .fb-num { font-weight: 700; color: var(--muted); min-width: 2rem; }
        .seq-fb-ans { flex: 1; text-align: left; font-weight: 600; }
        .fb-pts { font-weight: 700; color: var(--amber); }
      `}</style>
    </div>
  );
}
