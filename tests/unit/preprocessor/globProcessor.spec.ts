import { beforeEach, describe, expect, it, vi } from "vitest";
import globProcessor from "../../../src/preprocessor/globProcessor";

describe('globProcessor tests', () => {
  const callback = vi.fn();

  beforeEach(() => {
    callback.mockClear();
  });

  it('Reads the files in the supplied glob and passes their contents to the callback', async () => {
    await globProcessor({ filePattern: './**/globProcessorTest*.json' }, callback);

    expect(callback).toHaveBeenCalledTimes(2);

    // @ts-ignore
    expect(callback).toHaveBeenNthCalledWith(1, expect.stringEqualIgnoringWhitespace('{"resourceType":"ValueSet","id":"1"}'));
    // @ts-ignore
    expect(callback).toHaveBeenNthCalledWith(2, expect.stringEqualIgnoringWhitespace('{"resourceType":"ValueSet","id":"2"}'));
  });
});
