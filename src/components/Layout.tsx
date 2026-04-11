import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Clerk auth logout
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Mis Propiedades' },
    { to: '/agregar', icon: PlusSquare, label: 'Agregar Propiedad' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-brand-primary text-brand-white">
        <div className="font-bold text-xl">TuWebSV</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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

        <div className="px-6 py-4 border-b border-gray-800">
          <p className="text-sm text-gray-400">Agente</p>
          <p className="font-medium truncate">Juan Pérez</p>
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

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-brand-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
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
  );
}
