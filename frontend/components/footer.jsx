"use client";

import React from "react";
import Link from "next/link";
import { FaInstagram, FaLine } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";

export default function Footer() {
  return (
    <footer className="w-full bg-background/80 backdrop-blur-lg text-foreground pt-16 pb-8 border-t border-border/50 font-sans">
      
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between items-center md:items-start flex-wrap gap-10">
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="mb-5">
            <img 
              src="/images/logos/logo_sm.png" 
              alt="ARTNIVERSE" 
              className="max-w-[150px] h-auto mb-2 mx-auto md:mx-0" 
            />
            <p className="text-sm font-medium text-muted-foreground">Create Your Universe</p>
          </div>
          

          <div className="flex gap-5 text-2xl text-muted-foreground">
            {/*Instagram*/}
            <a 
              href="https://www.instagram.com/artniverse_/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors" 
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            
            {/*Mail*/}
            <a 
              href="mailto:artniverse2022@gmail.com" 
              className="hover:text-foreground transition-colors" 
              aria-label="Email"
            >
              <AiOutlineMail />
            </a>
            
            {/*Line*/}
            <a 
              href="https://line.me/R/ti/p/%40645xdkpk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors" 
              aria-label="Line"
            >
              <FaLine />
            </a>
          </div>
        </div>

        <div className="w-full md:w-1/3 md:flex-1 flex justify-center md:justify-center flex-wrap gap-x-16 md:gap-x-52 gap-y-8 text-center">
          <div className="min-w-[100px] flex flex-col items-center">
            <h3 className="text-[20px] font-bold mb-4 text-foreground">探索</h3>
            <ul className="space-y-2.5 text-[16px] flex flex-col items-center">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">首頁</Link></li>
              <li><Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">探索作品</Link></li>
              <li><Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">商店</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">關於我們</Link></li>
            </ul>
          </div>

          <div className="min-w-[100px] flex flex-col items-center">
            <h3 className="text-[20px] font-bold mb-4 text-foreground">創作者</h3>
            <ul className="space-y-2.5 text-[16px] flex flex-col items-center">
              <li><Link href="/creator-apply" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">成為創作者</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">創作者入口</Link></li>
              <li><Link href="/commission" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">委託創作</Link></li>
            </ul>
          </div>

          <div className="min-w-[100px] flex flex-col items-center">
            <h3 className="text-[20px] font-bold mb-4 text-foreground">支援</h3>
            <ul className="space-y-2.5 text-[16px] flex flex-col items-center">
              <li>
                <a href="mailto:artniverse2022@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">
                  聯絡我們
                </a>
              </li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors hover:underline">隱私權政策</Link></li>
            </ul>
          </div>
        </div>

      </div>

      <div className="container mx-auto px-4 mt-10 pt-5 border-t border-border/50 text-center text-[14px] text-muted-foreground">
        <p className="font-bold">&copy; 2026 Artniverse. All rights reserved.</p>
      </div>
    </footer>
  );
}