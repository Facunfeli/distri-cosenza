import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

// ── CATEGORIAS DEFAULT ────────────────────────────────────────────────────────
const DEFAULT_CATS = [
  { id:'trapos',      label:'Trapos',      emoji:'🧺' },
  { id:'rejillas',    label:'Rejillas',    emoji:'🔲' },
  { id:'repasadores', label:'Repasadores', emoji:'🍽' },
  { id:'microfibra',  label:'Microfibra',  emoji:'✨' },
  { id:'esponjas',    label:'Esponjas',    emoji:'🟩' },
  { id:'escobas',     label:'Escobas',     emoji:'🧹' },
  { id:'plumeros',    label:'Plumeros',    emoji:'🪶' },
  { id:'detergentes', label:'Detergentes', emoji:'🧴' },
]

// ── DESIGN ────────────────────────────────────────────────────────────────────
const C = {
  bg:'#0d0d0d', card:'#181818', border:'#262626',
  gold:'#c9a96e', green:'#4caf82', red:'#e05c5c', muted:'#555', text:'#f0ede8'
}
const S = {
  inp: { width:'100%', background:'#222', border:'1px solid #333', borderRadius:10, padding:'13px 15px', color:C.text, fontSize:14, outline:'none', marginBottom:10, boxSizing:'border-box' },
  btn: (v) => { v=v||'pri'; return { padding:v==='sm'?'7px 13px':'13px', borderRadius:v==='sm'?8:10, border:'none', cursor:'pointer', fontSize:v==='sm'?13:14, fontWeight:600, background:v==='pri'?C.gold:v==='red'?C.red:v==='green'?C.green:'#252525', color:v==='pri'?'#0d0d0d':C.text, width:(v==='pri'||v==='sec')?'100%':undefined } },
  card: { background:C.card, border:'1px solid #262626', borderRadius:14, padding:14, marginBottom:8 },
  hdr:  { background:'#111', borderBottom:'1px solid #262626', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 },
}
const fmt = n => '$' + Number(n).toLocaleString('es-AR')

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Ico = (p) => React.createElement('svg',{width:p.s||18,height:p.s||18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:p.d}))
const IBack   = () => React.createElement(Ico,{d:'M19 12H5M12 19l-7-7 7-7'})
const ITrash  = () => React.createElement(Ico,{d:'M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2'})
const ICart   = () => React.createElement(Ico,{d:'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0'})
const ICheck  = () => React.createElement(Ico,{d:'M20 6L9 17l-5-5'})
const ILogout = () => React.createElement(Ico,{d:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9'})
const IWsp    = () => React.createElement(Ico,{d:'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z'})
const IUser   = () => React.createElement(Ico,{d:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z'})

// ── LOADING ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <div style={{width:40,height:40,border:'3px solid #222',borderTop:'3px solid '+C.gold,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <p style={{color:C.muted,fontSize:13}}>Cargando Distri Cosenza...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [u,setU] = useState('')
  const [p,setP] = useState('')
  const [err,setErr] = useState('')
  const [loading,setLoading] = useState(false)

  const go = async () => {
    setLoading(true); setErr('')
    try {
      if (u === 'admin' && p === 'admin123') { onLogin({role:'admin'}); return }
      const {data,error} = await supabase
        .from('clients')
        .select('*')
        .eq('username', u.trim())
        .eq('password', p.trim())
        .single()
      if (error || !data) { setErr('Usuario o contraseña incorrectos'); return }
      onLogin({role:'client', client:data})
    } catch(e) { setErr('Error de conexión') }
    finally { setLoading(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:C.bg,padding:24}}>
      <div style={{width:'100%',maxWidth:360,background:C.card,borderRadius:20,padding:'36px 28px',border:'1px solid #262626'}}>
        <p style={{fontSize:11,letterSpacing:5,textTransform:'uppercase',color:C.gold,marginBottom:4}}>Distribuidora</p>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:4,color:C.text,lineHeight:1.1}}>Distri</h1>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:28,color:C.gold,lineHeight:1.1}}>Cosenza</h1>
        {err && <div style={{padding:'10px 14px',borderRadius:9,background:'rgba(224,92,92,0.13)',color:C.red,fontSize:13,marginBottom:10}}>{err}</div>}
        <input style={S.inp} placeholder="Usuario" value={u} onChange={e=>{setU(e.target.value);setErr('')}} onKeyDown={e=>e.key==='Enter'&&go()}/>
        <input style={S.inp} placeholder="Contraseña" type="password" value={p} onChange={e=>{setP(e.target.value);setErr('')}} onKeyDown={e=>e.key==='Enter'&&go()}/>
        <button style={S.btn()} onClick={go} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

// ── ADMIN ROOT ────────────────────────────────────────────────────────────────
function Admin({onLogout}) {
  const [tab,setTab] = useState('clients')
  const [products,setProducts] = useState([])
  const [cats,setCats] = useState(DEFAULT_CATS)
  const [clients,setClients] = useState([])
  const [orders,setOrders] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [p,cl,o] = await Promise.all([
        supabase.from('products').select('*').order('cat'),
        supabase.from('clients').select('*').order('name'),
        supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(50),
      ])
      if (p.data) setProducts(p.data)
      if (cl.data) setClients(cl.data)
      if (o.data) setOrders(o.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Spinner/>

  return (
    <div style={{minHeight:'100vh',background:C.bg}}>
      <div style={S.hdr}>
        <div>
          <p style={{fontSize:11,letterSpacing:4,textTransform:'uppercase',color:C.gold,margin:0}}>Panel Admin</p>
          <p style={{fontSize:11,color:C.muted,margin:'1px 0 0'}}>Distri Cosenza</p>
        </div>
        <button onClick={onLogout} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}><ILogout/> Salir</button>
      </div>
      <div style={{display:'flex',background:'#111',borderBottom:'1px solid #262626',padding:'0 12px',overflowX:'auto'}}>
        {[['clients','Clientes'],['products','Productos'],['cats','Categorías'],['orders','Pedidos']].map(([k,l]) =>
          <button key={k} onClick={()=>setTab(k)} style={{padding:'13px 14px',fontSize:12,fontWeight:600,cursor:'pointer',background:'none',border:'none',color:tab===k?C.gold:C.muted,borderBottom:tab===k?'2px solid '+C.gold:'2px solid transparent',whiteSpace:'nowrap'}}>{l}</button>
        )}
      </div>
      <div style={{padding:14}}>
        {tab==='clients'  && <AdminClients  clients={clients} setClients={setClients} products={products} cats={cats}/>}
        {tab==='products' && <AdminProducts products={products} setProducts={setProducts} cats={cats}/>}
        {tab==='cats'     && <AdminCats     cats={cats} setCats={setCats} products={products}/>}
        {tab==='orders'   && <AdminOrders   orders={orders} clients={clients} products={products}/>}
      </div>
    </div>
  )
}

// ── ADMIN: CLIENTES ───────────────────────────────────────────────────────────
function AdminClients({clients, setClients, products, cats}) {
  const [view, setView] = useState('list') // list | new | edit
  const [form, setForm] = useState({})
  const [prices, setPrices] = useState({})
  const [selCat, setSelCat] = useState(null)
  const [saving, setSaving] = useState(false)
  const [wspSent, setWspSent] = useState(false)

  const blankPrices = () => { const p={}; products.forEach(pr=>{p[pr.id]={price:'',min_qty:1,bulk_discount:10}}); return p }

  const openNew = () => {
    setForm({name:'',username:'',password:'1234',phone:'',address:'',type:'Almacén'})
    setPrices(blankPrices())
    setSelCat(cats[0]?.id||null)
    setWspSent(false)
    setView('new')
  }

  const openEdit = (c) => {
    setForm({name:c.name,username:c.username,password:c.password,phone:c.phone||'',address:c.address||'',type:c.type||'Almacén'})
    const p = blankPrices()
    if (c.prices) Object.entries(c.prices).forEach(([k,v])=>{p[k]={...p[k],...v}})
    setPrices(p)
    setSelCat(cats[0]?.id||null)
    setWspSent(false)
    setView({id:c.id})
  }

  const save = async () => {
    if (!form.name.trim() || !form.username.trim()) return
    setSaving(true)
    const entry = { ...form, prices }
    try {
      if (view === 'new') {
        const {data,error} = await supabase.from('clients').insert([entry]).select().single()
        if (!error && data) { setClients(prev=>[...prev,data]) }
      } else {
        const {data,error} = await supabase.from('clients').update(entry).eq('id',view.id).select().single()
        if (!error && data) { setClients(prev=>prev.map(c=>c.id===view.id?data:c)) }
      }
    } finally { setSaving(false) }
    setView('list')
  }

  const del = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return
    await supabase.from('clients').delete().eq('id',id)
    setClients(prev=>prev.filter(c=>c.id!==id))
  }

  const sendWhatsApp = () => {
    if (!form.phone) return
    const appUrl = window.location.origin
    const msg = `Hola ${form.name}! Te mando el acceso al catálogo de Distri Cosenza 📦\n\n🔗 ${appUrl}\n👤 Usuario: ${form.username}\n🔑 Clave: ${form.password}\n\nEntrá desde Chrome y tocá "Agregar a pantalla de inicio" para tenerlo como app 📲`
    const phone = form.phone.replace(/\D/g,'')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    setWspSent(true)
  }

  if (view !== 'list') {
    const isNew = view === 'new'
    const catProds = products.filter(p=>p.cat===selCat)
    return (
      <div>
        <button onClick={()=>setView('list')} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:12}}>{isNew?'Nuevo cliente':'Editar cliente'}</p>

        {/* Datos del local */}
        <input style={S.inp} placeholder="Nombre del local *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
        <input style={S.inp} placeholder="Dirección" value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
        <select style={{...S.inp}} value={form.type||'Almacén'} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
          {['Almacén','Supermercado','Kiosco','Limpieza','Otro'].map(t=><option key={t}>{t}</option>)}
        </select>

        {/* Acceso */}
        <div style={{height:1,background:'#222',margin:'4px 0 12px'}}/>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:8}}>Acceso</p>
        <input style={S.inp} placeholder="Usuario *" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value.toLowerCase().replace(/\s/g,'')}))}/>
        <input style={S.inp} placeholder="Contraseña" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
        <input style={S.inp} placeholder="WhatsApp (ej: 5491165001234)" value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>

        {/* Botón WhatsApp */}
        {form.phone && (
          <button onClick={sendWhatsApp} style={{...S.btn('green'),marginBottom:12,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <IWsp/> {wspSent ? '✓ Acceso enviado' : 'Enviar acceso por WhatsApp'}
          </button>
        )}

        {/* Precios por categoría */}
        <div style={{height:1,background:'#222',margin:'4px 0 12px'}}/>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>Precios por categoría</p>
        <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:12,paddingBottom:4}}>
          {cats.map(cat=>
            <button key={cat.id} onClick={()=>setSelCat(cat.id)} style={{padding:'7px 12px',borderRadius:8,border:'1px solid '+(selCat===cat.id?C.gold:'#333'),background:selCat===cat.id?'rgba(201,169,110,0.1)':'#1a1a1a',color:selCat===cat.id?C.gold:C.muted,cursor:'pointer',fontSize:12,fontWeight:600,whiteSpace:'nowrap'}}>
              {cat.emoji} {cat.label}
            </button>
          )}
        </div>
        {catProds.length===0 && <p style={{color:C.muted,fontSize:13,textAlign:'center',padding:'12px 0'}}>Sin productos en esta categoría aún.</p>}
        {catProds.map(pr=>(
          <div key={pr.id} style={{...S.card,marginBottom:8}}>
            <p style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:8}}>{pr.name}</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
              {[['Precio $','price'],['Min. doc.','min_qty'],['% desc. bulto','bulk_discount']].map(([lbl,field])=>(
                <div key={field}>
                  <p style={{fontSize:10,color:C.muted,marginBottom:3}}>{lbl}</p>
                  <input style={{...S.inp,marginBottom:0,padding:'9px 10px',fontSize:13}} type="number"
                    value={prices[pr.id]?.[field]??''}
                    onChange={e=>{ const val=e.target.value; setPrices(p=>({...p,[pr.id]:{...p[pr.id],[field]:val}})) }}/>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{display:'flex',gap:8,marginTop:12}}>
          <button style={{...S.btn('sec'),flex:1,background:'#222'}} onClick={()=>setView('list')}>Cancelar</button>
          <button style={{...S.btn(),flex:1}} onClick={save} disabled={saving}>{saving?'Guardando...':'Guardar'}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:0}}>{clients.length} clientes</p>
        <button style={S.btn('sm')} onClick={openNew}>+ Nuevo</button>
      </div>
      {clients.map(c=>(
        <div key={c.id} style={S.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:1}}>{c.name}</p>
              <p style={{fontSize:12,color:C.muted,marginBottom:6}}>@{c.username} · {c.address||'sin dirección'}</p>
              <span style={{fontSize:11,color:C.muted,background:'#222',borderRadius:6,padding:'2px 8px'}}>{c.type||'Almacén'}</span>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0,marginLeft:8}}>
              <button style={S.btn('sm')} onClick={()=>openEdit(c)}>Editar</button>
              <button style={{...S.btn('sm'),background:'rgba(224,92,92,0.1)',color:C.red,border:'none'}} onClick={()=>del(c.id)}><ITrash/></button>
            </div>
          </div>
        </div>
      ))}
      {clients.length===0 && <p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin clientes aún. Agregá el primero.</p>}
    </div>
  )
}

