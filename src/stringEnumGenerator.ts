import PropertyNamingStrategy from "./propertyNamingStrategy";
import { ValueSet, ValueSetExpansionContains } from "./types";
import EnumNamingStrategy from "./enumNamingStrategy";

type EnumDefinition = {
  name: string;
  comment?: string;
}

type PropertyDefinition = {
  name: string;
  value: string;
  comment?: string;
};

type EnumGeneratorOptions = {
  enumNamingStrategy: EnumNamingStrategy;
  propertyNamingStrategy: PropertyNamingStrategy;
}

const toTypeScriptString = (
  enumDef: EnumDefinition,
  properties: PropertyDefinition[],
): string => {
  return `${enumDef.comment ? `/* ${enumDef.comment} */\n` : ''}enum ${enumDef.name} {
  ${properties.map(p => {
    return `  ${p.comment ? `/* ${p.comment} */\n` : ''}${p.name}= '${p.value}';\n`;
  })}
  }`;
}

const getPropertyDefintionsFromContains = (
  namingStrategy: PropertyNamingStrategy,
  contains: ValueSetExpansionContains[],
  parent?: ValueSetExpansionContains,
): PropertyDefinition[] => {
  return contains.flatMap(c => {
    if (c.contains) {
      return getPropertyDefintionsFromContains(namingStrategy, c.contains, c);
    }

    const def: PropertyDefinition = {
      name: namingStrategy.getName(c, parent),
      comment: c.display,
      value: c.code,
    };

    return def;
  });
};

/**
 * Creates a string representation of the TypeScript enum.
 * @param vs The expanded ValueSet from which the enum is to be generated.
 */
const generateStringEnum = (vs: ValueSet, options: EnumGeneratorOptions): string => {
  if (!vs.expansion || !vs.expansion.contains) {
    throw new Error('The supplied ValueSet must contain an expansion in order to generate an enum of its values.');
  }

  const enumDef: EnumDefinition = {
    name: options.enumNamingStrategy.getName(vs),
    comment: vs.description,
  };

  const properties = getPropertyDefintionsFromContains(options.propertyNamingStrategy, vs.expansion.contains);

  return toTypeScriptString(enumDef, properties);
}

export default generateStringEnum;
