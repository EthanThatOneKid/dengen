import { createGraph, dirname, getLogger } from "./deps.ts";
import { parseComments } from "./parse/mod.ts";

/**
 * generate runs procedures defined in comment annotations.
 */
export async function generate(options: GenerateOptions): Promise<void> {
  logger().info("Generating...");
  const graph = await createGraph(options.rootSpecifiers);
  for (const module of graph.modules) {
    // Exclude the module if it matches any of the exclude patterns.
    const exclude = options.exclude.some((re) => re.test(module.specifier));
    if (exclude) {
      continue;
    }

    // Include the module if it matches any of the include patterns or if
    // there are no include patterns.
    const include = options.include.length === 0 ||
      options.include.some((re) => re.test(module.specifier));
    if (!include) {
      continue;
    }

    // Run the generators.
    const specifier = new URL(module.specifier);
    logger().info(`Generating ${specifier}`);
    const comments = await parseComments(
      Deno.openSync(specifier, { "read": true }),
    );
    const aliases = new Map<string, string[]>();
    for (const comment of comments) {
      // Skip the comment if it matches any of the skip patterns.
      const skip = options.skip.some((re) => re.test(comment.original));
      if (skip) {
        continue;
      }

      // Run the comment if it matches any of the run patterns or if there
      // are no run patterns.
      const run = options.run.length === 0 ||
        options.run.some((re) => re.test(comment.original));
      if (!run) {
        continue;
      }

      // Add the comment to the aliases map if it is an alias.
      if (comment.alias) {
        aliases.set(comment.alias, comment.args);
        continue;
      }

      // Construct the command details.
      const args = aliases.has(comment.args[0])
        ? aliases.get(comment.args[0])!.concat(comment.args.slice(1))
        : comment.args;
      const details = args.join(" ");
      if (options.trace) {
        console.log(details);
      }

      // Skip the command if this is a dry run.
      if (options.dryRun) {
        continue;
      }

      // Run the generator.
      const cwd = new URL(dirname(module.specifier));
      const command = new Deno.Command(args[0], {
        args: args.slice(1),
        cwd,
        stdout: "piped",
        stderr: "piped",
      });
      const output = command.outputSync();
      if (options.verbose) {
        Deno.stdout.writable.getWriter().write(output.stdout);
        Deno.stderr.writable.getWriter().write(output.stderr);
      }

      // Stop running generators in this module if the process failed.
      if (!output.success) {
        logger().error(`Failed to execute "${details}"`);
        break;
      }

      // Log the success.
      logger().info(`Successfully executed "${details}"`);
    }
  }
}

/**
 * GenerateOptions is the options for generate function.
 */
export interface GenerateOptions {
  /**
   * rootSpecifiers is a URL string of the root module specifier to build
   * the graph from or array of URL strings.
   */
  rootSpecifiers: string[];

  /**
   * dryRun is whether to run the directives without making any changes.
   */
  dryRun: boolean;

  /**
   * trace is whether to trace the execution of the directives. This prints
   * the commands as they are executed.
   */
  trace: boolean;

  /**
   * verbose is whether to print verbose output.
   */
  verbose: boolean;

  /**
   * run is a list of procedure patterns to run. It specifies a regular
   * expression to select directives to run by matching against the directive
   * text as-is. The regular expression does not need to match the entire
   * text of the directive, but it must match at least one character. The
   * default is to run all directives.
   */
  run: RegExp[];

  /**
   * skip is a list of procedure patterns to skip. It specifies a regular
   * expression to select directives to skip by matching against the directive
   * text as-is. The regular expression does not need to match the entire text
   * of the directive, but it must match at least one character. The default is
   * to not skip any directives.
   *
   * In the event that a command matches both a run and skip regular expressions,
   * the command is skipped.
   */
  skip: RegExp[];

  /**
   * include is a list of files to include. It specifies a glob pattern to
   * select files to include. The default is to include all files.
   */
  include: RegExp[];

  /**
   * exclude is a list of files to exclude. It specifies which files to exclude
   * from the include list. The default is to exclude no files. If a file is
   * matched by both the include and exclude lists, it is excluded.
   */
  exclude: RegExp[];
}

/**
 * logger is the logger for generate function.
 */
export function logger() {
  return getLogger(GENERATE);
}

/**
 * GENERATE is the directive name for generate function.
 */
export const GENERATE = "generate";
