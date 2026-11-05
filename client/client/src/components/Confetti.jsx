import { useState } from "react";
import { motion } from "framer-motion";

// A burst of coloured pieces for success moments. Drawn with CSS and Framer Motion, no images.
const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f472b6", "#a78bfa"];

export default function Confetti({ count = 60 }) {
  // Created once, so the pieces do not jump around on every re-render
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 520,
      y: -(Math.random() * 380 + 120),
      rotate: Math.random() * 720 - 360,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.15,
    }))
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, 600], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
