import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChevronRight, Plus, Upload, WalletCards } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { categories, planned, projects, summary, transactions } from '@/lib/demo-data';

const money = (n:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);

export default function Dashboard(){
  return <>
    <PageHeader eyebrow="Samedi 19 septembre 2026" title="Vue d'ensemble financière" subtitle="Suivez votre argent réel, vos budgets, vos projets et vos prochaines décisions en un seul endroit." actions={<><Link className="btn" href="/import"><Upload size={16}/>Importer</Link><Link className="btn btn-primary" href="/expenses"><Plus size={16}/>Nouvelle opération</Link></>}/>

    <div className="grid-4 metrics-grid">
      <div className="card metric-card premium"><div className="metric-label">Solde total <WalletCards size={16}/></div><div className="metric">{money(summary.balance)}</div><div className="metric-foot positive"><ArrowUpRight size={14}/> +8,4% <span>vs mois dernier</span></div></div>
      <div className="card metric-card"><div className="metric-label">Entrées ce mois</div><div className="metric">{money(summary.income)}</div><div className="metric-foot positive"><ArrowUpRight size={14}/> 82% <span>déjà encaissé</span></div></div>
      <div className="card metric-card"><div className="metric-label">Dépenses réelles</div><div className="metric">{money(summary.actualExpenses)}</div><div className="metric-foot negative"><ArrowDownRight size={14}/> 60% <span>des entrées</span></div></div>
      <div className="card metric-card"><div className="metric-label">Épargne réservée</div><div className="metric">2 000 $</div><div className="metric-foot positive"><ArrowUpRight size={14}/> 20% <span>du capital</span></div></div>
    </div>

    <div className="section dashboard-grid-main">
      <div className="card chart-card">
        <div className="section-head"><div><div className="section-title">Cashflow & projection</div><div className="section-caption">Entrées, dépenses et trajectoire prévisionnelle</div></div><div className="segmented"><Link href="/forecast?range=1m">1M</Link><Link href="/forecast?range=3m">3M</Link><Link className="active" href="/forecast?range=6m">6M</Link><Link href="/forecast?range=1y">1A</Link></div></div>
        <svg viewBox="0 0 760 280" className="cashflow-svg" role="img" aria-label="Projection de trésorerie sur six mois">
          <defs><linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-green)" stopOpacity=".22"/><stop offset="1" stopColor="var(--chart-green)" stopOpacity="0"/></linearGradient></defs>
          {[45,100,155,210].map((y)=><line key={y} x1="38" y1={y} x2="736" y2={y} className="gridline"/>)}
          <path d="M40 208 C95 178,120 152,166 164 S256 132,300 146 S386 92,430 112 S522 84,570 92 S660 54,735 68 L735 235 L40 235 Z" fill="url(#areaGreen)"/>
          <path d="M40 208 C95 178,120 152,166 164 S256 132,300 146 S386 92,430 112 S522 84,570 92 S660 54,735 68" className="income-line"/>
          <path d="M40 225 C110 210,140 185,200 194 S300 172,350 184 S450 150,520 166 S630 138,735 152" className="expense-line"/>
          <path d="M570 92 C625 82,680 72,735 68" className="forecast-line"/>
          {['Avr','Mai','Juin','Juil','Août','Sept','Oct'].map((m,i)=><text key={m} x={40+i*115} y="260" className="axis-label">{m}</text>)}
        </svg>
        <div className="chart-legend"><span><i className="dot green"/>Entrées</span><span><i className="dot coral"/>Dépenses</span><span><i className="dot dashed"/>Projection</span></div>
      </div>

      <div className="card health-card">
        <div className="section-head"><div><div className="section-title">Santé financière</div><div className="section-caption">Score de discipline budgétaire</div></div><span className="pill green">Très bon</span></div>
        <div className="gauge"><div className="gauge-inner"><strong>82</strong><span>/100</span><small>On track</small></div></div>
        <div className="health-stats"><div><span>Taux d'épargne</span><strong>23%</strong></div><div><span>Charges fixes</span><strong>41%</strong></div><div><span>Runway</span><strong>7,8 mois</strong></div><div><span>Budget utilisé</span><strong>64%</strong></div></div>
      </div>
    </div>

    <div className="section dashboard-grid-main">
      <div className="card">
        <div className="section-head"><div><div className="section-title">Budget par catégorie</div><div className="section-caption">Budget prévu vs dépenses déjà réalisées</div></div><Link className="pill" href="/planning">Gérer le budget <ChevronRight size={13}/></Link></div>
        <div className="budget-bars">
          {categories.map((c,i)=><div key={c.name} className="budget-row"><div><strong>{c.name}</strong><small>{money(c.spent)} sur {money(c.budget)}</small></div><div className="progress"><span style={{width:`${Math.min(c.pct,100)}%`,background:i===0?'var(--chart-green)':i===1?'var(--chart-blue)':i===2?'var(--chart-coral)':'var(--chart-violet)'}}/></div><b>{c.pct}%</b></div>)}
        </div>
      </div>

      <div className="card upcoming-card">
        <div className="section-head"><div><div className="section-title">À venir</div><div className="section-caption">Dépenses planifiées et récurrentes</div></div><Link className="pill" href="/forecast">Prévoir <ChevronRight size={13}/></Link></div>
        {planned.slice(0,4).map(p=><div className="upcoming-row" key={p.label}><div className="date-chip"><CalendarDays size={15}/></div><div className="upcoming-copy"><strong>{p.label}</strong><span>{p.due} · {p.recurrence}</span></div><b>{money(p.amount)}</b></div>)}
      </div>
    </div>

    <div className="section grid-2">
      <div className="card"><div className="section-head"><div><div className="section-title">Transactions récentes</div><div className="section-caption">Mouvements réels sur vos comptes</div></div><Link className="pill" href="/expenses">Voir tout</Link></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th></tr></thead><tbody>{transactions.map(t=><tr key={t.label}><td>{t.date}</td><td><strong>{t.label}</strong><div className="cell-sub">{t.type}</div></td><td>{t.category}</td><td className={`amount ${t.amount<0?'negative':'positive'}`}>{t.amount<0?'-':'+'}{money(Math.abs(t.amount))}</td></tr>)}</tbody></table></div></div>
      <div className="card"><div className="section-head"><div><div className="section-title">Allocation projets</div><div className="section-caption">Capital réservé pour vos objectifs</div></div><Link className="pill" href="/projects">Tous les projets</Link></div>{projects.map(p=><div className="project-mini" key={p.name}><div><strong>{p.name}</strong><span>Objectif {money(p.target)} · {p.deadline}</span></div><div className="project-amount"><b>{money(p.allocated)}</b><small>{Math.round((p.allocated/p.target)*100)}%</small></div><div className="progress"><span style={{width:`${(p.allocated/p.target)*100}%`}}/></div></div>)}</div>
    </div>
  </>;
}
