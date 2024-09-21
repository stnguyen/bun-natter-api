import { Database } from "bun:sqlite";
import { Type, type Static } from "@sinclair/typebox";

export const TCreateSpacePayload = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  owner: Type.String({ minLength: 1, maxLength: 30 }),
});

export async function createSpace(
  db: Database,
  space: Static<typeof TCreateSpacePayload>
) {
  return db.run("INSERT INTO spaces (name, owner) VALUES (?, ?)", [
    space.name,
    space.owner,
  ]);
}

export async function getSpaces(db: Database) {
  return db.query("SELECT * FROM spaces").all;
}
