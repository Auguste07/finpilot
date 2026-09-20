'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Repeat2, CalendarDays, Pencil, Download, Archive, BellRing, X } from 'lucide-react';

type Allocation = { id:number; name:string; pct:number };
type Rule = { id:number; label:string; amount:number; quantity:number; frequency:string; occurrences:number; start:string; reminderDays:number; category:string; notes:string };
type HistoryItem = { id:number; type:'planned-expense'|'allocation'; label:string; period:string; amount:number; details:string; archivedAt:string };

const money=(n:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
const initialDraft={label:'Eau',amount:35,quantity:1,frequency:'Mensuelle',occurrences:6,start:'2026-10-01',reminderDays:3,category:'Maison',notes:''};

export function ForecastPlanner(){
  const [income,setIncome]=useState(1500);
  const [month,setMonth]=useState('2026-10');
  const [allocations,setAllocations]=useState<Allocation[]>([
    {id:1,name:'Loyer',pct:30},{id:2,name:'Dépenses courantes',pct:20},{id:3,name:'Transport',pct:15},{id:4,name:'Épargne',pct:15},{id:5,name:'Santé',pct:5}
  ]);
  const [rules,setRules]=useState<Rule[]>([
    {id:1,label:'Eau',amount:35,quantity:1,frequency:'Mensuelle',occurrences:6,start:'2026-10-01',reminderDays:3,category:'Maison',notes:'Facture eau'},
    {id:2,label:'Internet',amount:75,quantity:1,frequency:'Mensuelle',occurrences:12,start:'2026-10-05',reminderDays:2,category:'Communication',notes:''}
  ]);
  const [history,setHistory]=useState<HistoryItem[]>([]);
  const [showRule,setShowRule]=useState(false);
  const [editingId,setEditingId]=useState<number|null>(null);
  const [draft,setDraft]=useState(initialDraft);
  const [historyFrom,setHistoryFrom]=useState('2026-01-01');
  const [historyTo,setHistoryTo]=useState('2026-12-31');

  useEffect(()=>{
    try{
      const saved=localStorage.getItem('finpilot-forecast');
      if(saved){const d=JSON.parse(saved);if(d.allocations)setAllocations(d.allocations);if(d.rules)setRules(d.rules);if(d.history)setHistory(d.history);if(d.income)setIncome(d.income);if(d.month)setMonth(d.month);}
    }catch{}
  },[]);
  useEffect(()=>{
    localStorage.setItem('finpilot-forecast',JSON.stringify({income,month,allocations,rules,history}));
    localStorage.setItem('finpilot-rules',JSON.stringify(rules));
  },[income,month,allocations,rules,history]);

  const totalPct=useMemo(()=>allocations.reduce((s,a)=>s+(Number(a.pct)||0),0),[allocations]);
  const allocated=income*totalPct/100;
  const remaining=income-allocated;

  function changeAllocation(id:number,key:'name'|'pct',value:string){
    setAllocations(list=>list.map(a=>a.id===id?{...a,[key]:key==='pct'?(value===''?0:Math.max(0,Math.min(100,Number(value)))):value}:a));
  }
  function addAllocation(){ setAllocations(list=>[...list,{id:Date.now(),name:'Nouvelle catégorie',pct:0}]); }
  function removeAllocation(id:number){ setAllocations(list=>list.filter(a=>a.id!==id)); }
  function archiveAllocation(a:Allocation){
    setHistory(h=>[{id:Date.now(),type:'allocation',label:a.name,period:month,amount:income*a.pct/100,details:`${a.pct}% de ${money(income)}`,archivedAt:new Date().toISOString()},...h]);
  }
  function openNew(){setEditingId(null);setDraft(initialDraft);setShowRule(true);}
  function editRule(r:Rule){setEditingId(r.id);setDraft({...r});setShowRule(true);}
  function saveRule(e:React.FormEvent){
    e.preventDefault();
    if(!draft.label.trim()||draft.amount<=0)return;
    if(editingId){setRules(list=>list.map(r=>r.id===editingId?{id:editingId,...draft}:r));}
    else setRules(list=>[...list,{id:Date.now(),...draft}]);
    setShowRule(false);setEditingId(null);setDraft(initialDraft);
  }
  function deleteRule(id:number){
    const r=rules.find(x=>x.id===id); if(!r)return;
    setHistory(h=>[{id:Date.now(),type:'planned-expense',label:r.label,period:r.start,amount:r.amount*r.quantity*r.occurrences,details:`${r.frequency}, ${r.occurrences} échéances`,archivedAt:new Date().toISOString()},...h]);
    setRules(list=>list.filter(r=>r.id!==id));
  }
  function archiveRule(r:Rule){
    setHistory(h=>[{id:Date.now(),type:'planned-expense',label:r.label,period:r.start,amount:r.amount*r.quantity*r.occurrences,details:`${r.frequency}, ${r.occurrences} échéances`,archivedAt:new Date().toISOString()},...h]);
  }
  function exportHistory(){
    const filtered=history.filter(h=>h.archivedAt.slice(0,10)>=historyFrom&&h.archivedAt.slice(0,10)<=historyTo);
    const csv=['Type,Libelle,Periode,Montant,Details,Archive le',...filtered.map(h=>[h.type,h.label,h.period,h.amount,h.details,h.archivedAt].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','))].join('\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`finpilot-historique-${historyFrom}-${historyTo}.csv`;a.click();URL.revokeObjectURL(url);
  }

  return <div className="forecast-layout">
    <section className="card allocation-builder">
      <div className="section-head"><div><div className="section-title">Planificateur de revenus & allocations</div><div className="section-caption">Définissez votre revenu futur puis répartissez-le librement en pourcentages.</div></div><span className="pill green">{new Date(month+'-01T00:00:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</span></div>
      <div className="form-grid forecast-controls"><div className="field"><label>Entrée prévue (USD)</label><input className="input" type="number" min="0" value={income||''} onChange={e=>setIncome(e.target.value===''?0:Math.max(0,Number(e.target.value)))}/></div><div className="field"><label>Mois de prévision</label><input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/><small className="field-hint">Choisissez directement le mois dans le calendrier.</small></div></div>
      <div className="allocation-title"><strong>Répartition personnalisée</strong><button className="btn btn-soft" onClick={addAllocation}><Plus size={15}/>Catégorie</button></div>
      <div className="allocation-list">
        {allocations.map(a=><div className="allocation-row" key={a.id}><input className="input" value={a.name} onChange={e=>changeAllocation(a.id,'name',e.target.value)} aria-label="Catégorie"/><div className="percent-field"><input className="input" type="number" min="0" max="100" value={a.pct===0?'':a.pct} placeholder="0" onChange={e=>changeAllocation(a.id,'pct',e.target.value)}/><span>%</span></div><div className="allocation-amount">{money(income*a.pct/100)}</div><div className="inline-actions"><button className="icon-btn subtle" onClick={()=>archiveAllocation(a)} title="Historiser"><Archive size={15}/></button><button className="icon-btn subtle" onClick={()=>removeAllocation(a.id)} aria-label={`Supprimer ${a.name}`}><Trash2 size={15}/></button></div></div>)}
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
      <div className="section-head"><div><div className="section-title">Dépenses planifiées & récurrences</div><div className="section-caption">Ajoutez, modifiez, supprimez, historisez et programmez les rappels.</div></div><button className="btn btn-primary" onClick={openNew}><Plus size={16}/>Ajouter une dépense</button></div>
      {showRule&&<div className="modal-backdrop" onMouseDown={()=>setShowRule(false)}><form className="modal-card recurrence-form" onMouseDown={e=>e.stopPropagation()} onSubmit={saveRule}>
        <div className="modal-head"><div><div className="section-title">{editingId?'Modifier la dépense':'Nouvelle dépense planifiée'}</div><div className="section-caption">Tous les paramètres restent modifiables.</div></div><button type="button" className="icon-btn" onClick={()=>setShowRule(false)}><X size={17}/></button></div>
        <div className="field"><label>Dépense</label><input className="input" value={draft.label} onChange={e=>setDraft({...draft,label:e.target.value})} required/></div>
        <div className="field"><label>Catégorie</label><input className="input" value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}/></div>
        <div className="field"><label>Montant unitaire</label><input className="input" type="number" min="0.01" step="0.01" value={draft.amount||''} onChange={e=>setDraft({...draft,amount:e.target.value===''?0:Number(e.target.value)})}/></div>
        <div className="field"><label>Quantité / échéance</label><input className="input" type="number" min="1" value={draft.quantity||''} onChange={e=>setDraft({...draft,quantity:e.target.value===''?1:Math.max(1,Number(e.target.value))})}/></div>
        <div className="field"><label>Fréquence</label><select className="select" value={draft.frequency} onChange={e=>setDraft({...draft,frequency:e.target.value})}><option>Hebdomadaire</option><option>Bimensuelle</option><option>Mensuelle</option><option>Trimestrielle</option><option>Semestrielle</option><option>Annuelle</option></select></div>
        <div className="field"><label>Nombre d'échéances</label><input className="input" type="number" min="1" max="120" value={draft.occurrences||''} onChange={e=>setDraft({...draft,occurrences:e.target.value===''?1:Math.max(1,Number(e.target.value))})}/></div>
        <div className="field"><label>Date de départ</label><input className="input" type="date" value={draft.start} onChange={e=>setDraft({...draft,start:e.target.value})}/></div>
        <div className="field"><label>Rappel avant échéance</label><select className="select" value={draft.reminderDays} onChange={e=>setDraft({...draft,reminderDays:Number(e.target.value)})}><option value="0">Le jour même</option><option value="1">1 jour avant</option><option value="2">2 jours avant</option><option value="3">3 jours avant</option><option value="7">7 jours avant</option></select></div>
        <div className="field field-wide"><label>Notes</label><textarea className="input textarea" value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></div>
        <div className="recurrence-actions"><button className="btn btn-primary" type="submit">{editingId?'Enregistrer':'Planifier'}</button><button className="btn" type="button" onClick={()=>setShowRule(false)}>Annuler</button></div>
      </form></div>}
      <div className="recurrence-list">{rules.map(r=><div className="recurrence-item" key={r.id}><div className="recurrence-icon"><Repeat2 size={17}/></div><div><strong>{r.label}</strong><span>{r.category} · {r.frequency} · {r.occurrences} échéances · quantité {r.quantity}</span></div><div><b>{money(r.amount*r.quantity)}</b><span>par échéance</span></div><div><b>{money(r.amount*r.quantity*r.occurrences)}</b><span>total prévu</span></div><div className="date-inline"><CalendarDays size={14}/>{r.start}</div><div className="row-actions"><button className="icon-btn subtle" onClick={()=>editRule(r)} title="Modifier"><Pencil size={15}/></button><button className="icon-btn subtle" onClick={()=>archiveRule(r)} title="Historiser"><Archive size={15}/></button><button className="icon-btn subtle" onClick={()=>deleteRule(r.id)} title="Supprimer"><Trash2 size={15}/></button></div></div>)}</div>
    </section>

    <section className="card recurrence-card history-card">
      <div className="section-head"><div><div className="section-title">Historisation & export</div><div className="section-caption">Archivez les anciennes semaines/mois puis exportez une période au format CSV.</div></div><button className="btn" onClick={exportHistory}><Download size={16}/>Exporter CSV</button></div>
      <div className="history-filters"><div className="field"><label>Du</label><input className="input" type="date" value={historyFrom} onChange={e=>setHistoryFrom(e.target.value)}/></div><div className="field"><label>Au</label><input className="input" type="date" value={historyTo} onChange={e=>setHistoryTo(e.target.value)}/></div><div className="history-info"><BellRing size={16}/><span>{history.length} élément(s) historisé(s)</span></div></div>
      <div className="table-wrap"><table><thead><tr><th>Type</th><th>Libellé</th><th>Période</th><th>Détails</th><th>Montant</th><th>Archivé le</th></tr></thead><tbody>{history.length===0?<tr><td colSpan={6} className="empty-cell">Aucun historique. Utilisez l’icône archive sur une dépense ou une allocation.</td></tr>:history.map(h=><tr key={h.id}><td>{h.type==='allocation'?'Allocation':'Dépense'}</td><td><strong>{h.label}</strong></td><td>{h.period}</td><td>{h.details}</td><td>{money(h.amount)}</td><td>{new Date(h.archivedAt).toLocaleDateString('fr-FR')}</td></tr>)}</tbody></table></div>
    </section>
  </div>;
}
