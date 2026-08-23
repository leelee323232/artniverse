"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { TheButton } from "@/components/common/TheButton";
import { userAPI } from "@/apis";
import axios from "axios";

// email 的基本正規格式檢查
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 密碼長度需大於 8 個字元
const PASSWORD_MIN_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithProvider, isLoading, register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 表單驗證放在頁面內處理（UI 層關注點）；API 層只負責傳輸與後端錯誤。
  const validate = (): string | null => {
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) return "請輸入姓名";
    if (!email) return "請輸入電子郵件";
    if (!formData.password) return "請輸入密碼";
    if (!formData.confirmPassword) return "請再次輸入密碼";

    if (!EMAIL_REGEX.test(email)) return "電子郵件格式不正確";
    if (formData.password.length <= PASSWORD_MIN_LENGTH) {
      return `密碼長度需大於 ${PASSWORD_MIN_LENGTH} 個字元`;
    }
    if (formData.password !== formData.confirmPassword) {
      return "兩次輸入的密碼不一致";
    }
    if (!agreeTerms) return "請先閱讀並同意服務條款與隱私權政策";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.confirmPassword,
      );
      //router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // 後端常見結構：{ message, errors: { email: ["..."] } }
        const data = err.response?.data as
          | { message?: string; errors?: Record<string, string[]> }
          | undefined;
        const fieldError = data?.errors
          ? Object.values(data.errors).flat().join("\n")
          : undefined;
        setError(fieldError || data?.message || "註冊失敗，請稍後再試");
      } else {
        setError("註冊失敗，請稍後再試");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderRegister = async (
    provider: "google" | "facebook" | "apple",
  ) => {
    setError("");
    await loginWithProvider(provider);
    router.push("/");
  };

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-24 pb-20">
        <Card className="w-full max-w-md border-border/50 bg-card/30 p-8 backdrop-blur-md">
          <div className="mb-8 text-center">
            <img
              src="/images/logos/logo_sm_white.png"
              alt="logo"
              className="h-40 w-40 mx-auto"
            />
            <h1 className="text-2xl font-bold text-foreground">會員註冊</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              建立您的帳號，開始探索藝術宇宙
            </p>
          </div>

          {/* Social Register */}
          <div className="mb-6 space-y-3">
            <TheButton
              variant="outline-primary"
              className="w-full justify-center gap-3 bg-white/5"
              onClick={() => handleProviderRegister("google")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              使用 Google 註冊
            </TheButton>

            <TheButton
              variant="outline-primary"
              className="w-full justify-center gap-3 bg-white/5"
              onClick={() => handleProviderRegister("facebook")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              使用 Facebook 註冊
            </TheButton>

            <TheButton
              variant="outline-primary"
              className="w-full justify-center gap-3 bg-white/5"
              onClick={() => handleProviderRegister("apple")}
              disabled={isLoading}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              使用 Apple 註冊
            </TheButton>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/30 px-2 text-muted-foreground backdrop-blur-sm">
                或使用電子郵件註冊
              </span>
            </div>
          </div>

          {/* Email Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="whitespace-pre-line rounded-lg bg-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="請輸入您的姓名"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-10 bg-white/5"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10 bg-white/5"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="需大於 8 個字元"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10 pr-10 bg-white/5"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">確認密碼</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="再次輸入密碼"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="pl-10 pr-10 bg-white/5"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-border"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="text-muted-foreground">
                我已閱讀並同意{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  服務條款
                </Link>{" "}
                與{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  隱私權政策
                </Link>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  註冊中...
                </>
              ) : (
                "註冊"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            已經有帳號了？{" "}
            <Link href="/login" className="text-primary hover:underline">
              前往登入
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