// ── ADMIN: PRODUCTOS ──────────────────────────────────────────────────────────
function AdminProducts({products, setProducts, cats}) {
  const [editing,setEditing] = useState(null)
  const [form,setForm] = useState({})
  const [saving,setSaving] = useState(false)

  const readImg = (e,slot) => {
    const file=e.target.files[0]; if(!file) return
    const r=new FileReader()
    r.onload = ev => setForm(f=>({...f,[slot]:ev.target.result}))
    r.readAsDataURL(file)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing==='new') {
        const {data,error} = await supabase.from('products').insert([form]).select().single()
        if (!error && data) setProducts(prev=>[...prev,data])
      } else {
        const {data,error} = await supabase.from('products').update(form).eq('id',editing).select().single()
        if (!error && data) setProducts(prev=>prev.map(p=>p.id===editing?data:p))
      }
    } finally { setSaving(false) }
    setEditing(null)
  }

  const del = async (id) => {
    if (!window.confirm('¿Eliminar producto?')) return
    await supabase.from('products').delete().eq('id',id)
    setProducts(prev=>prev.filter(p=>p.id!==id))
  }

  const addNew = () => {
    setForm({name:'',desc:'',unit:'docena',qty_per_unit:12,cat:cats[0]?.id||'',photo:null,photo2:null,active:true})
    setEditing('new')
  }

  if (editing!==null) return (
    <div>
      <button onClick={()=>setEditing(null)} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:12}}>{editing==='new'?'Nuevo producto':'Editar producto'}</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
        {[['photo','📦 Foto bulto','pi1'],['photo2','🖼 Referencia','pi2']].map(([slot,label,id])=>(
          <div key={slot}>
            <p style={{fontSize:10,color:C.muted,marginBottom:4}}>{label}</p>
            <div style={{height:110,background:'#1a1a1a',borderRadius:10,border:'1px dashed #333',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden'}}
              onClick={()=>document.getElementById(id)?.click()}>
              {form[slot] ? <img src={form[slot]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> :
                <div style={{textAlign:'center',color:C.muted,fontSize:11}}><div style={{fontSize:22}}>📷</div><p style={{margin:'4px 0 0'}}>Subir</p></div>}
              <input id={id} type="file" accept="image/*" style={{display:'none'}} onChange={e=>readImg(e,slot)}/>
            </div>
          </div>
        ))}
      </div>
      <input style={S.inp} placeholder="Nombre *" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <textarea style={{...S.inp,minHeight:60,resize:'vertical'}} placeholder="Descripción breve" value={form.desc||''} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
        <div><p style={{fontSize:11,color:C.muted,marginBottom:4}}>Unidad</p><input style={{...S.inp,marginBottom:0}} value={form.unit||''} placeholder="docena" onChange={e=>setForm(f=>({...f,unit:e.target.value}))}/></div>
        <div><p style={{fontSize:11,color:C.muted,marginBottom:4}}>Unidades/pack</p><input style={{...S.inp,marginBottom:0}} type="number" value={form.qty_per_unit||12} onChange={e=>setForm(f=>({...f,qty_per_unit:Number(e.target.value)}))}/></div>
      </div>
      <p style={{fontSize:11,color:C.muted,marginBottom:4}}>Categoría</p>
      <select style={S.inp} value={form.cat||''} onChange={e=>setForm(f=>({...f,cat:e.target.value}))}>
        {cats.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
      </select>
      <div style={{display:'flex',gap:8}}>
        <button style={{...S.btn('sec'),flex:1,background:'#222'}} onClick={()=>setEditing(null)}>Cancelar</button>
        <button style={{...S.btn(),flex:1}} onClick={save} disabled={saving}>{saving?'Guardando...':'Guardar'}</button>
      </div>
    </div>
  )

  const grouped = cats.map(cat=>({cat,items:products.filter(p=>p.cat===cat.id)})).filter(g=>g.items.length>0)
  const sinCat = products.filter(p=>!cats.find(c=>c.id===p.cat))
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',margin:0}}>{products.length} productos</p>
        <button style={S.btn('sm')} onClick={addNew}>+ Nuevo</button>
      </div>
      {grouped.map(({cat,items})=>(
        <div key={cat.id} style={{marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,padding:'7px 12px',background:'#111',borderRadius:10,border:'1px solid #262626'}}>
            <span style={{fontSize:18}}>{cat.emoji}</span>
            <p style={{fontWeight:700,fontSize:13,color:C.text,margin:0}}>{cat.label}</p>
            <span style={{fontSize:11,color:C.muted}}>({items.length})</span>
          </div>
          {items.map(p=>(
            <div key={p.id} style={{...S.card,display:'flex',gap:12,alignItems:'center',padding:12}}>
              <div style={{width:52,height:52,borderRadius:10,background:'#222',overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {p.photo?<img src={p.photo} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:22}}>{cat.emoji}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:600,fontSize:13,color:C.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</p>
                <p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{p.unit} · {p.qty_per_unit} u/pack</p>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button style={S.btn('sm')} onClick={()=>{setForm({...p});setEditing(p.id)}}>Editar</button>
                <button style={{...S.btn('sm'),background:'rgba(224,92,92,0.1)',color:C.red,border:'none'}} onClick={()=>del(p.id)}><ITrash/></button>
              </div>
            </div>
          ))}
        </div>
      ))}
      {sinCat.length>0 && <div><p style={{color:C.red,fontSize:11,marginBottom:8}}>Sin categoría</p>{sinCat.map(p=><div key={p.id} style={{...S.card,display:'flex',justifyContent:'space-between'}}><p style={{color:C.text,margin:0}}>{p.name}</p><button style={S.btn('sm')} onClick={()=>{setForm({...p});setEditing(p.id)}}>Editar</button></div>)}</div>}
    </div>
  )
}

// ── ADMIN: CATEGORIAS ─────────────────────────────────────────────────────────
function AdminCats({cats, setCats, products}) {
  const [newLabel,setNewLabel] = useState('')
  const [newEmoji,setNewEmoji] = useState('📦')
  const add = () => {
    if (!newLabel.trim()) return
    const id = newLabel.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    if (cats.find(c=>c.id===id)) return
    setCats(prev=>[...prev,{id,label:newLabel.trim(),emoji:newEmoji}])
    setNewLabel(''); setNewEmoji('📦')
  }
  const del = id => {
    if (products.some(p=>p.cat===id)) { alert('Tiene productos. Cambialos primero.'); return }
    if (window.confirm('¿Eliminar categoría?')) setCats(prev=>prev.filter(c=>c.id!==id))
  }
  return (
    <div>
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:14}}>Categorías ({cats.length})</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {cats.map(cat=>{
          const count=products.filter(p=>p.cat===cat.id).length
          return (
            <div key={cat.id} style={{background:C.card,border:'1px solid #262626',borderRadius:12,padding:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:28}}>{cat.emoji}</span>
                <button style={{background:'rgba(224,92,92,0.1)',border:'none',borderRadius:6,padding:'4px 7px',cursor:'pointer',color:C.red}} onClick={()=>del(cat.id)}><ITrash/></button>
              </div>
              <p style={{fontWeight:700,fontSize:13,color:C.text,margin:'0 0 2px'}}>{cat.label}</p>
              <p style={{fontSize:11,color:C.muted,margin:0}}>{count} prod.</p>
            </div>
          )
        })}
      </div>
      <div style={{...S.card,border:'1px dashed #333',background:'#111'}}>
        <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>Nueva categoría</p>
        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <input style={{...S.inp,marginBottom:0,flex:'0 0 52px',textAlign:'center',fontSize:20,padding:'8px'}} value={newEmoji} onChange={e=>setNewEmoji(e.target.value)} maxLength={2}/>
          <input style={{...S.inp,marginBottom:0,flex:1}} placeholder='Ej: Esponjas, Escobas...' value={newLabel} onChange={e=>setNewLabel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}/>
        </div>
        <button style={S.btn()} onClick={add}>Agregar categoría</button>
      </div>
    </div>
  )
}

