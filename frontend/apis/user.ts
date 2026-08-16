import { apiClient, setToken, clearToken } from "./client";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  token?: string;
  user?: {
    id: number | string;
    name: string;
    email: string;
  };
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  // 用來識別登入裝置，未帶時預設為 "web"
  device_name?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token_type: string;
  access_token: string;
  expires_at: string;
  user: AuthUser;
}

// 使用者 / 認證相關 API：路徑封裝在這一層，外層只要呼叫 userAPI.xxx()。
export const userAPI = {
  async register(payload: RegisterPayload) {
    const data = await apiClient.post<RegisterResponse>(
      "/v1/auth/register",
      payload,
    );
    return data;
  },

  // 登入成功後自動存下 access_token，後續需要授權的請求會自動帶上。
  async login(payload: LoginPayload) {
    const data = await apiClient.post<LoginResponse>("/v1/auth/token", {
      // device_name: "web",
      ...payload,
    });
    setToken(data?.data?.access_token);
    return data;
  },

  // 打了就登出（後端銷毀 token），同時清掉本地存的 token。
  async logout() {
    try {
      await apiClient.delete("/v1/auth/token");
    } finally {
      clearToken();
    }
  },
};
