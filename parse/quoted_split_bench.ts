import { quotedSplit } from "./quoted_split.ts";

Deno.bench("quotedSplit small", () => {
  quotedSplit("a b");
});

Deno.bench("quotedSplit big", () => {
  quotedSplit(
    "a b c d e f g h i j k l m n o p q r s t u v w x y z",
  );
});
