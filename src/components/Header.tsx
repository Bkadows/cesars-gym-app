'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Plus, LogOut } from 'lucide-react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initial theme check
    const isDark = document.body.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <header className="glass h-16 fixed top-0 right-0 left-64 z-30 px-8 flex items-center justify-between shadow-sm transition-all duration-300">
      {/* Search Input */}
      <div className="w-96 relative group">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Buscar miembro, venta, producto o pago..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 focus:bg-white transition-all outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 border border-slate-200 bg-white shadow-sm text-[9px] font-bold text-slate-400 px-1.5 py-0.5 rounded leading-none">
          ⌘K
        </span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Add Button */}
        <button className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm shadow-green-100 transition-premium">
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Registro</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-premium"
          title={darkMode ? "Modo Claro" : "Modo Oscuro"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Icon */}
        <button className="w-8 h-8 relative flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-premium">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* User Dropdown */}
        <div className="w-px h-6 bg-slate-200" />
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center font-bold text-xs text-green-700">
            C
          </div>
          <div className="hidden md:block">
            <p className="text-[11px] font-bold text-slate-800 leading-tight">Cesar's Admin</p>
            <p className="text-[9px] text-slate-400 leading-none">cesargym.pro</p>
          </div>
        </div>
      </div>
    </header>
  );
}
