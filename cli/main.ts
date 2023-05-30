import { handlers, setup } from "../deps.ts";
import { GENERATE, generate } from "../mod.ts";
import { parseGenerateFlags, toGenerateOptions } from "./flags.ts";

if (import.meta.main) {
  await main();
}

/**
 * main is the entrypoint of the program.
 */
async function main() {
  const flags = parseGenerateFlags(Deno.args);
  const options = toGenerateOptions(flags);

  await setup({
    loggers: {
      [GENERATE]: {
        // Suppress log messages if not verbose.
        level: options.verbose ? "DEBUG" : "WARNING",
        handlers: ["console"],
      },
    },
    handlers: {
      console: new handlers.ConsoleHandler("DEBUG"),
    },
  });

  await generate(options);
}
