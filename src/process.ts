import * as prettier from 'prettier';
import generateStringEnum, { EnumGeneratorOptions } from "./stringEnumGenerator";
import globProcessor from "./preprocessor/globProcessor";
import bufferProcessor from "./preprocessor/bufferProcessor";
import deserialise from "./deserialise";

type ProcessingOptions = Partial<EnumGeneratorOptions> & {
  inputFilePattern?: string;
  inputData?: string | Buffer;
};

const processInputs = async (options: ProcessingOptions): Promise<string[]> => {
  const dataProcessingPromises: (string[] | Promise<string[]>)[] = [];

  if (options.inputFilePattern) {
    dataProcessingPromises.push(globProcessor(options.inputFilePattern));
  }

  if (options.inputData) {
    dataProcessingPromises.push(bufferProcessor(options.inputData));
  }

  const inputData = (await Promise.all(dataProcessingPromises)).flatMap(i => i);

  if (inputData.length < 1) {
    throw new Error('None of the supplied input parameters contains any data.');
  }

  return await Promise.all(
    inputData
      .flatMap(i => deserialise(i))
      .map(v => generateStringEnum(v, options))
      .map(e => prettier.format(e, {
        parser: 'babel-ts',
      }))
  );
};

export default processInputs;
