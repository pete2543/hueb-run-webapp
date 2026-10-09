/**
 * ตัวเรียก API ของ ASP.NET Core (docs/api-contract.md)
 * error ทุกตัวมีรูป { code, message, details } เช่น QUOTA_FULL, ORDER_EXPIRED
 */

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1"

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(
      res.status,
      body?.code ?? "UNKNOWN",
      body?.message ?? res.statusText,
      body?.details,
    )
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
