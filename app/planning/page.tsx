import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { planned, categories } from '@/lib/demo-data';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
const money=(n:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);

export default function Planning(){return <>
  <PageHeader eyebrow="Budget & Spending" title="Budget mensuel" subtitle="Comparez votre budget cible aux dépenses réelles et basculez vers la prévision par pourcentage quand vous préparez un mois futur." actions={<><Link className="btn" href="/forecast"><Sparkles size={16}/>Prévoir par %</Link><button className="btn btn-primary"><Plus size={16}/>Nouveau budget</button></>}/>
  <div className="grid-4">
    <div className="card metric-card"><div className="metric-label">Budget mensuel</div><div className="metric">2 400 $</div><div className="delta">Plan actuel</div></div>
    <div className="card metric-card"><div className="metric-label">Dépenses réelles</div><div className="metric">1 540 $</div><div className="delta neg">64,2% du budget</div></div>
    <div className="card metric-card"><div className="metric-label">Reste disponible</div><div className="metric">860 $</div><div className="delta">35,8% restant</div></div>
    <div className="card metric-card"><div className="metric-label">Épargne cible</div><div className="metric">500 $</div><div className="delta">20,8% du budget</div></div>
  </div>
  <div className="section grid-2">
    <div className="card"><div className="section-head"><div><div className="section-title">Budget vs dépenses réelles</div><div className="section-caption">Analyse par catégorie</div></div><Link className="pill" href="/forecast">Planifier octobre <ArrowRight size={13}/></Link></div>{categories.map((c,i)=><div className="budget-row" key={c.name}><div><strong>{c.name}</strong><small>{money(c.spent)} sur {money(c.budget)}</small></div><div className="progress"><span style={{width:`${Math.min(c.pct,100)}%`,background:i===0?'var(--chart-green)':i===1?'var(--chart-blue)':i===2?'var(--chart-coral)':'var(--chart-violet)'}}/></div><b>{c.pct}%</b></div>)}</div>
    <div className="card"><div className="section-head"><div><div className="section-title">Dépenses récurrentes</div><div className="section-caption">Échéances prévues</div></div><Link className="pill" href="/forecast">Modifier</Link></div>{planned.map(p=><div className="upcoming-row" key={p.label}><div><strong>{p.label}</strong><span>{p.recurrence} · {p.due}</span></div><b>{money(p.amount)}</b></div>)}</div>
  </div>
</>}
