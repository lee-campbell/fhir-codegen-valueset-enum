import * as prettier from 'prettier';
import generateStringEnum, { EnumGeneratorOptions } from "./stringEnumGenerator";
import globProcessor from "./preprocessor/globProcessor";
import bufferProcessor from "./preprocessor/bufferProcessor";
import deserialise from "./deserialise";
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
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
    const generatedEnum = generateStringEnum(v, options);
    const formattedEnum = await prettier.format(generatedEnum, { parser: 'babel-ts' });

    if (options.outputDirectory) {
      const outputPath = join(options.outputDirectory, `${v.name}.ts`);
      await writeFile(outputPath, formattedEnum, 'utf-8');
    } else {
      console.log(formattedEnum);
    }
  }
}

const processInputs = async (options: ProcessingOptions): Promise<void> => {
  if (options.outputDirectory) {
    await mkdir(options.outputDirectory, { recursive : true });
  }

  if (options.inputFilePattern) {
    await globProcessor(
      { filePattern: options.inputFilePattern },
      async (data) => { await processInput(data, options); },
    );
  }

  if (options.inputData) {
    await bufferProcessor(
      { data: options.inputData },
      async (data) => { await processInput(data, options) },
    );
  }

  if (options.url) {
    await urlProcessor(
      { url: options.url, followLinks: options.followLinks },
      async (data) => { await processInput(data, options) },
    )
  }
};

export default processInputs;
