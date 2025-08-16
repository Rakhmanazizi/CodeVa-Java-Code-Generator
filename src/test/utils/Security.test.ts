// src/test/utils/Security.test.ts

import * as assert from 'assert';
import { Security } from '../../utils/Security';

describe('Security Utility Class', () => {
  it('getNonce() should return a string of 32 characters', () => {
    const nonce = Security.getNonce();
    assert.strictEqual(typeof nonce, 'string', 'Nonce should be a string');
    assert.strictEqual(nonce.length, 32, 'Nonce should have a length of 32');
  });

  it('getNonce() should return different values on each call', () => {
    const nonce1 = Security.getNonce();
    const nonce2 = Security.getNonce();
    assert.notStrictEqual(nonce1, nonce2, 'Two consecutive nonces should not be the same');
  });
});


