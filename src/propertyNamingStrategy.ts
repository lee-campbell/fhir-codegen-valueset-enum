import { ValueSetExpansionContains } from "./types";
import { sanitiseName } from "./utils";

export enum PropertyNamingStrategyType {
  CODE,
  DISPLAY,
  SYSTEMAWARE,
  CUSTOM,
}

type PropertyNamingStrategyFunction = (contains: ValueSetExpansionContains, parent?: ValueSetExpansionContains) => string;

const codePropertyNamingStrategy: PropertyNamingStrategyFunction = (contains, parent) => {
  let name = sanitiseName(contains.code?.toUpperCase());

  if (parent) {
    name = sanitiseName(parent.code?.toUpperCase()) + '_' + name;
  }

  return name;
};

const displayPropertyNamingStrategy: PropertyNamingStrategyFunction = (contains, parent) => {
  let name = sanitiseName(contains.display?.toUpperCase());

  if (parent) {
    name = sanitiseName(parent.display?.toUpperCase()) + '_' + name;
  }

  return name;
};

const systemAwarePropertyNamingStrategy: PropertyNamingStrategyFunction = (contains) => {
  return `'${contains.system}|${contains.code}'`;
};

type PropertyNamingStrategyOptions = {
  type: PropertyNamingStrategyType;
  customPropertyNamingStrategy?: PropertyNamingStrategyFunction;
}

export default class PropertyNamingStrategy {
  public getName: PropertyNamingStrategyFunction;

  constructor(options: PropertyNamingStrategyOptions) {
    switch(options.type) {
      case PropertyNamingStrategyType.CODE:
        this.getName = codePropertyNamingStrategy;
        break;
      case PropertyNamingStrategyType.DISPLAY:
        this.getName = displayPropertyNamingStrategy;
        break;
      case PropertyNamingStrategyType.SYSTEMAWARE:
        this.getName = systemAwarePropertyNamingStrategy;
        break;
      case PropertyNamingStrategyType.CUSTOM:
        if (!options.customPropertyNamingStrategy) {
          throw new Error('A customPropertyNamingStrategy function must be supplied when specifying the type "CUSTOM".');
        }

        if(typeof options.customPropertyNamingStrategy !== 'function') {
          throw new Error('The suppled customPropertyNamingStrategy must be a function.');
        }
        
        this.getName = options.customPropertyNamingStrategy;
        break;
      default:
        throw new Error(`PropertyNamingStrategyType "${options.type}" is not recognised.`);
    }
  }
}
