import { useNavigate, useParams } from "react-router-dom";
import GameShell from "../games/shell/GameShell.jsx";
import { GAMES } from "../games/registry.js";

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = GAMES[gameId];

  if (!game) {
    return (
      <section className="card">
        <h2>Game not found</h2>
        <p className="hint">This game does not exist yet.</p>
      </section>
    );
  }

  return (
    <GameShell
      key={gameId}
      game={game}
      onExit={() => navigate(`/subjects/${game.subject}`)}
    />
  );
}
