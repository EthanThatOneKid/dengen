import { assertEquals } from "../dev_deps.ts";

import { getMatches } from "./regex.ts";

Deno.test("getMatches gets the matches of a regex", () => {
  const matches = getMatches(
    `This is a
multiline string.
It has multiple
lines.`,
    /\b\w+\b/g,
  );
  assertEquals(matches, [
    { match: "This", line: 1, character: 1 },
    { match: "is", line: 1, character: 6 },
    { match: "a", line: 1, character: 9 },
    { match: "multiline", line: 2, character: 1 },
    { match: "string", line: 2, character: 11 },
    { match: "It", line: 3, character: 1 },
    { match: "has", line: 3, character: 4 },
    { match: "multiple", line: 3, character: 8 },
    { match: "lines", line: 4, character: 1 },
  ]);
});
