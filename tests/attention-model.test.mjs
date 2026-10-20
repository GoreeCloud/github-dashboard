import test from 'node:test';
import assert from 'node:assert/strict';
import {filterAttention} from '../public/attention-model.js';
test('empty queue',()=>assert.deepEqual(filterAttention([]),[]));
