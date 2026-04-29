# Music Quiz (September 2026)

A small React (Vite) app that runs a pub-style **Music Quiz** with multiple rounds:

- **Connections**: Reveal up to 4 clues and guess the connection.
- **Sequences**: Reveal up to 3 items and guess the 4th.
- **Connecting Wall**: Group 16 tiles into four groups of four (supports Wall **A** and **B**).
- **Missing Vowels**: The app displays answers with vowels/spaces removed and lets you self-mark.

The quiz content lives in `public/quiz.json`.

---

## Requirements

- Node.js (recommended: latest LTS)

---

## Install

```bash
npm install
```

---

## Run locally (development)

```bash
npm run dev
```

Vite will start a dev server and the app will load quiz data from:

- `public/quiz.json` (via `fetch('/quiz.json')`)

---

## Build (production)

```bash
npm run build
```

This creates the static build output in `dist/`.

Note: `dist/quiz.json` may exist as a packaged copy for static hosting, but **you should edit `public/quiz.json`** as the source-of-truth.

---

## Quiz data (`public/quiz.json`)

### Connections

`connections` is an array of questions. Each question has 4 clues and a connection string.

```json
{
  "id": 1,
  "clues": ["Clue One", "Clue Two", "Clue Three", "Clue Four"],
  "connection": "What connects them"
}
```

UI note: the player first chooses **one of 6 tiles** (2×3). After a tile is played and marked, it becomes completed and cannot be reselected.

#### Pictures (optional)

Each clue can stay a **plain string**, or be an **object** with an image URL (paths under `public/` served from the site root):

```json
"clues": [
  "Plain text clue",
  {
    "image": "/images/connections/example-clue.svg",
    "alt": "Describe the image for accessibility",
    "caption": "Optional short caption under the image"
  },
  {
    "text": "Caption alongside image",
    "image": "/images/connections/example-clue.svg",
    "alt": "Mixed clue"
  },
  "Clue Four"
]
```

Put image files in e.g. `public/images/connections/` and reference them as `/images/connections/yourfile.jpg`.

---

### Sequences

`sequences` is an array of sequence questions.

```json
{
  "id": 1,
  "items": ["First", "Second", "Third", "???"],
  "answer": "Fourth",
  "explanation": "Optional explanation"
}
```

The first three `items` entries work like Connections clues: **string** or **object** with optional `image`, `alt`, `caption`, `text` (same shape as above; use e.g. `public/images/sequences/`).

Optional: show an image when the fourth answer is revealed:

```json
{
  "answer": "Fourth",
  "answerImage": "/images/sequences/example-answer.svg",
  "answerAlt": "Describe the answer image"
}
```

UI note: like Connections, the player chooses **one of 6 tiles** (2×3) and completed tiles cannot be reselected.

---

### Connecting Wall (A/B variants)

`connectingWall` supports multiple walls (e.g. **A** and **B**) under `walls`.

```json
{
  "connectingWall": {
    "walls": {
      "A": {
        "prompt": "Wall A",
        "groups": [
          { "name": "Yellow Group", "color": "yellow", "tiles": ["A", "B", "C", "D"] },
          { "name": "Green Group",  "color": "green",  "tiles": ["E", "F", "G", "H"] },
          { "name": "Blue Group",   "color": "blue",   "tiles": ["I", "J", "K", "L"] },
          { "name": "Purple Group", "color": "purple", "tiles": ["M", "N", "O", "P"] }
        ]
      },
      "B": {
        "prompt": "Wall B",
        "groups": [
          { "name": "Yellow Group (B)", "color": "yellow", "tiles": ["A1", "B1", "C1", "D1"] },
          { "name": "Green Group (B)",  "color": "green",  "tiles": ["E1", "F1", "G1", "H1"] },
          { "name": "Blue Group (B)",   "color": "blue",   "tiles": ["I1", "J1", "K1", "L1"] },
          { "name": "Purple Group (B)", "color": "purple", "tiles": ["M1", "N1", "O1", "P1"] }
        ]
      }
    }
  }
}
```

Each wall has **exactly 4 groups**, each group has **exactly 4 tiles**.

---

### Missing Vowels (answers-only)

For Missing Vowels, you now provide **just the answers**. The UI generates the displayed prompt by:

1. uppercasing
2. removing spaces
3. removing vowels (A/E/I/O/U)

```json
{
  "category": "British Bands",
  "items": [
    "Rock And Roll",
    "Grandmaster Flash"
  ]
}
```

Backwards compatibility: if an item is still provided as `{ "encoded": "...", "answer": "..." }`, the UI will still work, but the preferred format is the string-only `items` list.

---

## Styling / theme

The site uses shared CSS variables in `src/App.css` for a consistent light, modern look (surfaces, borders, semantic tints, etc.). Individual rounds use those variables rather than hard-coded colors where possible.

