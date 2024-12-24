import { describe, expect, it } from "vitest";
import PropertyNamingStrategy, { PropertyNamingStrategyType } from "../../src/propertyNamingStrategy";
import { ValueSetExpansionContains } from "fhir/r5";

describe('propertyNamingStrategy tests', () => {
  it('Throws an error when an invalid property naming strategy is supplied', () => {
    expect.assertions(1);
    try {
      new PropertyNamingStrategy({
        // @ts-ignore
        type: 'FOO'
      });
    } catch (ex: any) {
      expect(ex.message).toEqual('PropertyNamingStrategyType "FOO" is not recognised.')
    }
  });

  it('Assigns the "code" naming strategy', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.CODE,
    });

    expect(strategy.getName.name).toEqual('codePropertyNamingStrategy');
  });

  it('Assigns the "display" naming strategy', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.DISPLAY,
    });

    expect(strategy.getName.name).toEqual('displayPropertyNamingStrategy');
  });

  it('Assigns the "system-aware" naming strategy', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.SYSTEMAWARE,
    });

    expect(strategy.getName.name).toEqual('systemAwarePropertyNamingStrategy');
  });

  it('Throws an error when the custom naming strategy type is specified, but no naming strategy function is supplied.', () => {
    expect.assertions(1);
    
    try {
      new PropertyNamingStrategy({
        type: PropertyNamingStrategyType.CUSTOM,
      })
    } catch (ex: any) {
      expect(ex.message).toEqual('A customPropertyNamingStrategy function must be supplied when specifying the type "CUSTOM".');
    }
  });
  
  it('Throws an error when the custom naming strategy type is specified, a non-function type is supplied.', () => {
    expect.assertions(1);
    
    try {
      new PropertyNamingStrategy({
        type: PropertyNamingStrategyType.CUSTOM,
        // @ts-ignore
        customPropertyNamingStrategy: 'func',
      });
    } catch (ex: any) {
      expect(ex.message).toEqual('The suppled customPropertyNamingStrategy must be a function.');
    }
  });

  it('Assigns the supplied custom naming strategy.', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.CUSTOM,
      customPropertyNamingStrategy: (vsec) => `${vsec.display}Code`,
    });

    expect(strategy.getName).toBeDefined();
  });

  it('Returns the unmodified "code" value when the "code" strategy is used.', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.CODE,
    });

    const vsec: ValueSetExpansionContains = {
      code: 'Thing',
    };

    const name = strategy.getName(vsec);
    expect(name).toEqual('THING');
  });

  it('Returns a name prefixed with the parent "code" when the "code" strategy is used.', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.CODE,
    });

    const child: ValueSetExpansionContains = {
      code: 'Stuff',
    };

    const parent: ValueSetExpansionContains = {
      code: 'Thing',
    };

    const name = strategy.getName(child, parent);

    expect(name).toEqual('THING_STUFF');
  });

  it('Returns the unmodified "display" value when the "display" strategy is used.', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.DISPLAY,
    });

    const vsec: ValueSetExpansionContains = {
      display: 'Thing',
    };

    const name = strategy.getName(vsec);
    expect(name).toEqual('THING');
  });

  it('Returns the unmodified "display" value when the "display" strategy is used.', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.DISPLAY,
    });

    const parent: ValueSetExpansionContains = {
      display: 'Thing',
    };

    const child: ValueSetExpansionContains = {
      display: 'Stuff',
    };

    const name = strategy.getName(child, parent);
    expect(name).toEqual('THING_STUFF');
  });

  it('Uses the "system-aware" strategy.', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.SYSTEMAWARE,
    });

    const vsec: ValueSetExpansionContains = {
      code: 'my-code',
      system: 'http://example.com',
    };

    const name = strategy.getName(vsec);
    expect(name).toEqual("'http://example.com|my-code'");
  });

  it('Uses a supplied custom strategy.', () => {
    const strategy = new PropertyNamingStrategy({
      type: PropertyNamingStrategyType.CUSTOM,
      customPropertyNamingStrategy: () => 'PropertyName',
    });

    const vsec: ValueSetExpansionContains = {};

    const name = strategy.getName(vsec);
    expect(name).toEqual('PropertyName');
  });
});
