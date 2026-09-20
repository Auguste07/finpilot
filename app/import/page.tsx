'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { PageHeader } from '@/components/page-header';
import { FileSpreadsheet, Upload, CheckCircle2 } from 'lucide-react';

type Row = Record<string, string | number | boolean | null>;

export default function ImportPage(){
  const [rows,setRows]=useState<Row[]>([]);
  const [name,setName]=useState('');

  async function readFile(file: File){
    setName(file.name);
    const data=await file.arrayBuffer();
    const wb=XLSX.read(data,{type:'array',cellDates:true});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const json=XLSX.utils.sheet_to_json<Row>(ws,{defval:''});
    setRows(json.slice(0,100));
  }

  return <>
    <PageHeader eyebrow="Data intake" title="Importer un fichier Excel" subtitle="Chargez vos historiques sans casser votre modèle : l’assistant d’import vous permet de mapper chaque colonne vers date, montant, catégorie, compte, projet ou type d’opération."/>
    <div className="grid-2">
      <div className="card">
        <label className="upload-zone" style={{display:'block',cursor:'pointer'}}>
          <FileSpreadsheet size={34} style={{margin:'0 auto 12px'}}/>
          <div style={{fontWeight:800}}>Déposez votre fichier .xlsx / .xls / .csv</div>
          <div className="section-caption" style={{margin:'7px 0 16px'}}>Aucun fichier n’est envoyé avant validation.</div>
          <span className="btn btn-primary"><Upload size={16}/>Choisir un fichier</span>
          <input type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={e=>e.target.files?.[0]&&readFile(e.target.files[0])}/>
        </label>
        {name&&<div className="kpi-row"><span><CheckCircle2 size={15} style={{display:'inline',marginRight:7}}/>{name}</span><strong>{rows.length} lignes prévisualisées</strong></div>}
      </div>
      <div className="card">
        <div className="section-title">Colonnes recommandées</div>
        <div className="section-caption" style={{margin:'7px 0 16px'}}>Le système accepte d’autres noms de colonnes via le mapping.</div>
        {['date','description','amount','type (income/expense)','category','account','project','status','notes'].map(x=><div className="kpi-row" key={x}><code>{x}</code><span className="pill">option configurable</span></div>)}
      </div>
    </div>
    {rows.length>0&&<div className="section card"><div className="section-head"><div><div className="section-title">Aperçu avant import</div><div className="section-caption">Les 100 premières lignes sont affichées. La validation serveur déduplique ensuite les opérations.</div></div><button className="btn btn-primary">Valider le mapping</button></div><div className="table-wrap"><table><thead><tr>{Object.keys(rows[0]).slice(0,8).map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{rows.slice(0,8).map((r,i)=><tr key={i}>{Object.keys(rows[0]).slice(0,8).map(k=><td key={k}>{String(r[k]??'')}</td>)}</tr>)}</tbody></table></div></div>}
  </>;
}
