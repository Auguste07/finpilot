'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, CircleDollarSign, FolderKanban, Import,
  Landmark, Settings, Sparkles, ArrowDownUp, PieChart,
  Moon, Sun, Search, Bell, ChevronDown, CheckCircle2, Clock3, CalendarDays, HandCoins
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const links = [
  ['/dashboard', 'Dashboard', BarChart3],
  ['/expenses', 'Transactions', ArrowDownUp],
  ['/income', 'Entrées', Landmark],
  ['/planning', 'Budget', PieChart],
  ['/forecast', 'Prévisions', Sparkles],
  ['/calendar', 'Calendrier', CalendarDays],
  ['/debts', 'Dettes & créances', HandCoins],
  ['/projects', 'Projets', FolderKanban],
  ['/import', 'Import Excel', Import],
  ['/settings', 'Paramètres', Settings],
] as const;

type Notice={id:string;title:string;body:string;time:string;read?:boolean};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [notificationsOpen,setNotificationsOpen]=useState(false);
  const [search,setSearch]=useState('');
  const [notices,setNotices]=useState<Notice[]>([
    {id:'welcome',title:'FinPilot actif',body:'Les rappels financiers sont prêts.',time:'Maintenant'}
  ]);

  useEffect(() => {
    const saved = window.localStorage.getItem('finpilot-theme');
    const prefers = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const next = saved ? saved === 'dark' : Boolean(prefers);
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try{const n=JSON.parse(localStorage.getItem('finpilot-notifications')||'null');if(n)setNotices(n)}catch{}
  }, []);

  useEffect(()=>{localStorage.setItem('finpilot-notifications',JSON.stringify(notices))},[notices]);

  useEffect(()=>{
    const check=()=>{
      try{
        const rules=JSON.parse(localStorage.getItem('finpilot-rules')||'[]') as Array<{id:number;label:string;start:string;reminderDays?:number;amount?:number}>;
        const now=new Date();now.setHours(0,0,0,0);
        rules.forEach(r=>{
          const due=new Date(r.start+'T00:00:00');
          const days=Math.ceil((due.getTime()-now.getTime())/86400000);
          const threshold=r.reminderDays??3;
          if(days>=0&&days<=threshold){
            const id=`rule-${r.id}-${r.start}`;
            setNotices(prev=>prev.some(n=>n.id===id)?prev:[{id,title:`Échéance : ${r.label}`,body:days===0?'À payer aujourd’hui':`Prévue dans ${days} jour(s)`,time:'Rappel automatique'},...prev]);
            if(typeof Notification!=='undefined'&&Notification.permission==='granted'){
              const sent=localStorage.getItem(`finpilot-notified-${id}`);
              if(!sent){new Notification(`FinPilot — ${r.label}`,{body:days===0?'Échéance aujourd’hui':`Échéance dans ${days} jour(s)`});localStorage.setItem(`finpilot-notified-${id}`,'1')}
            }
          }
        })
      }catch{}
    };
    check();const timer=window.setInterval(check,60000);return()=>window.clearInterval(timer);
  },[]);

  const unread=useMemo(()=>notices.filter(n=>!n.read).length,[notices]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    window.localStorage.setItem('finpilot-theme', next ? 'dark' : 'light');
  }
  async function enableNotifications(){
    if(typeof Notification==='undefined')return;
    const p=await Notification.requestPermission();
    if(p==='granted'){new Notification('FinPilot',{body:'Les rappels navigateur sont activés.'});setNotices(x=>[{id:'permission-'+Date.now(),title:'Notifications activées',body:'Vous recevrez des rappels pour les échéances proches.',time:'Maintenant'},...x])}
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
        <nav className="nav">{links.map(([href, label, Icon]) => <Link key={href} href={href} className={pathname === href ? 'active' : ''}><Icon size={17}/><span>{label}</span></Link>)}</nav>
        <Link href="/planning" className="sidebar-insight"><span className="tiny-label">Objectif mensuel</span><strong>Épargner 20%</strong><div className="progress"><span style={{width:'72%'}}/></div><small>72% de l’objectif atteint · ouvrir le budget</small></Link>
        <div className="sidebar-bottom"><Link href="/settings" className="profile-mini clickable-profile"><div className="avatar">AP</div><div><div className="profile-name">Compte personnel</div><div className="profile-sub">Voir le profil & préférences</div></div><ChevronDown size={15}/></Link></div>
      </aside>

      <section className="workspace">
        <header className="workspace-topbar">
          <div className="search-wrap"><div className="search-shell"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une section..."/><kbd>⌘ K</kbd></div>{search&&<div className="search-results">{links.filter(([,label])=>label.toLowerCase().includes(search.toLowerCase())).map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setSearch('')}><Icon size={15}/><span>{label}</span></Link>)}</div>}</div>
          <div className="top-actions">
            <div className="notification-wrap"><button className="icon-btn" aria-label="Notifications" onClick={()=>setNotificationsOpen(v=>!v)}><Bell size={17}/>{unread>0&&<i/>}</button>{notificationsOpen&&<div className="notification-panel"><div className="notification-head"><strong>Notifications</strong><button className="pill" onClick={()=>setNotices(x=>x.map(n=>({...n,read:true})))}>Tout marquer lu</button></div><button className="btn btn-soft notification-enable" onClick={enableNotifications}><Bell size={15}/>Activer les rappels navigateur</button><div className="notification-list">{notices.length===0?<div className="empty-cell">Aucune notification.</div>:notices.slice(0,8).map(n=><button key={n.id} className={`notification-item ${n.read?'read':''}`} onClick={()=>setNotices(x=>x.map(v=>v.id===n.id?{...v,read:true}:v))}><span className="notification-icon">{n.read?<CheckCircle2 size={16}/>:<Clock3 size={16}/>}</span><span><strong>{n.title}</strong><small>{n.body}</small><em>{n.time}</em></span></button>)}</div></div>}</div>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Changer le thème">{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
            <Link href="/settings" className="top-avatar" aria-label="Ouvrir le profil">AP</Link>
          </div>
        </header>
        <main className="main">{children}</main>
        <nav className="mobile-nav">{links.slice(0,5).map(([href,label,Icon])=><Link key={href} href={href} className={pathname===href?'active':''} aria-label={label}><Icon size={19}/><span>{label}</span></Link>)}</nav>
      </section>
    </div>
  );
}
