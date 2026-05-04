import React, { useState, useEffect } from 'react'
import { supabase } from './supabase.js'

const CATS = [
  { id:'trapos',      label:'Trapos',      emoji:'🧺' },
  { id:'rejillas',    label:'Rejillas',    emoji:'🔲' },
  { id:'microfibra',  label:'Microfibra',  emoji:'✨' },
  { id:'repasadores', label:'Repasadores', emoji:'🍽' },
]

const C = { bg:'#0d0d0d', card:'#181818', border:'#262626', gold:'#c9a96e', green:'#4caf82', red:'#e05c5c', muted:'#555', text:'#f0ede8' }
const inp = { width:'100%', background:'#222', border:'1px solid #333', borderRadius:10, padding:'13px 15px', color:C.text, fontSize:14, outline:'none', marginBottom:10, boxSizing:'border-box' }
const btnS = (v) => { v=v||'pri'; return { padding:v==='sm'?'7px 13px':'13px', borderRadius:v==='sm'?8:10, border:'none', cursor:'pointer', fontSize:v==='sm'?13:14, fontWeight:600, background:v==='pri'?C.gold:v==='red'?C.red:v==='green'?C.green:v==='ghost'?'transparent':'#252525', color:v==='pri'?'#0d0d0d':C.text, width:(v==='pri'||v==='sec')?'100%':undefined, border:v==='ghost'?'1px solid #333':'none' } }
const cardS = { background:C.card, border:'1px solid #262626', borderRadius:14, padding:14, marginBottom:8 }
const hdrS  = { background:'#111', borderBottom:'1px solid #262626', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }
const fmt = n => '$' + Number(n).toLocaleString('es-AR')

const Ico = (p) => React.createElement('svg',{width:p.s||18,height:p.s||18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:p.d}))
const IBack   = () => React.createElement(Ico,{d:'M19 12H5M12 19l-7-7 7-7'})
const ITrash  = () => React.createElement(Ico,{d:'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2'})
const ICart   = () => React.createElement(Ico,{d:'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0'})
const ICheck  = () => React.createElement(Ico,{d:'M20 6L9 17l-5-5'})
const ILogout = () => React.createElement(Ico,{d:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9'})
const IWsp    = () => React.createElement(Ico,{d:'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'})

function Spinner() {
  return React.createElement('div',{style:{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}},
    React.createElement('div',{style:{width:40,height:40,border:'3px solid #222',borderTop:'3px solid '+C.gold,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}),
    React.createElement('p',{style:{color:C.muted,fontSize:13}},'Cargando...'),
    React.createElement('style',null,'@keyframes spin{to{transform:rotate(360deg)}}')
  )
}

function InstallBanner() {
  const [prompt,setPrompt] = useState(null)
  const [show,setShow] = useState(false)
  const [ios,setIos] = useState(false)
  useEffect(()=>{
    const isIos=/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    if(isIos&&!window.navigator.standalone){setIos(true);setShow(true)}
    window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();setPrompt(e);setShow(true)})
  },[])
  if(!show) return null
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#1c1c1c',borderTop:'1px solid #333',padding:16,zIndex:999}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:ios?10:0}}>
        <div style={{flex:1}}>
          <p style={{fontWeight:700,fontSize:14,color:C.text,margin:'0 0 4px'}}>Instalar Distri Cosenza</p>
          {ios&&<p style={{fontSize:12,color:C.muted,margin:0,lineHeight:1.5}}>Toca <b style={{color:C.gold}}>Compartir</b> y luego <b style={{color:C.gold}}>"Agregar a inicio"</b></p>}
        </div>
        <button onClick={()=>setShow(false)} style={{background:'none',border:'none',color:C.muted,fontSize:22,cursor:'pointer',lineHeight:1,paddingLeft:12}}>×</button>
      </div>
      {!ios&&<button style={btnS()} onClick={async()=>{if(!prompt)return;prompt.prompt();await prompt.userChoice;setShow(false)}}>Agregar a pantalla de inicio</button>}
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [u,setU]=useState(''); const [p,setP]=useState(''); const [err,setErr]=useState(''); const [loading,setLoading]=useState(false)
  const go = async () => {
    const username=u.trim(); const password=p.trim()
    if(!username||!password){setErr('Completa los campos');return}
    setLoading(true); setErr('')
    try {
      if(username==='admin'&&password==='admin123'){
        const s={role:'admin'}; sessionStorage.setItem('dc_session',JSON.stringify(s)); onLogin(s); return
      }
      const {data,error}=await supabase.from('clients').select('*').eq('username',username).eq('password',password)
      if(error||!data||data.length===0){setErr('Usuario o contrasena incorrectos');setLoading(false);return}
      const s={role:'client',client:data[0]}; sessionStorage.setItem('dc_session',JSON.stringify(s)); onLogin(s)
    } catch(e){setErr('Error de conexion');setLoading(false)}
  }
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:C.bg,padding:24}}>
      <div style={{width:'100%',maxWidth:360,background:C.card,borderRadius:20,padding:'36px 28px',border:'1px solid #262626'}}>
        <p style={{fontSize:11,letterSpacing:5,textTransform:'uppercase',color:C.gold,marginBottom:4}}>Distribuidora</p>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:4,color:C.text,lineHeight:1.1}}>Distri</h1>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:28,color:C.gold,lineHeight:1.1}}>Cosenza</h1>
        {err&&<div style={{padding:'10px 14px',borderRadius:9,background:'rgba(224,92,92,0.13)',color:C.red,fontSize:13,marginBottom:10}}>{err}</div>}
        <input style={inp} placeholder="Usuario" value={u} onChange={e=>{setU(e.target.value);setErr('')}} onKeyDown={e=>e.key==='Enter'&&go()} autoCapitalize="none" autoCorrect="off" autoComplete="username"/>
        <input style={inp} placeholder="Contrasena" type="password" value={p} onChange={e=>{setP(e.target.value);setErr('')}} onKeyDown={e=>e.key==='Enter'&&go()} autoComplete="current-password"/>
        <button style={btnS()} onClick={go} disabled={loading}>{loading?'Ingresando...':'Ingresar'}</button>
      </div>
      <InstallBanner/>
    </div>
  )
}

