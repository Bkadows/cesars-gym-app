'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNavigation() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Registro', path: '/registro' },
    { name: 'Socios', path: '/socios' },
    { name: 'Precios', path: '/precios' },
    { name: 'Inventario', path: '/inventario' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <>
      <div className="top">
        <div className="dumb">🦁</div>
        <div className="logo">CESAR'S GYM<small>SOLO LOS MÁS FUERTES</small></div>
        <div className="spacer"></div>
      </div>
      
      <div className="tabs">
        {tabs.map(tab => {
          const isActive = pathname === tab.path || (pathname === '/' && tab.path === '/registro');
          return (
            <Link 
              key={tab.path}
              href={tab.path} 
              className={`tab ${isActive ? 'on' : ''}`}
              style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </>
  );
}
