const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = new URL(endpoint, BASE_URL).toString();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // sends cookies automatically
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data as T;
}
