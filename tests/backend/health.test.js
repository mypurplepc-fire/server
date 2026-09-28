const { test } = require('node:test');
const assert = require('node:assert');

test('health endpoint returns ok status', async () => {
  const response = await fetch('http://localhost:3001/api/health');
  const data = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data.status, 'ok');
  assert.ok(data.data.timestamp);
});
