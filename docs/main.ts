// Declare global variables provided by CDN script tags
// declare const prettier: any;
// declare const prettierPlugins: any;

import prettier from 'prettier/standalone';
import parserTypescript from 'prettier/plugins/typescript';
import estreePlugin from 'prettier/plugins/estree';

import generateEnum from '../lib/generateEnum';
import type { EnumGeneratorOptions, EnumType } from '../lib/generateEnum';

const inputValueSet = document.getElementById('inputValueSet') as HTMLTextAreaElement;
const outputEnum = document.getElementById('outputEnum') as HTMLTextAreaElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;

const enumTypeSelect = document.getElementById('enumType') as HTMLSelectElement;
const includeExportKeywordCheckbox = document.getElementById('includeExportKeyword') as HTMLInputElement;
const enumNamingStrategySelect = document.getElementById('enumNamingStrategy') as HTMLSelectElement;
const propertyNamingStrategySelect = document.getElementById('propertyNamingStrategy') as HTMLSelectElement;
const nameOverrideInput = document.getElementById('nameOverride') as HTMLInputElement;

function safeParseJSON(json: string): unknown | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

generateBtn.addEventListener('click', async () => {
  const valueSetStr = inputValueSet.value;
  const valueSet = safeParseJSON(valueSetStr);
  if (!valueSet) {
    outputEnum.value = 'Invalid JSON.';
    return;
  }

  // Build options
  const options: Partial<EnumGeneratorOptions> = {
    enumType: enumTypeSelect.value as EnumType,
    includeExportKeyword: includeExportKeywordCheckbox.checked,
    nameOverride: nameOverrideInput.value || 'UnnamedValueSet',
  };
  const EnumNamingStrategy = (await import('../lib/enumNamingStrategy')).default;
  const EnumNamingStrategyType = (await import('../lib/enumNamingStrategy')).EnumNamingStrategyType;
  const PropertyNamingStrategy = (await import('../lib/propertyNamingStrategy')).default;
  const PropertyNamingStrategyType = (await import('../lib/propertyNamingStrategy')).PropertyNamingStrategyType;

  options.enumNamingStrategy = new EnumNamingStrategy({
    type: EnumNamingStrategyType[enumNamingStrategySelect.value as keyof typeof EnumNamingStrategyType],
  });
  options.propertyNamingStrategy = new PropertyNamingStrategy({
    type: PropertyNamingStrategyType[propertyNamingStrategySelect.value as keyof typeof PropertyNamingStrategyType],
  });
  options.formatter = (code: string) =>
    prettier.format(code, {
      parser: 'typescript',
      plugins: [parserTypescript, estreePlugin],
    });

  try {
    outputEnum.value = await generateEnum(valueSet as import('../lib/types').ValueSet, options);
  } catch (err) {
    outputEnum.value = err instanceof Error && err.message ? err.message : 'Error generating enum.';
  }
});
