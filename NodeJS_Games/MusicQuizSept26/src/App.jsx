import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './components/Home';
import ConnectionsRound from './components/ConnectionsRound';
import SequencesRound from './components/SequencesRound';
import ConnectingWall from './components/ConnectingWall';
import MissingVowels from './components/MissingVowels';

function App() {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/quiz.json')
      .then((r) => {
        if (!r.ok) throw new Error('Could not load quiz.json');
        return r.json();
      })
      .then((data) => {
        setQuizData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-inner">
          <div className="spinner" />
          <p>Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="splash">
        <div className="splash-inner error-box">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <p className="hint">Make sure <code>public/quiz.json</code> exists and is valid JSON.</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/connections"
        element={<ConnectionsRound data={quizData?.connections} />}
      />
      <Route
        path="/sequences"
        element={<SequencesRound data={quizData?.sequences} />}
      />
      <Route
        path="/connecting-wall"
        element={<ConnectingWall data={quizData?.connectingWall} />}
      />
      <Route
        path="/missing-vowels"
        element={<MissingVowels data={quizData?.missingVowels} />}
      />
    </Routes>
  );
}

export default App;
