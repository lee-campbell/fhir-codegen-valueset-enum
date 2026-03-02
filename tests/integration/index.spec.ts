import { describe, expect, it } from 'vitest';
import generateEnum from '../../lib';
import type { ValueSet } from '../../lib/types';

describe('generateEnum', () => {
  it('should generate an enum for a ValueSet from the function exported from index.ts', () => {
    const vs: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
      expansion: {
        timestamp: new Date().toISOString(),
        contains: [
          {
            code: 'example',
            display: 'Example',
          },
        ],
      },
    };

    const result = generateEnum(vs);
    expect(result).toBeDefined();
  });
});
