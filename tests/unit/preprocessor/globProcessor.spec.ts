import { describe, expect, it } from "vitest";
import globProcessor from "../../../src/preprocessor/globProcessor";

describe('globProcessor tests', () => {
  it('Reads the files in the supplied glob and returns their contents as a string', async () => {
    const response = await globProcessor('./**/globProcessorTest*.json');
    expect(response.length).toEqual(2);
    expect(response[0].replace(/\s/g, '')).toEqual('{"resourceType":"ValueSet"}');
    expect(response[1].replace(/\s/g, '')).toEqual('{"resourceType":"ValueSet"}');
  });
});
