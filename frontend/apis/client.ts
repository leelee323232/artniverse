import axios from "axios";

// axios 實例：baseURL 抽成環境變數，未來切換環境只要改 .env。
// 未設定時預設回退測試環境，避免忘了設定整個壞掉。
export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://demoapi.artniverse.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 登入後拿到的 token 存在 localStorage，需要授權的 API 會自動帶上。
const TOKEN_KEY = "artniverse_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// 每次請求自動帶上 Authorization header（有 token 時）。
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