// ── ADMIN: PEDIDOS ────────────────────────────────────────────────────────────
function AdminOrders({orders, clients, products}) {
  const [sel,setSel] = useState(null)
  const getC = id => clients.find(c=>c.id===id)||{name:'?'}
  const getP = id => products.find(p=>p.id===id)||{name:'?',unit:''}

  if (sel) {
    const o = orders.find(x=>x.id===sel)
    const items = o.items||[]
    const total = items.reduce((s,i)=>s+i.price*i.qty,0)
    return (
      <div>
        <button onClick={()=>setSel(null)} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6,marginBottom:14}}><IBack/> Volver</button>
        <div style={S.card}>
          <p style={{fontSize:11,color:C.muted,letterSpacing:3,marginBottom:3}}>PEDIDO</p>
          <p style={{fontWeight:700,fontSize:17,color:C.text,marginBottom:2}}>{getC(o.client_id).name}</p>
          <p style={{fontSize:12,color:C.muted,marginBottom:14}}>{new Date(o.created_at).toLocaleString('es-AR')}</p>
          {items.map((item,i)=>{
            const pr=getP(item.product_id)
            return <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #262626'}}><div><p style={{fontWeight:600,fontSize:13,color:C.text,margin:0}}>{pr.name}</p><p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{item.qty} {pr.unit} × {fmt(item.price)}</p></div><p style={{fontWeight:700,color:C.gold,margin:0}}>{fmt(item.price*item.qty)}</p></div>
          })}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:14}}><p style={{fontWeight:700,fontSize:15,color:C.text,margin:0}}>Total</p><p style={{fontWeight:700,fontSize:20,color:C.gold,margin:0}}>{fmt(total)}</p></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p style={{fontSize:11,color:C.muted,letterSpacing:3,textTransform:'uppercase',marginBottom:12}}>{orders.length} pedidos</p>
      {orders.length===0 && <p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>Sin pedidos aún.</p>}
      {orders.map(o=>{
        const total=(o.items||[]).reduce((s,i)=>s+i.price*i.qty,0)
        return (
          <div key={o.id} style={{...S.card,cursor:'pointer'}} onClick={()=>setSel(o.id)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><p style={{fontWeight:700,fontSize:14,color:C.text,margin:0}}>{getC(o.client_id).name}</p><p style={{fontSize:11,color:C.muted,margin:'3px 0 0'}}>{new Date(o.created_at).toLocaleString('es-AR')}</p></div>
              <p style={{fontWeight:700,fontSize:16,color:C.gold,margin:0}}>{fmt(total)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── CLIENT STORE ──────────────────────────────────────────────────────────────
function Store({session, onLogout}) {
  const client = session.client
  const [products,setProducts] = useState([])
  const [cats] = useState(DEFAULT_CATS)
  const [cart,setCart] = useState({})
  const [view,setView] = useState('cat')
  const [selCat,setSelCat] = useState('all')
  const [loading,setLoading] = useState(true)
  const [submitting,setSubmitting] = useState(false)

  useEffect(()=>{
    supabase.from('products').select('*').eq('active',true).order('cat')
      .then(({data})=>{ if(data) setProducts(data); setLoading(false) })
  },[])

  const prices = client.prices || {}
  const myProds = products.filter(p=>prices[p.id]?.price)
  const myCats = cats.filter(cat=>myProds.some(p=>p.cat===cat.id))
  const visibleProds = selCat==='all' ? myProds : myProds.filter(p=>p.cat===selCat)

  const addToCart = (pid,delta) => {
    const min = prices[pid]?.min_qty || 1
    setCart(c=>{
      const cur=c[pid]||0; let next=cur+delta
      if(next<0) next=0
      if(next>0&&next<min) next=delta>0?min:0
      return {...c,[pid]:next}
    })
  }

  const cartItems = Object.entries(cart).filter(([,q])=>q>0).map(([pid,qty])=>({
    product_id:Number(pid), qty, price:prices[pid].price
  }))
  const cartTotal = cartItems.reduce((s,i)=>s+i.price*i.qty,0)
  const cartCount = cartItems.length

  const confirm = async () => {
    setSubmitting(true)
    await supabase.from('orders').insert([{
      client_id: client.id,
      items: cartItems,
      total: cartTotal,
    }])
    setCart({}); setSubmitting(false); setView('ok')
  }

  if (loading) return <Spinner/>

  if (view==='ok') return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,textAlign:'center'}}>
      <div style={{width:70,height:70,borderRadius:'50%',border:'2px solid '+C.green,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,color:C.green}}><ICheck/></div>
      <h2 style={{fontSize:24,fontWeight:800,color:C.text,marginBottom:8}}>¡Pedido enviado!</h2>
      <p style={{color:C.muted,marginBottom:28,fontSize:15,lineHeight:1.6}}>Te contactamos a la brevedad para coordinar la entrega.</p>
      <button style={{...S.btn(),maxWidth:280}} onClick={()=>setView('cat')}>Volver al catálogo</button>
    </div>
  )

  if (view==='cart') return (
    <div style={{minHeight:'100vh',background:C.bg}}>
      <div style={S.hdr}>
        <button onClick={()=>setView('cat')} style={{background:'none',border:'none',color:C.gold,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:14}}><IBack/> Volver</button>
        <p style={{fontSize:13,letterSpacing:3,textTransform:'uppercase',color:C.gold,margin:0,fontWeight:700}}>Mi pedido</p>
        <span/>
      </div>
      <div style={{padding:16}}>
        {cartItems.map((item,i)=>{
          const pr=products.find(p=>p.id===item.product_id)
          return <div key={i} style={{...S.card,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><p style={{fontWeight:700,fontSize:15,color:C.text,margin:0}}>{pr?.name}</p><p style={{fontSize:13,color:C.muted,margin:'3px 0 0'}}>{item.qty} {pr?.unit} × {fmt(item.price)}</p></div><p style={{fontWeight:800,color:C.gold,margin:0,fontSize:17}}>{fmt(item.price*item.qty)}</p></div>
        })}
        <div style={{...S.card,background:'#111',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 14px'}}><p style={{fontWeight:700,fontSize:16,color:C.text,margin:0}}>Total</p><p style={{fontWeight:800,fontSize:24,color:C.gold,margin:0}}>{fmt(cartTotal)}</p></div>
        <div style={{height:8}}/>
        <button style={S.btn()} onClick={confirm} disabled={submitting}>{submitting?'Enviando...':'Confirmar pedido'}</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:C.bg,paddingBottom:90}}>
      <div style={S.hdr}>
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

      {myCats.length>1&&(
        <div style={{display:'flex',gap:8,overflowX:'auto',padding:'12px 12px 10px',borderBottom:'1px solid #262626',background:'#111'}}>
          <button onClick={()=>setSelCat('all')} style={{padding:'10px 16px',borderRadius:10,border:'1px solid '+(selCat==='all'?C.gold:'#333'),background:selCat==='all'?C.gold:'transparent',color:selCat==='all'?'#0d0d0d':C.muted,cursor:'pointer',fontSize:13,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>Todo</button>
          {myCats.map(cat=><button key={cat.id} onClick={()=>setSelCat(cat.id)} style={{padding:'10px 16px',borderRadius:10,border:'1px solid '+(selCat===cat.id?C.gold:'#333'),background:selCat===cat.id?C.gold:'transparent',color:selCat===cat.id?'#0d0d0d':C.muted,cursor:'pointer',fontSize:13,fontWeight:700,whiteSpace:'nowrap',flexShrink:0}}>{cat.emoji} {cat.label}</button>)}
        </div>
      )}

      <div style={{padding:'10px 12px'}}>
        {visibleProds.map(pr=>{
          const pdata = prices[pr.id]
          const qpu = pr.qty_per_unit||12
          const priceUnit = Math.round(pdata.price/qpu)
          const bulkPrice = pdata.bulk_discount>0 ? Math.round(pdata.price*(1-pdata.bulk_discount/100)) : 0
          const qty = cart[pr.id]||0
          const catInfo = cats.find(c=>c.id===pr.cat)||{emoji:'📦'}
          return (
            <div key={pr.id} style={{background:C.card,border:'1px solid #262626',borderRadius:14,marginBottom:8,overflow:'hidden'}}>
              {pr.photo&&<img src={pr.photo} alt={pr.name} style={{width:'100%',height:140,objectFit:'cover',display:'block'}}/>}
              <div style={{padding:14}}>
                <p style={{fontWeight:700,fontSize:17,color:C.text,margin:'0 0 8px',lineHeight:1.2}}>{catInfo.emoji} {pr.name}</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
                  <div style={{background:'#222',borderRadius:10,padding:'10px 12px'}}>
                    <p style={{fontSize:11,color:C.muted,margin:'0 0 2px'}}>Por {pr.unit}</p>
                    <p style={{fontSize:20,fontWeight:800,color:C.gold,margin:0,lineHeight:1}}>{fmt(pdata.price)}</p>
                  </div>
                  <div style={{background:'#222',borderRadius:10,padding:'10px 12px'}}>
                    <p style={{fontSize:11,color:C.muted,margin:'0 0 2px'}}>Por unidad</p>
                    <p style={{fontSize:20,fontWeight:800,color:C.text,margin:0,lineHeight:1}}>{fmt(priceUnit)}</p>
                  </div>
                </div>
                <div style={{background:'rgba(201,169,110,0.1)',border:'1px solid rgba(201,169,110,0.25)',borderRadius:8,padding:'7px 12px',marginBottom:bulkPrice?8:12,display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:16}}>📦</span>
                  <span style={{fontSize:14,fontWeight:700,color:C.gold}}>Mínimo: {pdata.min_qty||1} {pr.unit} = {(pdata.min_qty||1)*qpu} unidades</span>
                </div>
                {bulkPrice>0&&(
                  <div style={{background:'#0d1f15',border:'1px solid rgba(76,175,130,0.25)',borderRadius:8,padding:'7px 12px',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div><p style={{fontSize:11,color:C.muted,margin:'0 0 2px'}}>🎁 1 bulto (10 doc.)</p><p style={{fontSize:15,fontWeight:700,color:C.green,margin:0}}>{fmt(bulkPrice)}/doc · {fmt(Math.round(bulkPrice/qpu))}/u</p></div>
                    <span style={{background:'rgba(76,175,130,0.15)',color:C.green,border:'1px solid rgba(76,175,130,0.3)',borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:700}}>{pdata.bulk_discount}% off</span>
                  </div>
                )}
                <p style={{fontSize:13,color:'#777',margin:'0 0 12px',lineHeight:1.5}}>{pr.desc}</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',background:'#222',borderRadius:10,overflow:'hidden',border:'1px solid #333'}}>
                    <button style={{width:44,height:44,background:'none',border:'none',color:C.text,cursor:'pointer',fontSize:24,fontWeight:300}} onClick={()=>addToCart(pr.id,-1)}>−</button>
                    <span style={{fontWeight:800,fontSize:18,minWidth:36,textAlign:'center',color:C.text}}>{qty}</span>
                    <button style={{width:44,height:44,background:'none',border:'none',color:C.text,cursor:'pointer',fontSize:24,fontWeight:300}} onClick={()=>addToCart(pr.id,1)}>+</button>
                  </div>
                  {qty>0&&<div style={{textAlign:'right'}}><p style={{fontWeight:800,color:C.green,fontSize:18,margin:0}}>{fmt(pdata.price*qty)}</p><p style={{fontSize:11,color:C.muted,margin:'2px 0 0'}}>{qty*qpu} unidades</p></div>}
                </div>
              </div>
            </div>
          )
        })}
        {visibleProds.length===0&&<p style={{color:C.muted,textAlign:'center',padding:'40px 0',fontSize:14}}>No hay productos en esta categoría.</p>}
      </div>

      {cartCount>0&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'14px 16px',background:'#111',borderTop:'1px solid #262626'}}>
          <button style={S.btn()} onClick={()=>setView('cart')}>Ver pedido · {fmt(cartTotal)}</button>
        </div>
      )}
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [session,setSession] = useState(null)
  if (!session) return <Login onLogin={setSession}/>
  if (session.role==='admin') return <Admin onLogout={()=>setSession(null)}/>
  return <Store session={session} onLogout={()=>setSession(null)}/>
}
