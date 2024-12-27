# FHIR ValueSet to Enum Generator

Code generator for creating TypeScript enums from FHIR ValueSets

## Roadmap

- [x] Generate from files/glob patterns
- [ ] Generate from $expand URLs (e.g. https://tx.fhir.org/r5/ValueSet/issue-severity/$expand?_format=json)
- [ ] Generate from search URLs (e.g. https://tx.fhir.org/r5/ValueSet), with "followPages" option
- [ ] CLI
- [x] Print to file/stdout
- [ ] Option to add a namespace to output enums
- [ ] Bring your own linting
- [ ] Object enums (or as close as TypeScript will allow)
- [ ] XML support
