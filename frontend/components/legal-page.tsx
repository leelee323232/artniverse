import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Card } from "@/components/ui/card";

export function LegalPage({ title, introduction, sections }: {
  title: string;
  introduction: string;
  sections: { title: string; paragraphs: string[] }[];
}) {
  return <div className="relative min-h-screen">
    <UniverseBackground />
    <Navigation />
    <main className="container mx-auto max-w-4xl px-4 pb-20 pt-24">
      <Card className="space-y-8 border-border/50 bg-card/80 p-6 backdrop-blur-md sm:p-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">草稿更新日期：2026 年 11 月 5 日</p>
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">本內容為待確認草稿，正式發布前仍需由 ARTNIVERSE 確認實際營運及資料處理方式。</p>
          <p className="leading-7 text-muted-foreground">{introduction}</p>
        </header>
        {sections.map((section, index) => <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-semibold">{index + 1}. {section.title}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph} className="leading-7 text-muted-foreground">{paragraph}</p>)}
        </section>)}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">聯絡我們</h2>
          <p className="leading-7 text-muted-foreground">營運主體：ARTNIVERSE。服務、帳號或個人資料相關問題，請來信至 <a href="mailto:artniverse2022@gmail.com" className="break-all text-primary underline underline-offset-4">artniverse2022@gmail.com</a>。請勿透過一般電子郵件提供密碼、完整信用卡資料或身分證件。</p>
        </section>
        <nav aria-label="條款相關連結" className="flex flex-wrap gap-5 border-t border-border/50 pt-6 text-sm">
          <Link href="/register/" className="text-primary hover:underline">返回註冊</Link>
          <Link href="/terms/" className="text-primary hover:underline">服務條款</Link>
          <Link href="/privacy/" className="text-primary hover:underline">隱私權政策</Link>
        </nav>
      </Card>
    </main>
  </div>;
}
