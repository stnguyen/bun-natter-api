import { Database } from "bun:sqlite";

export async function createSpace(db: Database, name: string, owner: string) {
  if (name.length > 255) {
    throw new Error("name is longer than 255 characters");
  }
  if (owner.length > 30) {
    throw new Error("owner is longer than 255 characters");
  }

  return db.run("INSERT INTO spaces (name, owner) VALUES (?, ?)", [
    name,
    owner,
  ]);
}

export async function getSpaces(db: Database) {
  return db.query("SELECT * FROM spaces").all;
}
