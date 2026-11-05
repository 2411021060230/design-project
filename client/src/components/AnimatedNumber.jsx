import { useEffect, useState } from "react";
import { animate } from "framer-motion";

// Counts smoothly up to a value, like the score counter in a game
export default function AnimatedNumber({ value }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const controls = animate(0, Number(value) || 0, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{shown}</>;
}
