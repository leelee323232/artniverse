"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TapPayConfig } from "@/lib/commerce/checkout-api";

type PrimeResult = { status: number; card?: { prime?: string } };
type TapPaySDK = {
  setupSDK(appId: number, appKey: string, environment: "sandbox"): void;
  card: {
    setup(options: { fields: Record<string, { element: HTMLElement; placeholder: string }>; styles: Record<string, Record<string, string>> }): void;
    onUpdate(callback: (state: { canGetPrime: boolean }) => void): void;
    getPrime(callback: (result: PrimeResult) => void): void;
  };
};
const sdk = () => (window as Window & { TPDirect?: TapPaySDK }).TPDirect;

export function TapPayCard({ config, total, disabled, onPay }: {
  config: TapPayConfig; total: number; disabled: boolean; onPay: (prime: string) => Promise<void>;
}) {
  const number = useRef<HTMLDivElement>(null);
  const expiry = useRef<HTMLDivElement>(null);
  const ccv = useRef<HTMLDivElement>(null);
  const alive = useRef(false);
  const locked = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (sdk()) setLoaded(true);
    const timer = window.setTimeout(() => {
      if (!sdk()) setError("信用卡元件載入逾時，請重新整理頁面，或確認瀏覽器未阻擋 TapPay。");
    }, 20000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!loaded || !number.current || !expiry.current || !ccv.current || config.environment !== "sandbox") return;
    const fields = [number.current, expiry.current, ccv.current];
    let active = true;
    setReady(false); setValid(false);
    try {
      const tp = sdk();
      if (!tp) throw new Error("信用卡元件尚未載入。");
      fields.forEach(field => field.replaceChildren());
      tp.setupSDK(config.app_id, config.app_key, "sandbox");
      tp.card.setup({
        fields: {
          number: { element: fields[0], placeholder: "信用卡卡號" },
          expirationDate: { element: fields[1], placeholder: "MM / YY" },
          ccv: { element: fields[2], placeholder: "安全碼" },
        },
        styles: { input: { color: "#111827", "font-size": "16px" }, ".invalid": { color: "#dc2626" } },
      });
      tp.card.onUpdate(state => { if (active) setValid(state.canGetPrime); });
      setReady(true); setError("");
    } catch { setError("無法初始化信用卡元件，請確認 TapPay 設定並重新整理頁面。"); }
    return () => { active = false; fields.forEach(field => field.replaceChildren()); };
  }, [loaded, config.app_id, config.app_key, config.environment]);

  async function pay() {
    if (locked.current || disabled || !ready || !valid) return;
    locked.current = true; setBusy(true); setError("");
    try {
      const prime = await new Promise<string>((resolve, reject) => {
        let settled = false;
        const timer = window.setTimeout(() => { settled = true; reject(new Error("取得信用卡付款憑證逾時，尚未送出付款，請重試。")); }, 15000);
        try {
          const tp = sdk();
          if (!tp) throw new Error("信用卡元件未就緒。");
          tp.card.getPrime(result => {
            if (settled) return;
            settled = true; window.clearTimeout(timer);
            if (result.status === 0 && result.card?.prime) resolve(result.card.prime);
            else reject(new Error("無法取得付款憑證，請確認信用卡資料後重試。"));
          });
        } catch (e) { settled = true; window.clearTimeout(timer); reject(e); }
      });
      if (alive.current) await onPay(prime);
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "付款元件發生錯誤。"); }
    finally { locked.current = false; if (alive.current) setBusy(false); }
  }

  return <div className="space-y-4">
    <Script id="tappay-sdk" src="https://js.tappaysdk.com/sdk/tpdirect/v5.19.2" strategy="afterInteractive" onReady={() => setLoaded(true)} onError={() => setError("無法載入 TapPay 信用卡元件，請重新整理頁面。")} />
    <h2 className="text-xl font-bold">信用卡付款</h2>
    <p className="text-sm text-muted-foreground">請使用 TapPay 測試卡。卡號直接交由 TapPay 處理。</p>
    <div className={disabled || busy ? "pointer-events-none opacity-60" : ""} aria-busy={busy}>
      <p id="card-number-label" className="mb-2 text-sm">卡號</p>
      <div ref={number} role="group" aria-labelledby="card-number-label" className="mb-4 h-12 rounded-md border bg-white px-3" />
      <div className="grid grid-cols-2 gap-4">
        <div><p id="card-expiry-label" className="mb-2 text-sm">有效期限</p><div ref={expiry} role="group" aria-labelledby="card-expiry-label" className="h-12 rounded-md border bg-white px-3" /></div>
        <div><p id="card-ccv-label" className="mb-2 text-sm">安全碼</p><div ref={ccv} role="group" aria-labelledby="card-ccv-label" className="h-12 rounded-md border bg-white px-3" /></div>
      </div>
    </div>
    {!ready && !error && <p role="status">載入信用卡元件中…</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <Button className="w-full" disabled={disabled || busy || !ready || !valid} onClick={() => void pay()}>{busy ? "付款處理中，請勿關閉頁面…" : `確認付款 NT$ ${total.toLocaleString("zh-TW")}`}</Button>
  </div>;
}
