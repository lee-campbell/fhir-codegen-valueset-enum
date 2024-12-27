import { glob, readFile } from "node:fs/promises";
import InputDataProcessor from "./processor";

type GlobProcessorOptions = {
  filePattern: string;
}

/**
 * Data pre-processor to read file contents and convert them to strings.
 * @param filePattern The glob pattern to match.
 * @returns The stringified file data.
 */
const globProcessor: InputDataProcessor = async (options: GlobProcessorOptions, callback) => {
  const { filePattern } = options;
  
  for await (const match of glob(filePattern)) {
    const fileContents = await readFile(match, 'utf-8');
    await callback(fileContents);
  }
}

export default globProcessor;
