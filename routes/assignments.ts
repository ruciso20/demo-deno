import { assignments } from "./users.ts";

export function assignmentsRoute(_req: Request): Response {
  return new Response(JSON.stringify(assignments, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}


