// Small wrapper around fetch. It sends the login cookie and turns server errors into exceptions.
export async function api(path, { method = "GET", body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "same-origin",
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    // The response had no JSON body, so keep the empty object
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}
