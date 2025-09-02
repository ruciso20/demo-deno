// routes/users.ts
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

// Datos en memoria
export const users: User[] = [];
export const assignments: Assignment[] = [];

// Helper JSON
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Ruta usuarios
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

  // DELETE /users/:id
  if (req.method === "DELETE" && url.pathname.startsWith("/users/")) {
    const id = Number(url.pathname.split("/")[2]);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return jsonResponse({ error: "Usuario no encontrado" }, 404);

    users.splice(index, 1);
    return jsonResponse({ message: "Usuario eliminado" });
  }

  // POST /users/:id/assign/:projectId
  if (
    req.method === "POST" &&
    url.pathname.startsWith("/users/") &&
    url.pathname.includes("/assign/")
  ) {
    const parts = url.pathname.split("/");
    const userId = Number(parts[2]);
    const projectId = Number(parts[4]);
    const projectName = `Proyecto-${projectId}`;

    const user = users.find((u) => u.id === userId);
    if (!user) return jsonResponse({ error: "Usuario no encontrado" }, 404);

    const assignment: Assignment = {
      userId,
      projectId,
      projectName,
      assignedAt: new Date().toISOString(),
      status: "active",
    };

    assignments.push(assignment);
    return jsonResponse({ message: `Usuario ${userId} asignado a ${projectName}`, assignment });
  }

  // DELETE /users/:id/assign/:projectId
  if (
    req.method === "DELETE" &&
    url.pathname.startsWith("/users/") &&
    url.pathname.includes("/assign/")
  ) {
    const parts = url.pathname.split("/");
    const userId = Number(parts[2]);
    const projectId = Number(parts[4]);

    const index = assignments.findIndex(
      (a) => a.userId === userId && a.projectId === projectId,
    );
    if (index === -1) return jsonResponse({ error: "Asignación no encontrada" }, 404);

    const removed = assignments.splice(index, 1)[0];
    return jsonResponse({
      message: `Usuario ${userId} removido de ${removed.projectName}`,
      assignment: removed,
    });
  }

  return jsonResponse({ error: "Ruta no encontrada" }, 404);
}
