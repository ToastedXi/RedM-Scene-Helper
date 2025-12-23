"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="mt-12 border-t border-white/10 bg-neutral-900/50">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-neutral-300">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <span
              aria-label="love"
              className={`text-rose-400 ${pulse ? "scale-110" : "scale-100"} inline-block transition-transform duration-300`}
            >
              ♥
            </span>
            <span>by Onlycrumbs</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/Onlycrumbs" target="_blank" className="hover:text-white transition-colors">
              GitHub
            </Link>
            <Link href="https://discord.gg/salemcounty" target="_blank" className="hover:text-red-400 transition-colors">
              Salem County Discord
            </Link>
            <Link href="https://github.com/Onlycrumbs/scenehelper" target="_blank" className="hover:text-white transition-colors">
              Repo
            </Link>
          </div>
          <p className="text-neutral-400">© {year} Salem County Scene Helper</p>
        </div>
      </div>
    </footer>
  );
}