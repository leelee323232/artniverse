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

// Test accounts
const TEST_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "member@test.com": {
    password: "member123",
    user: {
      id: "user-001",
      email: "member@test.com",
      name: "測試會員",
      avatar: "",
      is_creator: false,
      is_admin: false,
    },
  },
  "creator@test.com": {
    password: "creator123",
    user: {
      id: "user-002",
      email: "creator@test.com",
      name: "星空畫室",
      avatar: "",
      is_creator: true,
      is_admin: false,
      creatorProfile: {
        brandName: "星空畫室",
        bio: "專注於療癒系插畫創作，用溫暖的筆觸描繪生活中的小確幸。",
        links: [
          { label: "Instagram", url: "https://instagram.com/starryart" },
          { label: "Facebook", url: "https://facebook.com/starryart" },
        ],
        superSubscription: {
          enabled: true,
          price: 99,
          benefits: ["每月獨家桌布", "新品搶先看", "專屬折扣碼"],
        },
      },
    },
  },
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
  logout: () => void;
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

async function getCsrfCookie(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
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
    try {
      const currentUser = await fetchCurrentUser();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      setUser(null);

      if (axios.isAxiosError(error) && error.response?.status !== 401) {
        console.error("Unable to restore authentication session");
      }

      return null;
    }
  }

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem("artniverse_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("artniverse_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const account = TEST_ACCOUNTS[email.toLowerCase()]

    if (!account) {
      setIsLoading(false)
      return { success: false, error: "找不到此帳號" }
    }

    if (account.password !== password) {
      setIsLoading(false)
      return { success: false, error: "密碼錯誤" }
    }

    setUser(account.user)
    localStorage.setItem("artniverse_user", JSON.stringify(account.user))
    setIsLoading(false)
    return { success: true }
  }

  const loginWithProvider = async (
    provider: "google" | "facebook" | "apple",
  ) => {
    setIsLoading(true);

    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo, create a mock user
    const mockUser: User = {
      id: `${provider}-user-${Date.now()}`,
      email: `${provider}user@example.com`,
      name: `${provider === "google" ? "Google" : provider === "facebook" ? "Facebook" : "Apple"} 使用者`,
      avatar: "",
      is_creator: false,
      is_admin: false,
    };

    setUser(mockUser);
    localStorage.setItem("artniverse_user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("artniverse_user");
  };

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
