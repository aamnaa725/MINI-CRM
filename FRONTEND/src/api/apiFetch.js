const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const apiFetch = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  // ==============================================
  // AUTHENTICATION FAILED
  // JWT expired / invalid / missing
  // ==============================================

  if (response.status === 401) {
    // Clear frontend UI authentication state
    sessionStorage.removeItem(
      "isLoggedIn"
    );

    sessionStorage.removeItem(
      "user"
    );

    // Redirect to login
    window.location.href = "/login";

    return null;
  }

  return response;
};