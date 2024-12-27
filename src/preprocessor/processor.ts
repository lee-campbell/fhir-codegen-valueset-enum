/**
 * Abstract function type definition for input data processing. Takes any arguments and returns
 * strings for subsequent deserialisation.
 */
type InputDataProcessor = (...args) => string[] | Promise<string[]>;

export default InputDataProcessor;
