import {
  globToRegExp,
  isAbsolute,
  isGlob,
  join,
  parse,
  toFileUrl,
} from "../deps.ts";
import type { GenerateOptions } from "../mod.ts";

/**
 * toGenerateOptions converts CLI flags to GenerateOptions.
 */
export function toGenerateOptions(flags: GenerateFlags): GenerateOptions {
  return {
    rootSpecifiers: flags["--"]
      .map((specifier) =>
        isAbsolute(specifier)
          ? specifier
          : toFileUrl(join(Deno.cwd(), specifier)).href
      ),
    dryRun: flags["dry-run"],
    trace: flags["trace"],
    run: flags["run"].map(RegExp),
    skip: flags["skip"].map(RegExp),
    include: flags["include"]
      .map((specifierOrGlob) =>
        isGlob(specifierOrGlob)
          ? globToRegExp(specifierOrGlob)
          : escapeRegExp(specifierOrGlob)
      ),
    exclude: flags["exclude"]
      .map((specifierOrGlob) =>
        isGlob(specifierOrGlob)
          ? globToRegExp(specifierOrGlob)
          : escapeRegExp(specifierOrGlob)
      ),
  };
}

/**
 * GenerateFlags is the CLI flags.
 */
export type GenerateFlags = ReturnType<typeof parseGenerateFlags>;

/**
 * parseGenerateFlags parses the program's CLI flags.
 */
export function parseGenerateFlags(args: string[]) {
  return parse(args, {
    "--": true,
    stopEarly: true,
    string: ["run", "skip", "include", "exclude"],
    collect: ["run", "skip", "include", "exclude"],
    boolean: ["dry-run", "verbose", "trace"],
    alias: {
      "dry-run": ["n"],
      "verbose": ["v"],
      "trace": ["x"],
      "run": ["r"],
      "skip": ["s"],
    },
    default: {
      "dry-run": false,
      "verbose": false,
      "trace": false,
    },
  });
}

/**
 * escapeRegExp escapes a string for use in a regular expression.
 *
 * @see
 * https://github.com/sindresorhus/escape-string-regexp#readme
 */
export function escapeRegExp(pattern: string): RegExp {
  return new RegExp(
    pattern
      .replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
      .replace(/-/g, "\\x2d"),
  );
}
