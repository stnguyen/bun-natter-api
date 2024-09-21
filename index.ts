import { Database } from "bun:sqlite";

const db = new Database(":memory:");
const server = Bun.serve({
    port: 3000,
    fetch(request) {
        const query = db.query("select 'Hello world' as message;");
        const resp = query.get(); // => { message: "Hello world" }
        console.log(resp);
        return new Response("Welcome to Bun!");
    },
});

console.log(`Listening on localhost:${server.port}`);
