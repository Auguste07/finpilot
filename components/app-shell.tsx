'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, CalendarRange, CircleDollarSign, FolderKanban, Import,
  Landmark, Settings, Sparkles, WalletCards, ArrowDownUp, PieChart,
  Moon, Sun, Search, Bell, ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';

const links = [
  ['/dashboard', 'Dashboard', BarChart3],
  ['/expenses', 'Transactions', ArrowDownUp],
  ['/income', 'Entrées', Landmark],
  ['/planning', 'Budget', PieChart],
  ['/forecast', 'Prévisions', Sparkles],
  ['/projects', 'Projets', FolderKanban],
  ['/import', 'Import Excel', Import],
  ['/settings', 'Paramètres', Settings],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('finpilot-theme');
    const prefers = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const next = saved ? saved === 'dark' : Boolean(prefers);
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    window.localStorage.setItem('finpilot-theme', next ? 'dark' : 'light');
  }

  if (pathname === '/login' || pathname.startsWith('/auth/')) return <>{children}</>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark"><CircleDollarSign size={19}/></span>
          <span><strong>FinPilot</strong><small>Personal Finance OS</small></span>
        </Link>

        <div className="side-label">Workspace</div>
        <nav className="nav">
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={pathname === href ? 'active' : ''}>
              <Icon size={17}/><span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-insight">
          <span className="tiny-label">Objectif mensuel</span>
          <strong>Épargner 20%</strong>
          <div className="progress"><span style={{width:'72%'}}/></div>
          <small>72% de l’objectif atteint</small>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">AP</div>
            <div><div className="profile-name">Compte personnel</div><div className="profile-sub">Espace privé</div></div>
            <ChevronDown size={15}/>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-topbar">
          <div className="search-shell"><Search size={16}/><span>Rechercher...</span><kbd>⌘ K</kbd></div>
          <div className="top-actions">
            <button className="icon-btn" aria-label="Notifications"><Bell size={17}/><i/></button>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Changer le thème">{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
            <div className="top-avatar">AP</div>
          </div>
        </header>
        <main className="main">{children}</main>
        <nav className="mobile-nav">
          {links.slice(0,5).map(([href,label,Icon])=><Link key={href} href={href} className={pathname===href?'active':''} aria-label={label}><Icon size={19}/><span>{label}</span></Link>)}
        </nav>
      </section>
    </div>
  );
}
