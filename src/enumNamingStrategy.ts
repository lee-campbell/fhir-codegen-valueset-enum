import { ValueSet } from "./types";
import { sanitiseName } from "./utils";

/**
 * Enum for selecting the naming strategy type.
 */
export enum EnumNamingStrategyType {
  /**
   * Names the enum the value of ValueSet.name.
   */
  SIMPLE = 'simple',
  /**
   * Names the enum the result of concatenating ValueSet.name with the simplified FHIR version,
   * taken from the major version number of ValueSet.version, preceded by the letter "R", as per
   * FHIR convention, e.g. "IssueTypeR4".
   */
  VERSION_AWARE = 'version aware',
  /**
   * Instructs the use of a supplied custom naming strategy.
   */
  CUSTOM = 'custom',
}

type EnumNamingStrategyFunction = (vs: ValueSet) => string;

/**
 * Names the enum the value of ValueSet.name.
 * @param vs The ValueSet from which to derive the enum's name.
 * @returns The ValueSet name.
 */
const simpleEnumNamingStrategy: EnumNamingStrategyFunction = (vs) => {
  return sanitiseName(vs.name);
};

/**
 * Names the enum the result of concatenating ValueSet.name with the simplified FHIR version,
 * taken from the major version number of ValueSet.version, preceded by the letter "R", as per
 * FHIR convention, e.g. "IssueTypeR4".
 * @param vs The ValueSet from which to derive the enum's name.
 * @returns The ValueSet name.
 */
const versionAwareEnumNamingStrategy: EnumNamingStrategyFunction = (vs) => {
  const simplifiedVersion = `R${vs.version?.split('.')[0]}`;
  return sanitiseName(`${vs.name}${simplifiedVersion}`);
};

/**
 * Options for generating the name of the enum that represents the FHIR ValueSet. A "simple" and a
 * "version aware" strategy are provided, and can be selected using the "type" enum. Alternatively,
 * users can provide their own naming strategy, by selecting the "custom" type enum and populating the
 * `customEnumNamingStrategy` property.
 * 
 * N.B. users are responsible for their own name sanitisation when providing a custom naming strategy.
 * If the ValueSet's name contains a character that cannot be used to name variables in TypeScript,
 * the generated enum will be invalid.
 */
type EnumNamingStrategyOptions = {
  type: EnumNamingStrategyType;
  customEnumNamingStrategy?: EnumNamingStrategyFunction;
}

/**
 * ValueSet naming strategy class. A helper to derive the name of the enum created from the
 * supplied ValueSet.
 */
export default class EnumNamingStrategy {
  public getName: EnumNamingStrategyFunction;
  
  constructor(options: EnumNamingStrategyOptions) {
    switch(options.type) {
      case EnumNamingStrategyType.SIMPLE:
        this.getName = simpleEnumNamingStrategy;
        break;
      case EnumNamingStrategyType.VERSION_AWARE:
        this.getName = versionAwareEnumNamingStrategy;
        break;
      case EnumNamingStrategyType.CUSTOM:
        if (!options.customEnumNamingStrategy) {
          throw new Error('A customEnumNamingStrategy function must be supplied when specifying the type "CUSTOM".');
        }

        if(typeof options.customEnumNamingStrategy !== 'function') {
          throw new Error('The suppled customEnumNamingStrategy must be a function.');
        }

        this.getName = options.customEnumNamingStrategy;
        break;
      default:
        throw new Error(`EnumNamingStrategyType "${options.type}" is not recognised.`);
    }
  }
}
