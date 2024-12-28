# FHIR ValueSet to Enum Generator

Code generator for creating TypeScript enums from FHIR ValueSets

## Roadmap

The roadmap for this package consists of the following features, in priority order:

- [x] Print to file/stdout
- [x] Generate from files/glob patterns
- [x] Generate from $expand URLs (e.g. https://tx.fhir.org/r5/ValueSet/issue-severity/$expand?_format=json)
- [x] Generate from search URLs (e.g. https://tx.fhir.org/r5/ValueSet), with "followPages" option
- [x] Object enums (or as close as TypeScript will allow)
- [ ] CLI
- [ ] Deal with conflicting display names
- [ ] Option to add a namespace to output enums
- [ ] Bring your own linting
- [ ] XML support
