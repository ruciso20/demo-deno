export function notFoundRoute(): Response {
  return new Response("Ruta no encontrada", { status: 404 });
}
