import { describe, expect, it } from "vitest";
import processInputs from "../../src/process";
import { ValueSet } from "fhir/r5";
import { readFileSync } from "fs";
import { join } from "path";

describe('process tests', () => {
  it('Throws an error if none of the supplied parameters returns any data.', async () => {
    expect.assertions(1);

    try {
      await processInputs({});
    } catch (ex: any) {
      expect(ex.message).toEqual('None of the supplied input parameters contains any data.');
    }
  });

  it('Returns a prettified enum based upon the supplied ValueSet string.', async () => {
    const v: ValueSet = {
      resourceType: 'ValueSet',
      name: 'EndToEnd',
      description: 'Simple value set',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [{
          inactive: true,
          code: 'thi',
          system: 'http://example.com',
          display: 'Thing',
        }],
      },
    };

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'simpleValueSetEnum.ts'), 'utf-8');

    const response = await processInputs({ inputData: JSON.stringify(v) });
    expect(response).toHaveLength(1);
    expect(response[0]).toEqual(expectedValue);
  });

  it('Returns a prettified enum based upon the supplied ValueSet file.', async () => {
    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'simpleValueSetEnum.ts'), 'utf-8');

    const response = await processInputs({ inputFilePattern: './**/__fixtures__/simpleValueSetEnum.json' });
    expect(response).toHaveLength(1);
    expect(response[0]).toEqual(expectedValue);
  });
});
