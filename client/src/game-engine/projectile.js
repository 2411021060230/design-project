// Physics and scoring rules for Motion Lab. Plain functions with no React code,
// so they can be tested with node --test.

export const G = 9.8; // gravity in m/s squared
export const SHOTS_PER_ROUND = 5;
export const WIN_HITS = 3;

// Distance range for each level, and how close the ball must land (in metres)
export const TARGET_RANGES = {
  beginner: { min: 25, max: 70, tolerance: 8 },
  intermediate: { min: 30, max: 88, tolerance: 4 },
  advanced: { min: 40, max: 88, tolerance: 2 },
};

function radians(angleDeg) {
  return (angleDeg * Math.PI) / 180;
}

// Horizontal distance the ball travels before it lands again: range = v^2 sin(2 theta) / g
export function rangeFor(speed, angleDeg) {
  return (speed * speed * Math.sin(2 * radians(angleDeg))) / G;
}

// Time in the air: t = 2 v sin(theta) / g
export function flightTime(speed, angleDeg) {
  return (2 * speed * Math.sin(radians(angleDeg))) / G;
}

// Position of the ball at time t, in metres. Height never goes below the ground.
export function positionAt(speed, angleDeg, t) {
  const theta = radians(angleDeg);
  const x = speed * Math.cos(theta) * t;
  const y = Math.max(0, speed * Math.sin(theta) * t - 0.5 * G * t * t);
  return { x, y };
}

// Picks a target distance for a level. The random function can be replaced in tests.
export function randomTarget(difficulty, random = Math.random) {
  const { min, max } = TARGET_RANGES[difficulty] ?? TARGET_RANGES.beginner;
  return Math.round(min + random() * (max - min));
}

// Scores one shot. Landing within the tolerance is a hit. Closer hits score more.
export function scoreShot(landedAt, target, difficulty) {
  const { tolerance } = TARGET_RANGES[difficulty] ?? TARGET_RANGES.beginner;
  const miss = landedAt - target;
  const hit = Math.abs(miss) <= tolerance;
  const points = hit ? Math.max(0, Math.round(100 - Math.abs(miss) * 5)) : 0;
  return { hit, miss: Math.round(miss * 10) / 10, points };
}
