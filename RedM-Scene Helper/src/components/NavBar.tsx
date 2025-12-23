"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scene-helper", label: "SceneHelper" },
  { href: "/item-generator", label: "Item Generator" },
  { href: "/discord", label: "Discord" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 py-3">
        <ul className="flex items-center justify-center gap-6">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative inline-block px-2 py-1 text-sm sm:text-base transition-colors duration-300 ${
                    active ? "text-red-300" : "text-neutral-200 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className={`absolute left-0 right-0 -bottom-0.5 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 transition-transform duration-300 ease-out hover:scale-x-100 ${
                      active ? "scale-x-100" : ""
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}