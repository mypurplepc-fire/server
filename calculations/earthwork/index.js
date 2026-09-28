/**
 * Earthwork Quantity Calculator
 *
 * Calculates cut/fill volumes using rectangular
 * and average end area methods.
 */

function calculateEarthwork(inputs) {
  const { method, sections } = inputs;

  switch (method) {
    case 'rectangular':
      return calculateRectangular(sections);
    case 'averageEndArea':
      return calculateAverageEndArea(sections);
    default:
      throw new Error(`Unknown earthwork method: ${method}`);
  }
}

function calculateRectangular(section) {
  const { length, width, depth } = section;
  const volume = length * width * depth;

  return {
    method: 'rectangular',
    volume: roundTo(volume, 4),
    unit: 'm³',
  };
}

function calculateAverageEndArea(sections) {
  let totalVolume = 0;

  for (let i = 0; i < sections.length - 1; i++) {
    const area1 = sections[i].area;
    const area2 = sections[i + 1].area;
    const distance = sections[i + 1].distance - sections[i].distance;
    const segmentVolume = ((area1 + area2) / 2) * distance;
    totalVolume += segmentVolume;
  }

  return {
    method: 'averageEndArea',
    volume: roundTo(totalVolume, 4),
    unit: 'm³',
  };
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

module.exports = {
  calculateEarthwork,
};
