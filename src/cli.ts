import pkg from '../package.json';
import { CommandLineAction, CommandLineChoiceParameter, CommandLineParser, CommandLineStringParameter } from "@rushstack/ts-command-line";
import processInputs from './process';
import EnumNamingStrategy, { EnumNamingStrategyType } from './enumNamingStrategy';
import { EnumType } from './generateEnum';
import { PropertyNamingStrategyType } from './propertyNamingStrategy';

class EnumGeneratorAction extends CommandLineAction {
  private _inputUrl: CommandLineStringParameter;
  private _inputFilePattern: CommandLineStringParameter;
  private _enumType: CommandLineChoiceParameter;
  private _enumNamingStrategy: CommandLineChoiceParameter;
  private _propertyNamingStrategy: CommandLineChoiceParameter;
  private _outputDirectory: CommandLineStringParameter;
  
  constructor() {
    super({
      actionName: 'generate',
      documentation: '',
      summary: '',
    });

    this._inputUrl = this.defineStringParameter({
      argumentName: 'Input URL',
      description: 'A URL that should resolve to either an expanded ValueSet or a Bundle of ValueSet resources.',
      parameterLongName: 'url',
      parameterShortName: 'u',
    });

    this._inputFilePattern = this.defineStringParameter({
      argumentName: 'Input file pattern',
      description: 'A glob pattern that should resolve to one or more files containing either an expanded ValueSet or a Bundle of expanded ValueSets.',
      parameterLongName: 'file',
      parameterShortName: 'f',
    });

    this._outputDirectory = this.defineStringParameter({
      argumentName: 'Output directory',
      description: 'A path to which the generated enum files should be written. If omitted, the generated output will be printed to stdout',
      parameterLongName: 'output',
      parameterShortName: 'o',
    });

    this._enumType = this.defineChoiceParameter<EnumType>({
      defaultValue: 'code',
      parameterLongName: 'enum-type',
      parameterShortName: 't',
      description: 'The type of enum to be generated, may be:\n\t"code", to generate only string enums representing the "code" elements of the ValueSet,\n\t"Coding" to generate object enums representing the entire "Coding" returned by the ValueSet expansion or,\n\t"both" to generate both.',
      alternatives: ['code', 'Coding', 'both'],
    });

    this._enumNamingStrategy = this.defineChoiceParameter<'simple' | 'version_aware'>({
      parameterLongName: 'enum-naming-strategy',
      parameterShortName: 'e',
      defaultValue: 'simple',
      alternatives: ['simple', 'version_aware'],
      description: 'The strategy for naming the generated enums. The default is "simple", which uses the "name" property of the ValueSet. The other option is "version_aware", which suffixes the generated enum with the FHIR version, obtained from the ValueSet definition (e.g. "IssueSeverityR5").',
    });

    this._propertyNamingStrategy = this.defineChoiceParameter<'code' | 'display' | 'system_aware'>({
      parameterLongName: 'property-naming-strategy',
      parameterShortName: 'p',
      defaultValue: 'code',
      alternatives: ['code', 'display', 'system_aware'],
      description: 'The strategy for naming the generated enums. The options are:\n\t"display" (the default), which uses the "display" property of the ValueSet.expansion.contains elements,\n\t"code", which uses the "code" property of ValueSet.expansion.contains.\n\t"system_aware", which prepends the "code" value with the "system" from the ValueSet.expansion.contains, separated with a pipe ("|") character, e.g. "http://example.com|value", akin to performing a RESTful search.',
    });
  }
  
  protected async onExecute(): Promise<void> {
    const enumNamingStrategy = new EnumNamingStrategy({
      type: this._enumNamingStrategy.value,
    })
    
    await processInputs({
      url: this._inputUrl.value,
    });
  }
}

export default class EnumGeneratorParser extends CommandLineParser {
  constructor() {
    super({
      toolFilename: 'FHIR ValueSet Enum Generator',
      toolDescription: pkg.description,
    });

    this.addAction(new EnumGeneratorAction());
  }
}