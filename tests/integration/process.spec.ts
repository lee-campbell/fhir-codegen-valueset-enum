import { beforeEach, describe, expect, it, vi } from "vitest";
import processInputs from "../../src/process";
import { ValueSet } from "fhir/r5";
import { existsSync, readFileSync, rmdirSync } from "fs";
import { join } from "path";

const outputDirectory = join(__dirname, '__outputs__');

describe('process tests', () => {
  const logSpy = vi.spyOn(console, 'log');

  beforeEach(() => {
    logSpy.mockClear();
    
    if (existsSync(outputDirectory)) {
      rmdirSync(outputDirectory, { recursive: true });
    }
  });

  it('Prints a prettified enum based upon the supplied ValueSet string.', async () => {
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

    await processInputs({ inputData: JSON.stringify(v) });
    expect(logSpy).toHaveBeenCalledWith(expectedValue);
  });

  it('Prints a prettified enum based upon the supplied ValueSet file.', async () => {
    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'simpleValueSetEnum.ts'), 'utf-8');

    await processInputs({ inputFilePattern: './**/__fixtures__/simpleValueSetEnum.json' });
    expect(logSpy).toHaveBeenCalledWith(expectedValue);
  });

  it('Writes to file a prettified enum based upon the supplied ValueSet string.', async () => {
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

    await processInputs({ inputData: JSON.stringify(v), outputDirectory, });
    
    const outputValue = readFileSync(join(outputDirectory, 'EndToEnd.ts'), 'utf-8');

    expect(outputValue).toEqual(expectedValue);
  });

  it('Prints a prettified enum based upon the supplied URL.', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;
    
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/fhir+json');
    
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

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: mockHeaders,
      json: () => Promise.resolve(v),
    });

    await processInputs({
      url: 'http://example.com/ValueSet/1/$expand',
    });

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'simpleValueSetEnum.ts'), 'utf-8');
    expect(logSpy).toHaveBeenCalledWith(expectedValue);
  });
});
