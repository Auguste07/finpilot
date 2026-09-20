'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Repeat2, CalendarDays } from 'lucide-react';

type Allocation = { id:number; name:string; pct:number };
type Rule = { id:number; label:string; amount:number; quantity:number; frequency:string; occurrences:number; start:string };

const money=(n:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);

export function ForecastPlanner(){
  const [income,setIncome]=useState(1500);
  const [month,setMonth]=useState('Octobre 2026');
  const [allocations,setAllocations]=useState<Allocation[]>([
    {id:1,name:'Loyer',pct:30},{id:2,name:'Dépenses courantes',pct:20},{id:3,name:'Transport',pct:15},{id:4,name:'Épargne',pct:15},{id:5,name:'Santé',pct:5}
  ]);
  const [rules,setRules]=useState<Rule[]>([
    {id:1,label:'Eau',amount:35,quantity:1,frequency:'Mensuelle',occurrences:6,start:'2026-10-01'},
    {id:2,label:'Internet',amount:75,quantity:1,frequency:'Mensuelle',occurrences:12,start:'2026-10-05'}
  ]);
  const [showRule,setShowRule]=useState(false);
  const [draft,setDraft]=useState({label:'Eau',amount:35,quantity:1,frequency:'Mensuelle',occurrences:6,start:'2026-10-01'});

  const totalPct=useMemo(()=>allocations.reduce((s,a)=>s+(Number(a.pct)||0),0),[allocations]);
  const allocated=income*totalPct/100;
  const remaining=income-allocated;

  function changeAllocation(id:number,key:'name'|'pct',value:string){
    setAllocations(list=>list.map(a=>a.id===id?{...a,[key]:key==='pct'?Math.max(0,Math.min(100,Number(value)||0)):value}:a));
  }
  function addAllocation(){ setAllocations(list=>[...list,{id:Date.now(),name:'Nouvelle catégorie',pct:0}]); }
  function removeAllocation(id:number){ setAllocations(list=>list.filter(a=>a.id!==id)); }
  function addRule(e:React.FormEvent){
    e.preventDefault();
    if(!draft.label.trim()||draft.amount<=0)return;
    setRules(list=>[...list,{id:Date.now(),...draft}]);
    setShowRule(false);
  }

  return <div className="forecast-layout">
    <section className="card allocation-builder">
      <div className="section-head"><div><div className="section-title">Planificateur de revenus & allocations</div><div className="section-caption">Définissez votre revenu futur puis répartissez-le librement en pourcentages.</div></div><span className="pill green">{month}</span></div>
      <div className="form-grid forecast-controls"><div className="field"><label>Entrée prévue (USD)</label><input className="input" type="number" min="0" value={income} onChange={e=>setIncome(Math.max(0,Number(e.target.value)||0))}/></div><div className="field"><label>Mois de prévision</label><select className="select" value={month} onChange={e=>setMonth(e.target.value)}><option>Octobre 2026</option><option>Novembre 2026</option><option>Décembre 2026</option><option>Janvier 2027</option></select></div></div>
      <div className="allocation-title"><strong>Répartition personnalisée</strong><button className="btn btn-soft" onClick={addAllocation}><Plus size={15}/>Catégorie</button></div>
      <div className="allocation-list">
        {allocations.map(a=><div className="allocation-row" key={a.id}><input className="input" value={a.name} onChange={e=>changeAllocation(a.id,'name',e.target.value)} aria-label="Catégorie"/><div className="percent-field"><input className="input" type="number" min="0" max="100" value={a.pct} onChange={e=>changeAllocation(a.id,'pct',e.target.value)}/><span>%</span></div><div className="allocation-amount">{money(income*a.pct/100)}</div><button className="icon-btn subtle" onClick={()=>removeAllocation(a.id)} aria-label={`Supprimer ${a.name}`}><Trash2 size={15}/></button></div>)}
      </div>
      <div className={`allocation-alert ${totalPct>100?'danger':totalPct===100?'success':''}`}>{totalPct>100?`La répartition dépasse 100% de ${totalPct-100}%. Réduisez certains postes.`:totalPct===100?'Allocation complète : 100% du revenu est affecté.':`${100-totalPct}% reste libre et non affecté.`}</div>
    </section>

    <aside className="card forecast-summary">
      <div className="section-title">Résumé de la prévision</div><div className="section-caption">Mise à jour instantanée</div>
      <div className="summary-lines"><div><span>Revenu prévu</span><b>{money(income)}</b></div><div><span>Montant alloué</span><b>{money(allocated)}</b></div><div><span>Non alloué</span><b className={remaining<0?'text-negative':''}>{money(remaining)}</b></div></div>
      <div className="allocation-meter"><div><span>Allocation</span><strong>{totalPct}%</strong></div><div className="progress"><span style={{width:`${Math.min(totalPct,100)}%`}}/></div></div>
      <div className="forecast-breakdown">{allocations.map(a=><div key={a.id}><span>{a.name} · {a.pct}%</span><b>{money(income*a.pct/100)}</b></div>)}</div>
    </aside>

    <section className="card recurrence-card">
      <div className="section-head"><div><div className="section-title">Dépenses planifiées & récurrences</div><div className="section-caption">Définissez montant, quantité, fréquence, nombre d'échéances et date de départ.</div></div><button className="btn btn-primary" onClick={()=>setShowRule(v=>!v)}><Plus size={16}/>Ajouter une dépense</button></div>
      {showRule&&<form className="recurrence-form" onSubmit={addRule}>
        <div className="field"><label>Dépense</label><input className="input" value={draft.label} onChange={e=>setDraft({...draft,label:e.target.value})} required/></div>
        <div className="field"><label>Montant unitaire</label><input className="input" type="number" min="0.01" step="0.01" value={draft.amount} onChange={e=>setDraft({...draft,amount:Number(e.target.value)||0})}/></div>
        <div className="field"><label>Quantité / échéance</label><input className="input" type="number" min="1" value={draft.quantity} onChange={e=>setDraft({...draft,quantity:Math.max(1,Number(e.target.value)||1)})}/></div>
        <div className="field"><label>Fréquence</label><select className="select" value={draft.frequency} onChange={e=>setDraft({...draft,frequency:e.target.value})}><option>Hebdomadaire</option><option>Mensuelle</option><option>Trimestrielle</option><option>Annuelle</option></select></div>
        <div className="field"><label>Nombre d'échéances</label><input className="input" type="number" min="1" max="60" value={draft.occurrences} onChange={e=>setDraft({...draft,occurrences:Math.max(1,Number(e.target.value)||1)})}/></div>
        <div className="field"><label>Date de départ</label><input className="input" type="date" value={draft.start} onChange={e=>setDraft({...draft,start:e.target.value})}/></div>
        <div className="recurrence-actions"><button className="btn btn-primary" type="submit">Planifier</button><button className="btn" type="button" onClick={()=>setShowRule(false)}>Annuler</button></div>
      </form>}
      <div className="recurrence-list">{rules.map(r=><div className="recurrence-item" key={r.id}><div className="recurrence-icon"><Repeat2 size={17}/></div><div><strong>{r.label}</strong><span>{r.frequency} · {r.occurrences} échéances · quantité {r.quantity}</span></div><div><b>{money(r.amount*r.quantity)}</b><span>par échéance</span></div><div><b>{money(r.amount*r.quantity*r.occurrences)}</b><span>total prévu</span></div><div className="date-inline"><CalendarDays size={14}/>{r.start}</div></div>)}</div>
    </section>
  </div>;
}
