import PropertyNamingStrategy, { PropertyNamingStrategyType } from "./propertyNamingStrategy";
import { ValueSet, ValueSetExpansionContains } from "./types";
import EnumNamingStrategy, { EnumNamingStrategyType } from "./enumNamingStrategy";

type EnumDefinition = {
  name: string;
  comment?: string;
}

type PropertyDefinition = {
  name: string;
  value: string;
  comment?: string;
  deprecated?: boolean;
};

export type EnumGeneratorOptions = {
  enumNamingStrategy: EnumNamingStrategy;
  propertyNamingStrategy: PropertyNamingStrategy;
}

const getCommentString = (prop: PropertyDefinition): string => {
  if (!prop.comment) return '';
  let comment = `/**\n * ${prop.comment}\n`;
  if (prop.deprecated) {
    comment += ' * @deprecated This concept is marked as inactive in the code system\n';
  }
  comment += '*/\n';
  return comment;
};

const toTypeScriptString = (
  enumDef: EnumDefinition,
  properties: PropertyDefinition[],
): string => {
  let value = `${enumDef.comment ? `/** ${enumDef.comment} */\n` : ''}enum ${enumDef.name} {`;
  value += properties.map(p => `  ${getCommentString(p)}${p.name}= '${p.value}',`).join('\n');
  value += '}\n';
  return value;
}

const getPropertyDefintionsFromContains = (
  definitions: PropertyDefinition[] = [],
  namingStrategy: PropertyNamingStrategy,
  contains: ValueSetExpansionContains[],
  parent?: ValueSetExpansionContains,
): PropertyDefinition[] => {
  contains.forEach(c => {
    if (!c.abstract) {
      const def: PropertyDefinition = {
        name: namingStrategy.getName(c, parent),
        comment: c.display,
        value: c.code,
        // @ts-ignore
        deprecated: c.inactive,
      };
      
      definitions.push(def);
    }
    
    if (c.contains) {
      getPropertyDefintionsFromContains(definitions, namingStrategy, c.contains, c);
    }
  });

  return definitions;
};

const defaultOptions: EnumGeneratorOptions = {
  enumNamingStrategy: new EnumNamingStrategy({ type: EnumNamingStrategyType.SIMPLE }),
  propertyNamingStrategy: new PropertyNamingStrategy({ type: PropertyNamingStrategyType.DISPLAY }),
};

/**
 * Creates a string representation of the TypeScript enum.
 * @param vs The expanded ValueSet from which the enum is to be generated.
 */
const generateStringEnum = (vs: ValueSet, options?: Partial<EnumGeneratorOptions>): string => {
  if (!vs.expansion || !vs.expansion.contains) {
    throw new Error('The supplied ValueSet must contain an expansion in order to generate an enum of its values.');
  }

  if (options) {
    options = Object.assign(defaultOptions, options);
  } else {
    options = defaultOptions;
  }

  const enumDef: EnumDefinition = {
    name: options.enumNamingStrategy.getName(vs),
    comment: vs.description,
  };

  const properties = getPropertyDefintionsFromContains([], options.propertyNamingStrategy, vs.expansion.contains);

  return toTypeScriptString(enumDef, properties);
}

export default generateStringEnum;
