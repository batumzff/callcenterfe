'use client';

import Sidebar from "@/components/Sidebar";
import { AuthProvider } from '@/providers/AuthProvider';
import { useAuth } from '@/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar, Menu, MenuItem } from '@mui/material';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    handleClose();
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-8 relative">
        {/* Hamburger menu - only mobile */}
        <button
          className="md:hidden mr-4 p-2 rounded bg-white shadow"
          onClick={() => setSidebarOpen(true)}
          aria-label="Menüyü Aç"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div className="text-2xl font-bold text-primary">Call Center</div>
        {isAuthenticated && (
          <div>
            <Avatar
              onClick={handleMenu}
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: '#1a237e',
                cursor: 'pointer'
              }}
            >
              U
            </Avatar>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
            </Menu>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        {/* Main Content */}
        <main className="flex-1 p-8 bg-background overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface border-t border-border h-14 flex items-center justify-center">
        <div className="text-center text-text-muted w-full">
          © 2024 Call Center. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
} 