// routes/projects.ts
export type Project = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
};

export const projects: Project[] = [];

import { assignments } from "./users.ts";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function projectsRoute(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // GET /projects
  if (req.method === "GET" && url.pathname === "/projects") {
    return jsonResponse(projects);
  }

  // POST /projects
  if (req.method === "POST" && url.pathname === "/projects") {
    const body = await req.json();
    const newProject: Project = {
      id: projects.length + 1,
      name: body.name,
      description: body.description ?? "",
      createdAt: new Date().toISOString(),
    };
    projects.push(newProject);
    return jsonResponse(newProject, 201);
  }

  // DELETE /projects/:id → elimina proyecto + asignaciones del proyecto (cascada)
  if (req.method === "DELETE" && url.pathname.startsWith("/projects/")) {
    const id = Number(url.pathname.split("/")[2]);
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return jsonResponse({ error: "Proyecto no encontrado" }, 404);

    const removedProject = projects.splice(index, 1)[0];

    // cascada: borrar asignaciones del proyecto
    let removed = 0;
    for (let i = assignments.length - 1; i >= 0; i--) {
      if (assignments[i].projectId === id) {
        assignments.splice(i, 1);
        removed++;
      }
    }

    return jsonResponse({ message: "Proyecto eliminado", project: removedProject, removedAssignments: removed });
  }

  return jsonResponse({ error: "Ruta no encontrada" }, 404);
}
