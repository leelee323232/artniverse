"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { getToken, setToken, clearToken } from "@/apis/client";
import type { LoginResponse } from "@/apis/user";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  phone?: string | null;
  birthday?: string | null;
  address?: string | null;
  bio?: string | null;
  is_creator: boolean;
  is_admin: boolean;
  creatorProfile?: {
    brandName: string;
    bio: string;
    links: { label: string; url: string }[];
    superSubscription?: {
      enabled: boolean;
      price: number;
      benefits: string[];
    };
  };
}

export interface ApiUser {
  id: number | string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  birthday?: string | null;
  address?: string | null;
  bio?: string | null;
  is_creator?: boolean;
  is_admin?: boolean | 0 | 1 | "0" | "1";
  creator_profile?: User["creatorProfile"];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithProvider: (
    provider: "google" | "facebook" | "apple",
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateCreatorProfile: (updates: Partial<User["creatorProfile"]>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function normalizeUser(apiUser: ApiUser): User {
  return {
    id: String(apiUser.id),
    email: apiUser.email,
    name: apiUser.name,
    avatar: apiUser.avatar ?? "",
    is_creator: apiUser.is_creator ?? false,
    // Missing permissions default to false; do not treat the string "0" as truthy.
    is_admin:
      apiUser.is_admin === true ||
      apiUser.is_admin === 1 ||
      apiUser.is_admin === "1",
    phone: apiUser.phone ?? null,
    birthday: apiUser.birthday ?? null,
    address: apiUser.address ?? null,
    bio: apiUser.bio ?? null,
    creatorProfile: apiUser.creator_profile,
  };
}

async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<{
    data: ApiUser;
  }>("/api/v1/me");

  return normalizeUser(response.data.data);
}

function getLoginErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "目前無法連線到登入服務";
  }

  const status = error.response?.status;
  const data = error.response?.data as
    | {
        message?: string;
        errors?: Record<string, string[]>;
      }
    | undefined;

  if (status === 419) {
    return "登入驗證已過期，請重新操作";
  }

  if (status === 422 || status === 401) {
    // 不區分帳號不存在或密碼錯誤，避免帳號枚舉
    return "帳號或密碼錯誤";
  }

  if (status === 429) {
    return "登入嘗試次數過多，請稍後再試";
  }

  return data?.message ?? "登入失敗，請稍後再試";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  async function refreshUser(): Promise<User | null> {
    if (!getToken()) {
      setUser(null);
      return null;
    }
    try {
      const currentUser = await fetchCurrentUser();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      setUser(null);
      if (axios.isAxiosError(error) && error.response?.status === 401) clearToken();

      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        console.error("Unable to restore authentication session");
      }

      return null;
    }
  }

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      localStorage.removeItem("artniverse_user");
      if (!getToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await fetchCurrentUser();
        if (active) setUser(currentUser);
      } catch (error) {
        if (active) {
          if (axios.isAxiosError(error) && error.response?.status === 401) clearToken();
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => { active = false; };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      clearToken();
      const response = await api.post<LoginResponse>("/api/v1/auth/token", {
        email,
        password,
        device_name: "web",
      }, { withCredentials: false, withXSRFToken: false });
      const token = response.data.access_token;
      if (typeof token !== "string" || !token.trim()) {
        throw new Error("登入回應缺少 access_token");
      }
      setToken(token);
      setUser(await fetchCurrentUser());
      return { success: true };
    } catch (error) {
      clearToken();
      setUser(null);
      return { success: false, error: getLoginErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  };

  async function logout(): Promise<void> {
    setIsLoading(true);
    try {
      if (getToken()) await api.delete("/api/v1/auth/token");
    } finally {
      clearToken();
      localStorage.removeItem("artniverse_user");
      setUser(null);
      setIsLoading(false);
    }
  }

  async function loginWithProvider(
    provider: "google" | "facebook" | "apple",
  ): Promise<void> {
    /*
     * 目前後端尚未建立 Socialite OAuth 路由。
     * 不可以像測試版本一樣建立假使用者。
     */
    throw new Error(
      `${provider} 登入功能尚未串接後端`,
    )
  }

  function updateUser(updates: Partial<User>): void {
    /*
     * 現在只更新前端記憶體。
     * 等後端建立 PUT /api/v1/me 後，
     * 再改成先呼叫 API，成功後更新 state。
     */
    setUser((currentUser) => {
      if (!currentUser) {
        return null;
      }

      return {
        ...currentUser,
        ...updates,
      };
    });
  }

  function updateCreatorProfile(
    updates: Partial<User["creatorProfile"]>,
  ): void {
    /*
     * 同樣只是暫時更新畫面，
     * 重新整理後會以後端 /me 資料為準。
     */
    setUser((currentUser) => {
      if (!currentUser || !currentUser.is_creator) {
        return currentUser;
      }

      const currentProfile = currentUser.creatorProfile ?? {
        brandName: "",
        bio: "",
        links: [],
      };

      return {
        ...currentUser,
        creatorProfile: {
          ...currentProfile,
          ...updates,
        },
      };
    });
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    setIsLoading(true);

    try {
      await api.get("/sanctum/csrf-cookie");

      await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      const response = await api.get("/api/v1/me");
      setUser(response.data.data);

      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors;

        return {
          success: false,
          error:
            errors?.name?.[0] ??
            errors?.email?.[0] ??
            errors?.password?.[0] ??
            "註冊失敗",
        };
      }

      return { success: false, error: "註冊失敗" };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginWithProvider,
        logout,
        updateUser,
        updateCreatorProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
