
# FHIR ValueSet to TypeScript Enum Generator

Generate TypeScript enums from FHIR ValueSets for safer, more maintainable code in healthcare applications.

## Features
- Generate enums from FHIR ValueSet JSON files, glob patterns, or FHIR terminology server URLs
- Supports CLI and programmatic API usage
- Customizable naming strategies for enums and properties
- Output as TypeScript enums or object literals
- Web demo for instant conversion and experimentation

## Installation

```sh
npm install --save-dev fhir-codegen-valueset-enum
```

## CLI Usage

```sh
npx fhir-enum-gen --input path/to/valueset.json --output path/to/enum.ts
```

See `--help` for all CLI options.

## Programmatic Usage

```ts
import generateEnum from 'fhir-codegen-valueset-enum';
import { EnumNamingStrategy, PropertyNamingStrategy, EnumNamingStrategyType, PropertyNamingStrategyType } from 'fhir-codegen-valueset-enum';

const valueSet = /* FHIR ValueSet JSON object */;
const options = {
	enumType: 'code',
	includeExportKeyword: true,
	enumNamingStrategy: new EnumNamingStrategy({ type: EnumNamingStrategyType.SIMPLE }),
	propertyNamingStrategy: new PropertyNamingStrategy({ type: PropertyNamingStrategyType.DISPLAY }),
	nameOverride: 'MyEnum',
};
const tsEnum = await generateEnum(valueSet, options);
console.log(tsEnum);
```

## Web Demo

Try the [demo](https://lee-campbell.github.io/fhir-codegen-valueset-enum/) to paste a FHIR ValueSet and instantly generate a TypeScript enum.

## Options

- **enumType**: `'code' | 'Coding' | 'both'` — Output style
- **includeExportKeyword**: `boolean` — Add `export` keyword
- **enumNamingStrategy**: Naming strategy for the enum
- **propertyNamingStrategy**: Naming strategy for enum members
- **nameOverride**: Fallback name if ValueSet lacks a name

## Roadmap

- [x] Print to file/stdout
- [x] Generate from files/glob patterns
- [x] Generate from $expand URLs (e.g. https://tx.fhir.org/r5/ValueSet/issue-severity/$expand?_format=json)
- [x] Generate from search URLs (e.g. https://tx.fhir.org/r5/ValueSet), with "followPages" option
- [x] Object enums (or as close as TypeScript will allow)
- [x] CLI
- [x] Web demo (GitHub Pages)
- [ ] Deal with conflicting display names (collisions between CodeSystems)
- [ ] Option to add a namespace to output enums
- [ ] Bring your own linting
- [ ] XML support
