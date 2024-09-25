import db from "./database.ts";
import { createSpace, TCreateSpacePayload } from "./spaces.ts";
import { validatePayload } from "./types.ts";
import {
  createUser,
  signIn,
  TCreateUserPayload,
  TSignInPayload,
} from "./users.ts";

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
      await createSpace(
        db,
        validatePayload(await req.json(), TCreateSpacePayload)
      );
      return Response.json({}, { status: 201 });
    } else if (method === "POST" && pathname === "/users") {
      // Create a new user
      await createUser(
        db,
        validatePayload(await req.json(), TCreateUserPayload)
      );
      return Response.json({}, { status: 201 });
    } else if (method === "POST" && pathname === "/sessions") {
      // Sign in a user
      const isValid = await signIn(
        db,
        validatePayload(await req.json(), TSignInPayload)
      );
      if (!isValid) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
      }
      // TODO create a session and return token
      return Response.json({}, { status: 201 });
    }

    return Response.json({ message: "Not Found" }, { status: 404 });
  },
  error(e) {
    console.error(e);
    if (e instanceof TypeError) {
      return Response.json(
        { message: e.message, cause: e.cause },
        { status: 400 }
      );
    } else if (e instanceof SyntaxError) {
      return Response.json({ message: e.message }, { status: 400 });
    }

    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  },
});

console.log(`Listening on localhost:${server.port}`);
