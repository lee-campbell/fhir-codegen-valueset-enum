import { beforeEach, describe, expect, it, vi } from "vitest";
import EnumGeneratorParser from "../../src/cli";
import processInputs from "../../src/process";

vi.mock("../../src/process");

describe('cli tests', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');
  const consoleWarnSpy = vi.spyOn(console, 'warn');
  
  beforeEach(() => {
    consoleErrorSpy.mockClear();
    consoleWarnSpy.mockClear();
  });

  it('Prints an error if neither an input file pattern nor a URL is provided', async () => {
    const cli = new EnumGeneratorParser();
    await cli.executeAsync(['typescript']);
    
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('Error: At least one of --input-file or --url must be supplied.'));
  });

  it('Prints a warning if the "--follow-links" argument was provided, but without a URL.', async () => {
    const cli = new EnumGeneratorParser();
    await cli.executeAsync(['typescript', '-f', './**/*.json', '-l']);
    expect(consoleWarnSpy).toHaveBeenCalledWith('The --follow-links flag is only honoured when --url is supplied.');
  });
});
