import { Bundle, ValueSet } from "./types";

/**
 * Deserialises inbound data to an array of FHIR ValueSets.
 * 
 * N.B. no validation, other than that the supplied data is in JSON format, is perfomed.
 * @param data The stringified data, to be parsed/deserialised.
 * @param sourceName An optional source name, to assist debugging.
 * @returns The ValueSet array.
 */
const deserialise = (data: string, sourceName?: string): ValueSet[] => {
  const valueSets: ValueSet[] = [];
  
  let parsedData: any;
  try {
    parsedData = JSON.parse(data);
  } catch (ex) {
    throw new Error('Unable to parse data. Only JSON is supported.');
  }

  switch (parsedData.resourceType) {
    case 'ValueSet':
      valueSets.push(parsedData);
      break;
    case 'Bundle':
      const currentValueSets = parsedData.entry?.filter((e): e is ValueSet => e.resource?.resourceType === 'ValueSet').map(e => e.resource);
      if (!currentValueSets || currentValueSets.length < 1) {
        console.warn(`The source "${sourceName}" contains a Bundle that does not contain any ValueSet entries.`);
      } else {
        valueSets.push(...currentValueSets);
      }
      break;
    default:
      throw new Error(`The source ("${sourceName}") does not contain appropriate FHIR JSON. Only ValueSet and Bundle types containing ValueSets are supported.`);
  }

  return valueSets;
};

export default deserialise;
