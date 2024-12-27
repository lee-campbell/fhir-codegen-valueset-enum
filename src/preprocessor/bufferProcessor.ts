import InputDataProcessor from "./processor";

/**
 * Data pre-processor to convert Buffers to string.
 * @param data The data.
 * @returns A stringified version of the data.
 */
const bufferProcessor: InputDataProcessor = (data: string | Buffer) => {
  if (typeof data !== "string" && !Buffer.isBuffer(data)) {
    throw new Error('The supplied data must be a string or a Buffer.');
  }
  return [data.toString('utf-8')];
};

export default bufferProcessor;
