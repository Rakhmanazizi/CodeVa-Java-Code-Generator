// src/test/utils/CodeParser.test.ts
import * as assert from 'assert';
import { CodeParser } from '../../utils/CodeParser';

describe('CodeParser Utility Class', () => {
  it('should extract a simple class name correctly', () => {
    const javaCode = 'public class HelloWorld { ... }';
    const expected = 'HelloWorld';
    const actual = CodeParser.extractClassName(javaCode);
    assert.strictEqual(actual, expected, 'Failed to extract a simple class name  correctly');
  });
  it('should extract a class name with numbers and underscores', () => {
    const javaCode = '  public   class   My_Class123 extends Object {';
    const expected = 'My_Class123';
    const actual = CodeParser.extractClassName(javaCode);
    assert.strictEqual(actual, expected, 'Failed to extract a complex class name');
  });

  it('should return null if no public class is found', () => {
    const javaCode = 'class MyPrivateClass { ... }';
    const expected = null;
    const actual = CodeParser.extractClassName(javaCode);
    assert.strictEqual(actual, expected, 'Should have returned null for non-public class');
  });
});

