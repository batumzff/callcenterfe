"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Projeler", path: "/projects" },
  { name: "Çağrılar", path: "/calls" },
  { name: "Ayarlar", path: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-surface border-r border-border h-[calc(100vh-7rem)] flex flex-col py-8 px-4">
      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`px-4 py-2 rounded-lg font-medium text-base transition-colors
              ${pathname.startsWith(item.path)
                ? "bg-primary text-white"
                : "text-text hover:bg-background hover:text-primary"}
            `}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 