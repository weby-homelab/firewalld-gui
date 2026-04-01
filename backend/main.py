from fastapi import FastAPI, HTTPException, Body, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import subprocess, json, os, re, requests, shutil, sqlite3

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
DATA_DIR = "/app/data"
USER_DATA_FILE = f"{DATA_DIR}/users.json"
CONFIG_FILE = f"{DATA_DIR}/config.json"
SNAPSHOTS_DIR = f"{DATA_DIR}/snapshots"
DB_FILE = f"{DATA_DIR}/stats.db"

app = FastAPI(title="Firewalld-GUI API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)

def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_FILE)
    conn.execute("CREATE TABLE IF NOT EXISTS drops (id INTEGER PRIMARY KEY, ts TIMESTAMP, src TEXT, proto TEXT, port TEXT, UNIQUE(ts, src, port))")
    conn.execute("CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY, ts TIMESTAMP, username TEXT, action TEXT, details TEXT)")
    conn.commit(); conn.close()

init_db()

def log_action(username, action, details):
    conn = sqlite3.connect(DB_FILE)
    conn.execute("INSERT INTO audit_logs (ts, username, action, details) VALUES (?, ?, ?, ?)", (datetime.now().isoformat(), username, action, str(details)))
    conn.commit(); conn.close()
    send_tg_alert(f"🛡️ *Firewalld Action*\n👤 User: {username}\n🎯 Action: {action}\n📝 Details: ")

def send_tg_alert(text):
    if not os.path.exists(CONFIG_FILE): return
    try:
        with open(CONFIG_FILE, "r") as f: cfg = json.load(f)
        t = cfg.get("tg_token"); c = cfg.get("tg_chat_id")
        if t and c: requests.post(f"https://api.telegram.org/bot{t}/sendMessage", json={"chat_id": c, "text": text, "parse_mode": "Markdown"}, timeout=1.5)
    except: pass

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        users = load_users()
        if username not in users: raise HTTPException(status_code=401)
        return {"username": username, "role": users[username].get("role", "admin")}
    except JWTError: raise HTTPException(status_code=401)

def load_users():
    if not os.path.exists(USER_DATA_FILE): return {}
    with open(USER_DATA_FILE, "r") as f: return json.load(f)

def save_users(users):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USER_DATA_FILE, "w") as f: json.dump(users, f)


def run_cmd(cmd):
    try:
        # Capture both stdout and stderr to handle all firewall-cmd outputs
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        out = result.stdout.strip()
        if not out and result.stderr:
            out = result.stderr.strip()
        return out
    except subprocess.CalledProcessError as e:
        err = e.stderr.strip() or e.stdout.strip() or str(e)
        if "already" in err.lower(): return f"Success: {err}" # Handle 'already' cases gracefully
        raise HTTPException(status_code=400, detail=err)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/setup-needed")
async def is_setup_needed(): return {"setup_needed": len(load_users()) == 0}

@app.post("/api/auth/setup")
async def setup_admin(username: str = Body(...), password: str = Body(...)):
    users = load_users()
    if len(users) > 0: raise HTTPException(status_code=400)
    users[username] = {"password": pwd_context.hash(password), "role": "superadmin"}
    os.makedirs(DATA_DIR, exist_ok=True); json.dump(users, open(USER_DATA_FILE, "w"))
    log_action(username, "SETUP", "Superadmin created")
    return {"status": "success"}

