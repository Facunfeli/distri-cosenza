import React, { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

const DEFAULT_CATS = [
  { id:'trapos',      label:'Trapos',      emoji:'🧺' },
  { id:'rejillas',    label:'Rejillas',    emoji:'🔲' },
  { id:'microfibra',  label:'Microfibra',  emoji:'✨' },
  { id:'repasadores', label:'Repasadores', emoji:'🍽' },
  { id:'esponjas',    label:'Esponjas',    emoji:'🟩' },
  { id:'escobas',     label:'Escobas',     emoji:'🧹' },
  { id:'detergentes', label:'Detergentes', emoji:'🧴' },
  { id:'plumeros',    label:'Plumeros',    emoji:'🪶' },
]

const C = { bg:'#f5f5f5', white:'#ffffff', border:'#e0e0e0', gold:'#c9a96e', green:'#2ecc71', red:'#e74c3c', muted:'#999', text:'#222', sub:'#555', dark:'#1a1a1a' }
const fmt = n => '$' + Number(n).toLocaleString('es-AR')

const Ico = (p) => React.createElement('svg',{width:p.s||20,height:p.s||20,viewBox:'0 0 24 24',fill:'none',stroke:p.c||'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:p.d}))
const IBack   = () => React.createElement(Ico,{d:'M19 12H5M12 19l-7-7 7-7'})
const ITrash  = () => React.createElement(Ico,{d:'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2'})
const ICart   = (p) => React.createElement(Ico,{d:'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',s:p?.s||20})
const ICheck  = () => React.createElement(Ico,{d:'M20 6L9 17l-5-5'})
const ILogout = () => React.createElement(Ico,{d:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9'})
const IWsp    = () => React.createElement(Ico,{d:'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'})
const IChevron= () => React.createElement(Ico,{d:'M9 18l6-6-6-6',s:16})
const IClose  = () => React.createElement(Ico,{d:'M18 6L6 18M6 6l12 12',c:'#fff'})

const inp = { width:'100%', background:'#fff', border:'1px solid #ddd', borderRadius:8, padding:'12px 14px', color:C.text, fontSize:14, outline:'none', marginBottom:10, boxSizing:'border-box' }
const cardS = { background:C.white, border:'1px solid '+C.border, borderRadius:12, padding:14, marginBottom:8 }

function Spinner() {
  return React.createElement('div',{style:{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}},
    React.createElement('div',{style:{textAlign:'center'}},[
      React.createElement('div',{key:'s',style:{width:36,height:36,border:'3px solid #ddd',borderTop:'3px solid '+C.gold,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}}),
      React.createElement('p',{key:'t',style:{color:C.muted,fontSize:13}},'Cargando...'),
      React.createElement('style',{key:'st'},'@keyframes spin{to{transform:rotate(360deg)}}')
    ])
  )
}

// ── GALERIA MODAL ─────────────────────────────────────────────────────────────
function Gallery({photos, name, onClose}) {
  const [idx,setIdx]=useState(0)
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:1000,display:'flex',flexDirection:'column'}} onClick={onClose}>
      <div style={{display:'flex',justifyContent:'flex-end',padding:16}}>
        <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer'}}><IClose/></button>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 20px'}} onClick={e=>e.stopPropagation()}>
        <img src={photos[idx]} alt={name} style={{maxWidth:'100%',maxHeight:'65vh',objectFit:'contain',borderRadius:8}}/>
      </div>
      {photos.length>1&&(
        <div style={{display:'flex',justifyContent:'center',gap:10,padding:16}}>
          {photos.map((ph,i)=>(
            <div key={i} onClick={()=>setIdx(i)} style={{width:54,height:54,borderRadius:8,overflow:'hidden',border:'2px solid '+(i===idx?C.gold:'#555'),cursor:'pointer'}}>
              <img src={ph} alt="" style={{width:'100%',height:'100%',objectFit:'contain',background:'#222'}}/>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── TOPBAR ────────────────────────────────────────────────────────────────────
function TopBar({title, sub, onBack, cartCount, onCart, onLogout}) {
  return (
    <div style={{background:C.white,borderBottom:'1px solid '+C.border,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        {onBack&&<button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',color:C.text,display:'flex',alignItems:'center'}}><IBack/></button>}
        <div>
          <p style={{fontWeight:700,fontSize:15,color:C.text,margin:0,lineHeight:1.2}}>{title}</p>
          {sub&&<p style={{fontSize:11,color:C.muted,margin:0}}>{sub}</p>}
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        {onCart!==undefined&&(
          <div style={{position:'relative',cursor:'pointer'}} onClick={()=>cartCount>0&&onCart()}>
            <ICart/>
            {cartCount>0&&<span style={{position:'absolute',top:-6,right:-6,background:C.red,color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{cartCount}</span>}
          </div>
        )}
        {onLogout&&<button onClick={onLogout} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,display:'flex'}}><ILogout/></button>}
      </div>
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [u,setU]=useState(''); const [p,setP]=useState(''); const [err,setErr]=useState(''); const [loading,setLoading]=useState(false)
  const go=async()=>{
    const username=u.trim(); const password=p.trim()
    if(!username||!password){setErr('Completa los campos');return}
    setLoading(true); setErr('')
    try {
      if(username==='admin'&&password==='admin123'){const s={role:'admin'};sessionStorage.setItem('dc_session',JSON.stringify(s));onLogin(s);return}
      const {data,error}=await supabase.from('clients').select('*').eq('username',username).eq('password',password)
      if(error||!data||data.length===0){setErr('Usuario o contrasena incorrectos');setLoading(false);return}
      const s={role:'client',client:data[0]};sessionStorage.setItem('dc_session',JSON.stringify(s));onLogin(s)
    } catch(e){setErr('Error de conexion');setLoading(false)}
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f0f0',padding:24}}>
      <div style={{width:'100%',maxWidth:360,background:'#fff',borderRadius:16,padding:'36px 28px',boxShadow:'0 4px 24px rgba(0,0,0,0.1)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <p style={{fontSize:11,letterSpacing:5,textTransform:'uppercase',color:C.gold,marginBottom:4}}>Distribuidora</p>
          <h1 style={{fontSize:26,fontWeight:800,color:C.dark,margin:0}}>Distri Cosenza</h1>
        </div>
        {err&&<div style={{padding:'10px 14px',borderRadius:8,background:'#ffeaea',color:C.red,fontSize:13,marginBottom:10,border:'1px solid #fcc'}}>{err}</div>}
        <input style={inp} placeholder="Usuario" value={u} onChange={e=>setU(e.target.value)} autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck="false"/>
        <input style={inp} placeholder="Contrasena" type="password" value={p} onChange={e=>setP(e.target.value)} autoComplete="off" onKeyDown={e=>e.key==='Enter'&&go()}/>
        <button style={{width:'100%',padding:'13px',borderRadius:10,border:'none',cursor:'pointer',fontSize:15,fontWeight:700,background:C.gold,color:'#fff'}} onMouseDown={e=>e.preventDefault()} onClick={go} disabled={loading}>{loading?'Ingresando...':'Ingresar'}</button>
      </div>
    </div>
  )
}

// ── ADMIN ROOT ────────────────────────────────────────────────────────────────
function Admin({onLogout}) {
  const [tab,setTab]=useState('products')
  const [products,setProducts]=useState([]); const [clients,setClients]=useState([]); const [orders,setOrders]=useState([]); const [cats,setCats]=useState(DEFAULT_CATS)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    Promise.all([supabase.from('products').select('*').order('cat'),supabase.from('clients').select('*').order('name'),supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(100)])
      .then(([p,cl,o])=>{if(p.data)setProducts(p.data);if(cl.data)setClients(cl.data);if(o.data)setOrders(o.data);setLoading(false)})
  },[])
  if(loading) return React.createElement(Spinner,null)
  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5'}}>
      <div style={{background:C.dark,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <p style={{fontSize:13,letterSpacing:3,textTransform:'uppercase',color:C.gold,margin:0,fontWeight:700}}>Admin · Distri Cosenza</p>
        <button onClick={onLogout} style={{background:'none',border:'none',color:'#aaa',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}><ILogout/> Salir</button>
      </div>
      <div style={{display:'flex',background:C.white,borderBottom:'1px solid '+C.border,padding:'0 12px',overflowX:'auto'}}>
        {[['products','Productos'],['cats','Categorias'],['clients','Clientes'],['orders','Pedidos']].map(([k,l])=>
          <button key={k} onClick={()=>setTab(k)} style={{padding:'13px 14px',fontSize:13,fontWeight:600,cursor:'pointer',background:'none',border:'none',color:tab===k?C.gold:C.muted,borderBottom:tab===k?'2px solid '+C.gold:'2px solid transparent',whiteSpace:'nowrap'}}>{l}</button>
        )}
      </div>
      <div style={{padding:14,maxWidth:700,margin:'0 auto'}}>
        {tab==='products'&&<AdminProducts products={products} setProducts={setProducts} cats={cats}/>}
        {tab==='cats'    &&<AdminCats cats={cats} setCats={setCats} products={products}/>}
        {tab==='clients' &&<AdminClients clients={clients} setClients={setClients} products={products} cats={cats}/>}
        {tab==='orders'  &&<AdminOrders orders={orders} setOrders={setOrders} clients={clients} products={products}/>}
      </div>
    </div>
  )
}

function AdminCats({cats,setCats,products}) {
  const [newLabel,setNewLabel]=useState(''); const [newEmoji,setNewEmoji]=useState('📦')
  const add=()=>{ if(!newLabel.trim()) return; const id=newLabel.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''); if(cats.find(c=>c.id===id)) return; setCats(prev=>[...prev,{id,label:newLabel.trim(),emoji:newEmoji}]); setNewLabel(''); setNewEmoji('📦') }
  const del=id=>{ if(products.some(p=>p.cat===id)){alert('Tiene productos. Cambialos primero.');return} if(window.confirm('Eliminar?')) setCats(prev=>prev.filter(c=>c.id!==id)) }
  return (
    <div>
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>Categorias ({cats.length})</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {cats.map(cat=>{ const count=products.filter(p=>p.cat===cat.id).length; return (
          <div key={cat.id} style={{...cardS,padding:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:24}}>{cat.emoji}</span><button style={{background:'#ffeaea',border:'none',borderRadius:6,padding:'4px 7px',cursor:'pointer',color:C.red}} onClick={()=>del(cat.id)}><ITrash/></button></div>
            <p style={{fontWeight:700,fontSize:13,color:C.text,margin:'0 0 2px'}}>{cat.label}</p><p style={{fontSize:11,color:C.muted,margin:0}}>{count} prod.</p>
          </div>
        )})}
      </div>
      <div style={{...cardS,border:'1px dashed #ddd',background:'#fafafa'}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>Nueva categoria</p>
        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <input style={{...inp,marginBottom:0,flex:'0 0 52px',textAlign:'center',fontSize:20,padding:'8px'}} value={newEmoji} onChange={e=>setNewEmoji(e.target.value)} maxLength={2}/>
          <input style={{...inp,marginBottom:0,flex:1}} placeholder='Ej: Escobas...' value={newLabel} onChange={e=>setNewLabel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}/>
        </div>
        <button style={{width:'100%',padding:'11px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,background:C.gold,color:'#fff'}} onClick={add}>Agregar</button>
      </div>
    </div>
  )
}

function AdminProducts({products,setProducts,cats}) {
  const [editing,setEditing]=useState(null); const [form,setForm]=useState({}); const [saving,setSaving]=useState(false); const [msg,setMsg]=useState('')
  const readImg=(e,slot)=>{ const file=e.target.files[0]; if(!file) return; const r=new FileReader(); r.onload=ev=>setForm(f=>({...f,[slot]:ev.target.result})); r.readAsDataURL(file) }
  const openNew=()=>{ setForm({name:'',description:'',unit:'docena',qty_per_unit:12,cat:cats[0]?.id||'',photo:null,photo2:null}); setMsg(''); setEditing('new') }
  const openEdit=p=>{ setForm({...p}); setMsg(''); setEditing(p.id) }
  const save=async()=>{
    if(!form.name?.trim()){setMsg('El nombre es obligatorio');return}
    setSaving(true); setMsg('')
    const entry={name:form.name.trim(),description:form.description||'',unit:form.unit||'docena',qty_per_unit:Number(form.qty_per_unit)||12,cat:form.cat||'',photo:form.photo||null,photo2:form.photo2||null,active:true}
    try {
      if(editing==='new'){const {data,error}=await supabase.from('products').insert([entry]).select();if(error){setMsg('Error: '+error.message);return};if(data&&data[0])setProducts(prev=>[...prev,data[0]])}
      else{const {data,error}=await supabase.from('products').update(entry).eq('id',editing).select();if(error){setMsg('Error: '+error.message);return};if(data&&data[0])setProducts(prev=>prev.map(p=>p.id===editing?data[0]:p))}
      setMsg('Guardado!'); setTimeout(()=>setEditing(null),600)
    } finally{setSaving(false)}
  }
  const del=async id=>{ if(!window.confirm('Eliminar?')) return; await supabase.from('products').delete().eq('id',id); setProducts(prev=>prev.filter(p=>p.id!==id)) }
  if(editing!==null) return (
    <div style={{...cardS,maxWidth:500}}>
      <button onClick={()=>setEditing(null)} style={{background:'none',border:'none',cursor:'pointer',color:C.gold,fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>{editing==='new'?'Nuevo producto':'Editar producto'}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {[['photo','Foto 1','pi1'],['photo2','Foto 2','pi2']].map(([slot,label,id])=>(
          <div key={slot}>
            <p style={{fontSize:11,color:C.muted,marginBottom:4}}>{label}</p>
            <div style={{height:100,background:'#f5f5f5',borderRadius:10,border:'1px dashed #ddd',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden'}} onClick={()=>document.getElementById(id)?.click()}>
              {form[slot]?<img src={form[slot]} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<div style={{textAlign:'center',color:C.muted,fontSize:11}}><div style={{fontSize:24}}>📷</div><p style={{margin:'4px 0 0'}}>Subir</p></div>}
              <input id={id} type="file" accept="image/*" style={{display:'none'}} onChange={e=>readImg(e,slot)}/>
            </div>
          </div>
        ))}
      </div>
      <input style={inp} placeholder="Nombre *" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <textarea style={{...inp,minHeight:60,resize:'vertical'}} placeholder="Descripcion" value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
      <p style={{fontSize:11,color:C.muted,marginBottom:4}}>Categoria</p>
      <select style={inp} value={form.cat||''} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>
        <option value="">-- Elegir --</option>
        {cats.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
      </select>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div><p style={{fontSize:11,color:C.muted,marginBottom:4}}>Unidad</p><input style={{...inp,marginBottom:0}} value={form.unit||'docena'} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/></div>
        <div><p style={{fontSize:11,color:C.muted,marginBottom:4}}>Unidades/pack</p><input style={{...inp,marginBottom:0}} type="number" min="1" value={form.qty_per_unit||12} onChange={e=>setForm(f=>({...f,qty_per_unit:Number(e.target.value)}))}/></div>
      </div>
      {msg&&<div style={{padding:'10px 14px',borderRadius:8,marginTop:10,background:msg.startsWith('Error')?'#ffeaea':'#eaffea',color:msg.startsWith('Error')?C.red:C.green,fontSize:13}}>{msg}</div>}
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <button style={{flex:1,padding:'11px',borderRadius:8,border:'1px solid #ddd',cursor:'pointer',fontSize:14,fontWeight:600,background:'#fff',color:C.text}} onClick={()=>setEditing(null)}>Cancelar</button>
        <button style={{flex:1,padding:'11px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,background:C.gold,color:'#fff'}} onClick={save} disabled={saving}>{saving?'Guardando...':'Guardar'}</button>
      </div>
    </div>
  )
  const grouped=cats.map(cat=>({cat,items:products.filter(p=>p.cat===cat.id)})).filter(g=>g.items.length>0)
  const sinCat=products.filter(p=>!cats.find(c=>c.id===p.cat))
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:0}}>{products.length} productos</p>
        <button style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:C.gold,color:'#fff'}} onClick={openNew}>+ Nuevo</button>
      </div>
      {grouped.map(({cat,items})=>(
        <div key={cat.id} style={{marginBottom:16}}>
          <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:'0 0 8px'}}>{cat.emoji} {cat.label}</p>
          {items.map(p=>(
            <div key={p.id} style={{...cardS,display:'flex',gap:12,alignItems:'center',padding:10}}>
              <div style={{width:48,height:48,borderRadius:8,background:'#f5f5f5',overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #eee'}}>
                {p.photo?<img src={p.photo} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<span style={{fontSize:20}}>{cat.emoji}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}><p style={{fontWeight:600,fontSize:13,color:C.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</p><p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{p.unit} · {p.qty_per_unit} u/pack</p></div>
              <div style={{display:'flex',gap:6}}>
                <button style={{padding:'6px 12px',borderRadius:7,border:'1px solid #ddd',cursor:'pointer',fontSize:12,fontWeight:600,background:'#fff'}} onClick={()=>openEdit(p)}>Editar</button>
                <button style={{padding:'6px 10px',borderRadius:7,border:'none',cursor:'pointer',background:'#ffeaea',color:C.red}} onClick={()=>del(p.id)}><ITrash/></button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {sinCat.length>0&&<div><p style={{color:C.red,fontSize:11,marginBottom:8}}>Sin categoria</p>{sinCat.map(p=><div key={p.id} style={{...cardS,display:'flex',justifyContent:'space-between',alignItems:'center'}}><p style={{color:C.text,margin:0,fontSize:13}}>{p.name}</p><button style={{padding:'6px 12px',borderRadius:7,border:'1px solid #ddd',cursor:'pointer',fontSize:12,background:'#fff'}} onClick={()=>openEdit(p)}>Editar</button></div>)}</div>}
      {products.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin productos aun.</p>}
    </div>
  )
}

function AdminClients({clients,setClients,products,cats}) {
  const [view,setView]=useState('list'); const [editId,setEditId]=useState(null); const [form,setForm]=useState({}); const [prices,setPrices]=useState({}); const [saving,setSaving]=useState(false); const [msg,setMsg]=useState(''); const [wspSent,setWspSent]=useState(false)
  const blankPrices=()=>{ const p={}; products.forEach(pr=>{p[pr.id]={price:'',min_qty:1,bulk_discount:0}}); return p }
  const openNew=()=>{ setForm({name:'',username:'',password:'1234',phone:'',address:'',localidad:''}); setPrices(blankPrices()); setWspSent(false); setMsg(''); setEditId(null); setView('edit') }
  const openEdit=c=>{ setForm({name:c.name,username:c.username,password:c.password,phone:c.phone||'',address:c.address||'',localidad:c.localidad||''}); const p=blankPrices(); if(c.prices)Object.entries(c.prices).forEach(([k,v])=>{p[k]={...p[k],...v}}); setPrices(p); setWspSent(false); setMsg(''); setEditId(c.id); setView('edit') }
  const save=async()=>{
    if(!form.name.trim()||!form.username.trim()||!form.localidad?.trim()){setMsg('Nombre, usuario y localidad son obligatorios');return}
    setSaving(true); setMsg('')
    const entry={name:form.name.trim(),username:form.username.trim().toLowerCase(),password:form.password.trim(),phone:form.phone.replace(/[^0-9]/g,''),address:form.address.trim(),localidad:form.localidad?.trim()||'',prices}
    try {
      if(!editId){const {data,error}=await supabase.from('clients').insert([entry]).select();if(error){setMsg('Error: '+error.message);return};if(data&&data[0])setClients(prev=>[...prev,data[0]])}
      else{const {data,error}=await supabase.from('clients').update(entry).eq('id',editId).select();if(error){setMsg('Error: '+error.message);return};if(data&&data[0])setClients(prev=>prev.map(c=>c.id===editId?data[0]:c))}
      setMsg('Guardado!'); setTimeout(()=>setView('list'),600)
    } finally{setSaving(false)}
  }
  const del=async id=>{ if(!window.confirm('Eliminar?')) return; await supabase.from('clients').delete().eq('id',id); setClients(prev=>prev.filter(c=>c.id!==id)) }
  const sendWsp=()=>{
    if(!form.phone) return
    const msg='Hola '+form.name+'! Tu acceso al catalogo de Distri Cosenza:\n\nLink: '+window.location.origin+'\nUsuario: '+form.username+'\nClave: '+form.password
    window.open('https://wa.me/'+form.phone.replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(msg),'_blank'); setWspSent(true)
  }
  if(view==='edit'){
    const grouped=cats.map(cat=>({cat,items:products.filter(p=>p.cat===cat.id)})).filter(g=>g.items.length>0)
    return (
      <div style={{maxWidth:500}}>
        <button onClick={()=>setView('list')} style={{background:'none',border:'none',cursor:'pointer',color:C.gold,fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>{!editId?'Nuevo cliente':'Editar cliente'}</p>
        <div style={cardS}>
          <input style={inp} placeholder="Nombre del local *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <input style={inp} placeholder="Direccion" value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
        <input style={inp} placeholder="Localidad *" value={form.localidad||''} onChange={e=>setForm(f=>({...f,localidad:e.target.value}))}/>
          <input style={inp} placeholder="Usuario *" value={form.username} autoCapitalize="none" autoCorrect="off" autoComplete="off" onChange={e=>setForm(f=>({...f,username:e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'')}))}/>
          <input style={inp} placeholder="Contrasena" value={form.password} autoComplete="off" onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
          <input style={{...inp,marginBottom:form.phone?10:0}} placeholder="WhatsApp (5491165001234)" type="tel" value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
          {form.phone&&<button onClick={sendWsp} style={{width:'100%',padding:'11px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,background:'#25D366',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:0}}><IWsp/> {wspSent?'Acceso enviado!':'Enviar acceso por WhatsApp'}</button>}
        </div>
        {grouped.length>0&&(
          <div style={{marginTop:14}}>
            <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:6}}>Precios por producto</p>
            <p style={{fontSize:12,color:C.muted,marginBottom:10}}>Deja en blanco si no tenes precio todavia.</p>
            {grouped.map(({cat,items})=>(
              <div key={cat.id} style={{marginBottom:14}}>
                <p style={{fontSize:11,color:C.muted,letterSpacing:2,textTransform:'uppercase',margin:'0 0 6px'}}>{cat.emoji} {cat.label}</p>
                {items.map(pr=>(
                  <div key={pr.id} style={{...cardS,marginBottom:6,padding:12}}>
                    <p style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:8}}>{pr.name}</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                      {[['Precio $','price'],['Min. doc.','min_qty'],['% bulto','bulk_discount']].map(([lbl,field])=>(
                        <div key={field}><p style={{fontSize:10,color:C.muted,marginBottom:3}}>{lbl}</p>
                          <input style={{...inp,marginBottom:0,padding:'9px 10px',fontSize:13}} type="number" min="0" value={prices[pr.id]?.[field]??''} onChange={e=>{ const val=e.target.value; setPrices(p=>({...p,[pr.id]:{...p[pr.id],[field]:val}})) }}/></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {msg&&<div style={{padding:'10px 14px',borderRadius:8,background:msg.startsWith('Error')?'#ffeaea':'#eaffea',color:msg.startsWith('Error')?C.red:C.green,fontSize:13,marginBottom:10}}>{msg}</div>}
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button style={{flex:1,padding:'11px',borderRadius:8,border:'1px solid #ddd',cursor:'pointer',fontSize:14,fontWeight:600,background:'#fff'}} onClick={()=>setView('list')}>Cancelar</button>
          <button style={{flex:1,padding:'11px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,background:C.gold,color:'#fff'}} onClick={save} disabled={saving}>{saving?'Guardando...':'Guardar'}</button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:0}}>{clients.length} clientes</p>
        <button style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,background:C.gold,color:'#fff'}} onClick={openNew}>+ Nuevo</button>
      </div>
      {clients.map(c=>(
        <div key={c.id} style={cardS}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{flex:1,minWidth:0}}><p style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:2}}>{c.name}</p><p style={{fontSize:12,color:C.muted,margin:0}}>@{c.username} · {c.localidad||c.address||'sin direccion'}</p></div>
            <div style={{display:'flex',gap:6,flexShrink:0,marginLeft:8}}>
              <button style={{padding:'6px 12px',borderRadius:7,border:'1px solid #ddd',cursor:'pointer',fontSize:12,fontWeight:600,background:'#fff'}} onClick={()=>openEdit(c)}>Editar</button>
              <button style={{padding:'6px 10px',borderRadius:7,border:'none',cursor:'pointer',background:'#ffeaea',color:C.red}} onClick={()=>del(c.id)}><ITrash/></button>
            </div>
          </div>
        </div>
      ))}
      {clients.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin clientes aun.</p>}
    </div>
  )
}

function AdminOrders({orders,setOrders,clients,products}) {
  const [sel,setSel]=useState(null)
  const getC=id=>clients.find(c=>c.id===id)||{name:'?'}
  const getP=id=>products.find(p=>p.id===id)||{name:'?',unit:''}
  const inquiries=orders.filter(o=>o.status==='inquiry'); const regular=orders.filter(o=>o.status!=='inquiry')
  const resolve=async o=>{ await supabase.from('orders').update({status:'resolved'}).eq('id',o.id); setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:'resolved'}:x)) }
  if(sel){
    const o=orders.find(x=>x.id===sel); const items=o.items||[]; const total=items.reduce((s,i)=>s+(i.price||0)*i.qty,0)
    return (
      <div style={{maxWidth:500}}>
        <button onClick={()=>setSel(null)} style={{background:'none',border:'none',cursor:'pointer',color:C.gold,fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
        <div style={cardS}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span style={{fontSize:11,color:o.status==='inquiry'?C.gold:C.green,letterSpacing:2,fontWeight:700,background:o.status==='inquiry'?'#fff8ee':'#eaffea',padding:'3px 10px',borderRadius:20,border:'1px solid '+(o.status==='inquiry'?'#f5d98a':'#b2f0c8')}}>{o.status==='inquiry'?'CONSULTA':'PEDIDO'}</span>
            {o.status==='inquiry'&&<button style={{padding:'6px 12px',borderRadius:7,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:C.gold,color:'#fff'}} onClick={()=>resolve(o)}>Marcar resuelta</button>}
          </div>
          <p style={{fontWeight:700,fontSize:17,color:C.text,marginBottom:2}}>{getC(o.client_id).name}</p>
          <p style={{fontSize:12,color:C.muted,marginBottom:14}}>{new Date(o.created_at).toLocaleString('es-AR')}</p>
          {items.map((item,i)=>{ const pr=getP(item.product_id); return <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid '+C.border}}><div><p style={{fontWeight:600,fontSize:13,color:C.text,margin:0}}>{pr.name}</p><p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{item.qty} {pr.unit} {item.price?'x '+fmt(item.price):'· consulta'}</p></div>{item.price?<p style={{fontWeight:700,color:C.gold,margin:0}}>{fmt(item.price*item.qty)}</p>:<span style={{fontSize:12,color:C.gold,fontWeight:700}}>?</span>}</div> })}
          {total>0&&<div style={{display:'flex',justifyContent:'space-between',marginTop:14,paddingTop:14,borderTop:'1px solid '+C.border}}><p style={{fontWeight:700,fontSize:15,color:C.text,margin:0}}>Total</p><p style={{fontWeight:700,fontSize:20,color:C.gold,margin:0}}>{fmt(total)}</p></div>}
        </div>
      </div>
    )
  }
  return (
    <div>
      {inquiries.length>0&&(
        <div style={{marginBottom:20}}>
          <p style={{fontSize:11,color:C.gold,letterSpacing:3,textTransform:'uppercase',marginBottom:8}}>Consultas pendientes ({inquiries.length})</p>
          {inquiries.map(o=><div key={o.id} style={{...cardS,cursor:'pointer',border:'1px solid #f5d98a'}} onClick={()=>setSel(o.id)}>
            <p style={{fontWeight:700,fontSize:14,color:C.text,margin:'0 0 2px'}}>{getC(o.client_id).name}</p>
            <p style={{fontSize:11,color:C.muted,margin:0}}>{new Date(o.created_at).toLocaleString('es-AR')}</p>
          </div>)}
        </div>
      )}
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:8}}>Pedidos ({regular.length})</p>
      {regular.length===0&&inquiries.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin pedidos aun.</p>}
      {regular.map(o=>{ const total=(o.items||[]).reduce((s,i)=>s+(i.price||0)*i.qty,0); return <div key={o.id} style={{...cardS,cursor:'pointer'}} onClick={()=>setSel(o.id)}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{fontWeight:700,fontSize:14,color:C.text,margin:0}}>{getC(o.client_id).name}</p><p style={{fontSize:11,color:C.muted,margin:'3px 0 0'}}>{new Date(o.created_at).toLocaleString('es-AR')}</p></div><p style={{fontWeight:700,fontSize:16,color:C.gold,margin:0}}>{fmt(total)}</p></div></div> })}
    </div>
  )
}

// ── STORE CLIENTE ─────────────────────────────────────────────────────────────
function Store({session,onLogout}) {
  const client=session.client
  const [products,setProducts]=useState([])
  const [cats]=useState(DEFAULT_CATS)
  const [cart,setCart]=useState({})
  const [inquiries,setInquiries]=useState({})
  const [view,setView]=useState('home')   // home | cat | detail | cart | ok
  const [selCat,setSelCat]=useState(null)
  const [selProd,setSelProd]=useState(null)
  const [gallery,setGallery]=useState(null)
  const [loading,setLoading]=useState(true)
  const [submitting,setSubmitting]=useState(false)

  useEffect(()=>{
    supabase.from('products').select('*').eq('active',true).order('name')
      .then(({data})=>{ if(data) setProducts(data); setLoading(false) })
  },[])

  const prices=client.prices||{}
  const addToCart=(pid,delta)=>{
    const pdata=prices[pid]; if(!pdata?.price) return
    const min=Number(pdata.min_qty)||1
    setCart(c=>{ const cur=c[pid]||0; let next=cur+delta; if(next<0) next=0; if(next>0&&next<min) next=delta>0?min:0; return {...c,[pid]:next} })
  }
  const toggleInquiry=pid=>setInquiries(q=>({...q,[pid]:!q[pid]}))
  const cartItems=Object.entries(cart).filter(([,q])=>q>0).map(([pid,qty])=>({product_id:Number(pid),qty,price:Number(prices[pid].price)}))
  const inquiryItems=Object.entries(inquiries).filter(([,v])=>v).map(([pid])=>({product_id:Number(pid),qty:1,price:null}))
  const cartTotal=cartItems.reduce((s,i)=>s+i.price*i.qty,0)
  const cartCount=cartItems.length
  const inquiryCount=inquiryItems.length

  const WSP_NUMBERS = ['5491153495156','5491158203286']

  const confirm=async(isInquiry)=>{
    setSubmitting(true)
    await supabase.from('orders').insert([{client_id:client.id,items:isInquiry?inquiryItems:cartItems,total:isInquiry?0:cartTotal,status:isInquiry?'inquiry':'pending'}])
    if(isInquiry){
      setInquiries({})
      // WhatsApp para consulta
      const msg = `Hola! Soy la tienda Distri Cosenza. ${client.name} de ${client.localidad||''} realizo una consulta de precios desde la web.`
      window.open('https://wa.me/'+WSP_NUMBERS[0]+'?text='+encodeURIComponent(msg),'_blank')
    } else {
      // Armar resumen del pedido
      const lines = cartItems.map(item=>{
        const pr = products.find(p=>p.id===item.product_id)
        return (pr?.name||'Producto')+': '+item.qty+' '+(pr?.unit||'doc')+' x '+fmt(item.price)+' = '+fmt(item.price*item.qty)
      })
      const msg = `Hola! Soy Distri Cosenza.

Cliente: ${client.name}
Localidad: ${client.localidad||''}

Nuevo pedido:
${lines.join('\n')}

Total: ${fmt(cartTotal)}`
      setCart({})
      // Abrir WhatsApp al primero, el segundo lo manejamos aparte
      window.open('https://wa.me/'+WSP_NUMBERS[0]+'?text='+encodeURIComponent(msg),'_blank')
      // Pequeño delay para abrir el segundo
      setTimeout(()=>{ window.open('https://wa.me/'+WSP_NUMBERS[1]+'?text='+encodeURIComponent(msg),'_blank') }, 1500)
    }
    setSubmitting(false); setView('ok')
  }

  const activeCats=cats.filter(cat=>products.some(p=>p.cat===cat.id))

  if(loading) return React.createElement(Spinner,null)

  // ── OK ──
  if(view==='ok') return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,textAlign:'center'}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:'#eaffea',border:'2px solid '+C.green,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,color:C.green}}><ICheck/></div>
      <h2 style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:8}}>Pedido enviado!</h2>
      <p style={{color:C.muted,marginBottom:28,fontSize:15}}>Te contactamos a la brevedad para coordinar la entrega.</p>
      <button style={{padding:'12px 32px',borderRadius:10,border:'none',cursor:'pointer',fontSize:15,fontWeight:700,background:C.gold,color:'#fff'}} onClick={()=>setView('home')}>Volver al inicio</button>
    </div>
  )

  // ── CARRITO ──
  if(view==='cart') return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',maxWidth:600,margin:'0 auto'}}>
      <TopBar title="Mi pedido" onBack={()=>setView(selProd?'detail':'cat')} cartCount={0}/>
      <div style={{padding:16}}>
        {cartItems.map((item,i)=>{ const pr=products.find(p=>p.id===item.product_id); return (
          <div key={i} style={{...cardS,display:'flex',gap:12,alignItems:'center'}}>
            <div style={{width:56,height:56,background:'#f5f5f5',borderRadius:10,overflow:'hidden',flexShrink:0,border:'1px solid #eee',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {pr?.photo&&<img src={pr.photo} style={{width:'100%',height:'100%',objectFit:'contain'}}/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:14,color:C.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pr?.name}</p>
              <p style={{fontSize:12,color:C.muted,margin:'2px 0 0'}}>{item.qty} {pr?.unit} × {fmt(item.price)}</p>
            </div>
            <p style={{fontWeight:700,color:C.gold,margin:0,fontSize:15,flexShrink:0}}>{fmt(item.price*item.qty)}</p>
          </div>
        )})}
        <div style={{...cardS,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px'}}>
          <p style={{fontWeight:700,fontSize:16,color:C.text,margin:0}}>Total</p>
          <p style={{fontWeight:800,fontSize:24,color:C.gold,margin:0}}>{fmt(cartTotal)}</p>
        </div>
        <button style={{width:'100%',padding:'14px',borderRadius:10,border:'none',cursor:'pointer',fontSize:15,fontWeight:700,background:C.gold,color:'#fff',marginTop:4}} onClick={()=>confirm(false)} disabled={submitting}>{submitting?'Enviando...':'Confirmar pedido'}</button>
      </div>
    </div>
  )

  // ── DETALLE PRODUCTO ──
  if(view==='detail'&&selProd) {
    const pr=selProd
    const pdata=prices[pr.id]
    const hasPrice=pdata&&pdata.price
    const price=hasPrice?Number(pdata.price):0
    const qpu=Number(pr.qty_per_unit)||12
    const priceUnit=hasPrice?Math.round(price/qpu):0
    const bulkDiscount=hasPrice?Number(pdata.bulk_discount)||0:0
    const bulkPrice=bulkDiscount>0?Math.round(price*(1-bulkDiscount/100)):0
    const qty=cart[pr.id]||0
    const isInquiry=!!inquiries[pr.id]
    const photos=[pr.photo,pr.photo2].filter(Boolean)
    const catInfo=cats.find(c=>c.id===pr.cat)||{emoji:'📦',label:''}

    return (
      <div style={{minHeight:'100vh',background:'#f5f5f5',maxWidth:600,margin:'0 auto',paddingBottom:100}}>
        {gallery&&React.createElement(Gallery,{photos:gallery.photos,name:gallery.name,onClose:()=>setGallery(null)})}
        <TopBar title={pr.name} sub={catInfo.label} onBack={()=>setView('cat')} cartCount={cartCount} onCart={()=>setView('cart')}/>

        {/* Fotos */}
        <div style={{background:'#fff',padding:16}}>
          <div style={{borderRadius:12,overflow:'hidden',background:'#f8f8f8',display:'flex',alignItems:'center',justifyContent:'center',height:240,cursor:photos.length>0?'pointer':'default',border:'1px solid #eee'}} onClick={()=>photos.length>0&&setGallery({photos,name:pr.name})}>
            {photos.length>0?<img src={photos[0]} alt={pr.name} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>:<span style={{fontSize:56}}>{catInfo.emoji}</span>}
          </div>
          {photos.length>1&&(
            <div style={{display:'flex',gap:8,marginTop:10}}>
              {photos.map((ph,i)=>(
                <div key={i} onClick={()=>setGallery({photos,name:pr.name})} style={{width:60,height:60,borderRadius:8,overflow:'hidden',border:'1px solid #eee',cursor:'pointer',background:'#f8f8f8'}}>
                  <img src={ph} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                </div>
              ))}
              <div style={{fontSize:11,color:C.muted,alignSelf:'center',marginLeft:4}}>Toca para ver</div>
            </div>
          )}
        </div>

        <div style={{padding:'14px 16px'}}>
          <h1 style={{fontSize:20,fontWeight:800,color:C.text,margin:'0 0 6px'}}>{pr.name}</h1>
          {pr.description&&<p style={{fontSize:14,color:C.sub,margin:'0 0 14px',lineHeight:1.6}}>{pr.description}</p>}

          {hasPrice?(
            <div>
              {/* Precios */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                <div style={{background:'#fff',borderRadius:12,padding:'12px 14px',border:'1px solid '+C.border,textAlign:'center'}}>
                  <p style={{fontSize:11,color:C.muted,margin:'0 0 4px'}}>Por {pr.unit}</p>
                  <p style={{fontSize:22,fontWeight:800,color:C.gold,margin:0}}>{fmt(price)}</p>
                </div>
                <div style={{background:'#fff',borderRadius:12,padding:'12px 14px',border:'1px solid '+C.border,textAlign:'center'}}>
                  <p style={{fontSize:11,color:C.muted,margin:'0 0 4px'}}>Por unidad</p>
                  <p style={{fontSize:22,fontWeight:800,color:C.text,margin:0}}>{fmt(priceUnit)}</p>
                </div>
              </div>

              {/* Minimo */}
              <div style={{background:'#fff8ee',border:'1px solid #f5d98a',borderRadius:10,padding:'10px 14px',marginBottom:10,display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:18}}>📦</span>
                <span style={{fontSize:14,fontWeight:700,color:'#a07830'}}>Mínimo: {Number(pdata.min_qty)||1} {pr.unit} = {(Number(pdata.min_qty)||1)*qpu} unidades</span>
              </div>

              {/* Descuento bulto */}
              {bulkPrice>0&&(
                <div style={{background:'#eaffea',border:'1px solid #b2f0c8',borderRadius:10,padding:'10px 14px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><p style={{fontSize:11,color:C.muted,margin:'0 0 2px'}}>Bulto (10 docenas)</p><p style={{fontSize:16,fontWeight:700,color:'#1a8a3a',margin:0}}>{fmt(bulkPrice)}/doc · {fmt(Math.round(bulkPrice/qpu))}/u</p></div>
                  <span style={{fontSize:12,color:'#1a8a3a',fontWeight:700,background:'#c8f5d8',padding:'3px 10px',borderRadius:20}}>{bulkDiscount}% off</span>
                </div>
              )}

              {/* Selector cantidad */}
              <div style={{background:'#fff',borderRadius:12,border:'1px solid '+C.border,padding:'14px 16px',marginTop:6}}>
                <p style={{fontSize:13,color:C.muted,margin:'0 0 10px',fontWeight:600}}>Cantidad de docenas</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',border:'1px solid #ddd',borderRadius:10,overflow:'hidden'}}>
                    <button style={{width:46,height:46,background:'#f5f5f5',border:'none',cursor:'pointer',fontSize:22,fontWeight:300,color:C.text}} onClick={()=>addToCart(pr.id,-1)}>−</button>
                    <span style={{fontWeight:800,fontSize:20,minWidth:44,textAlign:'center',color:C.text}}>{qty}</span>
                    <button style={{width:46,height:46,background:'#f5f5f5',border:'none',cursor:'pointer',fontSize:22,fontWeight:300,color:C.text}} onClick={()=>addToCart(pr.id,1)}>+</button>
                  </div>
                  {qty>0&&(
                    <div style={{textAlign:'right'}}>
                      <p style={{fontWeight:800,color:C.green,fontSize:20,margin:0}}>{fmt(price*qty)}</p>
                      <p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{qty*qpu} unidades</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ):(
            <div>
              <div style={{background:'#f5f5f5',borderRadius:10,padding:'14px',marginBottom:12,textAlign:'center'}}>
                <p style={{fontSize:15,color:C.muted,margin:0}}>Precio a consultar</p>
              </div>
              <button onClick={()=>toggleInquiry(pr.id)} style={{width:'100%',padding:'13px',borderRadius:10,border:isInquiry?'none':'1px solid #ddd',cursor:'pointer',fontSize:14,fontWeight:700,background:isInquiry?C.green:'#fff',color:isInquiry?'#fff':C.text}}>
                {isInquiry?'✓ Consulta marcada':'Consultar precio'}
              </button>
            </div>
          )}
        </div>

        {/* Footer fijo */}
        {(cartCount>0||inquiryCount>0)&&(
          <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:600,margin:'0 auto',padding:'12px 16px',background:'#fff',borderTop:'1px solid '+C.border,display:'flex',flexDirection:'column',gap:8,boxShadow:'0 -2px 10px rgba(0,0,0,0.08)'}}>
            {cartCount>0&&<button style={{width:'100%',padding:'13px',borderRadius:10,border:'none',cursor:'pointer',fontSize:15,fontWeight:700,background:C.gold,color:'#fff'}} onClick={()=>setView('cart')}>Ver carrito ({cartCount}) · {fmt(cartTotal)}</button>}
            {inquiryCount>0&&<button style={{width:'100%',padding:'11px',borderRadius:10,border:'1px solid #ddd',cursor:'pointer',fontSize:13,fontWeight:600,background:'#fff',color:C.text}} onClick={()=>confirm(true)} disabled={submitting}>Consultar precio ({inquiryCount} prod.)</button>}
          </div>
        )}
      </div>
    )
  }

  // ── GRILLA DE PRODUCTOS POR CATEGORIA ──
  if(view==='cat'&&selCat) {
    const catInfo=cats.find(c=>c.id===selCat)||{emoji:'📦',label:''}
    const catProds=products.filter(p=>p.cat===selCat)
    return (
      <div style={{minHeight:'100vh',background:'#f5f5f5',maxWidth:600,margin:'0 auto',paddingBottom:80}}>
        <TopBar title={catInfo.label} sub={catProds.length+' productos'} onBack={()=>setView('home')} cartCount={cartCount} onCart={()=>setView('cart')}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'12px'}}>
          {catProds.map(pr=>{
            const pdata=prices[pr.id]; const hasPrice=pdata&&pdata.price
            const price=hasPrice?Number(pdata.price):0; const qpu=Number(pr.qty_per_unit)||12
            const qty=cart[pr.id]||0
            return (
              <div key={pr.id} style={{background:'#fff',borderRadius:12,border:'1px solid '+C.border,overflow:'hidden',cursor:'pointer',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}} onClick={()=>{ setSelProd(pr); setView('detail') }}>
                {/* Foto cuadrada */}
                <div style={{background:'#f8f8f8',aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                  {pr.photo?<img src={pr.photo} alt={pr.name} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<span style={{fontSize:36}}>{catInfo.emoji}</span>}
                </div>
                {/* Info */}
                <div style={{padding:'10px 10px 12px'}}>
                  <p style={{fontWeight:600,fontSize:13,color:C.text,margin:'0 0 4px',lineHeight:1.3,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{pr.name}</p>
                  {hasPrice?(
                    <div>
                      <p style={{fontSize:16,fontWeight:800,color:C.gold,margin:'0 0 1px'}}>{fmt(price)}</p>
                      <p style={{fontSize:11,color:C.muted,margin:0}}>por {pr.unit} · {fmt(Math.round(price/qpu))}/u</p>
                    </div>
                  ):(
                    <p style={{fontSize:12,color:C.muted,margin:0,fontStyle:'italic'}}>A consultar</p>
                  )}
                  {qty>0&&<div style={{marginTop:6,background:'#eaffea',borderRadius:6,padding:'3px 8px',display:'inline-block'}}><p style={{fontSize:11,fontWeight:700,color:C.green,margin:0}}>{qty} doc. en carrito</p></div>}
                </div>
              </div>
            )
          })}
        </div>
        {catProds.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin productos en esta categoria.</p>}
        {(cartCount>0||inquiryCount>0)&&(
          <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:600,margin:'0 auto',padding:'12px 16px',background:'#fff',borderTop:'1px solid '+C.border,boxShadow:'0 -2px 10px rgba(0,0,0,0.08)'}}>
            {cartCount>0&&<button style={{width:'100%',padding:'13px',borderRadius:10,border:'none',cursor:'pointer',fontSize:15,fontWeight:700,background:C.gold,color:'#fff'}} onClick={()=>setView('cart')}>Ver carrito ({cartCount}) · {fmt(cartTotal)}</button>}
          </div>
        )}
      </div>
    )
  }

  // ── HOME: GRILLA DE CATEGORIAS ──
  return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',maxWidth:600,margin:'0 auto'}}>
      <TopBar title="Distri Cosenza" sub={client.name} cartCount={cartCount} onCart={()=>setView('cart')} onLogout={onLogout}/>
      <div style={{padding:'12px'}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:'4px 0 12px'}}>Categorías</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {activeCats.map(cat=>{
            const count=products.filter(p=>p.cat===cat.id).length
            return (
              <div key={cat.id} onClick={()=>{ setSelCat(cat.id); setView('cat') }}
                style={{background:'#fff',borderRadius:14,border:'1px solid '+C.border,padding:'18px 14px',cursor:'pointer',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8}}>
                <span style={{fontSize:32}}>{cat.emoji}</span>
                <div>
                  <p style={{fontWeight:700,fontSize:15,color:C.text,margin:'0 0 2px'}}>{cat.label}</p>
                  <p style={{fontSize:12,color:C.muted,margin:0}}>{count} producto{count!==1?'s':''}</p>
                </div>
              </div>
            )
          })}
        </div>
        {activeCats.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'60px 0',fontSize:14}}>El catalogo esta vacio.</p>}
      </div>
    </div>
  )
}

export default function App() {
  const [session,setSession]=useState(()=>{ try{const s=sessionStorage.getItem('dc_session');return s?JSON.parse(s):null}catch{return null} })
  const logout=()=>{ sessionStorage.removeItem('dc_session'); setSession(null) }
  if(!session) return React.createElement(Login,{onLogin:setSession})
  if(session.role==='admin') return React.createElement(Admin,{onLogout:logout})
  return React.createElement(Store,{session,onLogout:logout})
}
