/**
 * Convert shape similarity weights → pseudo centimeter measurements
 * 
 * Important:
 * This is NOT real body measurement.
 * This is relative shape-similar estimation only.
 */

export function convertShapeWeightsToCM(shapeWeights) {
  if (!shapeWeights) return null;

  const safe = (v) => {
    if (isNaN(v) || v === null || v === undefined) return 0;
    return Math.max(0, Number(v));
  };

  return {
    shoulders: safe(shapeWeights.Shoulders) * 50,
    chest: safe(shapeWeights.Chest) * 100,
    waist: safe(shapeWeights.Waist) * 90,
    neck: safe(shapeWeights.Neck) * 40
  };
}