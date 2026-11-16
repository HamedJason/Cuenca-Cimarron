// Peticiones a la API con la cookie de sesión y la protección CSRF de Laravel.
// Los errores llegan como ApiError con el mensaje en español y los errores por campo.

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function xsrfToken() {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfReady = null;
// Las rutas de escuelas y administración necesitan la cookie XSRF-TOKEN antes de mandar datos.
function ensureCsrf() {
  if (xsrfToken()) return Promise.resolve();
  csrfReady ??= fetch("/api/sesion", { credentials: "same-origin", headers: { Accept: "application/json" } })
    .catch(() => {})
    .finally(() => {
      csrfReady = null;
    });
  return csrfReady;
}

export async function api(path, { method = "GET", body, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (method !== "GET") {
    await ensureCsrf();
    const token = xsrfToken();
    if (token) headers["X-XSRF-TOKEN"] = token;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ?? AbortSignal.timeout(15000),
    });
  } catch {
    throw new ApiError("No hay conexión con el servidor. Revisa tu internet e intenta otra vez", 0);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errors = {};
    for (const [field, list] of Object.entries(data.errors || {})) errors[field] = list[0];
    const message =
      response.status === 419
        ? "La página estuvo abierta mucho tiempo. Recárgala e intenta otra vez"
        : response.status === 429
          ? data.message || "Demasiados intentos. Espera un momento"
          : data.message || "Algo salió mal. Intenta otra vez";
    throw new ApiError(message, response.status, errors);
  }
  return data;
}
