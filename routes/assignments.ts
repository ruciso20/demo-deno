// routes/assignments.ts
import { assignments } from "./users.ts";

/**
 * GET    /assignments                       → lista todas las asignaciones
 * DELETE /assignments/:userId/:projectId    → borra asignación puntual
 */
export function assignmentsRoute(req: Request): Response {
  const url = new URL(req.url);

  // GET /assignments
  if (req.method === "GET" && url.pathname === "/assignments") {
    return new Response(JSON.stringify(assignments, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // DELETE /assignments/:userId/:projectId
  if (req.method === "DELETE" && url.pathname.startsWith("/assignments/")) {
    const parts = url.pathname.split("/");
    // /assignments/:userId/:projectId
    if (parts.length !== 4) {
      return json({ error: "Formato inválido. Usa /assignments/:userId/:projectId" }, 400);
    }
    const userId = Number(parts[2]);
    const projectId = Number(parts[3]);

    const before = assignments.length;
    for (let i = assignments.length - 1; i >= 0; i--) {
      if (assignments[i].userId === userId && assignments[i].projectId === projectId) {
        assignments.splice(i, 1);
      }
    }
    const removed = before - assignments.length;

    if (removed === 0) {
      return json({ error: "Asignación no encontrada" }, 404);
    }
    return json({ message: "Asignación eliminada", removed });
  }

  return json({ error: "Ruta no encontrada" }, 404);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}



