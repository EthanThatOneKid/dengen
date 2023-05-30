//deno:generate -command gen_docs deno run -A generate_docs.ts
//deno:generate gen_docs
import doc from "./doc.json" assert { type: "json" };

console.log(doc);
