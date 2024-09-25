import { Database } from "bun:sqlite";
import { Type, type Static } from "@sinclair/typebox";

export const TCreateUserPayload = Type.Object({
  username: Type.String({ minLength: 2, maxLength: 100 }),
  password: Type.String({ minLength: 6, maxLength: 30 }),
});

export const TSignInPayload = Type.Object({
  username: Type.String({ minLength: 2, maxLength: 100 }),
  password: Type.String({ minLength: 6, maxLength: 30 }),
});

export async function createUser(
  db: Database,
  user: Static<typeof TCreateUserPayload>
) {
  const hashedPassword = await Bun.password.hash(user.password);

  return db.run("INSERT INTO users (username, password) VALUES (?, ?)", [
    user.username,
    hashedPassword,
  ]);
}

export async function signIn(
  db: Database,
  user: Static<typeof TSignInPayload>
): Promise<boolean> {
  const dbUser = (await db
    .query("SELECT password FROM users WHERE username = ?")
    .get(user.username)) as { password: string } | null;

  if (!dbUser) {
    return false;
  }

  return await Bun.password.verify(user.password, dbUser?.password);
}
