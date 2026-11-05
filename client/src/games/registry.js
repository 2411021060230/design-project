import MotionLab from "./motion-lab/MotionLab.jsx";

// Every game the platform offers. To add a game, write its scene and add one entry here.
export const GAMES = {
  "motion-lab": {
    id: "motion-lab",
    subject: "physics",
    title: "Motion Lab",
    tagline: "Launch a ball so it lands on the flag",
    objectives: [
      "Land the ball within the tolerance of the flag in at least 3 of 5 shots.",
      "Choose a speed and an angle. Each shot has a new target.",
      "Use the feedback to adjust your next shot. Hints cost points.",
    ],
    timeLimit: { beginner: null, intermediate: 120, advanced: 90 },
    Scene: MotionLab,
  },
};
