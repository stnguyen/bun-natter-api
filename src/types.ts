import type { TSchema } from "@sinclair/typebox";
import { TypeCheck, TypeCompiler } from "@sinclair/typebox/compiler";

const SCHEMA_VALIDATOR_MAP = new Map<TSchema, TypeCheck<TSchema>>();

/**
 * Validate JSON payload against a schema.
 * @param payload  The JSON payload to validate.
 * @param schema  The schema to validate the payload against.
 * @throws TypeError if the schema is invalid.
 */
export function validatePayload(payload: any, schema: TSchema): any {
  if (!SCHEMA_VALIDATOR_MAP.has(schema)) {
    const newCompiler = TypeCompiler.Compile(schema);
    SCHEMA_VALIDATOR_MAP.set(schema, newCompiler);
  }

  const validator = SCHEMA_VALIDATOR_MAP.get(schema);
  if (validator!.Check(payload)) {
    return payload;
  }

  const error = validator!.Errors(payload).First();
  // Don't return the error object fully, as it may return malicious user input
  throw new TypeError(error!.message, {
    cause: { path: error?.path, schema: error?.schema },
  });
}