// ── ADMIN ROOT ────────────────────────────────────────────────────────────────
function Admin({onLogout}) {
  const [tab,setTab]=useState('products')
  const [products,setProducts]=useState([])
  const [clients,setClients]=useState([])
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    Promise.all([
      supabase.from('products').select('*').order('cat'),
      supabase.from('clients').select('*').order('name'),
      supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(100),
    ]).then(([p,cl,o])=>{
      if(p.data) setProducts(p.data)
      if(cl.data) setClients(cl.data)
      if(o.data) setOrders(o.data)
      setLoading(false)
    })
  },[])

  if(loading) return React.createElement(Spinner,null)

  return (
    <div style={{minHeight:'100vh',background:C.bg}}>
      <div style={hdrS}>
        <div>
          <p style={{fontSize:11,letterSpacing:4,textTransform:'uppercase',color:C.gold,margin:0}}>Admin · Distri Cosenza</p>
        </div>
        <button onClick={onLogout} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}><ILogout/> Salir</button>
      </div>
      <div style={{display:'flex',background:'#111',borderBottom:'1px solid #262626',padding:'0 12px',overflowX:'auto'}}>
        {[['products','Productos'],['clients','Clientes'],['orders','Pedidos']].map(([k,l])=>
          <button key={k} onClick={()=>setTab(k)} style={{padding:'13px 14px',fontSize:12,fontWeight:600,cursor:'pointer',background:'none',border:'none',color:tab===k?C.gold:C.muted,borderBottom:tab===k?'2px solid '+C.gold:'2px solid transparent',whiteSpace:'nowrap'}}>{l}</button>
        )}
      </div>
      <div style={{padding:14}}>
        {tab==='products'&&<AdminProducts products={products} setProducts={setProducts}/>}
        {tab==='clients' &&<AdminClients  clients={clients} setClients={setClients} products={products}/>}
        {tab==='orders'  &&<AdminOrders   orders={orders} setOrders={setOrders} clients={clients} products={products}/>}
      </div>
    </div>
  )
}

