import InputDataProcessor from "./processor";

type BufferProcessorOptions = {
  data: string | Buffer,
}

/**
 * Data pre-processor to convert Buffers to string.
 * @param options The BufferProcessorOptions for handling the inbound data (just the data in this
 * simple case).
 * @returns A stringified version of the data.
 */
const bufferProcessor: InputDataProcessor = async (options: BufferProcessorOptions, callback) => {
  const { data } = options;
  
  if (typeof data !== "string" && !Buffer.isBuffer(data)) {
    throw new Error('The supplied data must be a string or a Buffer.');
  }
  await callback(data.toString('utf-8'));
};

export default bufferProcessor;
