import { createGraph, dirname, getLogger } from "./deps.ts";
import { parseComments } from "./parse/mod.ts";

/**
 * generate runs procedures defined in comment annotations.
 */
export async function generate(options: GenerateOptions): Promise<void> {
  logger().info("Generating...");
  const graph = await createGraph(options.rootSpecifiers);
  for (const module of graph.modules) {
    const specifier = new URL(module.specifier);
    logger().info(`Generating ${specifier}`);
    const content = await Deno.readTextFile(specifier);
    const comments = parseComments(content);
    const aliases = new Map<string, string[]>();
    for (const comment of comments) {
      if (comment.alias) {
        aliases.set(comment.alias, comment.args);
        continue;
      }

      const args = aliases.has(comment.args[0])
        ? aliases.get(comment.args[0])!.concat(comment.args.slice(1))
        : comment.args;
      const cwd = new URL(dirname(module.specifier));
      const details = args.join(" ");
      if (options.trace) {
        console.log(details);
      }

      if (options.dryRun) {
        continue;
      }

      const command = new Deno.Command(args[0], {
        args: args.slice(1),
        cwd,
        stdout: "piped",
        stderr: "piped",
      });
      const process = command.spawn();
      if (options.verbose) {
        process.stdout.pipeTo(Deno.stdout.writable);
        process.stderr.pipeTo(Deno.stderr.writable);
      }

      const status = await process.status;
      if (!status.success) {
        logger().error(`Failed to execute ${details}`);
        break;
      }

      logger().info(`Successfully executed ${details}`);
    }
  }

  logger().info(JSON.stringify(graph, undefined, "  "));
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
