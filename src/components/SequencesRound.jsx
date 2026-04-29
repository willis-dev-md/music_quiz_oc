import { useState } from 'react';
import { Link } from 'react-router-dom';
import { normalizeSlot } from '../quiz/clueItem';

const POINTS = [5, 3, 2, 1]; // points for guessing after 1, 2, 3 items revealed
const TILE_COUNT = 6;
const TILE_ICONS = ['🎧', '🎤', '🎸', '🥁', '🎹', '🎼'];

function SeqSlotContent({ raw }) {
  const slot = normalizeSlot(raw);
  const [imgBroken, setImgBroken] = useState(false);

  if (slot.kind === 'text') {
    return <span className="seq-item-val">{slot.text || '?'}</span>;
  }

  const imgBlock =
    slot.src && !imgBroken ? (
      <div className="seq-media">
        <img
          className="seq-img"
          src={slot.src}
          alt={slot.alt || ''}
          loading="lazy"
          decoding="async"
          onError={() => setImgBroken(true)}
        />
      </div>
    ) : slot.src ? (
      <span className="seq-img-fallback text-muted">Image unavailable</span>
    ) : null;

  if (slot.kind === 'image') {
    return (
      <div className="seq-slot-inner">
        {imgBlock}
        {slot.caption ? <span className="seq-caption">{slot.caption}</span> : null}
      </div>
    );
  }

  return (
    <div className="seq-slot-inner">
      {imgBlock}
      {slot.text ? <span className="seq-item-val seq-item-val-text">{slot.text}</span> : null}
      {slot.caption ? <span className="seq-caption">{slot.caption}</span> : null}
    </div>
  );
}

function SeqFourthAnswer({ question }) {
  const q = question;
  const [imgBroken, setImgBroken] = useState(false);
  const src = q.answerImage;

  return (
    <div className="seq-fourth-inner">
      {src && !imgBroken && (
        <div className="seq-media">
          <img
            className="seq-img"
            src={src}
            alt={typeof q.answerAlt === 'string' ? q.answerAlt : String(q.answer)}
            loading="lazy"
            decoding="async"
            onError={() => setImgBroken(true)}
          />
        </div>
      )}
      {src && imgBroken && (
        <span className="seq-img-fallback text-muted">Image unavailable</span>
      )}
      <span className="seq-item-val">{q.answer}</span>
    </div>
  );
}

export default function SequencesRound({ data = [] }) {
  const [qIndex, setQIndex]       = useState(0);
  const [mode, setMode]           = useState('pick'); // 'pick' | 'play'
  const [revealed, setRevealed]   = useState(1);   // 1–3 items shown (4th is the answer)
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores]       = useState(Array(TILE_COUNT).fill(null));

  const q = data[qIndex];
  const playableCount = Math.min(TILE_COUNT, data.length);
  const totalScore = scores.slice(0, playableCount).reduce((s, v) => s + (v ?? 0), 0);
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
        <span className="round-subtitle">
          {mode === 'pick'
            ? 'Pick a tile'
            : `${TILE_ICONS[qIndex] || '⬤'} Tile ${qIndex + 1} / ${playableCount}`
          }
        </span>
        <span className="score-badge">Score: {totalScore}</span>
      </div>

      <div className="round-body">
        {allDone ? (
          <div className="final-screen animate-pop">
            <h2 className="seq-final-title">Round Complete!</h2>
            <div className="seq-final-score">{totalScore}</div>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
              points from {playableCount} tiles
            </p>
            <div className="seq-breakdown">
              {data.slice(0, playableCount).map((d, i) => (
                <div key={i} className={`seq-fb-row ${scores[i] > 0 ? 'correct' : 'wrong'}`}>
                  <span className="fb-num">Q{i + 1}</span>
                  <span className="seq-fb-ans">{d.answer}</span>
                  <span className="fb-pts">{scores[i]} pt{scores[i] !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-3" onClick={restart}>Play Again</button>
          </div>
        ) : mode === 'pick' ? (
          <div className="seq-pick">
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
          <div className="seq-layout">
            <p className="seq-instruction">What comes next in this sequence?</p>

            {/* Sequence chain */}
            <div className="seq-chain">
              {visibleItems.map((item, i) => (
                <div key={i} className={`seq-item ${i < revealed ? 'revealed animate-fade' : 'hidden'}`}>
                  <span className="seq-item-num">{i + 1}</span>
                  {i < revealed ? <SeqSlotContent raw={item} /> : <span className="seq-item-val">?</span>}
                </div>
              ))}

              {/* Arrow + 4th slot */}
              <div className="seq-arrow">→</div>
              <div className={`seq-item fourth ${showAnswer ? 'answered animate-pop' : 'pending'}`}>
                <span className="seq-item-num">4</span>
                {showAnswer ? <SeqFourthAnswer question={q} /> : <span className="seq-item-val">?</span>}
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
        /* Pick screen (shared look with Connections) */
        .seq-pick { width: 100%; max-width: 720px; }
        .pick-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
          margin-bottom: 1rem;
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
        .pick-tile:hover:not(:disabled) { border-color: #3b82f6; background: rgba(59, 130, 246, .06); transform: translateY(-1px); }
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
          color: var(--info);
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
        .seq-item.revealed { border-color: var(--info); background: var(--info-tint); }
        .seq-item.hidden   { opacity: .3; }
        .seq-item.fourth.pending { border-style: dashed; border-color: var(--warning); opacity: .6; }
        .seq-item.fourth.answered { border-color: var(--success); background: var(--success-tint); }
        .seq-item-num {
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--info);
        }
        .seq-item.fourth .seq-item-num { color: var(--warning); }
        .seq-item.fourth.answered .seq-item-num { color: var(--success); }
        .seq-item-val { font-size: 1.15rem; font-weight: 700; }
        .seq-slot-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .4rem;
          width: 100%;
          min-height: 2.5rem;
          justify-content: center;
        }
        .seq-media {
          width: 100%;
          max-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 10px;
          background: var(--surface-2, #f3f4f6);
        }
        .seq-img {
          max-width: 100%;
          max-height: 120px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .seq-img-fallback { font-size: .8rem; font-weight: 600; }
        .seq-item-val-text { font-size: 1rem !important; }
        .seq-caption {
          font-size: .7rem;
          font-weight: 600;
          color: var(--muted);
          line-height: 1.25;
        }
        .seq-fourth-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .45rem;
          width: 100%;
        }
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
