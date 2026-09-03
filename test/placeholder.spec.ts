import test from 'node:test'
import assert from 'node:assert/strict'

/**
 * This repo has no real test coverage yet. This placeholder exists only
 * so `npm test` and CI both run a genuine, real assertion — not a
 * silent no-op — until actual specs land. Delete it once real coverage
 * exists.
 *
 * Uses Node's built-in test runner rather than mocha: this repo's own
 * package.json "overrides" globally pin minimatch to 3.1.5 (for an
 * unrelated dependency's compatibility/security reason), which breaks
 * mocha's bundled glob@10.5 internals (glob needs a modern minimatch) —
 * `node:test` has no such dependency and avoids the conflict entirely.
 */
test('always passes — no real tests yet', () => {
  assert.equal(true, true)
})
