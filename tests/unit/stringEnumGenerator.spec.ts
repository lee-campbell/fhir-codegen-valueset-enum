import { ValueSet } from "fhir/r5";
import { describe, expect, it } from "vitest";
import generateStringEnum from "../../src/stringEnumGenerator";
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import EnumNamingStrategy, { EnumNamingStrategyType } from "../../src/enumNamingStrategy";
import PropertyNamingStrategy, { PropertyNamingStrategyType } from "../../src/propertyNamingStrategy";

describe('stringEnumGenerator tests', () => {
  it('Throws an error if the supplied ValueSet has no expansion', () => {
    expect.assertions(1);
    
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
    };

    try {
      generateStringEnum(vs);
    } catch (ex: any) {
      expect(ex.message).toEqual('The supplied ValueSet must contain an expansion in order to generate an enum of its values.');
    }
  });

  it('Throws an error if the supplied ValueSet has no expansion.contains', () => {
    expect.assertions(1);
    
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
      },
    };

    try {
      generateStringEnum(vs);
    } catch (ex: any) {
      expect(ex.message).toEqual('The supplied ValueSet must contain an expansion in order to generate an enum of its values.');
    }
  });

  it('Returns the expected value for a simple ValueSet.', () => {
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      name: 'Simple',
      description: 'Simple value set',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [{
          code: '1234',
          system: 'http://example.com',
          display: 'Thing',
        }],
      },
    };

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'simpleValueSetEnum.ts'), 'utf-8').replace(/\s/g, '');

    const result = generateStringEnum(vs);

    expect(result.replace(/\s/g, '')).toEqual(expectedValue);
  });

  it('Returns the expected value for a nested ValueSet.', () => {
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      name: 'Nested',
      description: 'Nested value set',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [{
          code: '1234',
          system: 'http://example.com',
          display: 'Thing',
          contains: [{
            code: '1234.5678',
            system: 'http://example.com',
            display: 'Subthing',
          }],
        }],
      },
    };

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'nestedValueSetEnum.ts'), 'utf-8').replace(/\s/g, '');

    const result = generateStringEnum(vs);

    expect(result.replace(/\s/g, '')).toEqual(expectedValue);
  });

  it('Returns the expected value for a ValueSet in which one of the codes has been deprecated.', () => {
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      name: 'Deprecated',
      description: 'Deprecated value set',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [{
          code: '1234',
          inactive: true,
          system: 'http://example.com',
          display: 'Thing',
        }],
      },
    };

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'deprecatedValueSetEnum.ts'), 'utf-8').replace(/\s/g, '');

    const result = generateStringEnum(vs);

    expect(result.replace(/\s/g, '')).toEqual(expectedValue);
  });

  it('Returns the expected value for a ValueSet in which one of the codes has been marked as abstract.', () => {
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      name: 'Abstract',
      description: 'Abstract value set',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [{
          code: '1234',
          system: 'http://example.com',
          display: 'Thing',
        }, {
          code: 'abs',
          system: 'http://example.com',
          display: 'Abstract',
          abstract: true,
        }],
      },
    };

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'abstractValueSetEnum.ts'), 'utf-8').replace(/\s/g, '');

    const result = generateStringEnum(vs);

    expect(result.replace(/\s/g, '')).toEqual(expectedValue);
  });

  it('Returns the expected value for a ValueSet in which there are no comments.', () => {
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      name: 'NoComment',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [{
          code: 'THI',
          system: 'http://example.com',
        }],
      },
    };

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'noCommentValueSetEnum.ts'), 'utf-8').replace(/\s/g, '');

    const result = generateStringEnum(vs, {
      propertyNamingStrategy: new PropertyNamingStrategy({
        type: PropertyNamingStrategyType.CODE,
      })
    });

    expect(result.replace(/\s/g, '')).toEqual(expectedValue);
  });

  it('Includes the "export" keyword when instructed to do so.', () => {
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      name: 'Simple',
      description: 'Simple value set',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [{
          code: '1234',
          system: 'http://example.com',
          display: 'Thing',
        }],
      },
    };

    const expectedValue = readFileSync(join(__dirname, '__fixtures__', 'exportedValueSetEnum.ts'), 'utf-8').replace(/\s/g, '');

    const result = generateStringEnum(vs, { includeExportKeyword: true });

    expect(result.replace(/\s/g, '')).toEqual(expectedValue);
  });
});
