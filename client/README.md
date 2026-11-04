# Gamified Learning: React Client (Stage 1)

This is the React front end. It talks to the Express server in `../server`.

## Run it

1. Start the server in one PowerShell window:
   ```powershell
   cd C:\Projects\gamified-learning-platform\server
   npm run dev
   ```
2. In a second window:
   ```powershell
   cd C:\Projects\gamified-learning-platform\client
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

The Vite dev server forwards `/api` requests to port 5000, so the login cookie works.

## Tests

```powershell
npm test
```

Tests the projectile physics and scoring used by Motion Lab.

## Structure

- `src/App.jsx`: routes and page layout
- `src/auth.jsx`: login state shared across pages
- `src/api.js`: request helper
- `src/pages/`: Dashboard, Subject (topics), Quiz
- `src/games/shell/GameShell.jsx`: shared game screens (intro, countdown, pause, restart, exit, victory, game over)
- `src/games/motion-lab/`: the first playable game
- `src/game-engine/`: game rules as plain functions, tested without a browser
- `src/styles.css`: themes, layout, and animation styles

## Not in this stage

Other games, 3D scenes, the teacher dashboard charts, and saving game scores to the server.