// ── ADMIN: PRODUCTOS ──────────────────────────────────────────────────────────
function AdminProducts({products,setProducts}) {
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState('')

  const readImg=(e,slot)=>{
    const file=e.target.files[0]; if(!file) return
    const r=new FileReader(); r.onload=ev=>setForm(f=>({...f,[slot]:ev.target.result})); r.readAsDataURL(file)
  }

  const openNew=()=>{ setForm({name:'',description:'',unit:'docena',qty_per_unit:12,cat:'trapos',photo:null,photo2:null}); setMsg(''); setEditing('new') }
  const openEdit=p=>{ setForm({...p}); setMsg(''); setEditing(p.id) }

  const save=async()=>{
    if(!form.name?.trim()){setMsg('El nombre es obligatorio');return}
    setSaving(true); setMsg('')
    const entry={name:form.name.trim(),description:form.description||'',unit:form.unit||'docena',qty_per_unit:Number(form.qty_per_unit)||12,cat:form.cat||'trapos',photo:form.photo||null,photo2:form.photo2||null,active:true}
    try {
      if(editing==='new'){
        const {data,error}=await supabase.from('products').insert([entry]).select()
        if(error){setMsg('Error: '+error.message);return}
        if(data&&data[0]) setProducts(prev=>[...prev,data[0]])
      } else {
        const {data,error}=await supabase.from('products').update(entry).eq('id',editing).select()
        if(error){setMsg('Error: '+error.message);return}
        if(data&&data[0]) setProducts(prev=>prev.map(p=>p.id===editing?data[0]:p))
      }
      setMsg('Guardado!'); setTimeout(()=>setEditing(null),600)
    } finally {setSaving(false)}
  }

  const del=async id=>{
    if(!window.confirm('Eliminar producto?')) return
    await supabase.from('products').delete().eq('id',id)
    setProducts(prev=>prev.filter(p=>p.id!==id))
  }

  if(editing!==null) return (
    <div style={{paddingBottom:40}}>
      <button onClick={()=>setEditing(null)} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>{editing==='new'?'Nuevo producto':'Editar producto'}</p>

      {/* Fotos */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {[['photo','Foto principal','pi1'],['photo2','Foto detalle','pi2']].map(([slot,label,id])=>(
          <div key={slot}>
            <p style={{fontSize:11,color:C.muted,marginBottom:4}}>{label}</p>
            <div style={{height:100,background:'#1a1a1a',borderRadius:10,border:'1px dashed #333',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden'}} onClick={()=>document.getElementById(id)?.click()}>
              {form[slot]?<img src={form[slot]} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}/>:
                <div style={{textAlign:'center',color:C.muted,fontSize:11}}><div style={{fontSize:24}}>📷</div><p style={{margin:'4px 0 0'}}>Subir</p></div>}
              <input id={id} type="file" accept="image/*" style={{display:'none'}} onChange={e=>readImg(e,slot)}/>
            </div>
          </div>
        ))}
      </div>

      <input style={inp} placeholder="Nombre *" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <textarea style={{...inp,minHeight:60,resize:'vertical'}} placeholder="Descripcion" value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>

      <p style={{fontSize:11,color:C.muted,marginBottom:4}}>Categoria</p>
      <select style={inp} value={form.cat||'trapos'} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>
        {CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
      </select>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div>
          <p style={{fontSize:11,color:C.muted,marginBottom:4}}>Unidad de venta</p>
          <input style={{...inp,marginBottom:0}} placeholder="docena" value={form.unit||'docena'} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/>
        </div>
        <div>
          <p style={{fontSize:11,color:C.muted,marginBottom:4}}>Unidades por pack</p>
          <input style={{...inp,marginBottom:0}} type="number" min="1" value={form.qty_per_unit||12} onChange={e=>setForm(f=>({...f,qty_per_unit:Number(e.target.value)}))}/>
        </div>
      </div>

      {msg&&<div style={{padding:'10px 14px',borderRadius:9,marginTop:12,background:msg.startsWith('Error')?'rgba(224,92,92,0.13)':'rgba(76,175,130,0.13)',color:msg.startsWith('Error')?C.red:C.green,fontSize:13}}>{msg}</div>}
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <button style={{...btnS('ghost'),flex:1}} onClick={()=>setEditing(null)}>Cancelar</button>
        <button style={{...btnS(),flex:1}} onClick={save} disabled={saving}>{saving?'Guardando...':'Guardar'}</button>
      </div>
    </div>
  )

  const grouped=CATS.map(cat=>({cat,items:products.filter(p=>p.cat===cat.id)})).filter(g=>g.items.length>0)
  const sinCat=products.filter(p=>!CATS.find(c=>c.id===p.cat))
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:0}}>{products.length} productos</p>
        <button style={btnS('sm')} onClick={openNew}>+ Nuevo</button>
      </div>
      {grouped.map(({cat,items})=>(
        <div key={cat.id} style={{marginBottom:16}}>
          <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:'0 0 8px'}}>{cat.emoji} {cat.label}</p>
          {items.map(p=>(
            <div key={p.id} style={{...cardS,display:'flex',gap:12,alignItems:'center',padding:12}}>
              <div style={{width:48,height:48,borderRadius:10,background:'#222',overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {p.photo?<img src={p.photo} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<span style={{fontSize:20}}>{cat.emoji}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:600,fontSize:13,color:C.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</p>
                <p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{p.unit} · {p.qty_per_unit} u/pack</p>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button style={btnS('sm')} onClick={()=>openEdit(p)}>Editar</button>
                <button style={{...btnS('sm'),background:'rgba(224,92,92,0.1)',color:C.red}} onClick={()=>del(p.id)}><ITrash/></button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {sinCat.length>0&&<div><p style={{color:C.red,fontSize:11,marginBottom:8}}>Sin categoria</p>{sinCat.map(p=><div key={p.id} style={{...cardS,display:'flex',justifyContent:'space-between',alignItems:'center'}}><p style={{color:C.text,margin:0,fontSize:13}}>{p.name}</p><button style={btnS('sm')} onClick={()=>openEdit(p)}>Editar</button></div>)}</div>}
      {products.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin productos aun. Agrega el primero.</p>}
    </div>
  )
}

// ── ADMIN: CLIENTES ───────────────────────────────────────────────────────────
function AdminClients({clients,setClients,products}) {
  const [view,setView]=useState('list')
  const [editId,setEditId]=useState(null)
  const [form,setForm]=useState({})
  const [prices,setPrices]=useState({})
  const [saving,setSaving]=useState(false)
  const [msg,setMsg]=useState('')
  const [wspSent,setWspSent]=useState(false)

  const blankPrices=()=>{ const p={}; products.forEach(pr=>{p[pr.id]={price:'',min_qty:1,bulk_discount:0}}); return p }

  const openNew=()=>{ setForm({name:'',username:'',password:'1234',phone:'',address:''}); setPrices(blankPrices()); setWspSent(false); setMsg(''); setEditId(null); setView('edit') }
  const openEdit=c=>{ setForm({name:c.name,username:c.username,password:c.password,phone:c.phone||'',address:c.address||''}); const p=blankPrices(); if(c.prices) Object.entries(c.prices).forEach(([k,v])=>{p[k]={...p[k],...v}}); setPrices(p); setWspSent(false); setMsg(''); setEditId(c.id); setView('edit') }

  const save=async()=>{
    if(!form.name.trim()||!form.username.trim()){setMsg('Nombre y usuario son obligatorios');return}
    setSaving(true); setMsg('')
    const entry={name:form.name.trim(),username:form.username.trim().toLowerCase(),password:form.password.trim(),phone:form.phone.replace(/[^0-9]/g,''),address:form.address.trim(),prices}
    try {
      if(!editId){
        const {data,error}=await supabase.from('clients').insert([entry]).select()
        if(error){setMsg('Error: '+error.message);return}
        if(data&&data[0]) setClients(prev=>[...prev,data[0]])
      } else {
        const {data,error}=await supabase.from('clients').update(entry).eq('id',editId).select()
        if(error){setMsg('Error: '+error.message);return}
        if(data&&data[0]) setClients(prev=>prev.map(c=>c.id===editId?data[0]:c))
      }
      setMsg('Guardado!'); setTimeout(()=>setView('list'),600)
    } finally {setSaving(false)}
  }

  const del=async id=>{ if(!window.confirm('Eliminar cliente?')) return; await supabase.from('clients').delete().eq('id',id); setClients(prev=>prev.filter(c=>c.id!==id)) }

  const sendWsp=()=>{
    if(!form.phone) return
    const msg='Hola '+form.name+'! Te mando tu acceso al catalogo de Distri Cosenza\n\nLink: '+window.location.origin+'\nUsuario: '+form.username+'\nClave: '+form.password+'\n\nAndroid: abri en Chrome y toca "Agregar a pantalla de inicio"\niPhone: abri en Safari, toca Compartir y "Agregar a inicio"'
    window.open('https://wa.me/'+form.phone.replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(msg),'_blank')
    setWspSent(true)
  }

  if(view==='edit') {
    // Group products by category for price assignment
    const grouped=CATS.map(cat=>({cat,items:products.filter(p=>p.cat===cat.id)})).filter(g=>g.items.length>0)
    return (
      <div style={{paddingBottom:40}}>
        <button onClick={()=>setView('list')} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>{!editId?'Nuevo cliente':'Editar cliente'}</p>

        <input style={inp} placeholder="Nombre del local *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
        <input style={inp} placeholder="Direccion" value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
        <input style={inp} placeholder="Usuario *" value={form.username} autoCapitalize="none" autoCorrect="off" onChange={e=>setForm(f=>({...f,username:e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'')}))}/>
        <input style={inp} placeholder="Contrasena" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
        <input style={inp} placeholder="WhatsApp (5491165001234)" type="tel" value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>

        {form.phone&&(
          <button onClick={sendWsp} style={{...btnS('green'),marginBottom:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <IWsp/> {wspSent?'Acceso enviado!':'Enviar acceso por WhatsApp'}
          </button>
        )}

        {/* Precios — todos los productos agrupados por categoria */}
        {grouped.length>0&&(
          <div>
            <div style={{height:1,background:'#222',margin:'4px 0 14px'}}/>
            <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:12}}>Precios por producto</p>
            <p style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>Deja en blanco si todavia no tenes precio para ese producto. El cliente lo vera pero tendra que consultar.</p>
            {grouped.map(({cat,items})=>(
              <div key={cat.id} style={{marginBottom:16}}>
                <p style={{fontSize:11,color:C.muted,letterSpacing:2,textTransform:'uppercase',margin:'0 0 8px'}}>{cat.emoji} {cat.label}</p>
                {items.map(pr=>(
                  <div key={pr.id} style={{...cardS,marginBottom:6}}>
                    <p style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:8}}>{pr.name}</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                      {[['Precio $','price'],['Min. doc.','min_qty'],['% desc. bulto','bulk_discount']].map(([lbl,field])=>(
                        <div key={field}>
                          <p style={{fontSize:10,color:C.muted,marginBottom:3}}>{lbl}</p>
                          <input style={{...inp,marginBottom:0,padding:'9px 10px',fontSize:13}} type="number" min="0"
                            value={prices[pr.id]?.[field]??''}
                            onChange={e=>{ const val=e.target.value; setPrices(p=>({...p,[pr.id]:{...p[pr.id],[field]:val}})) }}/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {msg&&<div style={{padding:'10px 14px',borderRadius:9,background:msg.startsWith('Error')?'rgba(224,92,92,0.13)':'rgba(76,175,130,0.13)',color:msg.startsWith('Error')?C.red:C.green,fontSize:13,marginBottom:10}}>{msg}</div>}
        <div style={{display:'flex',gap:8,marginTop:4}}>
          <button style={{...btnS('ghost'),flex:1}} onClick={()=>setView('list')}>Cancelar</button>
          <button style={{...btnS(),flex:1}} onClick={save} disabled={saving}>{saving?'Guardando...':'Guardar'}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:0}}>{clients.length} clientes</p>
        <button style={btnS('sm')} onClick={openNew}>+ Nuevo</button>
      </div>
      {clients.map(c=>(
        <div key={c.id} style={cardS}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:2}}>{c.name}</p>
              <p style={{fontSize:12,color:C.muted,margin:0}}>@{c.username} · {c.address||'sin direccion'}</p>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0,marginLeft:8}}>
              <button style={btnS('sm')} onClick={()=>openEdit(c)}>Editar</button>
              <button style={{...btnS('sm'),background:'rgba(224,92,92,0.1)',color:C.red}} onClick={()=>del(c.id)}><ITrash/></button>
            </div>
          </div>
        </div>
      ))}
      {clients.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin clientes aun.</p>}
    </div>
  )
}

// ── ADMIN: PEDIDOS ────────────────────────────────────────────────────────────
function AdminOrders({orders,setOrders,clients,products}) {
  const [sel,setSel]=useState(null)
  const getC=id=>clients.find(c=>c.id===id)||{name:'?'}
  const getP=id=>products.find(p=>p.id===id)||{name:'?',unit:''}

  // Consultas pendientes (pedidos con status 'inquiry')
  const inquiries=orders.filter(o=>o.status==='inquiry')
  const regular=orders.filter(o=>o.status!=='inquiry')

  const resolveInquiry=async(o)=>{
    await supabase.from('orders').update({status:'resolved'}).eq('id',o.id)
    setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:'resolved'}:x))
  }

  if(sel){
    const o=orders.find(x=>x.id===sel)
    const items=o.items||[]
    const total=items.reduce((s,i)=>s+(i.price||0)*i.qty,0)
    return (
      <div>
        <button onClick={()=>setSel(null)} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
        <div style={cardS}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <p style={{fontSize:11,color:C.muted,letterSpacing:3,margin:0}}>{o.status==='inquiry'?'CONSULTA':'PEDIDO'}</p>
            {o.status==='inquiry'&&<button style={btnS('sm')} onClick={()=>resolveInquiry(o)}>Marcar resuelta</button>}
          </div>
          <p style={{fontWeight:700,fontSize:17,color:C.text,marginBottom:2}}>{getC(o.client_id).name}</p>
          <p style={{fontSize:12,color:C.muted,marginBottom:14}}>{new Date(o.created_at).toLocaleString('es-AR')}</p>
          {items.map((item,i)=>{
            const pr=getP(item.product_id)
            return (
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #262626'}}>
                <div>
                  <p style={{fontWeight:600,fontSize:13,color:C.text,margin:0}}>{pr.name}</p>
                  <p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>
                    {item.qty} {pr.unit} {item.price?'x '+fmt(item.price):'· SIN PRECIO (consulta)'}
                  </p>
                </div>
                {item.price?<p style={{fontWeight:700,color:C.gold,margin:0}}>{fmt(item.price*item.qty)}</p>:
                  <span style={{fontSize:11,color:C.gold,fontWeight:700}}>Consulta</span>}
              </div>
            )
          })}
          {total>0&&<div style={{display:'flex',justifyContent:'space-between',marginTop:14}}><p style={{fontWeight:700,fontSize:15,color:C.text,margin:0}}>Total</p><p style={{fontWeight:700,fontSize:20,color:C.gold,margin:0}}>{fmt(total)}</p></div>}
        </div>
      </div>
    )
  }

  return (
    <div>
      {inquiries.length>0&&(
        <div style={{marginBottom:20}}>
          <p style={{fontSize:11,color:C.gold,letterSpacing:3,textTransform:'uppercase',marginBottom:8}}>Consultas pendientes ({inquiries.length})</p>
          {inquiries.map(o=>(
            <div key={o.id} style={{...cardS,cursor:'pointer',border:'1px solid '+C.gold+'44'}} onClick={()=>setSel(o.id)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <p style={{fontWeight:700,fontSize:14,color:C.text,margin:0}}>{getC(o.client_id).name}</p>
                  <p style={{fontSize:11,color:C.muted,margin:'3px 0 0'}}>{new Date(o.created_at).toLocaleString('es-AR')} · consulta de precio</p>
                </div>
                <span style={{fontSize:11,color:C.gold,fontWeight:700}}>Ver</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:8}}>Pedidos ({regular.length})</p>
      {regular.length===0&&inquiries.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin pedidos aun.</p>}
      {regular.map(o=>{
        const total=(o.items||[]).reduce((s,i)=>s+(i.price||0)*i.qty,0)
        return (
          <div key={o.id} style={{...cardS,cursor:'pointer'}} onClick={()=>setSel(o.id)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{fontWeight:700,fontSize:14,color:C.text,margin:0}}>{getC(o.client_id).name}</p>
                <p style={{fontSize:11,color:C.muted,margin:'3px 0 0'}}>{new Date(o.created_at).toLocaleString('es-AR')}</p>
              </div>
              <p style={{fontWeight:700,fontSize:16,color:C.gold,margin:0}}>{fmt(total)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── CLIENT STORE ──────────────────────────────────────────────────────────────
function Store({session,onLogout}) {
  const client=session.client
  const [products,setProducts]=useState([])
  const [cart,setCart]=useState({}) // { pid: qty }
  const [inquiries,setInquiries]=useState({}) // pids sin precio que el cliente marca
  const [view,setView]=useState('cat')
  const [selCat,setSelCat]=useState('all')
  const [loading,setLoading]=useState(true)
  const [submitting,setSubmitting]=useState(false)

  useEffect(()=>{
    supabase.from('products').select('*').eq('active',true).order('cat')
      .then(({data})=>{ if(data) setProducts(data); setLoading(false) })
  },[])

  const prices=client.prices||{}

  const addToCart=(pid,delta)=>{
    const pdata=prices[pid]
    if(!pdata?.price) return // sin precio no agrega al carrito
    const min=Number(pdata.min_qty)||1
    setCart(c=>{
      const cur=c[pid]||0; let next=cur+delta
      if(next<0) next=0
      if(next>0&&next<min) next=delta>0?min:0
      return {...c,[pid]:next}
    })
  }

  const toggleInquiry=pid=>{
    setInquiries(q=>({...q,[pid]:!q[pid]}))
  }

  const cartItems=Object.entries(cart).filter(([,q])=>q>0).map(([pid,qty])=>({product_id:Number(pid),qty,price:Number(prices[pid].price)}))
  const inquiryItems=Object.entries(inquiries).filter(([,v])=>v).map(([pid])=>({product_id:Number(pid),qty:1,price:null}))
  const cartTotal=cartItems.reduce((s,i)=>s+i.price*i.qty,0)
  const cartCount=cartItems.length
  const inquiryCount=inquiryItems.length

  const confirm=async(isInquiry)=>{
    setSubmitting(true)
    const items=isInquiry?inquiryItems:cartItems
    const status=isInquiry?'inquiry':'pending'
    await supabase.from('orders').insert([{client_id:client.id,items,total:isInquiry?0:cartTotal,status}])
    if(isInquiry){setInquiries({})}else{setCart({})}
    setSubmitting(false); setView('ok')
  }

  const myCats=CATS.filter(cat=>products.some(p=>p.cat===cat.id))
  const allProds=selCat==='all'?products:products.filter(p=>p.cat===selCat)

  if(loading) return React.createElement(Spinner,null)

  if(view==='ok') return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,textAlign:'center'}}>
      <div style={{width:70,height:70,borderRadius:'50%',border:'2px solid '+C.green,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,color:C.green}}><ICheck/></div>
      <h2 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:8}}>Enviado!</h2>
      <p style={{color:C.muted,marginBottom:28,fontSize:15}}>Te contactamos a la brevedad.</p>
      <button style={{...btnS(),maxWidth:280}} onClick={()=>setView('cat')}>Volver al catalogo</button>
    </div>
  )

  if(view==='cart') return (
    <div style={{minHeight:'100vh',background:C.bg}}>
      <div style={hdrS}>
        <button onClick={()=>setView('cat')} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:14}}><IBack/> Volver</button>
        <p style={{fontSize:13,letterSpacing:3,textTransform:'uppercase',color:C.gold,margin:0,fontWeight:700}}>Mi pedido</p>
        <span/>
      </div>
      <div style={{padding:16}}>
        {cartItems.map((item,i)=>{
          const pr=products.find(p=>p.id===item.product_id)
          return <div key={i} style={{...cardS,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{fontWeight:700,fontSize:15,color:C.text,margin:0}}>{pr?.name}</p><p style={{fontSize:13,color:C.muted,margin:'3px 0 0'}}>{item.qty} {pr?.unit} x {fmt(item.price)}</p></div><p style={{fontWeight:800,color:C.gold,margin:0,fontSize:17}}>{fmt(item.price*item.qty)}</p></div>
        })}
        <div style={{...cardS,background:'#111',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 14px'}}>
          <p style={{fontWeight:700,fontSize:16,color:C.text,margin:0}}>Total</p>
          <p style={{fontWeight:800,fontSize:24,color:C.gold,margin:0}}>{fmt(cartTotal)}</p>
        </div>
        <div style={{height:8}}/>
        <button style={btnS()} onClick={()=>confirm(false)} disabled={submitting}>{submitting?'Enviando...':'Confirmar pedido'}</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:C.bg,paddingBottom:100}}>
      <div style={hdrS}>
        <div>
          <p style={{fontSize:12,letterSpacing:3,textTransform:'uppercase',color:C.gold,margin:0,fontWeight:700}}>Distri Cosenza</p>
          <p style={{fontSize:12,color:C.muted,margin:'2px 0 0'}}>{client.name}</p>
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <div style={{position:'relative',cursor:'pointer',color:C.muted}} onClick={()=>cartCount>0&&setView('cart')}>
            <ICart/>
            {cartCount>0&&<span style={{position:'absolute',top:-5,right:-5,background:C.gold,color:'#0d0d0d',borderRadius:'50%',width:17,height:17,fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{cartCount}</span>}
          </div>
          <button onClick={onLogout} style={{background:'none',border:'none',color:C.muted,cursor:'pointer'}}><ILogout/></button>
        </div>
      </div>

      {/* Filtro categorias */}
      {myCats.length>1&&(
        <div style={{display:'flex',gap:6,overflowX:'auto',padding:'10px 12px 8px',borderBottom:'1px solid #262626',background:'#111'}}>
          <button onClick={()=>setSelCat('all')} style={{padding:'8px 14px',borderRadius:20,border:'none',background:selCat==='all'?C.gold:'#222',color:selCat==='all'?'#0d0d0d':C.muted,cursor:'pointer',fontSize:13,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>Todo</button>
          {myCats.map(cat=><button key={cat.id} onClick={()=>setSelCat(cat.id)} style={{padding:'8px 14px',borderRadius:20,border:'none',background:selCat===cat.id?C.gold:'#222',color:selCat===cat.id?'#0d0d0d':C.muted,cursor:'pointer',fontSize:13,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{cat.emoji} {cat.label}</button>)}
        </div>
      )}

      <div style={{padding:'10px 12px'}}>
        {allProds.map(pr=>{
          const pdata=prices[pr.id]
          const hasPrice=pdata&&pdata.price
          const qpu=Number(pr.qty_per_unit)||12
          const price=hasPrice?Number(pdata.price):0
          const priceUnit=hasPrice?Math.round(price/qpu):0
          const bulkDiscount=hasPrice?Number(pdata.bulk_discount)||0:0
          const bulkPrice=bulkDiscount>0?Math.round(price*(1-bulkDiscount/100)):0
          const qty=cart[pr.id]||0
          const isInquiry=inquiries[pr.id]||false
          const catInfo=CATS.find(c=>c.id===pr.cat)||{emoji:'📦'}

          return (
            <div key={pr.id} style={{background:C.card,border:'1px solid '+(isInquiry?C.gold+'66':'#262626'),borderRadius:14,marginBottom:8,overflow:'hidden'}}>
              {pr.photo&&<img src={pr.photo} alt={pr.name} style={{width:'100%',height:160,objectFit:'contain',display:'block',background:'#111'}}/>}
              <div style={{padding:12}}>
                <p style={{fontWeight:700,fontSize:16,color:C.text,margin:'0 0 6px',lineHeight:1.2}}>{catInfo.emoji} {pr.name}</p>

                {hasPrice?(
                  <>
                    {/* Precios */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                      <div style={{background:'#222',borderRadius:10,padding:'10px 12px'}}>
                        <p style={{fontSize:10,color:C.muted,margin:'0 0 2px'}}>Por {pr.unit}</p>
                        <p style={{fontSize:20,fontWeight:800,color:C.gold,margin:0,lineHeight:1}}>{fmt(price)}</p>
                      </div>
                      <div style={{background:'#222',borderRadius:10,padding:'10px 12px'}}>
                        <p style={{fontSize:10,color:C.muted,margin:'0 0 2px'}}>Por unidad</p>
                        <p style={{fontSize:20,fontWeight:800,color:C.text,margin:0,lineHeight:1}}>{fmt(priceUnit)}</p>
                      </div>
                    </div>

                    {/* Minimo */}
                    <div style={{background:'rgba(201,169,110,0.08)',border:'1px solid rgba(201,169,110,0.2)',borderRadius:8,padding:'6px 12px',marginBottom:bulkPrice?8:10,display:'flex',alignItems:'center',gap:6}}>
                      <span>📦</span>
                      <span style={{fontSize:13,fontWeight:700,color:C.gold}}>Min: {Number(pdata.min_qty)||1} {pr.unit} = {(Number(pdata.min_qty)||1)*qpu} u</span>
                    </div>

                    {/* Descuento bulto */}
                    {bulkPrice>0&&(
                      <div style={{background:'#0d1f15',border:'1px solid rgba(76,175,130,0.2)',borderRadius:8,padding:'6px 12px',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <p style={{fontSize:10,color:C.muted,margin:'0 0 2px'}}>Bulto (10 doc.)</p>
                          <p style={{fontSize:14,fontWeight:700,color:C.green,margin:0}}>{fmt(bulkPrice)}/doc</p>
                        </div>
                        <span style={{fontSize:11,color:C.green,fontWeight:700,background:'rgba(76,175,130,0.1)',padding:'2px 8px',borderRadius:20}}>{bulkDiscount}% off</span>
                      </div>
                    )}

                    {pr.description&&<p style={{fontSize:12,color:'#666',margin:'0 0 10px',lineHeight:1.5}}>{pr.description}</p>}

                    {/* Selector cantidad */}
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',background:'#222',borderRadius:10,overflow:'hidden',border:'1px solid #333'}}>
                        <button style={{width:42,height:42,background:'none',border:'none',color:C.text,cursor:'pointer',fontSize:22,lineHeight:1}} onClick={()=>addToCart(pr.id,-1)}>-</button>
                        <span style={{fontWeight:800,fontSize:17,minWidth:34,textAlign:'center',color:C.text}}>{qty}</span>
                        <button style={{width:42,height:42,background:'none',border:'none',color:C.text,cursor:'pointer',fontSize:22,lineHeight:1}} onClick={()=>addToCart(pr.id,1)}>+</button>
                      </div>
                      {qty>0&&<div style={{textAlign:'right'}}><p style={{fontWeight:800,color:C.green,fontSize:17,margin:0}}>{fmt(price*qty)}</p><p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{qty*qpu} unidades</p></div>}
                    </div>
                  </>
                ):(
                  /* Sin precio — mostrar boton consultar */
                  <div>
                    {pr.description&&<p style={{fontSize:12,color:'#666',margin:'0 0 10px',lineHeight:1.5}}>{pr.description}</p>}
                    <div style={{background:'#111',borderRadius:10,padding:'10px 14px',marginBottom:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <p style={{fontSize:13,color:C.muted,margin:0}}>Precio a consultar</p>
                    </div>
                    <button onClick={()=>toggleInquiry(pr.id)} style={{...btnS(isInquiry?'green':'ghost'),fontSize:13}}>
                      {isInquiry?'✓ Consulta marcada':'Consultar precio'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {allProds.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin productos disponibles.</p>}
      </div>

      {/* Footer fijo */}
      {(cartCount>0||inquiryCount>0)&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'12px 16px',background:'#111',borderTop:'1px solid #262626',display:'flex',flexDirection:'column',gap:8}}>
          {cartCount>0&&<button style={btnS()} onClick={()=>setView('cart')}>Ver pedido · {fmt(cartTotal)}</button>}
          {inquiryCount>0&&<button style={{...btnS('ghost'),fontSize:13}} onClick={()=>confirm(true)} disabled={submitting}>Enviar consulta de {inquiryCount} producto{inquiryCount>1?'s':''}</button>}
        </div>
      )}
      <InstallBanner/>
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
