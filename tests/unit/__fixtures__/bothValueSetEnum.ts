/** My Value Set */
export enum MyValueSet {
  /**
   * Thing
   */
  THING = 'thi',
}

/** My Value Set (Coding) */
const MyValueSetCoding = {
  /**
   * Thing
   */
  THING: {
    code: 'thi',
    system: 'http://example.com',
    display: 'Thing',
  },
} as const;

export { MyValueSetCoding };
