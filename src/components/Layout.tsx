import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Home, PlusSquare, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserButton, useUser, SignedIn, SignedOut } from '@clerk/clerk-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Mis Propiedades' },
    { to: '/agregar', icon: PlusSquare, label: 'Agregar Propiedad' },
  ];

  return (
    <>
      <SignedIn>
        <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-brand-primary text-brand-white">
            <div className="font-bold text-xl">TuWebSV</div>
            <div className="flex flex-row items-center gap-4">
              <UserButton afterSignOutUrl="/login" />
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-64 bg-brand-primary text-brand-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="p-6 hidden md:block">
              <div className="font-bold text-2xl tracking-tight text-brand-accent">TuWebSV</div>
            </div>

            <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
              <UserButton afterSignOutUrl="/login" />
              <div className="overflow-hidden">
                <p className="text-sm text-gray-400">Agente</p>
                <p className="font-medium truncate">{user?.fullName || 'Usuario'}</p>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-brand-accent text-brand-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-brand-white"
                    )
                  }
                >
                  <link.icon size={20} />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
}
