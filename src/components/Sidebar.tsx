'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  History, 
  Package, 
  QrCode, 
  TrendingUp, 
  Dumbbell,
  ChevronRight,
  Bell
} from 'lucide-react';

interface SidebarItemProps {
  name: string;
  path: string;
  icon: any;
  badge?: string | number;
  badgeColor?: string;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navItems: SidebarItemProps[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Caja Diaria', path: '/registro', icon: Wallet },
    { name: 'Miembros', path: '/socios', icon: Users, badge: 43, badgeColor: 'bg-green-100 text-green-700 font-bold' },
    { name: 'Historial Caja', path: '/historial', icon: History },
    { name: 'Inventario', path: '/inventario', icon: Package, badge: 'Low', badgeColor: 'bg-amber-100 text-amber-700' },
    { name: 'Scanner QR', path: '/scanner', icon: QrCode },
    { name: 'Reportes', path: '/reportes', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-40 flex flex-col transition-all duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-green-600 to-green-400 rounded-xl flex items-center justify-content-center text-white shadow-md shadow-green-100">
          <Dumbbell className="w-5 h-5 mx-auto" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-900 tracking-tight leading-none text-base">CESARS GYM</span>
            <span className="bg-green-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full leading-none tracking-wider uppercase">PRO</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Management SaaS</span>
        </div>
      </div>

      {/* Nav Section */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 px-3 tracking-wider uppercase block mb-2">Administración</span>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (pathname === '/' && item.path === '/registro');
          return (
            <Link key={item.path} href={item.path} className="block relative group">
              <div
                className={`flex items-center justify-between px-3 py-3 rounded-md transition-all duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {/* Active Gradient Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-500 rounded-md z-0 shadow-md shadow-green-100"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-3 relative z-10">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span className="text-xs font-semibold tracking-wide">{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5 relative z-10">
                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {!isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-600">
            CG
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-800 leading-tight">Admin Cesar</p>
            <p className="text-[9px] text-slate-400 leading-none">Super Usuario</p>
          </div>
        </div>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
    </aside>
  );
}
