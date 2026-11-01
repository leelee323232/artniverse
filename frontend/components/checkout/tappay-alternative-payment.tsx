"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { paymentLabels, type TapPayConfig } from "@/lib/commerce/checkout-api";

type PrimeResult = { status: number; prime?: string };
type AlternativeSDK = {
  setupSDK(id: number, key: string, environment: "sandbox"): void;
  linePay: { getPrime(callback: (result: PrimeResult) => void): void };
  virtualAccount: { getPrime(callback: (error: unknown, result?: PrimeResult) => void): void };
  redirect(url: string): void;
};
const sdk = () => (window as Window & { TPDirect?: AlternativeSDK }).TPDirect;

export function TapPayAlternativePayment({ config, method, total, disabled, paymentUrl, onPay }: {
  config: TapPayConfig; method: "line_pay" | "atm"; total: number; disabled: boolean;
  paymentUrl?: string; onPay: (prime: string) => Promise<void>;
}) {
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(false);
  const locked = useRef(false);
  useEffect(() => {
    alive.current = true;
    if (sdk()) setLoaded(true);
    const timer = window.setTimeout(() => { if (!sdk()) setError("TapPay 元件載入逾時，請重新載入頁面。"); }, 20000);
    return () => { alive.current = false; window.clearTimeout(timer); };
  }, []);
  useEffect(() => {
    setReady(false);
    if (!loaded || config.environment !== "sandbox") return;
    try {
      const tp = sdk();
      if (!tp) throw new Error();
      tp.setupSDK(config.app_id, config.app_key, "sandbox");
      setReady(true); setError("");
    } catch { setError("無法初始化 TapPay 付款元件，請重新載入頁面。"); }
  }, [loaded, config.app_id, config.app_key, config.environment]);

  async function pay() {
    if (locked.current || disabled || !ready) return;
    locked.current = true; setBusy(true); setError("");
    try {
      const tp = sdk();
      if (!tp) throw new Error("付款元件未就緒。");
      if (method === "line_pay" && paymentUrl) {
        const url = new URL(paymentUrl);
        if (url.protocol !== "https:" || url.username || url.password) throw new Error("付款網址無效，請聯繫管理員。");
        tp.redirect(url.href);
        return;
      }
      const prime = await new Promise<string>((resolve, reject) => {
        let settled = false;
        const timer = window.setTimeout(() => {
          settled = true; reject(new Error("取得付款憑證逾時，尚未送出付款，請重試。"));
        }, 15000);
        const finish = (result?: PrimeResult) => {
          if (settled) return;
          settled = true; window.clearTimeout(timer);
          if (result?.status === 0 && result.prime) resolve(result.prime);
          else reject(new Error("無法取得付款憑證，尚未送出付款，請稍後重試。"));
        };
        try {
          // LINE Pay uses one result argument; ATM uses an error-first callback.
          if (method === "line_pay") tp.linePay.getPrime(finish);
          else tp.virtualAccount.getPrime((error, result) => finish(error ? undefined : result));
        } catch { finish(); }
      });
      if (alive.current) await onPay(prime);
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "付款元件發生錯誤。"); }
    finally { locked.current = false; if (alive.current) setBusy(false); }
  }

  return <div className="space-y-4">
    <Script id="tappay-sdk" src="https://js.tappaysdk.com/sdk/tpdirect/v5.19.2" strategy="afterInteractive" onReady={() => setLoaded(true)} onError={() => setError("無法載入 TapPay 元件，請重新整理頁面。")} />
    <h2 className="text-xl font-bold">{paymentLabels[method]}</h2>
    <p className="text-sm">{method === "atm" ? "確認金額後取得本訂單專用虛擬帳號。測試帳號請勿真實轉帳。" : "取得付款連結後，按「前往 LINE Pay 付款」繼續。返回本站後請查詢付款狀態。"}</p>
    {!ready && !error && <p role="status">載入付款元件中…</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <Button className="w-full" disabled={disabled || busy || !ready} onClick={() => void pay()}>{busy ? "處理中，請勿關閉頁面…" : paymentUrl ? "前往 LINE Pay 付款" : method === "atm" ? `確認 NT$ ${total.toLocaleString("zh-TW")} 並取得虛擬帳號` : `確認 NT$ ${total.toLocaleString("zh-TW")} 並取得 LINE Pay 付款連結`}</Button>
  </div>;
}
