import test from 'node:test'; import assert from 'node:assert/strict'; import { hash, matches } from './store.js';
test('secure password hashing', () => { const h = hash('example-password'); assert.equal(matches('example-password', h), true); assert.equal(matches('incorrect', h), false); assert.notEqual(h, hash('example-password')) });
