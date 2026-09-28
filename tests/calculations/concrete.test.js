const { test } = require('node:test');
const assert = require('node:assert');
const { calculateConcreteVolume } = require('../../calculations/concrete');

test('concrete volume calculation - basic slab', () => {
  const result = calculateConcreteVolume({
    length: 10,
    width: 5,
    thickness: 0.15,
    wastagePercent: 5,
  });

  assert.strictEqual(result.volume, 7.5);
  assert.strictEqual(result.wastageVolume, 0.375);
  assert.strictEqual(result.requiredConcrete, 7.875);
});

test('concrete volume calculation - zero wastage', () => {
  const result = calculateConcreteVolume({
    length: 8,
    width: 4,
    thickness: 0.2,
    wastagePercent: 0,
  });

  assert.strictEqual(result.volume, 6.4);
  assert.strictEqual(result.wastageVolume, 0);
  assert.strictEqual(result.requiredConcrete, 6.4);
});
