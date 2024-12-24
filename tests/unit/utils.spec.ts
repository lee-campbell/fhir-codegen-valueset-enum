import { describe, expect, it } from "vitest";
import { sanitiseName } from "../../src/utils";

describe('utils tests', () => {
  describe('sanitiseName function tests', () => {
    it('Returns an empty string if no argument is supplied', () => {
      const result = sanitiseName(undefined);
      expect(result).toEqual('');
    });

    it('Correctly replaces any illegal characters with an underscore', () => {
      const result = sanitiseName('Prefix:Name');
      expect(result).toEqual('Prefix_Name');
    });

    it('Correctly prepends strings with an underscore if they begin with a numeric character', () => {
      const result = sanitiseName('1234');
      expect(result).toEqual('_1234');
    })
  });
});