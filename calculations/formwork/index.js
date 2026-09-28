/**
 * Formwork Quantity Calculator
 *
 * Calculates formwork area for slabs, beams, columns,
 * walls, and footings.
 */

const FORMWORK_TYPES = ['slab', 'beam', 'column', 'wall', 'footing'];

function calculateFormwork(inputs) {
  const { type, dimensions } = inputs;

  if (!FORMWORK_TYPES.includes(type)) {
    throw new Error(`Invalid formwork type. Must be one of: ${FORMWORK_TYPES.join(', ')}`);
  }

  const area = calculateArea(type, dimensions);

  return {
    type,
    area: roundTo(area, 4),
    unit: 'm²',
  };
}

function calculateArea(type, dims) {
  switch (type) {
    case 'slab':
      return dims.length * dims.width;
    case 'beam':
      return 2 * (dims.width + dims.depth) * dims.length;
    case 'column':
      return 2 * (dims.width + dims.depth) * dims.height;
    case 'wall':
      return 2 * dims.length * dims.height;
    case 'footing':
      return 2 * (dims.length + dims.width) * dims.depth;
    default:
      throw new Error(`Unknown formwork type: ${type}`);
  }
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

module.exports = {
  calculateFormwork,
  FORMWORK_TYPES,
};
