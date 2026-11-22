import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import topics from "./content.json";

export const metadata: Metadata = {
  title: "常見問題 | ARTNIVERSE 藝術宇宙",
  description: "了解 ARTNIVERSE 的收費模式、商品與服務，以及退換貨與退款政策。",
};

export default function FaqPage() {
  return (
    <div className="relative isolate min-h-screen">
      <UniverseBackground />
      <Navigation />
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
        <header className="mb-8 sm:mb-12">
          <p className="mb-3 text-sm font-medium tracking-widest text-primary">ARTNIVERSE</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">常見問題</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            關於收費、商品與服務，以及退換貨與退款的說明，請點選下方項目展開閱讀。
          </p>
        </header>

        <Accordion type="multiple" className="space-y-4">
          {topics.map((topic, index) => (
            <AccordionItem
              key={topic.id}
              value={topic.id}
              id={topic.id}
              className="scroll-mt-28 rounded-xl border border-border/60 bg-card/50 px-4 backdrop-blur-sm last:border-b sm:px-7"
            >
              <AccordionTrigger className="items-center gap-3 py-5 text-base font-semibold hover:no-underline sm:py-6 sm:text-lg">
                <span className="flex min-w-0 items-start gap-3">
                  <span aria-hidden="true" className="shrink-0 text-primary">0{index + 1}</span>
                  <span className="min-w-0 break-words text-left">{topic.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 break-words border-t border-border/50 pt-5 pb-6 text-sm leading-7 text-muted-foreground sm:pb-8 sm:text-base sm:leading-8">
                {topic.blocks.map((block, blockIndex) => {
                  const key = `${topic.id}-${blockIndex}`;
                  if (block.type === "heading") {
                    return <h3 key={key} className="pt-3 text-base font-semibold text-foreground sm:text-lg">{block.text}</h3>;
                  }
                  if (block.type === "subheading") {
                    return <h4 key={key} className="pt-1 font-medium text-foreground">{block.text}</h4>;
                  }
                  if (block.type === "ordered") {
                    return <ol key={key} className="list-decimal space-y-3 pl-5">{block.items?.map((item) => <li key={item} className="pl-1">{item}</li>)}</ol>;
                  }
                  if (block.type === "unordered") {
                    return <ul key={key} className="list-disc space-y-2 pl-5">{block.items?.map((item) => <li key={item} className="pl-1">{item}</li>)}</ul>;
                  }
                  return <p key={key}>{block.text}</p>;
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
}
