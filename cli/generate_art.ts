// Create a child process running terminal_images.
const child = new Deno.Command(Deno.execPath(), {
  args: [
    "run",
    "-A",
    "https://deno.land/x/terminal_images@3.1.0/cli.ts",
    "https://deno.land/images/artwork/hashrock_simple.png",
  ],
  stdin: "piped",
  stdout: "piped",
}).spawn();

// Pipe the child process stdout to a writable file named "static/doc.json".
child.stdout.pipeTo(
  Deno.openSync("art.txt", { write: true, create: true }).writable,
);
