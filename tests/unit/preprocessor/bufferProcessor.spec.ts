import { beforeEach, describe, expect, it, vi } from "vitest";
import bufferProcessor from "../../../src/preprocessor/bufferProcessor";

describe('bufferProcessor tests', () => {
  const callback = vi.fn();
  
  beforeEach(() => {
    callback.mockClear();
  });

  it('Throws an error when the supplied parameter is not a string or a Buffer', async () => {
    expect.assertions(1);

    try {
      await bufferProcessor(1, callback);
    } catch (ex: any) {
      expect(ex.message).toEqual('The supplied data must be a string or a Buffer.');
    }
  });

  it('Calls the callback with the supplied data string', async () => {
    await bufferProcessor({ data: 'string' }, callback);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('string');
  });

  it('Calls the callback with the stringified version of the supplied array', async () => {
    await bufferProcessor({ data: Buffer.from('string') }, callback);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('string');
  });
});