@app.post("/api/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    users = load_users()
    u = users.get(form_data.username)
    if not u or not pwd_context.verify(form_data.password, u["password"]): raise HTTPException(status_code=401)
    t = jwt.encode({"sub": form_data.username, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": t, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_me(u=Depends(get_current_user)): return u

@app.get("/api/status")
async def get_status(u=Depends(get_current_user)): return {"firewalld_state": run_cmd(["firewall-cmd", "--state"])}

# --- Global Config ---
@app.get("/api/config/global")
async def get_global_cfg(u=Depends(get_current_user)):
    dz = run_cmd(["firewall-cmd", "--get-default-zone"])
    ld = run_cmd(["firewall-cmd", "--get-log-denied"])
    return {"default_zone": dz, "log_denied": ld}

@app.post("/api/config/global")
async def set_global_cfg(data: dict = Body(...), u=Depends(get_current_user)):
    if "default_zone" in data:
        run_cmd(["firewall-cmd", "--set-default-zone=" + data["default_zone"]])
    if "log_denied" in data:
        run_cmd(["firewall-cmd", "--set-log-denied=" + data["log_denied"]])
    log_action(u["username"], "UPDATE_GLOBAL_CONFIG", data)
    return {"status": "success"}

# --- Zones Lifecycle ---
@app.get("/api/zones/all")
async def get_all_zones(u=Depends(get_current_user)): return {"zones": run_cmd(["firewall-cmd", "--get-zones"]).split()}

@app.post("/api/zone/create")
async def create_zone(name: str = Body(..., embed=True), u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--new-zone=" + name])
    log_action(u["username"], "CREATE_ZONE", name); return {"result": res}

@app.delete("/api/zone/{name}")
async def delete_zone(name: str, u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--delete-zone=" + name])
    log_action(u["username"], "DELETE_ZONE", name); return {"result": res}

# --- Policies Lifecycle ---
@app.get("/api/policies/all")
async def get_all_policies(u=Depends(get_current_user)):
    policies_raw = run_cmd(["firewall-cmd", "--permanent", "--get-policies"])
    return {"policies": policies_raw.split() if policies_raw else []}

@app.post("/api/policy/create")
async def create_policy(name: str = Body(..., embed=True), u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--new-policy=" + name])
    log_action(u["username"], "CREATE_POLICY", name); return {"result": res}

@app.delete("/api/policy/{name}")
async def delete_policy(name: str, u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--delete-policy=" + name])
    log_action(u["username"], "DELETE_POLICY", name); return {"result": res}

# --- Services Lifecycle ---
@app.get("/api/services/all")
async def get_services(u=Depends(get_current_user)):
    all_services = run_cmd(["firewall-cmd", "--get-services"]).split()
    custom_dir = "/etc/firewalld/services"
    custom_services = []
    if os.path.exists(custom_dir):
        custom_services = [f.replace(".xml", "") for f in os.listdir(custom_dir) if f.endswith(".xml")]
    
    result = []
    for s in all_services:
        is_custom = s in custom_services
        ports = []
        if is_custom:
            try:
                ports_raw = run_cmd(["firewall-cmd", "--permanent", "--service=" + s, "--get-ports"])
                ports = ports_raw.split()
            except: pass
            
        result.append({
            "name": s,
            "is_custom": is_custom,
            "ports": ports
        })
    return {"services": result}

@app.get("/api/service/{name}/details")
async def get_service_info(name: str, u=Depends(get_current_user)):
    ports = run_cmd(["firewall-cmd", "--permanent", "--service=" + name, "--get-ports"])
    return {"name": name, "ports": ports.split()}

@app.post("/api/service/{name}/port")
async def add_service_port(name: str, port: str = Body(..., embed=True), u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--service=" + name, "--add-port=" + port])
    log_action(u["username"], "SERVICE_ADD_PORT", f"Service: {name}, Port: {port}")
    return {"result": res}

@app.delete("/api/service/{name}/port/{port}")
async def remove_service_port(name: str, port: str, u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--service=" + name, "--remove-port=" + port])
    log_action(u["username"], "SERVICE_REMOVE_PORT", f"Service: {name}, Port: {port}")
    return {"result": res}

@app.post("/api/service/create")
async def create_service(name: str = Body(..., embed=True), u=Depends(get_current_user)):
    try:
        # Check if service already exists
        existing = run_cmd(["firewall-cmd", "--get-services"]).split()
        if name in existing:
            raise HTTPException(status_code=400, detail=f"Service '{name}' already exists")
            
        res = run_cmd(["firewall-cmd", "--permanent", "--new-service=" + name])
        run_cmd(["firewall-cmd", "--reload"])
        log_action(u["username"], "CREATE_SERVICE", name)
        return {"result": res}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/service/{name}")
async def delete_service(name: str, u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--delete-service=" + name])
    log_action(u["username"], "DELETE_SERVICE", name); return {"result": res}

@app.get("/api/zone/{name}/details")
async def get_zone_details(name: str, u=Depends(get_current_user)):
    p = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--list-ports"])
    s = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--list-services"])
    r = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--list-rich-rules"])
    f = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--list-forward-ports"])
    i = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--list-interfaces"])
    src = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--list-sources"])
    
    # New features: Masquerade and ICMP blocks
    masq = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--query-masquerade"]).strip()
    icmp_raw = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--list-icmp-blocks"])
    
    # Collect ports from services
    service_list = s.split()
    service_ports = {}
    for svc in service_list:
        try:
            svc_p = run_cmd(["firewall-cmd", "--permanent", "--service=" + svc, "--get-ports"])
            if svc_p:
                service_ports[svc] = svc_p.split()
        except: pass

    # Ultra-robust parsing: split by any whitespace, filter out empty and system junk
    icmp_list = []
    if icmp_raw:
        # Some versions return space-separated, some comma-separated
        raw_parts = re.split(r'[\s,]+', str(icmp_raw).strip())
        icmp_list = [p.strip() for p in raw_parts if p.strip() and p.strip().lower() not in ['(none)', 'no', 'none']]
    
    target = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--get-target"])
    
    return {
        "ports": p.split(), 
        "services": service_list, 
        "service_ports": service_ports,
        "rich_rules": r.split("\n") if r else [], 
        "forward_ports": f.split("\n") if f else [],
        "interfaces": i.split(),
        "sources": src.split(),
        "masquerade": masq == "yes",
        "icmp_blocks": icmp_list,
        "target": target.strip() if target else "default"
    }

@app.post("/api/zone/{name}/target")
async def set_zone_target(name: str, target: str = Body(..., embed=True), u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--set-target=" + target])
    log_action(u["username"], "SET_TARGET", f"Zone: {name}, Target: {target}")
    return {"result": res}

@app.post("/api/policy/{name}/target")
async def set_policy_target(name: str, target: str = Body(..., embed=True), u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--policy=" + name, "--set-target=" + target])
    log_action(u["username"], "SET_TARGET", f"Policy: {name}, Target: {target}")
    return {"result": res}

@app.get("/api/icmptypes/all")
async def get_all_icmptypes(u=Depends(get_current_user)):
    """Return all available ICMP types supported by firewalld"""
    return {"icmptypes": run_cmd(["firewall-cmd", "--get-icmptypes"]).split()}

@app.post("/api/zone/{name}/{type}")
async def add_item(name: str, type: str, data: dict = Body(None), u=Depends(get_current_user)):
    # Data can be None for masquerade
    val = data.get("value") if data else None
    if not val and data:
        val = data.get("port") or data.get("service") or data.get("rule") or data.get("forward") or data.get("interface") or data.get("source")
        
    shutil.copytree("/etc/firewalld", SNAPSHOTS_DIR+"/auto_"+datetime.now().strftime("%H%M%S"), dirs_exist_ok=True)
    
    if type == "masquerade":
        res = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--add-masquerade"])
        run_cmd(["firewall-cmd", "--reload"])
        val_log = "enabled"
    elif type == "icmp-block":
        res = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, f"--add-icmp-block={val}"])
        run_cmd(["firewall-cmd", "--reload"])
        val_log = val
    else:
        res = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, f"--add-{type}={val}"])
        val_log = val
        
    log_action(u["username"], f"ADD_{type.upper()}", f"Zone: {name}, Val: {val_log}")
    return {"result": res}

@app.delete("/api/zone/{name}/{type}")
@app.delete("/api/zone/{name}/{type}/{val:path}")
async def remove_item(name: str, type: str, val: str = None, u=Depends(get_current_user)):
    if type == "masquerade":
        res = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, "--remove-masquerade"])
        run_cmd(["firewall-cmd", "--reload"])
    elif type == "icmp-block":
        res = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, f"--remove-icmp-block={val}"])
        run_cmd(["firewall-cmd", "--reload"])
    else:
        res = run_cmd(["firewall-cmd", "--permanent", "--zone=" + name, f"--remove-{type}={val}"])
        
    log_action(u["username"], f"REMOVE_{type.upper()}", f"Zone: {name}, Val: {val}")
    return {"result": res}

@app.get("/api/ipsets/all")
async def get_ipsets(u=Depends(get_current_user)): return {"ipsets": run_cmd(["firewall-cmd", "--permanent", "--get-ipsets"]).split()}

@app.get("/api/ipset/{name}/details")
async def get_ipset_details(name: str, u=Depends(get_current_user)):
    e = run_cmd(["firewall-cmd", "--permanent", "--ipset=" + name, "--get-entries"])
    return {"name": name, "entries": e.split() if e else []}

@app.post("/api/ipset/{name}/entry")
async def add_ipset_entry(name: str, entry: str = Body(..., embed=True), u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--ipset=" + name, "--add-entry=" + entry])
    log_action(u["username"], "IPSET_ADD", f"Set: {name}, IP: {entry}"); return {"result": res}

@app.delete("/api/ipset/{name}/entry/{entry}")
async def remove_ipset_entry(name: str, entry: str, u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--ipset=" + name, "--remove-entry=" + entry])
    log_action(u["username"], "IPSET_REMOVE", f"Set: {name}, IP: {entry}"); return {"result": res}

@app.post("/api/ipset/create")
async def create_ipset(name: str=Body(..., embed=True), u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--permanent", "--new-ipset=" + name, "--type=hash:ip"])
    log_action(u["username"], "IPSET_CREATE", f"Set: {name}"); return {"result": res}

GEO_CACHE = {}

@app.get("/api/logs")
async def get_fw_logs(u=Depends(get_current_user)):
    try:
        log_files = ["/var/log/syslog", "/var/log/messages", "/var/log/kern.log"]
        target_log = None
        for lf in log_files:
            if os.path.exists(lf):
                target_log = lf
                break

        if not target_log: return {"logs": []}

        cmd = ["tail", "-n", "500", target_log]
        lines = subprocess.check_output(cmd, text=True).splitlines()

        parsed = []; conn = sqlite3.connect(DB_FILE)
        recent_ips = {}
        
        for line in lines:
            if any(k in line for k in ["REJECT", "DROP", "DENIED"]):
                src = re.search(r"SRC=([\d\.:a-fA-F]+)", line)
                p = re.search(r"PROTO=(\w+)", line)
                d = re.search(r"DPT=(\d+)", line)
                if src:
                    ip = src.group(1)
                    
                    # Basic Geo-IP Cache to avoid rate limiting
                    if ip not in GEO_CACHE:
                        try:
                            # Use ip-api.com (free, 45 requests/minute)
                            geo_res = requests.get(f"http://ip-api.com/json/{ip}", timeout=0.5).json()
                            GEO_CACHE[ip] = geo_res.get("countryCode", "??")
                        except: GEO_CACHE[ip] = "??"

                    item = {
                        "time": line[:16].strip(), 
                        "src": ip, 
                        "country": GEO_CACHE[ip],
                        "proto": p.group(1) if p else "?", 
                        "port": d.group(1) if d else "?"
                    }
                    parsed.append(item)
                    
                    # Anomaly Detection: Count drops per IP in this batch
                    recent_ips[ip] = recent_ips.get(ip, 0) + 1
                    if recent_ips[ip] == 50: # Trigger alert on 50th drop in last 500 lines
                         send_tg_alert(f"⚠️ *Anomaly Detected!*\n🎯 IP: {ip}\n🔥 Activity: 50+ dropped packets detected in recent logs.")

                    # Use a truncated timestamp for the stats DB to avoid duplicates in the same second
                    conn.execute("INSERT OR IGNORE INTO drops (ts, src, proto, port) VALUES (?, ?, ?, ?)", 
                                (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), item["src"], item["proto"], item["port"]))
        conn.commit(); conn.close(); return {"logs": parsed[::-1][:50]}
    except Exception as e: 
        print(f"Log Error: {e}")
        return {"logs": []}
@app.get("/api/stats")
async def get_stats(u=Depends(get_current_user)):
    try:
        conn = sqlite3.connect(DB_FILE)
        # Fetch drops from the last 24 hours using Python's exact local time cutoff
        cutoff = (datetime.now() - timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S")
        res = conn.execute("SELECT ts FROM drops WHERE ts > ?", (cutoff,)).fetchall()
        conn.close()
        
        counts = {}
        for r in res:
            try:
                # Align timestamp to nearest 30-minute block
                dt = datetime.strptime(r[0][:16], "%Y-%m-%d %H:%M")
                aligned_dt = dt.replace(minute=(dt.minute // 30) * 30, second=0, microsecond=0)
                k = aligned_dt.strftime("%H:%M")
                counts[k] = counts.get(k, 0) + 1
            except: pass

        # Build a complete 24-hour timeline in 30min steps (48 points)
        full_stats = []
        now = datetime.now()
        aligned_now = now.replace(minute=(now.minute // 30) * 30, second=0, microsecond=0)
        
        for i in range(47, -1, -1):
            h_dt = aligned_now - timedelta(minutes=i*30)
            h_str = h_dt.strftime("%H:%M")
            full_stats.append({
                "hour": h_str,
                "count": counts.get(h_str, 0)
            })
            
        return {"hourly": full_stats}
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"hourly": []}

@app.get("/api/policies/all")
async def get_all_policies(u=Depends(get_current_user)):
    """Return all available policies."""
    policies_raw = run_cmd(["firewall-cmd", "--permanent", "--get-policies"])
    return {"policies": policies_raw.split() if policies_raw else []}

@app.get("/api/policy/{name}/details")
async def get_policy_details(name: str, u=Depends(get_current_user)):
    """Return details of a specific policy (ingress, egress, target)."""
    ingress = run_cmd(["firewall-cmd", "--permanent", "--policy=" + name, "--get-ingress-zones"])
    egress = run_cmd(["firewall-cmd", "--permanent", "--policy=" + name, "--get-egress-zones"])
    target = run_cmd(["firewall-cmd", "--permanent", "--policy=" + name, "--get-target"])
    
    return {
        "ingress_zones": ingress.split() if ingress else [],
        "egress_zones": egress.split() if egress else [],
        "target": target.strip() if target else "default"
    }

@app.post("/api/quick-ban")
async def quick_ban(ip: str=Body(..., embed=True), u=Depends(get_current_user)):
    try:
        whitelist = run_cmd(["firewall-cmd", "--permanent", "--ipset=whitelist", "--get-entries"]).split()
        if ip in whitelist: return {"status": "ignored", "message": "IP is whitelisted"}
    except: pass
    
    ipsets = run_cmd(["firewall-cmd", "--permanent", "--get-ipsets"]).split()
    if "blacklist" not in ipsets:
        run_cmd(["firewall-cmd", "--permanent", "--new-ipset=blacklist", "--type=hash:ip"])
        run_cmd(["firewall-cmd", "--permanent", "--zone=public", "--add-rich-rule=rule family=ipv4 source ipset=blacklist drop"])
    
    run_cmd(["firewall-cmd", "--permanent", "--ipset=blacklist", "--add-entry=" + ip])
    run_cmd(["firewall-cmd", "--reload"])
    log_action(u["username"], "QUICK_BAN", f"IP: {ip}")
    return {"status": "success"}

@app.get("/api/whois/{ip}")
async def get_whois(ip: str, u=Depends(get_current_user)): return requests.get(f"http://ip-api.com/json/{ip}").json()

@app.get("/api/fail2ban/status")
async def get_f2b(u=Depends(get_current_user)):
    try:
        jails = re.search(r"Jail list:\s+(.*)", run_cmd(["fail2ban-client", "status"])).group(1).split(", ")
        banned = []
        for j in jails:
            ips = run_cmd(["fail2ban-client", "status", j]).split("Banned IP list:")[-1].strip().split()
            for ip in ips: banned.append({"ip": ip, "jail": j})
        return {"banned": banned}
    except: return {"banned": []}

@app.post("/api/fail2ban/unban")
async def unban(ip: str=Body(...), jail: str=Body(...), u=Depends(get_current_user)):
    res = run_cmd(["fail2ban-client", "set", jail, "unbanip", ip])
    log_action(u["username"], "F2B_UNBAN", f"IP: {ip}, Jail: {jail}"); return {"result": res}

@app.get("/api/audit-logs")
async def get_audit(u=Depends(get_current_user)):
    conn = sqlite3.connect(DB_FILE); res = conn.execute("SELECT ts, username, action, details FROM audit_logs ORDER BY id DESC LIMIT 50").fetchall(); conn.close()
    return {"logs": [{"ts": r[0], "user": r[1], "action": r[2], "details": r[3]} for r in res]}

@app.get("/api/users")
async def get_users(u=Depends(get_current_user)):
    if u["role"] != "superadmin": raise HTTPException(status_code=403)
    users = load_users()
    return [{"username": name, "role": d.get("role")} for name, d in users.items()]

@app.post("/api/users")
async def add_user(username: str=Body(...), password: str=Body(...), u=Depends(get_current_user)):
    if u["role"] != "superadmin": raise HTTPException(status_code=403)
    users = load_users(); users[username] = {"password": pwd_context.hash(password), "role": "admin"}
    save_users(users); log_action(u["username"], "ADD_USER", username); return {"status": "success"}

@app.delete("/api/users/{t}")
async def del_user(t: str, u=Depends(get_current_user)):
    if u["role"] != "superadmin": raise HTTPException(status_code=403)
    users = load_users(); del users[t]; save_users(users); log_action(u["username"], "DEL_USER", t); return {"status": "success"}

@app.get("/api/settings")
async def get_set(u=Depends(get_current_user)):
    return json.load(open(CONFIG_FILE, "r")) if os.path.exists(CONFIG_FILE) else {}

@app.post("/api/settings")
async def save_set(data: dict=Body(...), u=Depends(get_current_user)):
    if u["role"] != "superadmin": raise HTTPException(status_code=403)
    with open(CONFIG_FILE, "w") as f: json.dump(data, f)
    return {"status": "success"}

@app.post("/api/reload")
async def reload_f(u=Depends(get_current_user)):
    res = run_cmd(["firewall-cmd", "--reload"]); log_action(u["username"], "RELOAD", "System"); return {"result": res}

@app.get("/api/snapshots/all")
async def get_snaps(u=Depends(get_current_user)):
    return {"snapshots": sorted(os.listdir(SNAPSHOTS_DIR), reverse=True)} if os.path.exists(SNAPSHOTS_DIR) else {"snapshots": []}

@app.post("/api/snapshots/restore/{n}")
async def restore_sn(n: str, u=Depends(get_current_user)):
    # Secure filename check
    if not n or ".." in n or "/" in n or "\\" in n: 
        raise HTTPException(status_code=400, detail="Invalid snapshot name")
    
    snap_path = os.path.join(SNAPSHOTS_DIR, n)
    # Ensure the resolved path is actually inside SNAPSHOTS_DIR
    if not os.path.abspath(snap_path).startswith(os.path.abspath(SNAPSHOTS_DIR)):
        raise HTTPException(status_code=400, detail="Path traversal attempt detected")
        
    if not os.path.exists(snap_path): 
        raise HTTPException(status_code=404, detail="Snapshot not found")
        
    shutil.copytree(snap_path, "/etc/firewalld", dirs_exist_ok=True)
    run_cmd(["firewall-cmd", "--reload"])
    log_action(u["username"], "RESTORE", n)
    return {"status": "success"}

