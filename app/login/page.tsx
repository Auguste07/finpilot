'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CircleDollarSign } from 'lucide-react';

export default function Login(){
  const [email,setEmail]=useState(''); const [sent,setSent]=useState(false); const [err,setErr]=useState('');
  async function submit(e:React.FormEvent){e.preventDefault();setErr('');const supabase=createClient();const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${location.origin}/auth/callback`}}); if(error)setErr(error.message);else setSent(true);}
  return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:20}}><div className="card" style={{width:'100%',maxWidth:420,padding:28}}><div className="brand" style={{padding:0,marginBottom:24}}><span className="brand-mark"><CircleDollarSign size={19}/></span> FinPilot</div><div className="section-title" style={{fontSize:24}}>Votre espace financier privé</div><div className="section-caption" style={{margin:'8px 0 20px'}}>Connexion sans mot de passe via un lien sécurisé envoyé par e-mail.</div>{sent?<div className="pill green">Lien envoyé. Consultez votre boîte mail.</div>:<form onSubmit={submit}><div className="field"><label>Adresse e-mail</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com"/></div>{err&&<div style={{color:'#b42318',fontSize:12,marginTop:8}}>{err}</div>}<button className="btn btn-primary" style={{width:'100%',marginTop:16}}>Recevoir le lien de connexion</button></form>}</div></div>;
}
