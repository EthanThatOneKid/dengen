import { setup } from "../deps.ts";
import { GENERATE, generate } from "../mod.ts";
import { parseGenerateFlags, toGenerateOptions } from "./flags.ts";

if (import.meta.main) {
  await main();
}

/**
 * main is the entrypoint of the Dengen CLI.
 */
async function main() {
  const flags = parseGenerateFlags(Deno.args);
  const options = toGenerateOptions(flags);

  await setup({
    loggers: {
      [GENERATE]: {
        // Suppress log messages if not verbose.
        level: flags.verbose ? "DEBUG" : "ERROR",
      },
    },
  });

  await generate(options);
}
