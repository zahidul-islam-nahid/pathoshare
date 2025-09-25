import React, { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Beaker,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Check,
  LogIn,
  UserPlus,
  BarChart3,
  ArrowRight,
  BookOpen,
  Settings,
  ChevronRight,
  Download,
  FileDown,
  Plus,
  FileType2,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";

// ----------------- Local storage store -----------------
const LS_KEY = "pathoshare_reports";
async function loadReports(forceServer = false){
  const local = (()=>{ try{ return JSON.parse(localStorage.getItem(LS_KEY)||"[]"); }catch{ return []; } })();
  try{
    const res = await fetch('/api/reports', { cache: 'no-store' });
    if(res.ok){
      const server = await res.json();
      return forceServer ? (Array.isArray(server) ? server : []) : (Array.isArray(server) && server.length ? server : local);
    }
  }catch{}
  return forceServer ? [] : local;
}
function saveReports(reports){
  try{
    const normalized = Array.isArray(reports) ? reports : [];
    localStorage.setItem(LS_KEY, JSON.stringify(normalized));
  }catch{}
}
async function createReport(report){
  try{ await fetch('/api/reports', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(report) }); }
  catch{}
  // Maintain a local mirror for offline fallback
  const existing = JSON.parse(localStorage.getItem(LS_KEY)||'[]');
  localStorage.setItem(LS_KEY, JSON.stringify([report, ...existing]))
}
async function updateReport(report){
  try{ await fetch(`/api/reports/${report.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(report) }); }
  catch{}
  const existing = JSON.parse(localStorage.getItem(LS_KEY)||'[]');
  const idx = existing.findIndex(r=>r.id===report.id);
  if(idx>=0){ existing[idx]=report; }
  else { existing.unshift(report); }
  localStorage.setItem(LS_KEY, JSON.stringify(existing));
}
async function deleteReport(id){
  try{ await fetch(`/api/reports/${id}`, { method:'DELETE' }); }catch{}
  const existing = JSON.parse(localStorage.getItem(LS_KEY)||'[]');
  localStorage.setItem(LS_KEY, JSON.stringify(existing.filter(r=>r.id!==id)));
}

// ----------------- Auth (session only) -----------------
const AUTH_KEY = "pathoshare_auth";
const ROLE_KEY = "pathoshare_role"; // 'editor' | 'viewer'
function isAuthed(){ try{ return JSON.parse(sessionStorage.getItem(AUTH_KEY)||"false"); }catch{ return false; } }
function setAuthed(v){ sessionStorage.setItem(AUTH_KEY, JSON.stringify(!!v)); }
function setRole(role){ sessionStorage.setItem(ROLE_KEY, role); }
function getRole(){ return sessionStorage.getItem(ROLE_KEY)||'editor'; }
function clearAuth(){ try{ sessionStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(ROLE_KEY); }catch{} }
// Fixed credentials (change as needed)
const FIXED_USER = "admin";
const FIXED_PASS = "pathoshare123";
const VIEW_USER = "viewer";
const VIEW_PASS = "pathoview";

// ----------------- AST Panels (VITEK-2 like) -----------------
const PANEL_GRAM_NEG = [
  "Amikacin",
  "Amoxicillin/ Clavulanic Acid",
  "Ampicillin",
  "Aztreonam",
  "Cefalotin",
  "Cefepime",
  "Cefixime",
  "Cefoperazone/ Sulbactam",
  "Cefoxitin",
  "Ceftazidime",
  "Ceftriaxone",
  "Cefuroxime",
  "Cefuroxime Axetil",
  "Ciprofloxacin",
  "Colistin",
  "Ertapenem",
  "Fosfomycin",
  "Gentamicin",
  "Imipenem",
  "Levofloxacin",
  "Meropenem",
  "Minocycline",
  "Nalidixic Acid",
  "Nitrofurantoin",
  "Norfloxacin",
  "Ofloxacin",
  "Piperacillin/ Tazobactam",
  "Ticarcillin",
  "Tigecycline",
  "Trimethoprim/ Sulfamethoxazole"
];
const PANEL_GRAM_POS = [
  "Ampicillin",
  "Benzylpenicillin",
  "Cefotaxime",
  "Ceftriaxone",
  "Chloramphenicol",
  "Ciprofloxacin",
  "Clindamycin",
  "Daptomycin",
  "Erythromycin",
  "Gentamicin",
  "Levofloxacin",
  "Linezolid",
  "Moxifloxacin",
  "Nitrofurantoin",
  "Oxacillin",
  "Rifampicin",
  "Teicoplanin",
  "Tetracycline",
  "Tigecycline",
  "Trimethoprim/ Sulfamethoxazole",
  "Vancomycin"
];
const PANEL_YEAST = ["Amphotericin B", "Fluconazole", "Voriconazole", "Flucytosine", "Caspofungin", "Micafungin"];
const PANEL_GRAM_VAR = [
  "Amikacin",
  "Amoxicillin/ Clavulanic Acid",
  "Ampicillin",
  "Aztreonam",
  "Benzylpenicillin",
  "Cefalotin",
  "Cefepime",
  "Cefixime",
  "Cefoperazone/ Sulbactam",
  "Cefotaxime",
  "Cefoxitin",
  "Ceftazidime",
  "Ceftriaxone",
  "Cefuroxime",
  "Cefuroxime Axetil",
  "Chloramphenicol",
  "Ciprofloxacin",
  "Clindamycin",
  "Colistin",
  "Daptomycin",
  "Ertapenem",
  "Erythromycin",
  "Fosfomycin",
  "Gentamicin",
  "Imipenem",
  "Levofloxacin",
  "Linezolid",
  "Meropenem",
  "Minocycline",
  "Moxifloxacin",
  "Nalidixic Acid",
  "Nitrofurantoin",
  "Norfloxacin",
  "Ofloxacin",
  "Oxacillin",
  "Piperacillin/ Tazobactam",
  "Rifampicin",
  "Teicoplanin",
  "Tetracycline",
  "Ticarcillin",
  "Tigecycline",
  "Trimethoprim/ Sulfamethoxazole",
  "Vancomycin"
];

function defaultPanel(gram){
  if(gram === "Gram positive coccus in cluster") return PANEL_GRAM_POS;
  if(gram === "Gram positive short chain") return PANEL_GRAM_POS;
  if(gram === "Gram positive rod") return PANEL_GRAM_POS;
  if(gram === "Gram negative rod") return PANEL_GRAM_NEG;
  if(gram === "Gram negative coccobacilli") return PANEL_GRAM_NEG;
  if(gram === "Gram negative diplococci") return PANEL_GRAM_NEG;
  if(gram === "Gram variable") return PANEL_GRAM_VAR;
  if(gram === "Fungus") return PANEL_YEAST;
  return PANEL_GRAM_NEG;
}

// ----------------- UI helpers -----------------
const Container = ({ children, className = "" }) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Section = ({ children, className = "" }) => (
  <section className={`py-8 sm:py-12 ${className}`}>{children}</section>
);
const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-white/70 backdrop-blur border-black/10 text-neutral-700">
    {children}
  </span>
);

// ----------------- Layout -----------------
const NavBar = () => (
  <div className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <Container className="flex h-14 items-center justify-between">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <Sparkles className="size-5" />
        <span>PathoShare</span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        <Link to="/reports" className="text-black/70 hover:text-black">Reports</Link>
        {/* Always render, but block if viewer */}
        <Link
          to="/reports/new"
          className="text-black/70 hover:text-black"
          onClick={(e) => {
            if (getRole() === 'viewer') {
              e.preventDefault();
              alert("You don't have permission to create a report.");
            }
          }}
        >
          New Report
        </Link>
        <Link to="/summary" className="text-black/70 hover:text-black">Summary</Link>
        <Link to="/docs" className="text-black/70 hover:text-black">User Manual</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/reports/new" onClick={(e) => {
            if (getRole() === 'viewer') {
              e.preventDefault();
              alert("You don't have permission to create a report.");
            }
          }}
        >
        <Button size="sm" className="rounded-2xl"><Plus className="mr-2 size-4"/>New</Button></Link>
        <Button size="sm" variant="secondary" className="rounded-2xl" onClick={()=>{ clearAuth(); window.location.href='/login'; }}>Logout</Button>
      </div>
    </Container>
  </div>
);

const Footer = () => (
  <footer className="border-t bg-gradient-to-br from-white to-slate-50">
    <Container className="py-8 text-xs text-neutral-500 flex flex-wrap items-center gap-2">
      <span>
        © {new Date().getFullYear()} PathoShare. For research purposes only. 
        Created by{" "}
        <a
          href="https://www.linkedin.com/in/zahidul-islam-nahid/"   // 👉 replace with GitHub, LinkedIn, or mailto
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-neutral-700"
        >
          Zahidul Islam
        </a>
      </span>
    </Container>
  </footer>
);


// ----------------- Home -----------------
 const Home = () => {
   const navigate = useNavigate();
   const [reports, setReports] = useState([]);
   useEffect(()=>{ loadReports().then(setReports).catch(()=>setReports([])); },[]);
   const total = reports.length;
   const positives = reports.filter(r=>r.lab?.cultureResult==="Positive").length;
   const organisms = new Set(reports.map(r=>r.lab?.organism).filter(Boolean)).size;
   return (
    <div className="bg-[radial-gradient(40rem_20rem_at_30%_-10%,#c7d2fe40,transparent),radial-gradient(40rem_20rem_at_70%_-10%,#fbcfe840,transparent)]">
      <Container>
        <Section className="grid items-center gap-10 md:grid-cols-2">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5}}>
            <Pill>Microbial Etiology</Pill>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Culture & AST report sharing</h1>
            <p className="mt-4 text-lg text-neutral-700">Field team register patients information, lab team complete culture, gram-stain, species and AST. Generate a clean PDF and view live summary stats.</p>
            <div className="mt-6 flex gap-3">
            <Button
              className="rounded-2xl"
              onClick={() => {
                if (getRole() === 'viewer') {
                  alert("You don't have permission to create a report.");
                } else {
                  navigate('/reports/new');
                }
              }}
            >
              Create report <ArrowRight className="ml-2 size-4" />
            </Button>
              <Button variant="secondary" className="rounded-2xl" onClick={()=>navigate('/reports')}>View reports</Button>
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.5, delay:0.1}}>
            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="size-5"/>Weekly overview</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                 {[
                   {k:"Total", v: total},
                   {k:"Positive", v: positives},
                   {k:"Organisms", v: organisms},
                 ].map(x=> (
                  <div key={x.k} className="rounded-xl border p-3 text-center">
                    <div className="text-2xl font-semibold">{x.v}</div>
                    <div className="text-xs text-neutral-600">{x.k}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Section>
      </Container>
    </div>
  );
};

// ----------------- Auth Pages -----------------
function RequireAuth({ children }){
  const location = useLocation();
  if(!isAuthed()) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function Login(){
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  function submit(e){
    e.preventDefault();
    if(!username || !password){ setError("Enter username and password"); return; }
    if(username === FIXED_USER && password === FIXED_PASS){
      setAuthed(true); setRole('editor'); navigate(from, { replace: true }); return;
    }
    if(username === VIEW_USER && password === VIEW_PASS){
      setAuthed(true); setRole('viewer'); navigate(from, { replace: true }); return;
    }
    setError("Invalid credentials");
  }
  return (
    <Section>
      <Container>
        <div className="max-w-sm mx-auto">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Login</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {error ? <div className="text-sm text-red-600">{error}</div> : null}
              <FieldBlock label="Username"><Input value={username} onChange={e=>setUsername(e.target.value)} /></FieldBlock>
              <FieldBlock label="Password"><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></FieldBlock>
              <Button onClick={submit} className="rounded-2xl">Sign in</Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

// ----------------- Forms & Pages -----------------
const FieldBlock = ({label, children}) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
  </div>
);

function emptyReport(){
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    patient: {
      patientId:"", name:"", age:"", ageUnit:"year", sex:"", specimenType:"Blood", collectionDate:"", notes:"",
    },
    lab: {
      receivedDate:"",
      cultureResult:"Pending",
      numIsolates: 1,
      isolates: [
        { gram: "Gram-negative", species: "", ast: { panel: defaultPanel("Gram-negative"), rows: defaultPanel("Gram-negative").map(a=>({antibiotic:a, sir:"", mic:""})) } }
      ],
    },
  };
}

function makeRowsForGram(gram){
  const panel = defaultPanel(gram);
  return panel.map(ab=>({ antibiotic: ab, sir: "", mic: "" }));
}

const NewReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(()=> emptyReport());

  // keep isolates array length in sync with numIsolates
  useEffect(()=>{
    setReport(prev=>{
      const current = prev.lab.isolates || [];
      const desired = prev.lab.numIsolates || 0;
      let next = current.slice(0, desired).map(it=>({
        ...it,
        ast: {
          panel: defaultPanel(it.gram),
          rows: (it.ast?.rows?.length ? it.ast.rows : makeRowsForGram(it.gram))
        }
      }));
      while(next.length < desired){
        const gram = "Gram-negative";
        next.push({ gram, species: "", ast: { panel: defaultPanel(gram), rows: makeRowsForGram(gram) } });
      }
      return { ...prev, lab: { ...prev.lab, isolates: next } };
    });
    // eslint-disable-next-line
  }, [report.lab.numIsolates]);

  async function save(){
    const all = await loadReports();
    const exists = (Array.isArray(all)? all: []).some(r=>r.id===report.id);
    if(exists) await updateReport(report); else await createReport(report);
    navigate(`/reports/${report.id}`);
  }

  return (
    <Section>
      <Container>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">New Report</h2>
            <p className="text-neutral-600 text-sm">Enter patient info (field) and lab findings.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>navigate('/reports')}>Cancel</Button>
            <Button onClick={save}><Check className="mr-2 size-4"/>Save</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Patient information</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <FieldBlock label="Patient ID"><Input value={report.patient.patientId} onChange={e=>setReport({...report, patient:{...report.patient, patientId:e.target.value}})} placeholder="Patient ID"/></FieldBlock>
              <div className="grid grid-cols-3 gap-3">
                <FieldBlock label="Name"><Input value={report.patient.name} onChange={e=>setReport({...report, patient:{...report.patient, name:e.target.value}})} /></FieldBlock>
                <FieldBlock label="Age">
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" value={report.patient.age} onChange={e=>setReport({...report, patient:{...report.patient, age:e.target.value}})} />
                    <select className="w-full rounded-md border px-3 py-2" value={report.patient.ageUnit||'year'} onChange={e=>setReport({...report, patient:{...report.patient, ageUnit:e.target.value}})}>
                      {['hour(s)','day(s)','week(s)','month(s)','year(s)'].map(u=> <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </FieldBlock>
                <FieldBlock label="Sex">
                  <select className="w-full rounded-md border px-3 py-2" value={report.patient.sex} onChange={e=>setReport({...report, patient:{...report.patient, sex:e.target.value}})}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </FieldBlock>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FieldBlock label="Specimen type">
                  <select className="w-full rounded-md border px-3 py-2" value={report.patient.specimenType} onChange={e=>setReport({...report, patient:{...report.patient, specimenType:e.target.value}})}>
                    {['Blood','EDTA Blood','Serum','Urine','Vaginal swab','Other'].map(s=> <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldBlock>
                <FieldBlock label="Collection date"><Input type="date" value={report.patient.collectionDate} onChange={e=>setReport({...report, patient:{...report.patient, collectionDate:e.target.value}})} /></FieldBlock>
              </div>
              <FieldBlock label="Notes"><Textarea rows={3} value={report.patient.notes} onChange={e=>setReport({...report, patient:{...report.patient, notes:e.target.value}})} /></FieldBlock>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Culture Results</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-3">
                <FieldBlock label="Received date"><Input type="date" value={report.lab.receivedDate} onChange={e=>setReport({...report, lab:{...report.lab, receivedDate:e.target.value}})} /></FieldBlock>
                <FieldBlock label="Culture result">
                  <select className="w-full rounded-md border px-3 py-2" value={report.lab.cultureResult} onChange={e=>setReport({...report, lab:{...report.lab, cultureResult:e.target.value}})}>
                    {["Pending","Negative","Positive"].map(s=> <option key={s}>{s}</option>)}
                  </select>
                </FieldBlock>
                <FieldBlock label="Isolate types"><Input type="number" min={0} value={report.lab.numIsolates} onChange={e=>setReport({...report, lab:{...report.lab, numIsolates: Math.max(0, Number(e.target.value||0))}})} /></FieldBlock>
              </div>

              {report.lab.isolates?.map((iso, idx)=> (
                <div key={idx} className="rounded-xl border p-3">
                  <div className="mb-3 text-sm font-medium">Isolate {idx+1}</div>
                  <div className="grid grid-cols-3 gap-3">
                    <FieldBlock label="Gram-stain">
                      <select className="w-full rounded-md border px-3 py-2" value={iso.gram} onChange={e=>{
                        const gram = e.target.value;
                        const isolates = [...report.lab.isolates];
                        isolates[idx] = { ...isolates[idx], gram, ast: { panel: defaultPanel(gram), rows: makeRowsForGram(gram) } };
                        setReport({ ...report, lab: { ...report.lab, isolates } });
                      }}>
                        {["Gram negative rod","Gram negative coccobacilli","Gram negative diplococci","Gram positive rod","Gram positive coccus in cluster","Gram positive short chain","Gram variable","Fungus"].map(g=> <option key={g}>{g}</option>)}
                      </select>
                    </FieldBlock>
                    <FieldBlock label="Organism name"><Input value={iso.species} onChange={e=>{
                      const isolates=[...report.lab.isolates]; isolates[idx] = { ...isolates[idx], species: e.target.value }; setReport({...report, lab:{...report.lab, isolates}});
                    }} placeholder="Klebsiella pneumoniae"/></FieldBlock>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-sm text-neutral-600">AST — {iso.gram}</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Antibiotic</TableHead>
                          <TableHead className="w-[20%]">S / I / R</TableHead>
                          <TableHead className="w-[20%]">MIC</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {iso.ast.rows.map((row, rIdx)=> (
                          <TableRow key={row.antibiotic}>
                            <TableCell>{row.antibiotic}</TableCell>
                            <TableCell>
                              <select className="w-full rounded-md border px-3 py-2" value={row.sir} onChange={e=>{
                                const isolates=[...report.lab.isolates];
                                const rows=[...isolates[idx].ast.rows]; rows[rIdx] = { ...rows[rIdx], sir: e.target.value };
                                isolates[idx] = { ...isolates[idx], ast: { ...isolates[idx].ast, rows } };
                                setReport({ ...report, lab: { ...report.lab, isolates } });
                              }}>
                                <option value="">—</option>
                                <option>S</option>
                                <option>I</option>
                                <option>R</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              <Input placeholder="e.g., 1" value={row.mic} onChange={e=>{
                                const isolates=[...report.lab.isolates];
                                const rows=[...isolates[idx].ast.rows]; rows[rIdx] = { ...rows[rIdx], mic: e.target.value };
                                isolates[idx] = { ...isolates[idx], ast: { ...isolates[idx].ast, rows } };
                                setReport({ ...report, lab: { ...report.lab, isolates } });
                              }} />
                            </TableCell>
                            <TableCell>
                              <Input placeholder="optional" onChange={()=>{}} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        {/* per-isolate AST handled above */}
      </Container>
    </Section>
  );
};

const ReportsList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  useEffect(()=>{
    loadReports(true).then(setReports).catch(()=>setReports([]));
    const onFocus = ()=> loadReports(true).then(setReports).catch(()=>{});
    const onVisibility = ()=>{ if(document.visibilityState==='visible') onFocus(); };
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return ()=>{
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('visibilitychange', onVisibility);
    };
  },[]);
  const [query, setQuery] = useState("");

  const norm = (s) => (s || "").toString().toLowerCase().trim();

  const filteredReports = useMemo(() => {
    const q = norm(query);
    if (!q) return reports;
    return reports.filter((r) => {
      const pid = norm(r?.patient?.patientId);
      const name = norm(r?.patient?.name);
      return pid.includes(q) || name.includes(q);
    });
  }, [reports, query]);
  function download(filename, blob){
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
  function toCsv(rows){
    const esc = v=>{
      if(v==null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
    };
    if(!rows.length) return '';
    const headers = Object.keys(rows[0]);
    return [headers.join(','), ...rows.map(r=> headers.map(h=>esc(r[h])).join(','))].join('\n');
  }
  async function exportJson(){
    const fresh = await loadReports(true);
    const data = JSON.stringify(fresh, null, 2);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    download(`pathoshare_reports_${ts}.json`, new Blob([data], { type: 'application/json;charset=utf-8' }));
  }
  async function exportCsv(){
    const reports = await loadReports(true);
    const reportRows = reports.map(r=>({
      id: r.id,
      createdAt: r.createdAt,
      patientId: r.patient?.patientId||'',
      name: r.patient?.name||'',
      age: r.patient?.age||'',
      sex: r.patient?.sex||'',
      specimenType: r.patient?.specimenType||'',
      collectionDate: r.patient?.collectionDate||'',
      cultureResult: r.lab?.cultureResult||'',
      numIsolates: r.lab?.numIsolates ?? (Array.isArray(r.lab?.isolates)? r.lab.isolates.length : 0),
      receivedDate: r.lab?.receivedDate||'',
    }));
    const isolateRows = reports.flatMap(r=> (Array.isArray(r.lab?.isolates)? r.lab.isolates: []).map((iso,idx)=>({
      reportId: r.id,
      isolateIndex: idx+1,
      gram: iso?.gram||'',
      species: iso?.species||'',
    })));
    const astRows = reports.flatMap(r=> (Array.isArray(r.lab?.isolates)? r.lab.isolates: []).flatMap((iso,idx)=> (iso?.ast?.rows||[])
      .filter(row=> (row?.sir||'').trim() !== '')
      .map(row=>({
        reportId: r.id,
        specimenId: r.patient?.patientId || '',
        specimenType: r.patient?.specimenType || '',
        organism: iso?.species || '',
        isolateIndex: idx+1,
        antibiotic: row.antibiotic,
        sir: row.sir||'',
        mic: row.mic||'',
      }))));
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM for Excel
    const files = [
      { name: 'reports.csv', content: toCsv(reportRows) },
      { name: 'isolates.csv', content: toCsv(isolateRows) },
      { name: 'ast.csv', content: toCsv(astRows) },
    ];
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    files.forEach(f=> download(`pathoshare_${ts}_${f.name}`, new Blob([bom, f.content], { type: 'text/csv;charset=utf-8;' })));
  }
  const importRef = useRef(null);
  function onImportJson(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(String(reader.result||'[]'));
        if(!Array.isArray(parsed)) throw new Error('Invalid file');
        saveReports(parsed);
        setReports(parsed);
        alert('Import successful');
      }catch(err){ alert('Import failed: '+err.message); }
      if(importRef.current) importRef.current.value = '';
    };
    reader.readAsText(file);
  }
  function getIsolates(r){
    const v = r?.lab?.isolates;
    return Array.isArray(v) ? v : [];
  }
  function summarizeGrams(r){
    const isolates = getIsolates(r);
    const counts = isolates.reduce((acc,i)=>{ const key = i?.gram || 'Unknown'; acc[key]=(acc[key]||0)+1; return acc;},{});
    return Object.entries(counts).map(([g,c])=> `${g} (${c})`).join(', ') || '—';
  }
  return (
    <Section>
      <Container>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reports</h2>

        {/* Right controls: keep your existing buttons; add search to the left of them */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Patient ID or Name"
            className="w-64 rounded-md border px-3 py-2 text-sm"
            aria-label="Search"
          />
          {getRole()==='editor' && (
            <>
              <Button size="sm" variant="secondary" onClick={exportJson} className="rounded-2xl">Export JSON</Button>
              <Button size="sm" variant="secondary" onClick={exportCsv} className="rounded-2xl">Export CSV</Button>
              <label className="inline-flex items-center">
                <input ref={importRef} type="file" accept="application/json" onChange={onImportJson} className="hidden" />
                <Button size="sm" variant="secondary" onClick={()=>importRef.current?.click()} className="rounded-2xl">Import JSON</Button>
              </label>
              <Link to="/reports/new"><Button size="sm" className="rounded-2xl">New</Button></Link>
            </>
          )}
        </div>
      </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Specimen</TableHead>
              <TableHead>Collection date</TableHead>
              <TableHead>Culture result</TableHead>
              <TableHead>Isolate types</TableHead>
              <TableHead>Gram staining</TableHead>
              <TableHead>Species</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map(r=> (
              <TableRow key={r?.id || Math.random()} className="hover:bg-neutral-50">
                <TableCell className="font-medium">{r?.patient?.patientId || '—'}</TableCell>
                <TableCell>{r?.patient?.name || '—'}</TableCell>
                <TableCell>{r?.patient?.age ? `${r?.patient?.age} ${r?.patient?.ageUnit||''}` : '—'}</TableCell>
                <TableCell>{r?.patient?.specimenType || '—'}</TableCell>
                <TableCell>{r?.patient?.collectionDate || '—'}</TableCell>
                <TableCell>{r?.lab?.cultureResult || '—'}</TableCell>
                <TableCell>{r?.lab?.cultureResult==='Positive' ? ((r?.lab?.numIsolates ?? getIsolates(r).length) || 0) : 0}</TableCell>
                <TableCell>{r?.lab?.cultureResult==='Positive' ? summarizeGrams(r) : '—'}</TableCell>
                <TableCell>{r?.lab?.cultureResult==='Positive' ? (getIsolates(r).map(i=>i?.species||'—').filter(Boolean).join(', ') || '—') : '—'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={()=>navigate(`/reports/${r?.id}`)}>Open</Button>
                    {getRole()==='editor' && (
                    <Button size="sm" onClick={()=>{
                      const ok = confirm('Delete this report?');
                      if(!ok) return;
                      deleteReport(r?.id).then(()=> loadReports().then(setReports));
                    }}>Delete</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </Section>
  );
};

function openPrintable(html){
  const w = window.open("", "_blank");
  if (!w) return;

  w.document.open();
  w.document.write(html);
  w.document.close();

  // Wait for the new document AND all <img> elements to load
  const onReady = () => {
    const imgs = Array.from(w.document.images || []);
    const waits = imgs.map(img =>
      img.complete ? Promise.resolve() :
      new Promise(res => { img.onload = img.onerror = res; })
    );
    Promise.all(waits).then(() => {
      w.focus();
      w.print();
    });
  };

  if (w.document.readyState === "complete") onReady();
  else w.addEventListener("load", onReady);
}
const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const pendingSaveRef = React.useRef(Promise.resolve());
  useEffect(()=>{
    setLoading(true);
    loadReports()
      .then(list=> setReport((list||[]).find(r=>r.id===id) || null))
      .finally(()=> setLoading(false));
  },[id]);

  if(loading){
    return (
      <Section>
        <Container>
          <p className="text-sm">Loading…</p>
        </Container>
      </Section>
    );
  }
  if(!report){
    return (
      <Section>
        <Container>
          <p className="text-sm">Report not found.</p>
          <Button variant="secondary" className="mt-4" onClick={()=>navigate('/reports')}>Back</Button>
        </Container>
      </Section>
    );
  }

  function exportPDF(){
    const reportingDate = new Date().toLocaleDateString(); // export time = Reporting Date
    const culture = report?.lab?.cultureResult || 'Pending';
    const isolates = Array.isArray(report?.lab?.isolates) ? report.lab.isolates : [];
    const positive = culture === 'Positive';
    const nIso = positive ? isolates.length : 0;
  
    // Decide template: negative, single positive, multiple positive
    const mode = !positive ? 'neg' : (nIso <= 1 ? 'pos1' : 'posN');
  
    // Fixed header text (from your samples)
    const headerLeftLogo  = '/images/icddrb.jpeg';
    const headerRightLogo = '/images/shishu.jpeg';
    const reviewerSign    = '/images/arpita.jpeg';
    const approverSign    = '/images/muntasir.jpeg';
  
    const protocolBlock = `
      <div style="font-size:12px; line-height:1.15; margin-top:4px;">
        <div><strong>Protocol Title:</strong> Profiling Neonatal Sepsis in Bangladesh: Insights into Prevalence, Microbial Burden, and Antimicrobial Resistance</div>
        <div><strong>Principal Investigator:</strong> Mohammad Monir Hossain</div>
        <div><strong>Protocol No:</strong> PR-24111 &nbsp;&nbsp; <strong>ERC Approval Date:</strong> 3 February 2025</div>
      </div>
    `;
  
    // Patient/Specimen block (Location & Phase intentionally omitted)
    const patientSpecimen = `
      <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">
        <tr>
          <th style="text-align:left; padding:6px; width:50%; background:#f6f6f6; border:1px solid #ddd;">Patient Information</th>
          <th style="text-align:left; padding:6px; width:50%; background:#f6f6f6; border:1px solid #ddd;">Specimen Information</th>
        </tr>
        <tr>
          <td style="vertical-align:top; border:1px solid #ddd; padding:8px;">
            <div><strong>Patient’s Name:</strong> ${report?.patient?.name || ''}</div>
            <div><strong>Case ID:</strong> ${report?.patient?.patientId || ''}</div>
            <div><strong>Age:</strong> ${[report?.patient?.age, report?.patient?.ageUnit].filter(Boolean).join(' ') || ''}</div>
            <div><strong>Sex:</strong> ${report?.patient?.sex || ''}</div>
          </td>
          <td style="vertical-align:top; border:1px solid #ddd; padding:8px;">
            <div><strong>Specimen Type:</strong> ${report?.patient?.specimenType || ''}</div>
            <div><strong>Collection Date:</strong> ${report?.patient?.collectionDate || ''}</div>
            <div><strong>Reporting Date:</strong> ${reportingDate}</div>
          </td>
        </tr>
      </table>
    `;
  
    // Result line(s)
    const resultNegative = `
      <p style="font-size:12px; margin-top:12px;">
        <strong>Results:</strong><br/>
        No organism isolated in aerobic condition at 35±2°C.
      </p>
    `;
  
    function isolateHeaderLine() {
      if (!positive || nIso === 0) return '';
      if (nIso === 1) {
        const iso = isolates[0] || {};
        const name = iso?.species || '';
        return `
          <p style="font-size:12px; margin-top:12px;">
            <strong>Results:</strong><br/>
            ${name ? `<i>${name}</i> ` : ''}isolated in aerobic condition at 35±2°C.
          </p>
        `;
      }
      // multiple
      // label a), b), c) as in your example for two organisms. 
      const labels = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const lines = isolates.map((iso, i) => {
        const name = iso?.species || '';
        return `${labels[i]}) <i>${name}</i>`;
      }).filter(Boolean);
      return `
        <p style="font-size:12px; margin-top:12px;">
          <strong>Results:</strong><br/>
          ${lines.join(' and ')} isolated in aerobic condition at 35±2°C.
        </p>
      `;
    }
  
    // Build ANTIBIOGRAM tables (only when positive & rows have S/I/R or MIC)
    function antibiogramTables(){
      if (!positive || nIso === 0) return '';
      const labels = 'abcdefghijklmnopqrstuvwxyz'.split('');
      return isolates.map((iso, idx) => {
        // keep only rows with any value set
        const rows = (iso?.ast?.rows || []).filter(r => (r?.sir || r?.mic || '').toString().trim() !== '');
        if (!rows.length) return '';
        const label = (nIso > 1) ? `<div style="margin-top:8px; font-weight:600;">${labels[idx]}</div>` : '';
        const head = `
          <div style="margin-top:8px; font-size:12px; font-weight:600;">
            ANTIBIOGRAM (S=Sensitive, R=Resistant, I=Intermediate)
          </div>
          <div style="margin:4px 0 6px 0; font-size:12px; font-weight:600;">
            Antibiotics Sensitivity Pattern of Isolates
          </div>
        `;
        const table = `
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr>
                <th style="text-align:left; padding:6px; background:#f6f6f6; border:1px solid #ddd;">Antibiotics</th>
                <th style="text-align:left; padding:6px; background:#f6f6f6; border:1px solid #ddd;">S/I/R</th>
                <th style="text-align:left; padding:6px; background:#f6f6f6; border:1px solid #ddd;">MIC</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(r=>`
                <tr>
                  <td style="border:1px solid #ddd; padding:6px;">${r.antibiotic || ''}</td>
                  <td style="border:1px solid #ddd; padding:6px;">${r.sir || ''}</td>
                  <td style="border:1px solid #ddd; padding:6px;">${r.mic || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        return `${label}${head}${table}`;
      }).join('<div style="height:10px;"></div>');
    }
  
    // Disclaimer + signatures (footer)
    const disclaimer = `
      <p style="font-size:11px; margin-top:14px;">
        <em>*Disclaimer:</em><br/>
        This report for research purpose only and is subjected to change based on further analysis or additional diagnostic information.
      </p>
    `;
  
    const signatures = `
      <table style="width:100%; border-collapse:collapse; margin-top:16px; font-size:12px;">
        <tr>
          <td style="width:50%; vertical-align:top; padding-right:12px;">
            <div style="height:60px;">
              <img src="${reviewerSign}" alt="Reviewed by signature" style="height:60px;"/>
            </div>
            <div style="border-top:1px solid #888; padding-top:6px; margin-top:4px;">
              <strong>Reviewed by</strong><br/>
              Arpita Shyama Deb, M.Sc<br/>
              Senior Research Officer,<br/>
              Virology laboratory<br/>
              Infectious Diseases Division,<br/>
              icddr,b
            </div>
          </td>
          <td style="width:50%; vertical-align:top; padding-left:12px;">
            <div style="height:60px;">
              <img src="${approverSign}" alt="Approved by signature" style="height:60px;"/>
            </div>
            <div style="border-top:1px solid #888; padding-top:6px; margin-top:4px;">
              <strong>Approved by</strong><br/>
              Muntasir Alam, PhD<br/>
              Assistant Scientist<br/>
              Virology laboratory<br/>
              Infectious Diseases Division,<br/>
              icddr,b
            </div>
          </td>
        </tr>
      </table>
    `;
  
    // Put everything together
    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Report ${report?.patient?.patientId || ''}</title>
        <style>
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial; padding: 20px; color: #111; }
          .hdr { display:flex; align-items:center; justify-content:space-between; }
          .hdr img { height: 52px; }
          h1 { font-size: 18px; margin: 8px 0 0 0; }
          .section-title { font-size: 14px; font-weight: 600; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="hdr">
          <img src="${headerLeftLogo}" alt="icddr,b logo"/>
          <img src="${headerRightLogo}" alt="Shishu logo"/>
        </div>
  
        ${protocolBlock}
  
        ${patientSpecimen}
  
        ${mode === 'neg' ? resultNegative : isolateHeaderLine()}
  
        ${mode !== 'neg' ? antibiogramTables() : ''}
  
        ${disclaimer}
  
        ${signatures}
      </body>
    </html>`;
  
    openPrintable(html);
  }
  
  function updateAndSave(updater){
    const updated = updater(report);
    setReport(updated);
    const p = updateReport(updated);
    pendingSaveRef.current = p;
    return p;
  }

  return (
    <Section>
      <Container>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Report — {report.patient.patientId||'Untitled'}</h2>
            <p className="text-neutral-600 text-sm">Created {new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>exportPDF()} className="rounded-2xl"><FileDown className="mr-2 size-4"/>Export PDF</Button>
            {getRole()==='editor' && (
            <Button variant="secondary" onClick={()=>{
               const ok = confirm('Delete this report?');
               if(!ok) return;
               deleteReport(report.id).then(()=> navigate('/reports'));
             }} className="rounded-2xl">Delete</Button>
            )}
            <Button onClick={async ()=>{ try{ await pendingSaveRef.current; }finally{ navigate('/reports'); } }} className="rounded-2xl">Close</Button>
          </div>
        </div>

        <Card className="rounded-2xl mb-6">
          <CardHeader><CardTitle>Patient</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FieldBlock label="Patient ID"><Input disabled={getRole()==='viewer'} value={report.patient.patientId} onChange={e=>updateAndSave(r=>({...r, patient:{...r.patient, patientId:e.target.value}}))} /></FieldBlock>
            <FieldBlock label="Name"><Input disabled={getRole()==='viewer'} value={report.patient.name} onChange={e=>updateAndSave(r=>({...r, patient:{...r.patient, name:e.target.value}}))} /></FieldBlock>
            <FieldBlock label="Age">
              <div className="grid grid-cols-2 gap-2">
                <Input disabled={getRole()==='viewer'} type="number" value={report.patient.age} onChange={e=>updateAndSave(r=>({...r, patient:{...r.patient, age:e.target.value}}))} />
                <select disabled={getRole()==='viewer'} className="w-full rounded-md border px-3 py-2" value={report.patient.ageUnit||'year'} onChange={e=>updateAndSave(r=>({...r, patient:{...r.patient, ageUnit:e.target.value}}))}>
                  {['hour(s)','day(s)','week(s)','month(s)','year(s)'].map(u=> <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </FieldBlock>
            <FieldBlock label="Sex">
              <select disabled={getRole()==='viewer'} className="w-full rounded-md border px-3 py-2" value={report.patient.sex} onChange={e=>updateAndSave(r=>({...r, patient:{...r.patient, sex:e.target.value}}))}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </FieldBlock>
            <FieldBlock label="Specimen"><Input disabled={getRole()==='viewer'} value={report.patient.specimenType} onChange={e=>updateAndSave(r=>({...r, patient:{...r.patient, specimenType:e.target.value}}))} /></FieldBlock>
            <FieldBlock label="Collection date"><Input disabled={getRole()==='viewer'} type="date" value={report.patient.collectionDate} onChange={e=>updateAndSave(r=>({...r, patient:{...r.patient, collectionDate:e.target.value}}))} /></FieldBlock>
          </CardContent>
        </Card>

        <Card className="rounded-2xl mb-6">
          <CardHeader><CardTitle>Lab</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FieldBlock label="Received date"><Input disabled={getRole()==='viewer'} type="date" value={report.lab.receivedDate} onChange={e=>updateAndSave(r=>({...r, lab:{...r.lab, receivedDate:e.target.value}}))} /></FieldBlock>
            <FieldBlock label="Culture">
              <select className="w-full rounded-md border px-3 py-2" value={report.lab.cultureResult} disabled={getRole()==='viewer'} onChange={e=>updateAndSave(r=>({...r, lab:{...r.lab, cultureResult:e.target.value}}))}>
                {["Pending","Negative","Positive"].map(s=> <option key={s}>{s}</option>)}
              </select>
            </FieldBlock>
            <FieldBlock label="Isolate types"><Input disabled={getRole()==='viewer'} type="number" value={report.lab.numIsolates} onChange={e=>updateAndSave(r=>{
              const num = Math.max(0, Number(e.target.value||0));
              const current = r.lab.isolates||[];
              let isolates = current.slice(0, num);
              while(isolates.length < num){
                const gram = "Gram-negative";
                isolates.push({ gram, species: "", ast: { panel: defaultPanel(gram), rows: makeRowsForGram(gram) } });
              }
              return { ...r, lab: { ...r.lab, numIsolates: num, isolates } };
            })} /></FieldBlock>
            </CardContent>
        </Card>

        {(report.lab?.isolates||[]).map((iso, idx)=> (
          <Card key={idx} className="rounded-2xl mb-6">
            <CardHeader><CardTitle>Isolate {idx+1}</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid md:grid-cols-3 gap-3">
                <FieldBlock label="Gram">
                  <select disabled={getRole()==='viewer'} className="w-full rounded-md border px-3 py-2" value={iso.gram} onChange={e=>updateAndSave(r=>{
                    const isolates=[...(r.lab.isolates||[])];
                    const gram = e.target.value;
                    isolates[idx] = { ...isolates[idx], gram, ast: { panel: defaultPanel(gram), rows: makeRowsForGram(gram) } };
                    return { ...r, lab: { ...r.lab, isolates } };
                  })}>
                    {["Gram negative rod","Gram negative coccobacilli","Gram negative diplococci","Gram positive rod","Gram positive coccus in cluster","Gram positive short chain","Gram variable","Fungus"].map(g=> <option key={g}>{g}</option>)}
                  </select>
                </FieldBlock>
                <FieldBlock label="Species"><Input disabled={getRole()==='viewer'} value={iso.species} onChange={e=>updateAndSave(r=>{
                  const isolates=[...(r.lab.isolates||[])]; isolates[idx] = { ...isolates[idx], species: e.target.value }; return { ...r, lab: { ...r.lab, isolates } };
                })} /></FieldBlock>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Antibiotic</TableHead>
                    <TableHead>S/I/R</TableHead>
                    <TableHead>MIC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(iso.ast?.rows||[]).map((row, rIdx)=> (
                    <TableRow key={row.antibiotic}>
                      <TableCell className="font-medium">{row.antibiotic}</TableCell>
                      <TableCell>
                        <select disabled={getRole()==='viewer'} className="w-full rounded-md border px-3 py-2" value={row.sir} onChange={e=>updateAndSave(r=>{
                          const isolates=[...(r.lab.isolates||[])];
                          const rows=[...(isolates[idx].ast?.rows||[])];
                          rows[rIdx] = { ...rows[rIdx], sir: e.target.value };
                          isolates[idx] = { ...isolates[idx], ast: { ...isolates[idx].ast, rows } };
                          return { ...r, lab: { ...r.lab, isolates } };
                        })}>
                          <option value="">—</option>
                          <option>S</option>
                          <option>I</option>
                          <option>R</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input disabled={getRole()==='viewer'} value={row.mic} placeholder="e.g., 0.25" onChange={e=>updateAndSave(r=>{
                          const isolates=[...(r.lab.isolates||[])];
                          const rows=[...(isolates[idx].ast?.rows||[])];
                          rows[rIdx] = { ...rows[rIdx], mic: e.target.value };
                          isolates[idx] = { ...isolates[idx], ast: { ...isolates[idx].ast, rows } };
                          return { ...r, lab: { ...r.lab, isolates } };
                        })} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </Container>
    </Section>
  );
};

const Summary = () => {
  const [reports, setReports] = useState([]);
  useEffect(()=>{ loadReports().then(setReports).catch(()=>setReports([])); },[]);
  const total = reports.length;
  const positives = reports.filter(r=>r.lab?.cultureResult==="Positive").length;
  const positivity = total? Math.round((positives/total)*100):0;
  const bySpecimen = Object.entries(reports.reduce((acc,r)=>{ const k=r.patient?.specimenType||'—'; acc[k]=(acc[k]||0)+1; return acc; },{})).map(([name,value])=>({name,value}));
  const byOrganism = Object.entries(reports.reduce((acc,r)=>{ const k=r.lab?.organism||'—'; acc[k]=(acc[k]||0)+1; return acc; },{})).map(([name,value])=>({name,value})).slice(0,8);

  return (
    <Section>
      <Container>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Summary statistics</h2>
          <p className="text-sm text-neutral-600">Calculated from saved reports in your browser.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl"><CardHeader><CardTitle>Totals</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-3">
            {[{k:"Reports",v:total},{k:"Positive",v:positives},{k:"% Pos",v:`${positivity}%`}].map(x=> (
              <div key={x.k} className="rounded-xl border p-3 text-center"><div className="text-2xl font-semibold">{x.v}</div><div className="text-xs text-neutral-600">{x.k}</div></div>
            ))}
          </CardContent></Card>

          <Card className="rounded-2xl"><CardHeader><CardTitle>By specimen</CardTitle></CardHeader><CardContent className="h-56">
            <ResponsiveContainer>
              <BarChart data={bySpecimen}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/>
                <YAxis allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>

          <Card className="rounded-2xl"><CardHeader><CardTitle>Top organisms</CardTitle></CardHeader><CardContent className="h-56">
            <ResponsiveContainer>
              <BarChart data={byOrganism}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/>
                <YAxis allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </div>
      </Container>
    </Section>
  );
};

const UserManual = () => (
  <Section>
    <Container>
      <div className="mb-6 max-w-2xl">
        <h2 className="text-2xl font-semibold flex items-center gap-2"><BookOpen className="size-5"/>User Manual</h2>
        <p className="text-neutral-600 text-sm">How to use the PathoShare in the field + lab workflow.</p>
      </div>
      <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-700">
        <li>Field: Open <em>New Report</em>, fill patient information & specimen type, save.</li>
        <li>Lab: Open the saved report, complete Gram/Culture/Organism, fill AST S/I/R and MIC.</li>
        <li>Click <em>Export PDF</em> for a shareable printout.</li>
        <li>Visit <em>Summary</em> for simple, live stats. All data are stored locally (browser).</li>
      </ol>
    </Container>
  </Section>
);

// ----------------- App -----------------
export default function App(){
  return (
    <div className="min-h-screen font-sans text-neutral-900">
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<RequireAuth><Home/></RequireAuth>} />
        <Route path="/reports" element={<RequireAuth><ReportsList/></RequireAuth>} />
        <Route path="/reports/new" element={<RequireAuth><NewReport/></RequireAuth>} />
        <Route path="/reports/:id" element={<RequireAuth><ReportDetail/></RequireAuth>} />
        <Route path="/summary" element={<RequireAuth><Summary/></RequireAuth>} />
        <Route path="/docs" element={<RequireAuth><UserManual/></RequireAuth>} />
      </Routes>
      <Footer />
    </div>
  );
}
