import dotenv from "dotenv";
import db from "./database.ts";
import { SQLiteError } from "bun:sqlite";
import { createSpace, TCreateSpacePayload } from "./spaces.ts";
import { validatePayload } from "./types.ts";
import {
  createUser,
  signIn,
  TCreateUserPayload,
  TSignInPayload,
} from "./users.ts";
import type { Server } from "bun";
import { logAuditEvent } from "./audit.ts";

dotenv.config();
const VERSION = "0.0.1";

function startServer(hostname: string, port: number): Server {
  const { HTTPS_KEY, HTTPS_CERT } = process.env;
  const tls =
    HTTPS_KEY && HTTPS_CERT
    ? { key: Bun.file(HTTPS_KEY), cert: Bun.file(HTTPS_CERT) }
    : undefined;

  console.log("Starting server with tls:", tls);

  const server = Bun.serve({
    hostname, port, tls,
    async fetch(req, server) {
      const { method, url } = req;
      const pathname = new URL(url).pathname;

      console.log(`Received ${method} request to '${pathname}'`);

      let response;
      let userId: string | undefined;

      if (method === "GET" && pathname === "/") {
        // Health check
        response = Response.json({ version: VERSION });
      } else if (method === "POST" && pathname === "/spaces") {
        // Create a new space
        await createSpace(
          db,
          validatePayload(await req.json(), TCreateSpacePayload)
        );
        response = Response.json({}, { status: 201 });
      } else if (method === "POST" && pathname === "/users") {
        // Create a new user
        try {
          const userData = validatePayload(await req.json(), TCreateUserPayload);
          await createUser(db, userData);
          userId = userData.username;
          response = Response.json({}, { status: 201 });
        } catch (e) {
          if (e instanceof SQLiteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
            response = Response.json(
              { message: "Username already taken" },
              { status: 400 }
            );
          } else {
            throw e;
          }
        }
      } else if (method === "POST" && pathname === "/sessions") {
        // Sign in a user
        const signInData = validatePayload(await req.json(), TSignInPayload);
        const isValid = await signIn(db, signInData);
        if (!isValid) {
          response = Response.json({ message: "Unauthorized" }, { status: 401 });
        } else {
          userId = signInData.username;
          // TODO create a session and return token
          response = Response.json({}, { status: 201 });
        }
      } else {
        response = Response.json({ message: "Not Found" }, { status: 404 });
      }

      // Log the audit event
      logAuditEvent({
        method,
        path: pathname,
        userId,
        status: response.status
      });

      return response;
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

  console.log(`Listening on ${hostname}:${server.port}`);

  return server
}

// Only log if we're not in test mode
if (process.env.NODE_ENV !== "test") {
  startServer("0.0.0.0", 4567);
}

export { startServer };
