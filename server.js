import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the built Vite output (run 'npm run build' first)
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — all routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎵 Music Quiz Sept 26 is running at http://localhost:${PORT}`);
  console.log(`   Tip: run 'npm run build' first if you haven't already.`);
});
