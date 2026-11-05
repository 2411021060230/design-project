// Tests for Motion Lab's physics and scoring. Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { rangeFor, flightTime, positionAt, randomTarget, scoreShot, G } from "./projectile.js";

test("range matches the formula v squared sin(2 theta) over g", () => {
  const expected = (20 * 20 * Math.sin(Math.PI / 2)) / G; // 45 degrees
  assert.ok(Math.abs(rangeFor(20, 45) - expected) < 1e-9);
  assert.ok(Math.abs(rangeFor(20, 45) - 40.82) < 0.01);
});

test("45 degrees gives the longest range for a given speed", () => {
  assert.ok(rangeFor(20, 45) > rangeFor(20, 40));
  assert.ok(rangeFor(20, 45) > rangeFor(20, 50));
});

test("complementary angles give the same range", () => {
  assert.ok(Math.abs(rangeFor(18, 30) - rangeFor(18, 60)) < 1e-9);
});

test("doubling the speed makes the range four times as long", () => {
  assert.ok(Math.abs(rangeFor(20, 40) * 4 - rangeFor(40, 40)) < 1e-9);
});

test("flight time and position agree: the ball lands at the range", () => {
  const t = flightTime(20, 45);
  const landed = positionAt(20, 45, t);
  assert.ok(Math.abs(landed.y) < 1e-9);
  assert.ok(Math.abs(landed.x - rangeFor(20, 45)) < 1e-6);
});

test("the ball never goes below the ground", () => {
  const late = positionAt(20, 45, flightTime(20, 45) + 5);
  assert.equal(late.y, 0);
});

test("a shot inside the tolerance is a hit and scores points", () => {
  const result = scoreShot(52, 50, "beginner"); // 2 m off, beginner tolerance is 8 m
  assert.equal(result.hit, true);
  assert.ok(result.points > 0);
  assert.equal(result.miss, 2);
});

test("a shot outside the tolerance is a miss and scores nothing", () => {
  const result = scoreShot(70, 50, "advanced"); // 20 m off, advanced tolerance is 2 m
  assert.equal(result.hit, false);
  assert.equal(result.points, 0);
});

test("a short shot has a negative miss", () => {
  assert.ok(scoreShot(40, 50, "intermediate").miss < 0);
});

test("points are never negative and closer hits score more", () => {
  const close = scoreShot(50.5, 50, "advanced");
  const looser = scoreShot(51.5, 50, "advanced");
  assert.ok(close.points >= looser.points);
  assert.ok(looser.points >= 0);
});

test("random targets stay inside each level's range", () => {
  for (const level of ["beginner", "intermediate", "advanced"]) {
    assert.ok(randomTarget(level, () => 0) >= 25);
    assert.ok(randomTarget(level, () => 0.999999) <= 88);
  }
});
