// Create a child process running `deno doc --json`.
const child = new Deno.Command(Deno.execPath(), {
  args: ["doc", "--json"],
  stdin: "piped",
  stdout: "piped",
}).spawn();

// Pipe the child process stdout to a writable file named "doc.json".
child.stdout.pipeTo(
  Deno.openSync("doc.json", { write: true, create: true }).writable,
);
