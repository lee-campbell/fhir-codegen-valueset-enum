import { glob, readFile } from "node:fs/promises";
import InputDataProcessor from "./processor";

/**
 * Data pre-processor to read file contents and convert them to strings.
 * @param filePattern The glob pattern to match.
 * @returns The stringified file data.
 */
const globProcessor: InputDataProcessor = async (filePattern: string) => {
  const fileContents: string[] = [];
  
  for await (const match of glob(filePattern)) {
    fileContents.push(await readFile(match, 'utf-8'));
  }

  return fileContents;
}

export default globProcessor;
