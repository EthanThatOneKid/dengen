import { assertEquals, assertThrows } from "../dev_deps.ts";

import { quotedSplit } from "./quoted_split.ts";

Deno.test("split splits an empty string", () => {
  const got = quotedSplit("");
  assertEquals(got, []);
});

Deno.test("split splits a string with a space", () => {
  const got = quotedSplit(" ");
  assertEquals(got, []);
});

Deno.test("split splits a string with one word", () => {
  const got = quotedSplit("a");
  assertEquals(got, ["a"]);
});

Deno.test("split splits a string with a leading space", () => {
  const got = quotedSplit(" a");
  assertEquals(got, ["a"]);
});

Deno.test("split splits a string with a trailing space", () => {
  const got = quotedSplit("a ");
  assertEquals(got, ["a"]);
});

Deno.test("split splits a string with two words", () => {
  const got = quotedSplit("a b");
  assertEquals(got, ["a", "b"]);
});

Deno.test("split splits a string with two words and a multi-space", () => {
  const got = quotedSplit("a  b");
  assertEquals(got, ["a", "b"]);
});

Deno.test("split splits a string with two words and a tab", () => {
  const got = quotedSplit("a\tb");
  assertEquals(got, ["a", "b"]);
});

Deno.test("split splits a string with two words and a newline", () => {
  const got = quotedSplit("a\nb");
  assertEquals(got, ["a", "b"]);
});

Deno.test("split splits a string with a single-quoted word", () => {
  const got = quotedSplit("'a b'");
  assertEquals(got, ["a b"]);
});

Deno.test("split splits a string with a double-quoted word", () => {
  const got = quotedSplit('"a b"');
  assertEquals(got, ["a b"]);
});

Deno.test("split splits a string with a single-quoted and double-quoted word", () => {
  const got = quotedSplit(`'a '"b "`);
  assertEquals(got, ["a ", "b "]);
});

Deno.test("split splits a string with a both quotes contained within each other", () => {
  const got = quotedSplit(`'a "'"'b"`);
  assertEquals(got, [`a "`, `'b`]);
});

Deno.test("split escapes single quote", () => {
  const got = quotedSplit(`\\'`);
  assertEquals(got, [`\\'`]);
});

Deno.test("Split throws on unterminated single quote", () => {
  assertThrows(() => quotedSplit(`'a`), Error, "unterminated ' string");
});
