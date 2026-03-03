import * as prettier from 'prettier';
import EnumNamingStrategy, { EnumNamingStrategyType } from './enumNamingStrategy';
import PropertyNamingStrategy, { PropertyNamingStrategyType } from './propertyNamingStrategy';
import type { ValueSet, ValueSetExpansionContains } from './types';
import { sanitiseName } from './utils';

export type EnumType = 'code' | 'Coding' | 'both';

type EnumDefinition = {
  name: string;
  comment: string;
};

type PropertyDefinition = {
  name: string;
  value: string;
  comment?: string;
  deprecated?: boolean;
  system?: string;
};

export type EnumGeneratorOptions = {
  enumType: EnumType;
  includeExportKeyword: boolean;
  enumNamingStrategy: EnumNamingStrategy;
  propertyNamingStrategy: PropertyNamingStrategy;
  /**
   * When the naming strategy fails to provide a name (e.g. if the ValueSet contains neither a "name" nor a
   * "description"), use this name to name the enum instead.
   */
  nameOverride: string;
  /**
   * Optional formatter function for output (e.g., Prettier). Defaults to Prettier with babel-ts parser.
   */
  formatter?: (code: string) => string | Promise<string>;
};

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
  value += properties.map((p) => `  ${getCommentString(p)}${p.name}= '${p.value}',`).join('\n');
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

  propertyDefinitions.forEach((p) => {
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

  value += '} as const;\n';

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
  contains.forEach((c) => {
    if (!c.abstract && c.code) {
      const def: PropertyDefinition = {
        name: namingStrategy.getName(c, parent),
        comment: c.display,
        value: c.code,
        system: c.system,
        // @ts-expect-error
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
  nameOverride: 'UnnamedValueSet',
  formatter: (code: string) => prettier.format(code, { parser: 'babel-ts', singleQuote: true }),
};


/**
 * Creates a string representation of the TypeScript enum.
 * @param vs The expanded ValueSet from which the enum is to be generated.
 * @param options Enum generation options (can override formatter)
 */
const generateEnum = async (vs: ValueSet, options?: Partial<EnumGeneratorOptions>): Promise<string> => {
  if (!vs.expansion || !vs.expansion.contains) {
    throw new Error(`The supplied ValueSet must contain an expansion in order to generate an enum of its values.`);
  }

  const opts: EnumGeneratorOptions = options ? { ...defaultOptions, ...options } : defaultOptions;

  const enumDef: EnumDefinition = {
    name: opts.enumNamingStrategy.getName(vs) || sanitiseName(opts.nameOverride),
    comment: vs.description || vs.name || 'No description provided',
  };

  const properties = getPropertyDefintionsFromContains([], opts.propertyNamingStrategy, vs.expansion.contains);

  let retVal = '';

  if (opts.enumType === 'both' || opts.enumType === 'code') {
    retVal += generateCodeEnum(enumDef, properties, opts.includeExportKeyword);
  }

  if (opts.enumType === 'both' || opts.enumType === 'Coding') {
    if (retVal) retVal += '\n';
    retVal += generateCodingEnum(enumDef, properties, opts.includeExportKeyword);
  }

  if (opts.formatter) {
    return await opts.formatter(retVal);
  }
  return retVal;
};

export default generateEnum;
