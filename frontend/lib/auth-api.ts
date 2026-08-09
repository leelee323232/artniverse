import { api } from "@/lib/api";
import type { LoginInput, User } from "@/types/auth";

export async function getCsrfCookie(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export async function loginRequest(
  input: LoginInput,
): Promise<User> {
  await getCsrfCookie();

  await api.post("/login", input);

  return getCurrentUser();
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<{ data: User }>("/api/v1/me");

  return response.data.data;
}

export async function logoutRequest(): Promise<void> {
  await getCsrfCookie();
  await api.post("/logout");
}