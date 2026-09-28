/**
 * Rebar Quantity Calculator
 *
 * Calculates rebar quantities based on bar diameter,
 * length, number of bars, and spacing.
 */

function calculateRebar(inputs) {
  const { diameter, length, numberOfBars, spacing, memberLength } = inputs;

  let bars = numberOfBars;
  if (!bars && spacing > 0 && memberLength > 0) {
    bars = Math.floor(memberLength / spacing) + 1;
  }

  const totalLength = bars * length;
  const unitWeight = (diameter * diameter) / 162;
  const totalWeight = totalLength * unitWeight;
  const weightInTonnes = totalWeight / 1000;

  return {
    numberOfBars: bars,
    totalLength: roundTo(totalLength, 3),
    unitWeight: roundTo(unitWeight, 4),
    totalWeight: roundTo(totalWeight, 3),
    weightInTonnes: roundTo(weightInTonnes, 4),
  };
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

module.exports = {
  calculateRebar,
};
