import { useState } from 'react';
import { Link } from 'react-router-dom';

function encodeMissingVowels(answer) {
  if (!answer) return '';
  return String(answer)
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[AEIOU]/g, '');
}

export default function MissingVowels({ data = [] }) {
  const [catIndex, setCatIndex]   = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [revealed, setRevealed]   = useState(false);
  const [scores, setScores]       = useState(
    // scores[catIndex][itemIndex] = true/false/null
    data.map((cat) => cat.items.map(() => null))
  );
  const [done, setDone] = useState(false);

  const cat  = data[catIndex];
  const item = cat?.items[itemIndex];
  const answerText = typeof item === 'string' ? item : item?.answer;
  const encodedText =
    (typeof item === 'object' && item?.encoded) ? item.encoded : encodeMissingVowels(answerText);

  function showAnswer() { setRevealed(true); }

  function mark(correct) {
    const next = scores.map((c) => [...c]);
    next[catIndex][itemIndex] = correct;
    setScores(next);
    advance(next);
  }

  function advance(nextScores) {
    const nextItem = itemIndex + 1;
    if (nextItem < cat.items.length) {
      setItemIndex(nextItem);
      setRevealed(false);
    } else {
      const nextCat = catIndex + 1;
      if (nextCat < data.length) {
        setCatIndex(nextCat);
        setItemIndex(0);
        setRevealed(false);
      } else {
        setDone(true);
      }
    }
  }

  function skip() {
    const next = scores.map((c) => [...c]);
    next[catIndex][itemIndex] = false;
    setScores(next);
    advance(next);
  }

  function restart() {
    setCatIndex(0);
    setItemIndex(0);
    setRevealed(false);
    setScores(data.map((cat) => cat.items.map(() => null)));
    setDone(false);
  }

  const totalCorrect = scores.flat().filter(Boolean).length;
  const totalItems   = scores.flat().length;

  if (!data.length) {
    return (
      <div className="round-page">
        <div className="round-header">
          <Link to="/" className="btn-back">← Back</Link>
          <h1 className="round-title">❓ Missing Vowels</h1>
        </div>
        <div className="round-body">
          <p className="text-muted">No missing vowels data found in quiz.json.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="round-page">
      <div className="round-header">
        <Link to="/" className="btn-back">← Back</Link>
        <h1 className="round-title">❓ Missing Vowels</h1>
        <span className="round-subtitle">
          Category {catIndex + 1} / {data.length}
        </span>
        <span className="score-badge">✓ {totalCorrect}</span>
      </div>

      <div className="round-body">
        {done ? (
          /* ── Final results ── */
          <div className="mv-final animate-pop">
            <h2 className="mv-final-title">Round Complete!</h2>
            <div className="mv-final-score">{totalCorrect}</div>
            <p className="text-muted mb-3">correct out of {totalItems}</p>

            <div className="mv-results">
              {data.map((c, ci) => (
                <div key={ci} className="mv-cat-result">
                  <h3 className="mv-cat-name">{c.category}</h3>
                  {c.items.map((it, ii) => {
                    const answer = typeof it === 'string' ? it : it?.answer;
                    const encoded =
                      (typeof it === 'object' && it?.encoded)
                        ? it.encoded
                        : encodeMissingVowels(answer);

                    return (
                      <div
                        key={ii}
                        className={`mv-result-row ${scores[ci][ii] ? 'correct' : 'wrong'}`}
                      >
                        <span className="mv-encoded">{encoded}</span>
                        <span className="mv-arrow">→</span>
                        <span className="mv-answer">{answer}</span>
                        <span className="mv-tick">{scores[ci][ii] ? '✓' : '✗'}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-3" onClick={restart}>Play Again</button>
          </div>
        ) : (
          /* ── Active puzzle ── */
          <div className="mv-layout">
            {/* Category header */}
            <div className="mv-category-bar">
              <span className="mv-cat-label">Category</span>
              <span className="mv-cat-title">{cat.category}</span>
            </div>

            {/* Item progress */}
            <div className="progress-dots">
              {cat.items.map((_, i) => (
                <div
                  key={i}
                  className={`progress-dot ${
                    scores[catIndex][i] !== null
                      ? scores[catIndex][i] ? 'done' : 'done'
                      : i === itemIndex ? 'active' : ''
                  }`}
                  style={
                    scores[catIndex][i] === false
                      ? { background: '#ef4444' }
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Puzzle tile */}
            <div className={`mv-puzzle-tile ${revealed ? 'revealed' : ''} animate-fade`} key={`${catIndex}-${itemIndex}`}>
              <span className="mv-encoded-text">{encodedText}</span>
            </div>

            {/* Answer */}
            {revealed && (
              <div className="answer-box animate-pop">
                <div className="answer-label">Answer</div>
                <div className="answer-text">{answerText}</div>
                <div className="flex flex-center flex-gap-1 mt-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    onClick={() => mark(false)}
                  >
                    ✗ Wrong
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: '#22c55e', color: '#22c55e' }}
                    onClick={() => mark(true)}
                  >
                    ✓ Correct
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            {!revealed && (
              <div className="mv-controls">
                <button className="btn btn-amber" onClick={showAnswer}>
                  Reveal Answer
                </button>
                <button className="btn btn-secondary btn-sm" onClick={skip}>
                  Skip
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .mv-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          width: 100%;
          max-width: 920px;
        }
        .mv-category-bar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: .75rem 1.5rem;
          text-align: center;
          width: 100%;
        }
        .mv-cat-label {
          display: block;
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--primary);
          margin-bottom: .2rem;
        }
        .mv-cat-title {
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--text);
        }
        .mv-puzzle-tile {
          background: var(--surface);
          border: 3px solid var(--border);
          border-radius: 20px;
          padding: 2.5rem 3rem;
          text-align: center;
          width: 100%;
          transition: border-color .2s;
        }
        .mv-puzzle-tile.revealed { border-color: var(--amber); }
        .mv-encoded-text {
          font-size: clamp(1.25rem, 3.2vw, 2.4rem);
          font-weight: 900;
          letter-spacing: .15em;
          color: var(--text);
          word-break: break-all;
        }
        .mv-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Final */
        .mv-final { text-align: center; max-width: 600px; width: 100%; }
        .mv-final-title { font-size: 2rem; font-weight: 900; color: var(--amber); margin-bottom: .5rem; }
        .mv-final-score { font-size: 5rem; font-weight: 900; color: var(--green); line-height: 1; }
        .mv-results { display: flex; flex-direction: column; gap: 1.5rem; text-align: left; }
        .mv-cat-result {}
        .mv-cat-name {
          font-size: .85rem;
          font-weight: 900;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--primary);
          margin-bottom: .5rem;
        }
        .mv-result-row {
          display: flex;
          align-items: center;
          gap: .75rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: .6rem 1rem;
          font-size: .9rem;
          margin-bottom: .35rem;
        }
        .mv-result-row.correct { border-color: rgba(22, 163, 74, .35); background: var(--success-tint); }
        .mv-result-row.wrong   { border-color: rgba(239, 68, 68, .35); background: var(--danger-tint); opacity: .85; }
        .mv-encoded { font-weight: 700; color: var(--warning); min-width: 120px; }
        .mv-arrow   { color: var(--muted); }
        .mv-answer  { flex: 1; font-weight: 600; }
        .mv-tick    { font-weight: 900; font-size: 1rem; }
        .mv-result-row.correct .mv-tick { color: var(--green); }
        .mv-result-row.wrong   .mv-tick { color: var(--red); }
      `}</style>
    </div>
  );
}
