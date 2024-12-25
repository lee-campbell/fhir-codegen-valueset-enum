import { glob, readFile } from "node:fs/promises";
import { ValueSet } from "./types";
import * as prettier from 'prettier';
import generateStringEnum, { EnumGeneratorOptions } from "./stringEnumGenerator";

type ProcessingOptions = Partial<EnumGeneratorOptions> & {
  inputFilePattern?: string;
  inputData?: string | Buffer;
};

const parseData = (data: string, sourceName?: string): ValueSet[] => {
  const valueSets: ValueSet[] = [];
  
  let parsedData: any;
  try {
    parsedData = JSON.parse(data);
  } catch (ex) {
    throw new Error(`Unable to parse data. Only JSON files are supported.`);
  }

  switch (parsedData.resourceType) {
    case 'ValueSet':
      valueSets.push(parsedData);
      break;
    case 'Bundle':
      const currentValueSets = parsedData.entry.filter(e => e.resource?.resourceType === 'ValueSet');
      if (currentValueSets.length < 1) {
        console.warn(`The source "${sourceName}" contains a Bundle that does not contain any ValueSet entries.`);
      } else {
        parsedData.push(...currentValueSets);
      }
      break;
    default:
      throw new Error(`The source ("${sourceName}") does not contain appropriate FHIR JSON. Only ValueSet and Bundle types containing ValueSets are supported.`);
  }

  return valueSets;
};

const processInputFilePattern = async (filePattern: string): Promise<ValueSet[]> => {
  const valueSets: ValueSet[] = [];
  
  for await (const match of glob(filePattern)) {
    const fileData = await readFile(match, 'utf-8');
    valueSets.push(...parseData(fileData, match));
  }

  return valueSets;
}

const processInputData = (data: string | Buffer): ValueSet[] => {
  const valueSets: ValueSet[] = [];
  
  const serialisedData = data.toString('utf-8');
  return parseData(serialisedData, '--data');
};

const process = async (options: ProcessingOptions): Promise<string[]> => {
  const valueSets: ValueSet[] = [];

  if (options.inputFilePattern) {
    valueSets.push(... await processInputFilePattern(options.inputFilePattern));
  }

  if (options.inputData) {
    valueSets.push(...processInputData(options.inputData));
  }

  if (valueSets.length < 1) {
    throw new Error('None of the supplied inputs contains a FHIR ValueSet.');
  }

  return await Promise.all(
    valueSets
      .map(v => generateStringEnum(v, options))
      .map(e => prettier.format(e))
  );
};
