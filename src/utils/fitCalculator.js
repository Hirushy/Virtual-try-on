export function calculateFitScore(bodyValue, clothValue) {

  if (clothValue === undefined || clothValue === null) return 0;

  const diff = Math.abs(bodyValue - clothValue);

  /* Base distance scoring */
  let score = 100 - diff * 45;

  /* Psychological comfort smoothing curve */
  score = 100 / (1 + Math.exp(-0.15 * (score - 50)));

  /* Stability clamp */
  score = Math.max(0, Math.min(100, score));

  return score;
}

/* Confidence Layer ⭐ */
export function calculateConfidenceScore(score) {

  if (score > 85) return 0.95;
  if (score > 70) return 0.85;
  if (score > 50) return 0.75;
  if (score > 30) return 0.65;

  return 0.55;
}