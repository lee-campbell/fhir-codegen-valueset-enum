import { describe, expect, it } from "vitest";
import deserialise from "../../src/deserialise";
import { Bundle, ValueSet, ValueSetCompose } from "fhir/r5";

describe('deserialise tests', () => {
  it('Throws an error when the supplied data is not JSON', () => {
    expect.assertions(1);

    try {
      deserialise('Not JSON.');
    } catch (ex: any) {
      expect(ex.message).toEqual('Unable to parse data. Only JSON is supported.');
    }
  });

  it('Throws an error when the supplied data does not have a resourceType property.', () => {
    expect.assertions(1);

    try {
      deserialise('{"prop": "value"}');
    } catch (ex: any) {
      expect(ex.message).toEqual('The source ("undefined") does not contain appropriate FHIR JSON. Only ValueSet and Bundle types containing ValueSets are supported.');
    }
  });

  it('Throws an error when the supplied data does not have either the "ValueSet" or "Bundle" resourceType property.', () => {
    expect.assertions(1);

    try {
      deserialise('{"resourceType": "Foo"}');
    } catch (ex: any) {
      expect(ex.message).toEqual('The source ("undefined") does not contain appropriate FHIR JSON. Only ValueSet and Bundle types containing ValueSets are supported.');
    }
  });

  it('Returns a single parsed ValueSet object when a single resource is passed in.', () => {
    const v: ValueSet = {
      resourceType: 'ValueSet',
      status: 'active',
    };
    
    const result = deserialise(JSON.stringify(v));
    expect(result).toHaveLength(1);
    expect(result[0].resourceType).toEqual('ValueSet');
  });

  it('Returns multiple parsed ValueSet objects when a Bundle is passed in.', () => {
    const b: Bundle<ValueSet> = {
      resourceType: 'Bundle',
      type: 'collection',
      total: 2,
      entry: [{
        resource: {
          resourceType: 'ValueSet',
          id: '1',
          status: 'active',
        },
      }, {
        resource: {
          resourceType: 'ValueSet',
          id: '2',
          status: 'active',
        },
      }],
    };

    const result = deserialise(JSON.stringify(b));
    expect(result).toHaveLength(2);
    
    const valueSet1 = result.find(v => v.id === '1');
    expect(valueSet1).toBeDefined();

    const valueSet2 = result.find(v => v.id === '2');
    expect(valueSet2).toBeDefined();
  });

  it('Does not fail, but prints a warning, when no ValueSets are present in the supplied Bundle.', () => {
    const b: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 0,
    };

    const result = deserialise(JSON.stringify(b));
    expect(result).toHaveLength(0);
  });
});
