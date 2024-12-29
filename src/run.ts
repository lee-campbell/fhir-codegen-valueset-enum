import EnumGeneratorParser from "./cli";

async function main(): Promise<void> {
  const cli = new EnumGeneratorParser();
  await cli.executeAsync();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
