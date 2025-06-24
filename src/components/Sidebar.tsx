"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Projeler", path: "/projects" },
  { name: "Agentlar", path: "/agents" },
  { name: "Arama Grupları", path: "/search-groups" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay and Sidebar for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />
          <aside className="w-64 bg-background border-r border-border h-full flex flex-col py-8 px-4 absolute left-0 top-0 z-40 shadow-lg animate-slide-in">
            {/* Kapatma butonu */}
            <button
              className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsOpen(false)}
              aria-label="Menüyü Kapat"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            <nav className="flex flex-col gap-2 mt-8">
              {menu.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg font-medium text-base transition-colors
                    ${pathname.startsWith(item.path)
                      ? "bg-primary text-white"
                      : "text-text hover:bg-background hover:text-primary"}
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-surface border-r border-border h-[calc(100vh-7rem)] flex-col py-8 px-4">
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
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease;
        }
      `}</style>
    </>
  );
} 