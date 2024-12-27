import { describe, expect, it } from "vitest";
import bufferProcessor from "../../../src/preprocessor/bufferProcessor";

describe('bufferProcessor tests', () => {
  it('Throws an error when the supplied parameter is not a string or a Buffer', () => {
    expect.assertions(1);

    try {
      bufferProcessor(1);
    } catch (ex: any) {
      expect(ex.message).toEqual('The supplied data must be a string or a Buffer.');
    }
  });

  it('Returns the supplied string data as a string array', () => {
    const response = bufferProcessor('string');
    expect(response).toEqual(['string']);
  });

  it('Returns the supplied Buffer data as a string array', () => {
    const response = bufferProcessor(Buffer.from('string'));
    expect(response).toEqual(['string']);
  });
});
