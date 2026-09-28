/**
 * Concrete Quantity Calculator
 *
 * Calculates concrete volume, wastage, and formwork area
 * for rectangular members (slabs, footings, etc.)
 */

function calculateConcreteVolume(inputs) {
  const { length, width, thickness, wastagePercent } = inputs;

  const volume = length * width * thickness;
  const wastageVolume = volume * (wastagePercent / 100);
  const requiredConcrete = volume + wastageVolume;

  return {
    volume: roundTo(volume, 4),
    wastageVolume: roundTo(wastageVolume, 4),
    requiredConcrete: roundTo(requiredConcrete, 4),
    formworkArea: roundTo(2 * (length + width) * thickness + length * width, 4),
  };
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

module.exports = {
  calculateConcreteVolume,
};
