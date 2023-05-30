/**
 * quotedSplit is a simple shell-like string splitter that splits on spaces
 * unless the space is quoted.
 *
 * @see https://tip.golang.org/src/cmd/internal/quoted/quoted.go
 */
export function quotedSplit(s: string): string[] {
  // Split fields allowing '' or "" around elements.
  // Quotes further inside the string do not count.
  const f: string[] = [];
  while (s.length > 0) {
    while (s.length > 0 && isSpaceByte(s[0])) {
      s = s.slice(1);
    }
    if (s.length === 0) {
      break;
    }
    // Accepted quoted string. No unescaping inside.
    if (s[0] === '"' || s[0] === "'") {
      const quote = s[0];
      s = s.slice(1);
      let i = 0;
      while (i < s.length && s[i] !== quote) {
        i++;
      }
      if (i >= s.length) {
        throw new Error(`Unterminated ${quote} string.`);
      }
      f.push(s.slice(0, i));
      s = s.slice(i + 1);
      continue;
    }
    let i = 0;
    while (i < s.length && !isSpaceByte(s[i])) {
      i++;
    }
    f.push(s.slice(0, i));
    s = s.slice(i);
  }
  return f;
}

// isSpaceByte returns true if the given character is a space character.
function isSpaceByte(c: string): boolean {
  return c === " " || c === "\t" || c === "\n" || c === "\r";
}
