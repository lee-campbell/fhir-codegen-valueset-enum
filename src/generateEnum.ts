import PropertyNamingStrategy, { PropertyNamingStrategyType } from "./propertyNamingStrategy";
import { ValueSet, ValueSetExpansionContains } from "./types";
import EnumNamingStrategy, { EnumNamingStrategyType } from "./enumNamingStrategy";

type EnumType = 'code' | 'Coding' | 'both';

type EnumDefinition = {
  name: string;
  comment: string;
}

type PropertyDefinition = {
  name: string;
  value: string;
  comment?: string;
  deprecated?: boolean;
  system?: string;
};

export type EnumGeneratorOptions = {
  enumType: EnumType;
  includeExportKeyword?: boolean;
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

const generateCodeEnum = (
  enumDef: EnumDefinition,
  properties: PropertyDefinition[],
  includeExportKeyword: boolean,
): string => {
  let value = `/** ${enumDef.comment} */\n${includeExportKeyword ? 'export ' : ''}enum ${enumDef.name} {\n`;
  value += properties.map(p => `  ${getCommentString(p)}${p.name}= '${p.value}',`).join('\n');
  value += '}\n';
  return value;
};

const generateCodingEnum = (
  enumDef: EnumDefinition,
  propertyDefinitions: PropertyDefinition[],
  includeExportKeyword: boolean,
): string => {
  const codingEnumName = `${enumDef.name}Coding`;
  let value = `/** ${enumDef.comment} (Coding) */\n`;
  value += `const ${codingEnumName} = {\n`;

  propertyDefinitions.forEach(p => {
    let propString = `${getCommentString(p)}`;
    propString += `${p.name}: {\n`;
    propString += `code: '${p.value}',\n`;

    if (p.system) {
      propString += `system: '${p.system}',\n`;
    }

    if (p.comment) {
      propString += `display: '${p.comment}',\n`;
    }

    propString += '},\n';

    value += propString;
  });

  value += '} as const;\n'

  if (includeExportKeyword) {
    value += `export { ${codingEnumName} };\n`;
  }
  
  return value;
};

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
        system: c.system,
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
  enumType: 'code',
  includeExportKeyword: false,
  enumNamingStrategy: new EnumNamingStrategy({ type: EnumNamingStrategyType.SIMPLE }),
  propertyNamingStrategy: new PropertyNamingStrategy({ type: PropertyNamingStrategyType.DISPLAY }),
};

/**
 * Creates a string representation of the TypeScript enum.
 * @param vs The expanded ValueSet from which the enum is to be generated.
 */
const generateEnum = (vs: ValueSet, options?: Partial<EnumGeneratorOptions>): string => {
  if (!vs.expansion || !vs.expansion.contains) {
    throw new Error('The supplied ValueSet must contain an expansion in order to generate an enum of its values.');
  }

  if (options) {
    options = Object.assign({...defaultOptions}, options);
  } else {
    options = defaultOptions;
  }

  const enumDef: EnumDefinition = {
    name: options.enumNamingStrategy.getName(vs),
    comment: vs.description || vs.name,
  };

  const properties = getPropertyDefintionsFromContains([], options.propertyNamingStrategy, vs.expansion.contains);

  let retVal = '';

  if (options.enumType === 'both' || options.enumType === 'code') {
    retVal += generateCodeEnum(enumDef, properties, options.includeExportKeyword);
  }

  if (options.enumType === 'both' || options.enumType === 'Coding') {
    if (retVal) retVal += '\n';
    retVal += generateCodingEnum(enumDef, properties, options.includeExportKeyword);
  }

  return retVal;
}

export default generateEnum;
