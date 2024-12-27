/**
 * Abstract function type definition for input data processing. Takes any arguments and returns
 * strings for subsequent deserialisation.
 */
type InputDataProcessor = (options: any, callback: (data: string) => Promise<void>) => Promise<void>;

export default InputDataProcessor;
