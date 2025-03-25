import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { startServer } from "./index";
import type { Server } from "bun";
import { migrateToLatest } from "../scripts/migrate";
import db from "./database";

const HOSTNAME = "localhost";
const PORT = 45671;
const BASE_URL = `http://${HOSTNAME}:${PORT}`;

let server: Server;

// Start server before all tests
beforeAll(async () => {
  await migrateToLatest(db);

  console.log("Starting server for tests...");
  server = startServer(HOSTNAME, PORT);
});

// Stop server after all tests
afterAll(async () => {
  console.log("Server stopped after tests");
  server.stop();

  // Delete the test database
  await Bun.file(db.filename).delete();
});

describe("API Tests", () => {
  test("health check endpoint", async () => {
    const response = await fetch(`${BASE_URL}/`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("version");
  });

  test("create user endpoint", async () => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        password: "testpass123",
      }),
    });
    expect(response.status).toBe(201);
  });

  test("create user endpoint with existing username", async () => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        password: "difftestpass123",
      }),
    });
    expect(response.status).toBe(400);
  });

  test("sign in endpoint", async () => {
    const response = await fetch(`${BASE_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "testuser",
        password: "testpass123",
      }),
    });
    expect(response.status).toBe(201);
  });

  test("create space endpoint", async () => {
    const response = await fetch(`${BASE_URL}/spaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Space",
        owner: "testuser",
      }),
    });
    expect(response.status).toBe(201);
  });
}); 