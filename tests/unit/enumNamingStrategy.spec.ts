import { describe, expect, it } from 'vitest';
import EnumNamingStrategy, { EnumNamingStrategyType } from '../../src/enumNamingStrategy';
import { ValueSet } from 'fhir/r5';

describe('enumNamingStrategy tests', () => {
  it('Throws an error when an invalid naming strategy type is supplied.', () => {
    expect.assertions(1);

    try {
      new EnumNamingStrategy({
        // @ts-ignore
        type: 'FOO',
      })  
    } catch (ex: any) {
      expect(ex.message).toEqual('EnumNamingStrategyType "FOO" is not recognised.')
    }
  });

  it('Assigns the "simple" naming strategy', () => {
    const strategy = new EnumNamingStrategy({
      type: EnumNamingStrategyType.SIMPLE,
    });

    expect(strategy.getName.name).toEqual('simpleEnumNamingStrategy');
  });

  it('Assigns the "version aware" naming strategy', () => {
    const strategy = new EnumNamingStrategy({
      type: EnumNamingStrategyType.VERSION_AWARE,
    });

    expect(strategy.getName.name).toEqual('versionAwareEnumNamingStrategy');
  });

  it('Throws an error when the custom naming strategy type is specified, but no naming strategy function is supplied.', () => {
    expect.assertions(1);
    
    try {
      new EnumNamingStrategy({
        type: EnumNamingStrategyType.CUSTOM,
      })
    } catch (ex: any) {
      expect(ex.message).toEqual('A customEnumNamingStrategy function must be supplied when specifying the type "CUSTOM".');
    }
  });

  it('Throws an error when the custom naming strategy type is specified, a non-function type is supplied.', () => {
    expect.assertions(1);
    
    try {
      new EnumNamingStrategy({
        type: EnumNamingStrategyType.CUSTOM,
        // @ts-ignore
        customEnumNamingStrategy: 'func',
      });
    } catch (ex: any) {
      expect(ex.message).toEqual('The suppled customEnumNamingStrategy must be a function.');
    }
  });

  it('Assigns the supplied custom naming strategy.', () => {
    const strategy = new EnumNamingStrategy({
      type: EnumNamingStrategyType.CUSTOM,
      customEnumNamingStrategy: (vs) => `${vs.name}ValueSetEnum`,
    });

    expect(strategy.getName).toBeDefined();
  });

  it('Returns the unmodified name of the supplied ValueSet when the simple naming strategy is used.', () => {
    const strategy = new EnumNamingStrategy({ type: EnumNamingStrategyType.SIMPLE });
    const valueSet: ValueSet = {
      resourceType: 'ValueSet',
      name: 'MyValueSet',
      status: 'active',
    };

    const name = strategy.getName(valueSet);

    expect(name).toEqual('MyValueSet');
  });

  it('Sanitises the name of the ValueSet when it contains illegal characters.', () => {
    const strategy = new EnumNamingStrategy({ type: EnumNamingStrategyType.SIMPLE });
    const valueSet: ValueSet = {
      resourceType: 'ValueSet',
      name: 'My+Value?Set',
      status: 'active',
    };

    const name = strategy.getName(valueSet);

    expect(name).toEqual('My_Value_Set');
  });

  it('Uses the version-aware naming strategy', () => {
    const strategy = new EnumNamingStrategy({ type: EnumNamingStrategyType.VERSION_AWARE });
    const valueSet: ValueSet = {
      resourceType: 'ValueSet',
      version: '4.0.1',
      name: 'MyValueSet',
      status: 'active',
    };

    const name = strategy.getName(valueSet);

    expect(name).toEqual('MyValueSetR4');
  });

  it('Sanitises, using the version-aware naming strategy', () => {
    const strategy = new EnumNamingStrategy({ type: EnumNamingStrategyType.VERSION_AWARE });
    const valueSet: ValueSet = {
      resourceType: 'ValueSet',
      version: '4.0.1',
      name: 'My+Value?Set',
      status: 'active',
    };

    const name = strategy.getName(valueSet);

    expect(name).toEqual('My_Value_SetR4');
  });

  it('Applies a custom naming strategy', () => {
    const strategy = new EnumNamingStrategy({
      type: EnumNamingStrategyType.CUSTOM,
      customEnumNamingStrategy: (vs) => `${vs.name}ValueSetEnum`,
    });
    
    const valueSet: ValueSet = {
      resourceType: 'ValueSet',
      name: 'MyValueSet',
      status: 'active',
    };

    const name = strategy.getName(valueSet);

    expect(name).toEqual('MyValueSetValueSetEnum');
  });
});
