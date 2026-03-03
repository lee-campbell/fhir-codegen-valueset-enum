import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import deserialise from './deserialise';
import generateEnum, { type EnumGeneratorOptions } from './generateEnum';
import bufferProcessor from './preprocessor/bufferProcessor';
import globProcessor from './preprocessor/globProcessor';
import urlProcessor from './preprocessor/urlProcessor';

type ProcessingOptions = Partial<EnumGeneratorOptions> & {
  inputFilePattern?: string;
  inputData?: string | Buffer;
  /**
   * The directory into which the files should be written. If none is supplied, the output of the
   * enum generation will be written to `stdout`.
   */
  outputDirectory?: string;
  url?: string | URL;
  followLinks?: boolean;
};

const processInput = async (input: string, options: ProcessingOptions): Promise<void> => {
  const valueSets = deserialise(input);

  for (const v of valueSets) {
    const generatedEnum = await generateEnum(v, options);

    if (options.outputDirectory) {
      const outputPath = join(options.outputDirectory, `${v.name}.ts`);
      await writeFile(outputPath, generatedEnum, 'utf-8');
    } else {
      console.log(generatedEnum);
    }
  }
};

const processInputs = async (options: ProcessingOptions): Promise<void> => {
  if (options.outputDirectory) {
    await mkdir(options.outputDirectory, { recursive: true });
  }

  if (options.inputFilePattern) {
    await globProcessor({ filePattern: options.inputFilePattern }, async (data) => {
      await processInput(data, options);
    });
  }

  if (options.inputData) {
    await bufferProcessor({ data: options.inputData }, async (data) => {
      await processInput(data, options);
    });
  }

  if (options.url) {
    await urlProcessor({ url: options.url, followLinks: options.followLinks }, async (data) => {
      await processInput(data, options);
    });
  }
};

export default processInputs;
