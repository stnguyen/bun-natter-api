import { Database } from "bun:sqlite";

class Spaces {
  constructor(private database: Database) {}

  async createSpace(name: string) {
    return this.database.run("INSERT INTO spaces (name) VALUES (?)", name);
  }

  async getSpaces() {
    return this.database.all("SELECT * FROM spaces");
  }
}