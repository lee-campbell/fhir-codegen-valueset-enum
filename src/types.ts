import { ValueSet as ValueSetR2 } from "fhir/r2";
import { ValueSet as ValueSetR3 } from "fhir/r3";
import { ValueSet as ValueSetR4 } from "fhir/r4";
import { ValueSet as ValueSetR4B } from "fhir/r4b";
import { ValueSet as ValueSetR5 } from "fhir/r5";

import { ValueSetExpansionContains as ValueSetExpansionContainsR2 } from "fhir/r2";
import { ValueSetExpansionContains as ValueSetExpansionContainsR3 } from "fhir/r3";
import { ValueSetExpansionContains as ValueSetExpansionContainsR4 } from "fhir/r4";
import { ValueSetExpansionContains as ValueSetExpansionContainsR4B } from "fhir/r4b";
import { ValueSetExpansionContains as ValueSetExpansionContainsR5 } from "fhir/r5";

export type ValueSet = 
  | ValueSetR2
  | ValueSetR3
  | ValueSetR4
  | ValueSetR4B
  | ValueSetR5;

export type ValueSetExpansionContains = 
  | ValueSetExpansionContainsR2
  | ValueSetExpansionContainsR3
  | ValueSetExpansionContainsR4
  | ValueSetExpansionContainsR4B
  | ValueSetExpansionContainsR5;
