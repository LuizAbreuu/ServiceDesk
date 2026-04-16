import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Ticket, BookOpen, Users, BarChart2, Settings, LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',            icon: LayoutDashboard, adminOnly: true },
  { to: '/tickets',    label: 'Chamados',              icon: Ticket          },
  { to: '/knowledge',  label: 'Base de Conhecimento',  icon: BookOpen,        adminOnly: true },
  { to: '/users',      label: 'Usuários',              icon: Users,           adminOnly: true },
  { to: '/reports',    label: 'Relatórios',            icon: BarChart2,       adminOnly: true },
  { to: '/settings',   label: 'Configurações',         icon: Settings        },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || (user && ['Admin', 'Manager', 'Agent'].includes(user.role))
  );

  return (
    <aside className="w-56 flex flex-col bg-[#1a1a2e] text-white shrink-0">
      {/* Logo */}
      <NavLink to="/dashboard" className="p-4 border-b border-white/10 block hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6c63ff] rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold">HD</span>
          </div>
          <span className="font-semibold text-sm">HelpDesk</span>
        </div>
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {filteredNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#6c63ff] text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#6c63ff] flex items-center justify-center text-xs font-semibold">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-white/50">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </aside>
  );
}