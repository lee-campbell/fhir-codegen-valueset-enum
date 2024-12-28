import { existsSync, rmdirSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import processInputs from "../../src/process";
import { join } from "node:path";

const outputDirectory = join(__dirname, '__outputs__' );

describe('End-to-end test', () => {
  beforeEach(() => {
    if (existsSync(outputDirectory)) {
      rmdirSync(outputDirectory, { recursive: true });
    }
  });
  it('Retrieves the "issue-severity" ValueSet from the FHIR R5 terminology server and generates an enum.', async () => {
    await processInputs({
      url: 'https://tx.fhir.org/r5/ValueSet/issue-severity/$expand?_format=json',
      outputDirectory,
      includeExportKeyword: true,
      enumType: 'both',
    });

    const { IssueSeverity, IssueSeverityCoding } = await import(join(outputDirectory, 'IssueSeverity'));

    expect(IssueSeverity.FATAL).toEqual('fatal');
    expect(IssueSeverityCoding.FATAL).toEqual({
      code: 'fatal',
      system: 'http://hl7.org/fhir/issue-severity',
      display: 'Fatal',
    });
  });
});
