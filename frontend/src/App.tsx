import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import "./App.css"

function App() {
  const [token, setToken] = useState(localStorage.getItem("fm_token"))
  const [user, setUser] = useState<any>(null)
  const [view, setView] = useState("config")
  const [monitorView, setMonitorView] = useState("drops")
  const [status, setStatus] = useState<any>(null)
  const [zones, setZones] = useState<string[]>([])
  const [selectedZone, setSelectedZone] = useState<string>("public")
  const [zoneDetails, setZoneDetails] = useState<any>(null)
  const [ipsets, setIpsets] = useState<string[]>([])
  const [selectedIpset, setSelectedIpset] = useState<string | null>(null)
  const [ipsetDetails, setIpsetDetails] = useState<any>(null)
  const [fwLogs, setFwLogs] = useState<any[]>([])
  const [bannedIps, setBannedIps] = useState<any[]>([])
  const [blacklistEntries, setBlacklistEntries] = useState<string[]>([])
  const [snapshots, setSnapshots] = useState<string[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState<any[]>([])
  const [whois, setWhois] = useState<any>(null)
  const [tgConfig, setTgConfig] = useState({ tg_token: "", tg_chat_id: "" })
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState("v1.4.1")

  useEffect(() => {
    // Force set local version to override any fetch delays
    setVersion("v1.4.1");
  }, []);
  const [inputs, setInputs] = useState({ port: "", service: "", rule: "", ipset: "", ipentry: "", forward: "", user: "", pass: "", icmp: "", interface: "", source: "", new_zone: "", new_policy: "", new_service: "" })
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null)
  const [showSafeMigrate, setShowSafeMigrate] = useState(false)
  const [migrateStep, setMigrateStep] = useState(1)
  const [availableIcmpTypes, setAvailableIcmpTypes] = useState<string[]>([])
  const [policies, setPolicies] = useState<string[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null)
  const [policyDetails, setPolicyDetails] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [serviceDetails, setServiceDetails] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSystem, setShowSystem] = useState(false)
  const [globalConfig, setGlobalConfig] = useState<any>(null)

  const authHeaders = { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
  const protectedPorts = ["55222/tcp", "22/tcp", "80/tcp", "443/tcp"]

  const logout = () => { localStorage.removeItem("fm_token"); setToken(null); setUser(null) }

  const checkSetup = async () => {
    try {
      const res = await fetch("/api/auth/setup-needed");
      const data = await res.json();
      setSetupNeeded(data.setup_needed);
    } catch (e) { console.error(e) }
  }

  const fetchProfile = async () => {
    if (!token) return
    try {
      const res = await fetch("/api/auth/me", { headers: authHeaders })
      if (res.ok) setUser(await res.json()); else logout()
    } catch (e) { logout() }
  }

  const fetchData = async () => {
    if (!token || !user) return
    const f = async (u: string) => {
        const r = await fetch(u, { headers: authHeaders })
        if (r.status === 401) { logout(); return {} }
        return r.json()
    }
    try {
      if (view === "config") {
        setStatus(await f("/api/status"))
        setZones((await f("/api/zones/all")).zones || [])
        setIpsets((await f("/api/ipsets/all")).ipsets || [])
        setPolicies((await f("/api/policies/all")).policies || [])
        setServices((await f("/api/services/all")).services || [])
        setGlobalConfig(await f("/api/config/global"))
        if (availableIcmpTypes.length === 0) {
            setAvailableIcmpTypes((await f("/api/icmptypes/all")).icmptypes || [])
        }
      }
      if (view === "monitoring") {
        setFwLogs((await f("/api/logs")).logs || [])
        setBannedIps((await f("/api/fail2ban/status")).banned || [])
        setStats((await f("/api/stats")).hourly || [])
        const bl = await f("/api/ipset/blacklist/details")
        setBlacklistEntries(bl.entries || [])
      }
      if (view === "snapshots") setSnapshots((await f("/api/snapshots/all")).snapshots || [])
      if (view === "admin" && user.role === "superadmin") {
        setAuditLogs((await f("/api/audit-logs")).logs || [])
        const uData = await f("/api/users")
        setUsers(Array.isArray(uData) ? uData : [])
      }
      if (view === "settings" && user.role === "superadmin") setTgConfig(await f("/api/settings") || { tg_token: "", tg_chat_id: "" })
    } catch (e) { console.error(e) }
  }

  const apiAction = async (url: string, method: string, body?: any) => {
    setLoading(true)
    const res = await fetch(url, { method, headers: authHeaders, body: body ? JSON.stringify(body) : null })
    if (res.ok) {
        await fetchData();
        if (selectedZone && view === "config") fetchZoneDetails(selectedZone);
        if (selectedIpset && view === "config") fetchIpsetDetails(selectedIpset);
        if (selectedService && view === "services") fetchServiceDetails(selectedService);
    } else {
        const errorData = await res.json().catch(() => ({ detail: "Unknown error" }));
        alert(`Action failed: ${errorData.detail || "Server error"}`);
    }
    setLoading(false)
  }

  useEffect(() => { checkSetup() }, [])
  useEffect(() => { if (token) fetchProfile() }, [token])
  useEffect(() => { if (token && user) fetchData() }, [token, view, user])

  const fetchZoneDetails = async (z: string) => {
    const res = await fetch("/api/zone/"+z+"/details", {headers:authHeaders})
    if (res.ok) setZoneDetails(await res.json())
  }

  const fetchIpsetDetails = async (n: string) => {
    const res = await fetch("/api/ipset/"+n+"/details", {headers:authHeaders})
    if (res.ok) setIpsetDetails(await res.json())
  }

  const fetchPolicyDetails = async (p: string) => {
    const res = await fetch("/api/policy/"+p+"/details", {headers:authHeaders})
    if (res.ok) setPolicyDetails(await res.json())
  }

  const fetchServiceDetails = async (s: string) => {
    const res = await fetch("/api/service/"+s+"/details", {headers:authHeaders})
    if (res.ok) setServiceDetails(await res.json())
  }

  useEffect(() => { if (token && user && selectedZone && view === "config") fetchZoneDetails(selectedZone) }, [token, user, selectedZone, view])
  useEffect(() => { if (token && user && selectedIpset && view === "config") fetchIpsetDetails(selectedIpset) }, [token, user, selectedIpset, view])
  useEffect(() => { if (token && user && selectedPolicy && view === "config") fetchPolicyDetails(selectedPolicy) }, [token, user, selectedPolicy, view])
  useEffect(() => { if (token && user && selectedService && view === "services") fetchServiceDetails(selectedService) }, [token, user, selectedService, view])
  useEffect(() => { if (token && user && view === "services") fetchData() }, [token, user, view])

  useEffect(() => {
    if (token && user && view === "monitoring") {
      const timer = setInterval(fetchData, 15000)
      return () => clearInterval(timer)
    }
  }, [token, user, view])

  if (setupNeeded === true) return (
    <div className="auth-screen">
      <form className="glass-card auth-card" onSubmit={async (e:any)=>{
        e.preventDefault();
        const res = await fetch("/api/auth/setup", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: e.target.user.value, password: e.target.pass.value })
        });
        if (res.ok) { alert("Admin created! Log in now."); setSetupNeeded(false); }
      }}>
        <h2>Initial Setup</h2>
        <p className="note">Create first Superadmin</p>
        <input name="user" placeholder="Username" required />
        <input name="pass" type="password" placeholder="Password" required />
        <button className="btn-reload" type="submit">Create Admin</button>
      </form>
    </div>
  )

  if (!token) return <div className="auth-screen"><form className="glass-card auth-card" onSubmit={async (e:any)=>{
    e.preventDefault(); const fd=new FormData(); fd.append("username", e.target.user.value); fd.append("password", e.target.pass.value);
    const res = await fetch("/api/auth/login", {method:"POST", body:fd})
    if(res.ok){ const d=await res.json(); localStorage.setItem("fm_token", d.access_token); setToken(d.access_token); }
    else alert("Login failed")
  }}><h2>Firewalld-GUI</h2><input name="user" placeholder="Username" /><input name="pass" type="password" placeholder="Password" /><button className="btn-reload">Login</button></form></div>

  return (
    <div className="container-fluid">
      <header className="glass-card header">
        <div className="brand"><h1>Firewalld-GUI</h1><span className="badge">{version}</span></div>
        <nav className="view-nav">
          {["config", "services", "monitoring", "snapshots", "admin", "settings"].map(v => (
            (v !== "settings" && v !== "admin" || user?.role === "superadmin") &&
            <button key={v} className={view===v?"nav-btn active":"nav-btn"} onClick={()=>setView(v)}>{v.charAt(0).toUpperCase()+v.slice(1)}</button>
          ))}
        </nav>

        <div className="header-actions">
          <div className="user-tag">{user?.username} ({user?.role})</div>
          <button className="btn btn-reload" onClick={() => apiAction("/api/reload", "POST")} disabled={loading}>
            {loading ? "Applying..." : "Apply Changes"}
          </button>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-grid">
        {view === "config" && (
          <>
            <div className="side-pane">
              <section className="glass-card"><h3>Status: <span className="text-success">{status?.firewalld_state}</span></h3></section>
              
              <section className="glass-card">
                <div className="group-header"><h3>Zones</h3></div>
                <div className="add-form" style={{marginBottom:"10px"}}>
                  <input value={inputs.new_zone} onChange={e=>setInputs({...inputs,new_zone:e.target.value})} placeholder="New zone..." />
                  <button onClick={()=>{apiAction("/api/zone/create","POST",{name:inputs.new_zone});setInputs({...inputs,new_zone:""})}}>+</button>
                </div>
                <div className="zone-list">
                  {zones.map(z => (
                    <div key={z} className="list-item-wrap">
                      <button className={selectedZone===z?"zone-btn active":"zone-btn"} onClick={()=>{setSelectedZone(z);setSelectedIpset(null);setSelectedPolicy(null);}}>{z}</button>
                      {z !== "public" && z !== "trusted" && <i className="fas fa-trash del-icon" onClick={()=>apiAction("/api/zone/"+z, "DELETE")}></i>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-card">
                <h3>Policies (Routing)</h3>
                <div className="add-form" style={{marginBottom:"10px"}}>
                  <input value={inputs.new_policy} onChange={e=>setInputs({...inputs,new_policy:e.target.value})} placeholder="New policy..." />
                  <button onClick={()=>{apiAction("/api/policy/create","POST",{name:inputs.new_policy});setInputs({...inputs,new_policy:""})}}>+</button>
                </div>
                <div className="zone-list">
                  {policies.map(p => (
                    <div key={p} className="list-item-wrap">
                      <button className={selectedPolicy===p?"zone-btn active ipset-active":"zone-btn"} onClick={()=>{setSelectedPolicy(p);setSelectedZone(null);setSelectedIpset(null);}}>{p}</button>
                      <i className="fas fa-trash del-icon" onClick={()=>apiAction("/api/policy/"+p, "DELETE")}></i>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass-card">
                <h3>IP Sets</h3>
                <div className="add-form" style={{marginBottom:"10px"}}>
                  <input value={inputs.ipset} onChange={e=>setInputs({...inputs,ipset:e.target.value})} placeholder="New set..." />
                  <button onClick={()=>{apiAction("/api/ipset/create","POST",{name:inputs.ipset});setInputs({...inputs,ipset:""})}}>+</button>
                </div>
                <div className="zone-list">{ipsets.map(s => (<button key={s} className={selectedIpset===s?"zone-btn active ipset-active":"zone-btn"} onClick={()=>{setSelectedIpset(s);setSelectedZone(null);setSelectedPolicy(null);}}>{s}</button>))}</div>
              </section>

              <section className="glass-card">
                <h3>Global Config</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <div>
                    <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Default Zone</label>
                    <select 
                      value={globalConfig?.default_zone || ''} 
                      onChange={e => apiAction("/api/config/global", "POST", {default_zone: e.target.value})}
                      className="btn-mini"
                    >
                      {zones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Log Denied</label>
                    <select 
                      value={globalConfig?.log_denied || 'off'} 
                      onChange={e => apiAction("/api/config/global", "POST", {log_denied: e.target.value})}
                      className="btn-mini"
                    >
                      <option value="off">off</option>
                      <option value="all">all</option>
                      <option value="unicast">unicast</option>
                      <option value="broadcast">broadcast</option>
                      <option value="multicast">multicast</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
            <div className="main-pane">
              {selectedZone && <section className="glass-card details-view">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px'}}>
                    <h2 style={{margin: 0, border: 'none', padding: 0}}>Zone: {selectedZone}</h2>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{fontSize: '0.85em', color: 'var(--text-muted)'}}>Masquerade (NAT)</span>
                        <button 
                            onClick={() => apiAction(`/api/zone/${selectedZone}/masquerade`, zoneDetails?.masquerade ? "DELETE" : "POST", { value: "yes" })}
                            style={{
                                background: zoneDetails?.masquerade ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                                border: 'none', borderRadius: '20px', width: '40px', height: '22px', position: 'relative', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            <div style={{
                                width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', 
                                left: zoneDetails?.masquerade ? '20px' : '2px', transition: '0.3s'
                            }}></div>
                        </button>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid var(--card-border)'}}>
                        <span style={{fontSize: '0.85em', color: 'var(--text-muted)'}}>Target</span>
                        <select 
                            value={zoneDetails?.target || 'default'} 
                            onChange={(e) => apiAction(`/api/zone/${selectedZone}/target`, "POST", { target: e.target.value })}
                            className="btn-mini"
                        >
                            <option value="default">default</option>
                            <option value="ACCEPT">ACCEPT</option>
                            <option value="REJECT">REJECT</option>
                            <option value="DROP">DROP</option>
                        </select>
                    </div>
                </div>
                <div className="details-grid">
                
                {/* --- New Section: Interfaces & Sources --- */}
                <div className="detail-group">
                  <div className="group-header">
                    <h4>Routing & Binding (Interfaces & Sources)</h4>
                  </div>
                  <div className="tag-container" style={{marginBottom: "10px"}}>
                    {zoneDetails?.interfaces?.map((iface: string) => (
                      <span key={iface} className="tag iface" title="Network Interface">
                        <i className="fas fa-network-wired mr-1"></i> {iface} 
                        <i onClick={() => apiAction("/api/zone/" + selectedZone + "/interface/" + encodeURIComponent(iface), "DELETE")}>×</i>
                      </span>
                    ))}
                    {zoneDetails?.sources?.map((src: string) => (
                      <span key={src} className="tag port" title="Source IP/Subnet">
                        <i className="fas fa-satellite-dish mr-1"></i> {src} 
                        <i onClick={() => apiAction("/api/zone/" + selectedZone + "/source/" + encodeURIComponent(src), "DELETE")}>×</i>
                      </span>
                    ))}
                  </div>
                  <div className="add-form" style={{maxWidth: '500px'}}>
                    <input value={inputs.interface} onChange={e => setInputs({ ...inputs, interface: e.target.value })} placeholder="Interface (e.g. eth0)" />
                    <button onClick={() => { if(inputs.interface) { apiAction("/api/zone/" + selectedZone + "/interface", "POST", { value: inputs.interface }); setInputs({ ...inputs, interface: "" }); } }}>+ Iface</button>
                    <div style={{width: '20px'}}></div>
                    <input value={inputs.source} onChange={e => setInputs({ ...inputs, source: e.target.value })} placeholder="Source (e.g. 10.0.0.0/24)" />
                    <button onClick={() => { if(inputs.source) { apiAction("/api/zone/" + selectedZone + "/source", "POST", { value: inputs.source }); setInputs({ ...inputs, source: "" }); } }}>+ Source</button>
                  </div>
                </div>
                {/* ----------------------------------------- */}

                <div className="detail-group">
                  <h4>Active ICMP Blocks</h4>
                  <div className="tag-container" style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px'}}>
                    {zoneDetails && zoneDetails.icmp_blocks && zoneDetails.icmp_blocks.length > 0 ? (
                      zoneDetails.icmp_blocks.map((icmp: string) => (
                        <div key={icmp} className="glass-card" style={{
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '12px 20px', 
                          borderLeft: '4px solid var(--danger)',
                          background: 'rgba(239, 68, 68, 0.05)'
                        }}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <i className="fas fa-hand-paper" style={{color: 'var(--danger)', fontSize: '1.2rem'}}></i>
                            <span style={{fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px'}}>{icmp.toUpperCase()}</span>
                          </div>
                          <button 
                            className="btn-mini-ban"
                            onClick={() => apiAction("/api/zone/" + selectedZone + "/icmp-block/" + encodeURIComponent(icmp), "DELETE")}
                            style={{padding: '8px 20px', fontSize: '0.9rem', textTransform: 'uppercase'}}
                          >
                            <i className="fas fa-unlock mr-2"></i> Unblock
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state-card glass-card" style={{padding: '20px', textAlign: 'center', opacity: 0.5}}>
                        <i className="fas fa-check-circle" style={{fontSize: '1.5rem', marginBottom: '8px', color: 'var(--success)'}}></i>
                        <p>No active ICMP blocks. All traffic allowed.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="add-form" style={{maxWidth: '400px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px dashed var(--card-border)'}}>
                    <select 
                      value={inputs.icmp} 
                      onChange={e => setInputs({ ...inputs, icmp: e.target.value })}
                      className="btn-mini"
                      style={{flex: 1}}
                    >
                      <option value="">Block ICMP type...</option>
                      {availableIcmpTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button 
                      className="btn-reload"
                      onClick={() => { if(inputs.icmp) { apiAction("/api/zone/" + selectedZone + "/icmp-block", "POST", { value: inputs.icmp }); setInputs({ ...inputs, icmp: "" }); } }}
                      style={{padding: '5px 15px'}}
                    >
                      <i className="fas fa-ban mr-1"></i> Block
                    </button>
                  </div>
                </div>
                <div className="detail-group">
                  <div className="group-header">
                    <h4>Ports</h4>
                    <button className="btn-small-link" onClick={() => { setShowSafeMigrate(true); setMigrateStep(1); }}>
                      <i className="fas fa-key"></i> Manage Access
                    </button>
                  </div>
                  <div className="tag-container">
                    {zoneDetails?.ports?.map((p: string) => (
                      <span key={p} className={`tag port ${protectedPorts.includes(p) ? 'protected' : ''}`}>
                        {p} 
                        {protectedPorts.includes(p) && <i className="fas fa-lock mini-lock"></i>}
                        {(!protectedPorts.includes(p) || migrateStep === 2) && 
                          <i onClick={() => apiAction("/api/zone/" + selectedZone + "/port/" + encodeURIComponent(p), "DELETE")}>×</i>
                        }
                      </span>
                    ))}
                    <div className="add-form">
                      <input value={inputs.port} onChange={e => setInputs({ ...inputs, port: e.target.value })} placeholder="80/tcp" />
                      <button onClick={() => { apiAction("/api/zone/" + selectedZone + "/port", "POST", { port: inputs.port }); setInputs({ ...inputs, port: "" }) }}>+</button>
                    </div>
                  </div>
                </div>
                <div className="detail-group">
                  <h4>Port Forwarding (NAT)</h4>
                  <div className="nat-list">
                    {zoneDetails?.forward_ports?.filter((f: string) => f.trim() !== "").map((f: string) => {
                      const m = f.match(/port=(\d+):proto=(\w+):toport=(\d+):toaddr=(.*)/) || f.match(/port=(\d+):proto=(\w+):toport=(\d+)/);
                      return (
                        <div key={f} className="nat-card">
                          <div className="nat-route">
                            <span className="ext-port">{m ? m[1] : f}</span>
                            <span className="proto-badge">{m ? m[2].toUpperCase() : 'TCP'}</span>
                            <i className="fas fa-arrow-right-long"></i>
                            <span className="int-port">{m ? m[3] : ''}</span>
                            {m && m[4] && <span className="int-addr">@{m[4]}</span>}
                          </div>
                          <button className="btn-del" onClick={() => apiAction("/api/zone/" + selectedZone + "/forward-port/" + encodeURIComponent(f), "DELETE")}>×</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="add-nat-form">
                    <div className="input-group">
                      <input type="number" placeholder="Ext Port" id="nat-ext" />
                      <select id="nat-proto">
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                      </select>
                      <input type="number" placeholder="Int Port" id="nat-int" />
                      <input type="text" placeholder="Int IP (Optional)" id="nat-ip" />
                    </div>
                    <button className="btn-add-full" onClick={() => {
                      const ext = (document.getElementById('nat-ext') as HTMLInputElement).value;
                      const proto = (document.getElementById('nat-proto') as HTMLSelectElement).value;
                      const int = (document.getElementById('nat-int') as HTMLInputElement).value;
                      const ip = (document.getElementById('nat-ip') as HTMLInputElement).value;
                      if (!ext || !int) return alert("Ports required");
                      let val = `port=${ext}:proto=${proto}:toport=${int}`;
                      if (ip) val += `:toaddr=${ip}`;
                      apiAction("/api/zone/" + selectedZone + "/forward-port", "POST", { forward: val });
                    }}>Add NAT Rule</button>
                  </div>
                </div>
                <div className="detail-group"><h4>Rich Rules</h4>{zoneDetails?.rich_rules?.map((r:string,i:number)=>(<div key={i} className="rich-rule-item"><code>{r}</code><i onClick={()=>apiAction("/api/zone/"+selectedZone+"/rich-rule","DELETE",{rule:r})}>×</i></div>))}
                  <div className="add-form"><input value={inputs.rule} onChange={e=>setInputs({...inputs,rule:e.target.value})} placeholder="rule..." style={{width:"100%"}} /><button onClick={()=>{apiAction("/api/zone/"+selectedZone+"/rich-rule","POST",{rule:inputs.rule});setInputs({...inputs,rule:""})}}>Add</button></div>
                </div></div></section>}
              {selectedIpset && <section className="glass-card details-view"><h2>IP Set: {selectedIpset}</h2><div className="detail-group"><h4>Entries</h4><div className="tag-container">
                {ipsetDetails?.entries?.map((e:string)=><span key={e} className={selectedIpset==="whitelist"?"tag port":"tag service"}>{e} <i onClick={()=>apiAction("/api/ipset/"+selectedIpset+"/entry/"+e,"DELETE")}>×</i></span>)}
                <div className="add-form"><input value={inputs.ipentry} onChange={e=>setInputs({...inputs,ipentry:e.target.value})} placeholder="1.2.3.4" /><button onClick={()=>{apiAction("/api/ipset/"+selectedIpset+"/entry","POST",{entry:inputs.ipentry});setInputs({...inputs,ipentry:""})}}>Add</button></div>
              </div></div></section>}
              
              {selectedPolicy && <section className="glass-card details-view">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px'}}>
                    <h2 style={{margin: 0, border: 'none', padding: 0}}>Policy: {selectedPolicy}</h2>
                </div>
                <div className="details-grid">
                    <div className="detail-group">
                        <h4>Target Action</h4>
                        <div className="tag-container" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <span className={`tag ${policyDetails?.target === 'ACCEPT' ? 'port' : policyDetails?.target === 'DROP' ? 'banned' : 'service'}`} style={{fontSize: '1.1em', fontWeight: 'bold'}}>
                                {policyDetails?.target || 'DEFAULT'}
                            </span>
                            <select 
                                value={policyDetails?.target || 'default'} 
                                onChange={(e) => apiAction(`/api/policy/${selectedPolicy}/target`, "POST", { target: e.target.value })}
                                className="btn-mini"
                            >
                                <option value="default">default</option>
                                <option value="ACCEPT">ACCEPT</option>
                                <option value="REJECT">REJECT</option>
                                <option value="DROP">DROP</option>
                            </select>
                        </div>
                    </div>
                    <div className="detail-group">
                        <div className="group-header"><h4>Ingress Zones (Source)</h4></div>
                        <div className="tag-container">
                            {policyDetails?.ingress_zones?.map((z: string) => (
                                <span key={z} className="tag iface"><i className="fas fa-sign-in-alt mr-1"></i> {z}</span>
                            ))}
                            {!policyDetails?.ingress_zones?.length && <span className="text-gray-500 italic text-sm">ANY</span>}
                        </div>
                    </div>
                    <div className="detail-group">
                        <div className="group-header"><h4>Egress Zones (Destination)</h4></div>
                        <div className="tag-container">
                            {policyDetails?.egress_zones?.map((z: string) => (
                                <span key={z} className="tag service"><i className="fas fa-sign-out-alt mr-1"></i> {z}</span>
                            ))}
                            {!policyDetails?.egress_zones?.length && <span className="text-gray-500 italic text-sm">ANY</span>}
                        </div>
                    </div>
                    <p className="note text-gray-500 text-sm mt-4">
                        <i className="fas fa-info-circle mr-1"></i> 
                        Policies are used to filter traffic flowing <b>between</b> different zones. Manage them via CLI (e.g. <code>firewall-cmd --new-policy</code>) to see them here.
                    </p>
                </div>
              </section>}
            </div>
          </>
        )}

        {view === "services" && (
          <div className="wide-pane">
            <div style={{display: 'grid', gridTemplateColumns: selectedService ? '1fr 350px' : '1fr', gap: '24px', transition: '0.3s'}}>
              <div className="services-main">
                <section className="glass-card">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid var(--card-border)', paddingBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <h2 style={{margin: 0, border: 'none', padding: 0}}>Service Definitions</h2>
                      <span className="badge" style={{background: 'var(--success)', opacity: 0.8}}>Permanent</span>
                    </div>
                    <div style={{position: 'relative', width: '300px'}}>
                      <i className="fas fa-search" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '0.8rem'}}></i>
                      <input 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Filter services..." 
                        style={{width: '100%', padding: '10px 12px 10px 35px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', borderRadius: '8px', color: '#fff'}}
                      />
                    </div>
                  </div>

                  <div style={{background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--card-border)', marginBottom: '30px'}}>
                    <div style={{display: 'flex', gap: '12px'}}>
                      <input 
                        value={inputs.new_service} 
                        onChange={e=>setInputs({...inputs,new_service:e.target.value})} 
                        placeholder="Enter new service name (e.g. samba-custom)" 
                        style={{flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '6px', color: '#fff'}}
                      />
                      <button className="btn-reload" onClick={()=>{apiAction("/api/service/create","POST",{name:inputs.new_service});setInputs({...inputs,new_service:""})}} style={{padding: '0 25px'}}>
                        <i className="fas fa-plus mr-1"></i> Create Service
                      </button>
                    </div>
                  </div>

                  <div className="detail-group">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                      <h4>Custom Services ({services.filter(s => s.is_custom).length})</h4>
                      <div style={{height: '1px', flex: 1, background: 'var(--card-border)', margin: '0 20px', opacity: 0.3}}></div>
                    </div>
                    <div className="tag-container" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px'}}>
                      {services.filter(s => s.is_custom && s.name.includes(searchTerm)).map(s => (
                        <div 
                          key={s.name} 
                          className={`list-item-wrap glass-card ${selectedService === s.name ? 'active-item' : ''}`}
                          style={{padding: '15px', cursor: 'pointer', border: selectedService === s.name ? '1px solid var(--success)' : '1px solid var(--card-border)', display: 'block'}}
                          onClick={() => setSelectedService(s.name)}
                        >
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: s.ports?.length ? '10px' : '0'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                              <div style={{width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <i className="fas fa-tools" style={{color: 'var(--success)', fontSize: '0.9rem'}}></i>
                              </div>
                              <span style={{fontWeight: 600, fontSize: '1rem'}}>{s.name}</span>
                            </div>
                            <i className="fas fa-trash del-icon" style={{marginTop: '5px'}} onClick={(e)=>{e.stopPropagation(); apiAction("/api/service/"+s.name, "DELETE"); if(selectedService===s.name)setSelectedService(null)}}></i>
                          </div>
                          
                          {s.ports?.length > 0 && (
                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px'}}>
                              {s.ports.slice(0, 3).map((p:string) => (
                                <span key={p} style={{fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)'}}>{p}</span>
                              ))}
                              {s.ports.length > 3 && <span style={{fontSize: '0.7rem', opacity: 0.5}}>+{s.ports.length - 3} more</span>}
                            </div>
                          )}
                        </div>
                      ))}
                      {services.filter(s => s.is_custom).length === 0 && (
                        <div className="empty-state-card glass-card" style={{gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--card-border)'}}>
                          <i className="fas fa-project-diagram" style={{fontSize: '2.5rem', marginBottom: '15px', color: 'var(--success)', opacity: 0.4}}></i>
                          <h3 style={{opacity: 0.8}}>No Custom Services Defined</h3>
                          <p className="note">Custom services allow you to group multiple ports and protocols into a single named definition for easier management.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-group" style={{marginTop: '50px'}}>
                    <div 
                      style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--card-border)'}}
                      onClick={() => setShowSystem(!showSystem)}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <i className={`fas ${showSystem ? 'fa-folder-open' : 'fa-folder'}`} style={{color: 'var(--text-muted)'}}></i>
                        <h4 style={{margin: 0}}>System Definitions ({services.filter(s => !s.is_custom).length})</h4>
                      </div>
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{showSystem ? "Click to hide" : "Click to expand"}</span>
                    </div>
                    
                    {showSystem && (
                      <div className="tag-container" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginTop: '20px'}}>
                        {services.filter(s => !s.is_custom && s.name.includes(searchTerm)).map(s => (
                          <div key={s.name} className="glass-card" style={{padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', opacity: 0.7}}>
                            <i className="fas fa-lock" style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}></i>
                            <span style={{fontSize: '0.85rem'}}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {selectedService && (
                <div className="services-sidebar">
                  <section className="glass-card details-view" style={{position: 'sticky', top: '20px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                      <h3 style={{margin: 0}}>Service: {selectedService}</h3>
                      <i className="fas fa-times clickable" onClick={() => setSelectedService(null)}></i>
                    </div>
                    
                    <div className="detail-group">
                      <h4>Ports / Protocols</h4>
                      <div className="tag-container" style={{marginTop: '10px'}}>
                        {serviceDetails?.ports?.map((p: string) => (
                          <span key={p} className="tag port">
                            {p} <i onClick={() => apiAction(`/api/service/${selectedService}/port/${encodeURIComponent(p)}`, "DELETE")}>×</i>
                          </span>
                        ))}
                        {serviceDetails?.ports?.length === 0 && <p className="empty" style={{padding: '10px'}}>No ports defined</p>}
                      </div>
                      
                      <div className="add-form" style={{marginTop: '20px'}}>
                        <input value={inputs.port} onChange={e=>setInputs({...inputs,port:e.target.value})} placeholder="e.g. 8080/tcp" />
                        <button onClick={() => { if(inputs.port) { apiAction(`/api/service/${selectedService}/port`, "POST", { port: inputs.port }); setInputs({ ...inputs, port: "" }); } }}>+</button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "monitoring" && (
          <div className="wide-pane">
            <section className="glass-card"><h2>Attack Statistics (Last 24h)</h2><div style={{height:"180px", marginTop:"15px"}}><ResponsiveContainer width="100%" height="100%"><LineChart data={stats}><XAxis dataKey="hour" stroke="#666"/><YAxis stroke="#666"/><Tooltip/><Line type="monotone" dataKey="count" stroke="#ff4444" strokeWidth={3}/></LineChart></ResponsiveContainer></div></section>
            
            <section className="glass-card">
              <div className="sub-nav">
                <button className={monitorView === "drops" ? "sub-nav-btn active" : "sub-nav-btn"} onClick={() => setMonitorView("drops")}>Live Drops</button>
                <button className={monitorView === "manual" ? "sub-nav-btn active" : "sub-nav-btn"} onClick={() => setMonitorView("manual")}>Manual Blacklist</button>
                <button className={monitorView === "fail2ban" ? "sub-nav-btn active" : "sub-nav-btn"} onClick={() => setMonitorView("fail2ban")}>Fail2Ban</button>
              </div>

              {monitorView === "drops" && (
                <div className="table-container"><table className="log-table"><thead><tr><th>Time</th><th>IP</th><th>Geo</th><th>Proto</th><th>Port</th><th>Action</th></tr></thead>
                <tbody>{fwLogs.map((l,i)=>(<tr key={i}><td>{l.time}</td><td className="text-danger clickable" onClick={async ()=>{const r=await (await fetch("/api/whois/"+l.src,{headers:authHeaders})).json();setWhois(r)}}>{l.src}</td>
                  <td><span className="badge" style={{background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem'}}>{l.country}</span></td>
                  <td>{l.proto}</td><td>{l.port}</td>
                  <td><button className="btn-mini-ban" onClick={()=>apiAction("/api/quick-ban","POST",{ip:l.src})}>🚫 Ban IP</button></td></tr>))}
                  {fwLogs.length === 0 && <tr><td colSpan={6} className="empty">No drops recorded</td></tr>}
                </tbody></table></div>
              )}

              {monitorView === "manual" && (
                <div className="tag-container" style={{marginTop: "20px"}}>
                  {blacklistEntries.map(ip => (<span key={ip} className="tag banned">{ip} <i onClick={()=>apiAction("/api/ipset/blacklist/entry/"+ip, "DELETE")}>×</i></span>))}
                  {blacklistEntries.length === 0 && <p className="empty">Empty blacklist</p>}
                </div>
              )}

              {monitorView === "fail2ban" && (
                <div className="tag-container" style={{marginTop: "20px"}}>
                  {bannedIps.map((b,i)=>(<span key={i} className="tag banned">{b.ip} ({b.jail}) <i onClick={()=>apiAction("/api/fail2ban/unban","POST",{ip:b.ip,jail:b.jail})}>×</i></span>))}
                  {bannedIps.length === 0 && <p className="empty">No active bans from Fail2Ban</p>}
                </div>
              )}
            </section>

            {whois && <div className="whois-modal" onClick={()=>setWhois(null)}><div className="glass-card whois-content" onClick={e=>e.stopPropagation()}><h3>Whois: {whois.ip || whois.query}</h3>
              <div className="whois-data"><p><b>Location:</b> {whois.country}, {whois.city}</p><p><b>ISP:</b> {whois.isp}</p><p><b>Org:</b> {whois.org}</p><button className="btn-reload" onClick={()=>setWhois(null)}>Close</button></div></div></div>}

            {showSafeMigrate && (
              <div className="whois-modal" onClick={() => setShowSafeMigrate(false)}>
                <div className="glass-card whois-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "450px" }}>
                  <h3>🛡️ Safe Port Migration</h3>
                  <div className="migrate-workflow">
                    {migrateStep === 1 ? (
                      <>
                        <p className="note"><b>Step 1:</b> Add your new access port first to ensure you don't lose connection.</p>
                        <div className="add-form" style={{ marginTop: "15px" }}>
                          <input placeholder="New Port (e.g. 4444/tcp)" id="new-migrate-port" />
                          <button className="btn-reload" onClick={async () => {
                            const p = (document.getElementById('new-migrate-port') as HTMLInputElement).value;
                            if (!p) return;
                            await apiAction("/api/zone/" + selectedZone + "/port", "POST", { port: p });
                            setMigrateStep(2);
                          }}>Add & Continue</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="note text-success"><b>Step 2:</b> New port added! You can now safely remove old protected ports from the main dashboard.</p>
                        <p className="note" style={{fontSize: "0.8em", opacity: 0.7}}>Unlock mode is active. Deletion enabled for protected ports.</p>
                        <button className="btn-reload" onClick={() => setShowSafeMigrate(false)} style={{ marginTop: "15px", width: "100%" }}>Finish & Exit</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "admin" && (
          <div className="wide-pane">
            <section className="glass-card"><h2>Audit Logs</h2><div className="table-container"><table className="log-table"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead>
              <tbody>{auditLogs.map((l,i)=>(<tr key={i}><td>{l.ts?.split("T")[1]?.slice(0,8)}</td><td>{l.user}</td><td><b>{l.action}</b></td><td style={{fontSize:"0.85em"}}>{l.details}</td></tr>))}
              {auditLogs.length === 0 && <tr><td colSpan={4} className="empty">No logs</td></tr>}
              </tbody></table></div></section>
            <section className="glass-card"><h2>User Management</h2><div className="tag-container">
              {users.map(u => (<span key={u.username} className="tag port">{u.username} ({u.role}) {u.role !== "superadmin" && <i onClick={()=>apiAction("/api/users/"+u.username,"DELETE")}>×</i>}</span>))}
              <div className="add-form"><input value={inputs.user} onChange={e=>setInputs({...inputs,user:e.target.value})} placeholder="User" /><input type="password" value={inputs.pass} onChange={e=>setInputs({...inputs,pass:e.target.value})} placeholder="Pass" /><button onClick={()=>{apiAction("/api/users","POST",{username:inputs.user, password:inputs.pass});setInputs({...inputs,user:"",pass:""})}}>+ Add</button></div>
            </div></section>
          </div>
        )}

        {view === "settings" && (
          <div className="wide-pane">
            <section className="glass-card"><h2>Settings</h2><div className="add-form-col">
              <label>Telegram Bot Token</label><input value={tgConfig.tg_token} onChange={e=>setTgConfig({...tgConfig,tg_token:e.target.value})} placeholder="Token" />
              <label>Telegram Chat ID</label><input value={tgConfig.tg_chat_id} onChange={e=>setTgConfig({...tgConfig,tg_chat_id:e.target.value})} placeholder="Chat ID" />
              <button className="btn-reload" onClick={()=>apiAction("/api/settings","POST",tgConfig)} style={{width: "150px", marginTop: "10px"}}>Save Settings</button>
            </div></section>
          </div>
        )}

        {view === "snapshots" && (
          <div className="wide-pane"><section className="glass-card"><h2>Time Machine (Snapshots)</h2><div className="snap-list">
            {snapshots.map(s=>(<div key={s} className="snap-item"><span>{s}</span><button className="btn-reload" onClick={()=>{if(confirm("Restore?"))apiAction("/api/snapshots/restore/"+s,"POST")}} style={{background:"#ffaa00"}}>Restore</button></div>))}
            {snapshots.length === 0 && <p className="empty">No snapshots recorded yet.</p>}
          </div></section></div>
        )}
      </main>
      <footer className="footer">© 2026 Weby Homelab • Running on AlmaLinux 10</footer>
    </div>
  )
}

export default App
