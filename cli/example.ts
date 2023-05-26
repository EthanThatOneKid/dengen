import { hello } from "../testtest/example.ts";

//deno:generate deno run -A generate_art.ts
const art = Deno.readTextFileSync("art.txt");

console.log(art, { hello });
