import db from "./database.ts";
import { createSpace } from "./spaces.ts";

const VERSION = "0.0.1";

const server = Bun.serve({
  port: 4567,
  async fetch(req, server) {
    const { method, url } = req;
    const pathname = new URL(url).pathname;

    console.log(`Received ${method} request to '${pathname}'`);

    if (method === "GET" && pathname === "/") {
      // Health check
      return Response.json({ version: VERSION });
    } else if (method === "POST" && pathname === "/spaces") {
      // Create a new space
      const { name, owner } = await req.json();
      await createSpace(db, name, owner);
    }

    return new Response("Not found", { status: 404 });
  },
  error(e) {
    console.error(e);
    return new Response("Internal server error", { status: 500 });
  },
});

console.log(`Listening on localhost:${server.port}`);
