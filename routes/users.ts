// routes/users.ts
import { projects } from "./projects.ts";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  active: boolean;
};

export type Assignment = {
  userId: number;
  projectId: number;
  projectName: string;
  assignedAt: string;
  status: string; // "active", "completed", "removed"
};

export const users: User[] = [];
export const assignments: Assignment[] = [];

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function usersRoute(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // GET /users
  if (req.method === "GET" && url.pathname === "/users") {
    return jsonResponse(users);
  }

  // POST /users
  if (req.method === "POST" && url.pathname === "/users") {
    const body = await req.json();
    const newUser: User = {
      id: users.length + 1,
      name: body.name,
      email: body.email,
      role: body.role ?? "user",
      createdAt: new Date().toISOString(),
      active: true,
    };
    users.push(newUser);
    return jsonResponse(newUser, 201);
  }

  // DELETE /users/:id  → elimina usuario + asignaciones del usuario (cascada)
  if (req.method === "DELETE" && url.pathname.startsWith("/users/") && !url.pathname.includes("/assign/")) {
    const id = Number(url.pathname.split("/")[2]);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return jsonResponse({ error: "Usuario no encontrado" }, 404);

    users.splice(idx, 1);

    // cascada: borrar asignaciones del usuario
    let removed = 0;
    for (let i = assignments.length - 1; i >= 0; i--) {
      if (assignments[i].userId === id) {
        assignments.splice(i, 1);
        removed++;
      }
    }

    return jsonResponse({ message: "Usuario eliminado", removedAssignments: removed });
  }

  // POST /users/:id/assign/:projectId  → validar proyecto existente + evitar duplicados
  if (
    req.method === "POST" &&
    url.pathname.startsWith("/users/") &&
    url.pathname.includes("/assign/")
  ) {
    const parts = url.pathname.split("/");
    const userId = Number(parts[2]);
    const projectId = Number(parts[4]);

    const user = users.find((u) => u.id === userId);
    if (!user) return jsonResponse({ error: "Usuario no encontrado" }, 404);

    const project = projects.find((p) => p.id === projectId);
    if (!project) return jsonResponse({ error: "Proyecto no existente" }, 400);

    // evitar duplicado
    const dup = assignments.some((a) => a.userId === userId && a.projectId === projectId);
    if (dup) return jsonResponse({ error: "Asignación ya existe" }, 409);

    const assignment: Assignment = {
      userId,
      projectId,
      projectName: project.name,
      assignedAt: new Date().toISOString(),
      status: "active",
    };
    assignments.push(assignment);

    return jsonResponse({ message: `Usuario ${userId} asignado a ${project.name}`, assignment });
  }

  // DELETE /users/:id/assign/:projectId  → remover asignación puntual
  if (
    req.method === "DELETE" &&
    url.pathname.startsWith("/users/") &&
    url.pathname.includes("/assign/")
  ) {
    const parts = url.pathname.split("/");
    const userId = Number(parts[2]);
    const projectId = Number(parts[4]);

    const index = assignments.findIndex((a) => a.userId === userId && a.projectId === projectId);
    if (index === -1) return jsonResponse({ error: "Asignación no encontrada" }, 404);

    const removed = assignments.splice(index, 1)[0];
    return jsonResponse({
      message: `Usuario ${userId} removido de ${removed.projectName}`,
      assignment: removed,
    });
  }

  return jsonResponse({ error: "Ruta no encontrada" }, 404);
}
