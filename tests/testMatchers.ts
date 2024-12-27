import { expect } from 'vitest';

expect.extend({
  stringEqualIgnoringWhitespace(received: string, expected: string) {
    const normalize = (str: string) => str.replace(/\s+/g, '');
    const pass = normalize(received) === normalize(expected);

    if (pass) {
      return {
        message: () =>
          `"expected" and "received" match (ignoring whitespace).`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected "${received}" to be equal to "${expected}" when ignoring whitespace`,
        pass: false,
      };
    }
  },
});

declare module 'vitest' {
  interface Assertion<T = any> {
    stringEqualIgnoringWhitespace(expected: string): void;
  }
}
