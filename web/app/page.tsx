"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import PageCurtain, { type PageCurtainPhase } from "./PageCurtain";
import {
  ArrowRight, ArrowUpRight, CalendarDays, CarFront, Check, CheckCircle2,
  ChevronLeft, ChevronRight, Clock3, ClipboardCheck, Eye, EyeOff, Gauge,
  GitBranch, Layers3, LockKeyhole, MapPin, Menu, Moon, PackageCheck,
  Plus, ShieldCheck, Sparkles, Sun, TrendingUp, Users2, Wrench, X, Zap,
  Settings2, LogOut, Search, Activity, BadgeCheck, CircleHelp,
} from "lucide-react";

// Local development uses the Express port. On Vercel, /api stays on the same origin.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "")).replace(/\/$/, "");
const SHOW_DEMO = process.env.NODE_ENV === "development";
const DEMO_PASSWORD = "Demo@12345";
const DEMO_ROLES = [
  { role: "Customer", email: "customer@bayflow.demo", label: "Book and track repairs" },
  { role: "Owner", email: "owner@bayflow.demo", label: "Manage garages & teams" },
  { role: "Service Advisor", email: "advisor@bayflow.demo", label: "Coordinate the workflow" },
  { role: "Technician", email: "technician@bayflow.demo", label: "Inspect and repair" },
  { role: "Parts Person", email: "parts@bayflow.demo", label: "Manage parts & stock" },
  { role: "QC Inspector", email: "qc@bayflow.demo", label: "Verify repair quality" },
];
const STAGES = [
  "PENDING", "CONFIRMED", "ASSIGNED", "INSPECTING", "ESTIMATE_REVIEW",
  "AWAITING_CUSTOMER", "ESTIMATE_APPROVED", "PARTS_PENDING", "PARTS_ORDERED",
  "PARTS_READY", "IN_REPAIR", "QC_PENDING", "QC_IN_PROGRESS",
  "READY_FOR_PICKUP", "COMPLETED",
];
const FEATURES = [
  { icon: CalendarDays, title: "Effortless booking", text: "Reserve the right service and appointment slot in a few clicks.", code: "01" },
  { icon: GitBranch, title: "Connected workflows", text: "Keep advisors, technicians and customers in perfect sync.", code: "02" },
  { icon: ShieldCheck, title: "Quality, verified", text: "Independent inspections and an accountable rework loop.", code: "03" },
  { icon: PackageCheck, title: "Smarter inventory", text: "Know what is in stock, what is ordered and what is allocated.", code: "04" },
  { icon: Users2, title: "Purpose-built roles", text: "A tailored workspace for every person in the service journey.", code: "05" },
  { icon: TrendingUp, title: "Actionable insights", text: "A clear view of throughput, active jobs and workshop revenue.", code: "06" },
];
const pretty = (value: string) => String(value || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (a) => a.toUpperCase());
const money = (n: number) => `PKR ${Number(n || 0).toLocaleString()}`;
const initialVehicle = { plate: "", make: "", model: "", year: "2022", color: "", mileage: "" };

async function api(path: string, method = "GET", body?: unknown) {
  const token = typeof window === "undefined" ? null : localStorage.getItem("bayflow-token");
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method, cache: "no-store",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error(`API unreachable. Check ${API_BASE || "this website"}/api/health and confirm the Express backend is running.`);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `API request failed (${res.status})`);
  return data;
}

const entrance = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div className={className} variants={entrance} initial="hidden" whileInView="show"
      viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
function IconButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return <motion.button aria-label={title} title={title} className="bf-icon-btn" whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.94 }} onClick={onClick}>{children}</motion.button>;
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [view, setView] = useState("home");
  const [curtainPhase, setCurtainPhase] = useState<PageCurtainPhase>("idle");
  const navigatingRef = useRef(false);
  const navigationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prefersReducedMotion = useReducedMotion();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [services, setServices] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [shopId, setShopId] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [demoRole, setDemoRole] = useState("Customer");
  const [afterLogin, setAfterLogin] = useState("dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<any>({});
  const [query, setQuery] = useState("");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const loadShops = useCallback(async () => {
    try { setShops(await api("/shops")); }
    catch (e: any) { setError(e.message); }
  }, []);
  const loadUser = useCallback(async () => {
    try {
      const d = await api("/me");
      setAccount(d.user);
      setMemberships(d.memberships || []);
      setShopId((s) => s || d.memberships?.[0]?.shopId || "");
    } catch { localStorage.removeItem("bayflow-token"); setAccount(null); }
  }, []);
  const loadBookings = useCallback(async (id: string) => {
    try {
      setBookings(await api("/bookings"));
      setAnalytics(id ? await api(`/analytics/${id}`).catch(() => null) : null);
    } catch (e: any) { setError(e.message); }
  }, []);
  const loadBooking = async (id: string) => {
    try { setCurrentBooking(await api(`/bookings/${id}`)); setForm({}); navigate("booking"); }
    catch (e: any) { setError(e.message); }
  };

  useEffect(() => {
    setDark(localStorage.getItem("bayflow-theme") !== "light");
    loadShops();
    if (localStorage.getItem("bayflow-token")) loadUser();
  }, [loadShops, loadUser]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("bayflow-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => { if (account) loadBookings(shopId); }, [account, shopId, loadBookings]);
  useEffect(() => {
    return () => {
      navigationTimers.current.forEach(clearTimeout);
    };
  }, []);

  function navigate(next: string) {
    setMobileMenu(false);
    if (navigatingRef.current || next === view) return;

    setError("");
    if (prefersReducedMotion) {
      setView(next);
      window.scrollTo(0, 0);
      return;
    }

    navigatingRef.current = true;
    setCurtainPhase("cover");

    // Wait until all mosaic tiles have covered the current screen.
    navigationTimers.current.push(setTimeout(() => {
      setView(next);
      window.scrollTo(0, 0);
      // Allow AnimatePresence to mount the next view underneath the curtain.
      navigationTimers.current.push(setTimeout(() => {
        setCurtainPhase("reveal");
      }, 260));
    }, 980));

    navigationTimers.current.push(setTimeout(() => {
      setCurtainPhase("idle");
      navigatingRef.current = false;
      navigationTimers.current = [];
    }, 2260));
  }
  async function run(fn: () => Promise<void>) {
    setBusy(true); setError(""); setSuccess("");
    try { await fn(); } catch (e: any) { setError(e.message || "Something went wrong"); }
    finally { setBusy(false); }
  }
  function chooseShop(shop: any) {
    setSelectedShop(shop); setServices([]); setSlot(""); setStep(1);
    navigate("reserve");
  }
  function selectDemo(role: typeof DEMO_ROLES[number]) {
    setDemoRole(role.role); setEmail(role.email); setPassword(DEMO_PASSWORD); setAuthMode("login");
  }
  async function submitAuth() {
    await run(async () => {
      if (authMode === "register") {
        await api("/register", "POST", { name, email, password });
        setAuthMode("login"); setSuccess("Account created. You can now sign in."); return;
      }
      const data = await api("/login", "POST", { email, password });
      localStorage.setItem("bayflow-token", data.token);
      setAccount(data.user); setMemberships(data.memberships || []);
      setShopId(data.memberships?.[0]?.shopId || "");
      navigate(afterLogin); setAfterLogin("dashboard");
    });
  }
  async function submitBooking() {
    if (!account) { setAfterLogin("reserve"); navigate("auth"); return; }
    await run(async () => {
      const created = await api("/bookings", "POST", {
        shopId: selectedShop.id, serviceIds: services, slotId: slot, vehicle, notes,
      });
      await loadShops(); await loadBookings(shopId);
      setCurrentBooking(await api(`/bookings/${created.id}`));
      navigate("booking"); setSuccess("Your appointment request was created.");
    });
  }
  async function action(actionName: string, extra: any = {}) {
    if (!currentBooking) return;
    await run(async () => {
      await api(`/bookings/${currentBooking.id}/action`, "POST", { action: actionName, ...extra });
      setCurrentBooking(await api(`/bookings/${currentBooking.id}`));
      setForm({}); await loadBookings(shopId);
      setSuccess("Booking updated successfully.");
    });
  }
  function logout() {
    localStorage.removeItem("bayflow-token"); setAccount(null);
    setMemberships([]); setBookings([]); navigate("home");
  }
  const role = memberships.find((m) => m.shopId === shopId)?.role || "customer";
  const activeShop = shops.find((s) => s.id === shopId);
  const visibleShops = shops.filter((s) => `${s.name} ${s.address} ${s.description}`.toLowerCase().includes(query.toLowerCase()));
  const activeCount = bookings.filter((b) => !["COMPLETED", "CANCELLED"].includes(b.status)).length;
  const finishedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const btn = (text: string, actionName: string, extra: any = {}) => <button className="bf-btn bf-primary" disabled={busy} onClick={() => action(actionName, extra)}>{text}<ArrowUpRight size={17} /></button>;

  return (
    <MotionConfig reducedMotion="user">
      <div className="bf-app">
        <PageCurtain phase={curtainPhase} />
        <motion.div className="bf-scroll-progress" style={{ scaleX }} />
        <div className="bf-mesh" aria-hidden="true" />
        <div className="bf-announcement"><span className="bf-live-dot" /> THE NEW STANDARD IN AUTOMOTIVE CARE <span className="bf-hide-mobile">— ONE CONNECTED EXPERIENCE</span><ArrowUpRight size={13} /></div>
        <header className="bf-header bf-container">
          <button className="bf-logo" onClick={() => navigate("home")} aria-label="BayFlow home"><span className="bf-logo-icon"><Layers3 size={25} /></span><span>bay<span className="bf-logo-accent">flow</span><small>THE AUTO SERVICE PLATFORM</small></span></button>
          <nav className={`bf-nav ${mobileMenu ? "bf-nav-open" : ""}`} aria-label="Main navigation">
            {[{ title: "Home", page: "home" }, { title: "Find a garage", page: "shops" }, { title: "Platform", page: "features" }, ...(account ? [{ title: "Dashboard", page: "dashboard" }] : [])].map((n) => <button className={view === n.page ? "bf-nav-active" : ""} key={n.page} onClick={() => navigate(n.page)}>{n.title}</button>)}
          </nav>
          <div className="bf-header-actions">
            <IconButton title="Toggle theme" onClick={() => setDark((v) => !v)}>{dark ? <Sun size={19} /> : <Moon size={19} />}</IconButton>
            {account ? <button className="bf-btn bf-outline bf-signin" onClick={logout}>Sign out <LogOut size={16} /></button> : <button className="bf-btn bf-outline bf-signin" onClick={() => navigate("auth")}>Sign in <ArrowUpRight size={16} /></button>}
            <IconButton title="Toggle navigation" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={19} /> : <Menu size={19} />}</IconButton>
          </div>
        </header>

        <AnimatePresence>
          {(error || success) && <motion.div key={error ? "error" : "success"} className={`bf-toast ${error ? "bf-error" : "bf-success"}`} role="status" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}><span>{error || success}</span><button onClick={() => { setError(""); setSuccess(""); }} aria-label="Dismiss"><X size={17} /></button></motion.div>}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.28 }}>

            {view === "home" && <>
              <section className="bf-hero bf-container">
                <div className="bf-hero-copy">
                  <motion.div className="bf-eyebrow bf-pill" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}><span className="bf-live-dot" /> THE OPERATING SYSTEM FOR MODERN GARAGES <ArrowUpRight size={15} /></motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 55 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}>Every repair,<br /><span className="bf-gradient-text">reimagined.</span></motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }}>One beautiful service journey connecting drivers, garages and teams — from the first appointment to the final quality check.</motion.p>
                  <motion.div className="bf-hero-buttons" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}><motion.button whileHover={{ y: -4, scale: 1.025 }} whileTap={{ scale: 0.97 }} className="bf-btn bf-primary bf-large" onClick={() => navigate("shops")}>Book your service <ArrowUpRight size={18} /></motion.button><button className="bf-btn bf-quiet bf-large" onClick={() => navigate("features")}>Explore the platform <ArrowRight size={18} /></button></motion.div>
                  <div className="bf-trust"><div className="bf-avatars"><span>AZ</span><span>MK</span><span>SA</span></div><div><strong>Built for workshops that care</strong><small>Transparent service. Clear ownership. Less friction.</small></div></div>
                </div>
                <motion.div className="bf-hero-art" initial={{ opacity: 0, rotateY: -16, x: 50 }} animate={{ opacity: 1, rotateY: -7, x: 0 }} transition={{ duration: 1, delay: 0.35 }}>
                  <div className="bf-radar" />
                  <motion.div className="bf-visual-panel" animate={{ y: [0, -9, 0] }} transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}>
                    <div className="bf-visual-top"><span>● &nbsp; ● &nbsp; ●</span><span>WORKSHOP OVERVIEW</span><span className="bf-green">● Live</span></div>
                    <div className="bf-visual-body"><span className="bf-eyebrow">WORKSHOP INTELLIGENCE</span><h3>Your workflow.<br />Beautifully in sync.</h3><div className="bf-visual-kpis"><div><small>Active jobs</small><strong>24<span>↗</span></strong></div><div><small>Completed</small><strong>86<span>↗</span></strong></div></div><div className="bf-chart">{[38, 56, 46, 70, 59, 88, 75, 100, 83].map((h, i) => <motion.i key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.85 + i * 0.07, duration: 0.65 }} />)}</div><div className="bf-visual-complete"><CheckCircle2 size={17} /> Quality check passed <span>JUST NOW</span></div></div>
                  </motion.div>
                  <motion.div className="bf-floating bf-float-one" animate={{ y: [0, -13, 0] }} transition={{ repeat: Infinity, duration: 6 }}><span className="bf-float-icon"><Wrench size={20} /></span><div><strong>Repair in progress</strong><small>Honda Civic · Job #2048</small></div><b>ACTIVE</b></motion.div>
                  <motion.div className="bf-floating bf-float-two" animate={{ y: [0, 11, 0] }} transition={{ repeat: Infinity, duration: 7 }}><span className="bf-float-icon bf-float-green"><ShieldCheck size={20} /></span><div><strong>Quality approved</strong><small>Ready for collection</small></div><CheckCircle2 className="bf-green" size={20} /></motion.div>
                </motion.div>
              </section>
              <Reveal className="bf-container bf-trustbar"><span>ONE SEAMLESS WORKFLOW</span><b>01 / Discover & book</b><i /><b>02 / Inspect & approve</b><i /><b>03 / Repair & verify</b></Reveal>
              <div className="bf-container bf-statstrip">{[["06", "Dedicated user roles"], ["01", "Connected platform"], ["24/7", "Online booking access"], ["360°", "Service journey visibility"]].map(([n, t], i) => <Reveal key={n} delay={i * 0.08}><strong>{n}</strong><span>{t}</span></Reveal>)}</div>
              <section className="bf-container bf-section"><Reveal className="bf-section-heading"><div><span className="bf-eyebrow">WHY BAYFLOW / 01</span><h2>One platform.<br /><span className="bf-muted">Every moving part.</span></h2></div><p>No scattered spreadsheets. No lost handovers. Just a connected service experience designed around real workflows.</p></Reveal><div className="bf-feature-grid">{FEATURES.map((f, i) => <Reveal key={f.title} delay={i * 0.06}><motion.div whileHover={{ y: -9 }} className="bf-feature-card"><span className="bf-feature-icon"><f.icon size={25} /></span><small>{f.code}</small><h3>{f.title}</h3><p>{f.text}</p><ArrowUpRight className="bf-feature-arrow" size={20} /></motion.div></Reveal>)}</div></section>
              <section className="bf-container bf-section bf-process"><Reveal><span className="bf-eyebrow">THE EXPERIENCE / 02</span><h2>From appointment<br />to <span className="bf-gradient-text">all clear.</span></h2><p>Every team member knows the next step. Every customer stays in the loop.</p><button onClick={() => navigate("shops")} className="bf-btn bf-primary">Start a booking <ArrowRight size={17} /></button></Reveal><div className="bf-process-list">{[["01", "Discover & book", "Choose the garage, service and time that work for you."], ["02", "Inspect & approve", "Review the itemized estimate before any work begins."], ["03", "Repair & verify", "Track repairs, parts allocation and independent QC."], ["04", "Collect with confidence", "A transparent record from arrival to pickup."]].map(([n, t, d], i) => <Reveal key={n} delay={i * 0.08} className="bf-process-row"><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div><CheckCircle2 size={22} /></Reveal>)}</div></section>
              <Reveal className="bf-container bf-cta"><span className="bf-eyebrow">BUILT TO MOVE YOU FORWARD</span><h2>Your workshop deserves<br />a better <em>way to work.</em></h2><p>Smarter bookings, simpler operations and better service outcomes — all in one place.</p><motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="bf-btn bf-cta-btn" onClick={() => navigate("shops")}>Explore garages <ArrowUpRight size={18} /></motion.button></Reveal>
            </>}

            {view === "features" && <section className="bf-container bf-section bf-page"><Reveal><span className="bf-eyebrow">THE BAYFLOW PLATFORM</span><h1 className="bf-page-title">Designed to move<br /><span className="bf-gradient-text">every team forward.</span></h1><p className="bf-lead">Six connected capabilities. One seamless automotive service experience.</p></Reveal><div className="bf-feature-grid">{FEATURES.map((f, i) => <Reveal key={f.title} delay={i * 0.07}><motion.div whileHover={{ y: -8 }} className="bf-feature-card"><span className="bf-feature-icon"><f.icon size={26} /></span><small>{f.code}</small><h3>{f.title}</h3><p>{f.text}</p></motion.div></Reveal>)}</div><Reveal className="bf-callout"><p>Ready to bring clarity to your next service appointment?</p><button className="bf-btn bf-primary" onClick={() => navigate("shops")}>Find a garage <ArrowRight size={17} /></button></Reveal></section>}

            {view === "shops" && <section className="bf-container bf-section bf-page"><Reveal><span className="bf-eyebrow">01 / DISCOVER</span><h1 className="bf-page-title">Find your <span className="bf-gradient-text">perfect garage.</span></h1><p className="bf-lead">Explore service centers, compare expertise and reserve an available slot.</p></Reveal><div className="bf-search"><Search size={19} /><input aria-label="Search garages" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by garage, location or service..." /><span>{visibleShops.length} GARAGES</span></div><div className="bf-shop-grid">{visibleShops.map((s, i) => <Reveal key={s.id} delay={i * 0.08}><motion.article whileHover={{ y: -7 }} className="bf-shop-card"><div className={`bf-shop-cover bf-shop-cover-${i % 3}`}><span>{s.initials || s.name.slice(0, 2)}</span><b><span className="bf-live-dot" /> ACCEPTING BOOKINGS</b></div><div className="bf-shop-content"><span className="bf-eyebrow">PREMIUM AUTOMOTIVE SERVICE</span><h3>{s.name}</h3><p>{s.description}</p><div className="bf-shop-tags">{(s.services || []).slice(0, 3).map((srv: any) => <span key={srv.id}>{srv.name}</span>)}</div><div className="bf-shop-meta"><span><MapPin size={16} /> {s.address}</span><span><Clock3 size={16} /> {s.hours}</span></div><button className="bf-btn bf-primary bf-full" onClick={() => chooseShop(s)}>Book appointment <ArrowUpRight size={18} /></button></div></motion.article></Reveal>)}</div>{!visibleShops.length && <div className="bf-empty"><Search size={30} /><h3>No garages found</h3><p>Try another search, or verify that the backend `/api/shops` is available.</p></div>}</section>}

            {view === "reserve" && selectedShop && <section className="bf-container bf-section bf-page bf-narrow"><span className="bf-eyebrow">02 / YOUR APPOINTMENT</span><h1 className="bf-page-title">Make it <span className="bf-gradient-text">official.</span></h1><p className="bf-lead">{selectedShop.name} · {selectedShop.address}</p><div className="bf-wizard-progress">{["Services", "Time slot", "Vehicle", "Review"].map((title, i) => <div className={i + 1 <= step ? "bf-step-active" : ""} key={title}><span>{i + 1}</span><b>{title}</b></div>)}</div><div className="bf-panel bf-wizard"><AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.25 }}>
              {step === 1 && <><h2>What can we help with?</h2><p className="bf-muted">Choose one or more services.</p><div className="bf-options">{(selectedShop.services || []).map((s: any) => <motion.button whileTap={{ scale: 0.98 }} className={`bf-option ${services.includes(s.id) ? "bf-option-active" : ""}`} key={s.id} onClick={() => setServices((p) => p.includes(s.id) ? p.filter((id) => id !== s.id) : [...p, s.id])}><span><Wrench size={19} /> {s.name}</span><span>{money(s.price)} <CheckCircle2 size={18} /></span></motion.button>)}</div></>}
              {step === 2 && <><h2>Choose your appointment</h2><p className="bf-muted">Select an available service time.</p><div className="bf-slot-grid">{(selectedShop.slots || []).slice(0, 48).map((s: any) => <button className={`bf-slot ${slot === s.id ? "bf-option-active" : ""}`} key={s.id} onClick={() => setSlot(s.id)}><CalendarDays size={19} /><strong>{s.date}</strong><span>{s.time}</span><small>{s.remaining} available</small></button>)}</div>{!(selectedShop.slots || []).length && <p className="bf-note">No available slots. Check back later.</p>}</>}
              {step === 3 && <><h2>Your vehicle details</h2><div className="bf-form-grid">{(["plate", "make", "model", "year", "color", "mileage"] as const).map((k) => <label key={k}>{pretty(k)}<input value={vehicle[k]} onChange={(e) => setVehicle((v) => ({ ...v, [k]: e.target.value }))} placeholder={{ plate: "LEA-1234", make: "Honda", model: "Civic", year: "2022", color: "Silver", mileage: "35000" }[k]} /></label>)}<label className="bf-wide">Describe the issue (optional)<textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tell us what you've noticed..." /></label></div></>}
              {step === 4 && <><h2>Review your appointment</h2><div className="bf-review">{[["Garage", selectedShop.name], ["Services", selectedShop.services.filter((s: any) => services.includes(s.id)).map((s: any) => s.name).join(", ")], ["Time", (selectedShop.slots.find((s: any) => s.id === slot)?.date || "") + " · " + (selectedShop.slots.find((s: any) => s.id === slot)?.time || "")], ["Vehicle", `${vehicle.year} ${vehicle.make} ${vehicle.model} · ${vehicle.plate}`]].map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div><div className="bf-note">Your request is reviewed by the service team before confirmation.</div></>}
              </motion.div></AnimatePresence><div className="bf-wizard-actions">{step > 1 && <button className="bf-btn bf-outline" onClick={() => setStep(step - 1)}><ChevronLeft size={16} /> Back</button>}<button className="bf-btn bf-primary" disabled={busy || (step === 1 && !services.length) || (step === 2 && !slot) || (step === 3 && (!vehicle.plate || !vehicle.make || !vehicle.model || !vehicle.year))} onClick={() => step < 4 ? setStep(step + 1) : submitBooking()}>{step === 4 ? account ? "Confirm booking" : "Sign in to continue" : "Continue"}<ChevronRight size={17} /></button></div></div></section>}

            {view === "auth" && <section className="bf-container bf-auth-page"><Reveal className="bf-auth-card"><div className="bf-auth-card-heading"><span className="bf-eyebrow">WELCOME TO BAYFLOW</span><h1>{authMode === "login" ? "Welcome back." : "Create your account."}</h1><p>{authMode === "login" ? "Your garage experience is just one sign-in away." : "Join a smarter way to book and track service."}</p></div><form onSubmit={(e) => { e.preventDefault(); submitAuth(); }}>{authMode === "register" && <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></label>}<label>Email address<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<div className="bf-password-field"><input required minLength={authMode === "register" ? 8 : undefined} type={showPassword ? "text" : "password"} autoComplete={authMode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label><button className="bf-btn bf-primary bf-full" disabled={busy} type="submit">{busy ? "Please wait..." : authMode === "login" ? "Sign in to BayFlow" : "Create account"}<ArrowRight size={18} /></button></form><p className="bf-auth-switch">{authMode === "login" ? "New to BayFlow?" : "Already have an account?"}<button onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Create an account" : "Sign in"}</button></p>
              {SHOW_DEMO && <div className="bf-demo"><div className="bf-demo-head"><span className="bf-demo-head-icon"><Sparkles size={18} /></span><div><strong>Explore demo workspaces</strong><small>Choose a role to fill its demo credentials.</small></div><span className="bf-demo-badge">LOCAL DEMO</span></div><div className="bf-demo-grid">{DEMO_ROLES.map((r) => <button type="button" className={`bf-demo-role ${demoRole === r.role ? "bf-demo-selected" : ""}`} key={r.role} onClick={() => selectDemo(r)}><span>{r.role}</span>{demoRole === r.role && <Check size={16} />}</button>)}</div><div className="bf-demo-note"><LockKeyhole size={15} /><span>Demo accounts must be seeded locally. Never use this password for a production account.</span></div></div>}
              </Reveal><Reveal delay={0.15} className="bf-auth-visual"><div className="bf-auth-visual-inner"><span className="bf-eyebrow">BEAUTIFULLY CONNECTED</span><motion.div className="bf-auth-car" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 6 }}><CarFront size={105} strokeWidth={1.1} /></motion.div><h2>Every booking.<br />Every approval.<br /><span className="bf-gradient-text">Every repair.</span></h2><p>A smarter automotive experience built for the people who keep things moving.</p><div className="bf-auth-benefits"><span><CheckCircle2 size={16} /> Transparent status tracking</span><span><CheckCircle2 size={16} /> Role-based workflows</span><span><CheckCircle2 size={16} /> Independent quality checks</span></div></div></Reveal></section>}

            {view === "dashboard" && account && <section className="bf-container bf-section bf-page"><div className="bf-dash-top"><div><span className="bf-eyebrow">YOUR WORKSPACE</span><h1 className="bf-page-title">Good day, <span className="bf-gradient-text">{account.name.split(" ")[0]}.</span></h1><p className="bf-lead">Everything important, clearly in view.</p></div>{memberships.length > 0 && <select aria-label="Choose garage" className="bf-shop-select" value={shopId} onChange={(e) => setShopId(e.target.value)}>{shops.filter((s) => memberships.some((m) => m.shopId === s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}</div>{memberships.length > 0 && <div className="bf-role-tag"><Settings2 size={17} /> {pretty(role)} workspace · {activeShop?.name}</div>}<div className="bf-dash-cards">{[[ClipboardCheck, "Accessible bookings", bookings.length], [Activity, "Active jobs", activeCount], [BadgeCheck, "Completed", finishedCount], [TrendingUp, "Revenue", money(analytics?.revenue || 0)]].map(([Icon, label, value]: any, i) => <Reveal key={label} delay={i * 0.06}><div className="bf-dash-card"><span><Icon size={20} /> {label}</span><strong>{value}</strong><small>Based on your accessible records</small></div></Reveal>)}</div><div className="bf-panel bf-jobs"><div className="bf-panel-head"><div><span className="bf-eyebrow">SERVICE OPERATIONS</span><h2>{memberships.length ? "Workshop bookings" : "My appointments"}</h2></div><button className="bf-btn bf-outline" onClick={() => navigate("shops")}>New booking <Plus size={17} /></button></div><div className="bf-table"><div className="bf-table-header"><span>REFERENCE / VEHICLE</span><span>GARAGE</span><span>STATUS</span><span>VIEW</span></div>{bookings.map((b: any) => <motion.button whileHover={{ x: 4 }} className="bf-table-row" key={b.id} onClick={() => loadBooking(b.id)}><span><strong>{b.reference}</strong><small>{b.vehicle.make} {b.vehicle.model} · {b.vehicle.plate}</small></span><span>{b.shop?.name || "Workshop"}</span><span><b className="bf-status">{pretty(b.status)}</b></span><ArrowUpRight size={19} /></motion.button>)}</div>{!bookings.length && <div className="bf-empty"><CarFront size={34} /><h3>Nothing in your queue yet.</h3><p>Your upcoming bookings will appear here.</p></div>}</div>
              {role === "owner" && <div className="bf-panel bf-admin"><div className="bf-panel-head"><div><span className="bf-eyebrow">SHOP MANAGEMENT</span><h2>Grow your operation</h2></div></div><div className="bf-two-cols"><div><h3>Add a garage</h3><div className="bf-form-grid"><label>Garage name<input value={form.newShopName || ""} onChange={(e) => setForm({ ...form, newShopName: e.target.value })} /></label><label>Address<input value={form.newShopAddress || ""} onChange={(e) => setForm({ ...form, newShopAddress: e.target.value })} /></label></div><button className="bf-btn bf-primary" disabled={busy} onClick={() => run(async () => { await api("/shops", "POST", { name: form.newShopName, address: form.newShopAddress }); await loadShops(); await loadUser(); setSuccess("Garage created."); })}>Create garage <Plus size={17} /></button></div><div><h3>Add a team member</h3><div className="bf-form-grid"><label>Name<input value={form.staffName || ""} onChange={(e) => setForm({ ...form, staffName: e.target.value })} /></label><label>Email<input type="email" value={form.staffEmail || ""} onChange={(e) => setForm({ ...form, staffEmail: e.target.value })} /></label><label>Password<input type="password" value={form.staffPass || ""} onChange={(e) => setForm({ ...form, staffPass: e.target.value })} /></label><label>Role<select value={form.staffRole || "advisor"} onChange={(e) => setForm({ ...form, staffRole: e.target.value })}>{["advisor", "technician", "qc", "parts"].map((r) => <option key={r} value={r}>{pretty(r)}</option>)}</select></label></div><button className="bf-btn bf-primary" disabled={busy || !shopId} onClick={() => run(async () => { await api(`/staff/${shopId}`, "POST", { name: form.staffName, email: form.staffEmail, password: form.staffPass, role: form.staffRole || "advisor" }); setForm({}); setSuccess("Team member created."); })}>Add team member <Plus size={17} /></button></div></div></div>}
              {(role === "owner" || role === "parts") && <Inventory shopId={shopId} />}
            </section>}

            {view === "booking" && currentBooking && <section className="bf-container bf-section bf-page"><button className="bf-back" onClick={() => navigate("dashboard")}><ChevronLeft size={17} /> Back to dashboard</button><div className="bf-booking-head"><div><span className="bf-eyebrow">SERVICE JOB / {currentBooking.reference}</span><h1 className="bf-page-title">{currentBooking.vehicle.make} <span className="bf-gradient-text">{currentBooking.vehicle.model}</span></h1><p className="bf-lead">{currentBooking.vehicle.plate} · {currentBooking.vehicle.year} · {currentBooking.shop?.name}</p></div><b className="bf-status">{pretty(currentBooking.status)}</b></div><div className="bf-detail-grid"><div><div className="bf-panel"><div className="bf-panel-head"><h2>Service journey</h2><ClipboardCheck size={22} /></div><div className="bf-stage-grid">{STAGES.map((s, i) => <div key={s} className={STAGES.indexOf(currentBooking.status) >= i ? "bf-stage-done" : ""}><span>{i + 1}</span>{pretty(s)}</div>)}</div>{currentBooking.status === "ESTIMATE_REJECTED" && <div className="bf-note">Estimate rejected — a revised estimate can be submitted.</div>}</div><div className="bf-panel"><h2>Itemized estimate</h2>{currentBooking.estimate?.length ? <><div className="bf-estimate-list">{currentBooking.estimate.map((x: any) => <div key={x.id}><span><strong>{x.name}</strong><small>{pretty(x.type)} · Qty {x.qty}</small></span><b>{money(x.qty * x.price)}</b></div>)}</div><div className="bf-estimate-total"><span>Total estimate</span><strong>{money(currentBooking.estimate.reduce((t: number, i: any) => t + i.qty * i.price, 0))}</strong></div></> : <p className="bf-muted">An itemized estimate will appear after inspection.</p>}</div><div className="bf-panel"><h2>Activity history</h2><div className="bf-activity-list">{currentBooking.audit?.slice().reverse().map((a: any) => <div key={a.id}><span className="bf-activity-dot"/><div><strong>{pretty(a.action)}</strong><small>{a.detail || "Status updated"} · {new Date(a.at).toLocaleString()}</small></div></div>)}</div></div></div><div><div className="bf-panel"><span className="bf-eyebrow">NEXT STEP</span><h2>Move the job forward</h2><p className="bf-muted">Available actions depend on your role and the current stage.</p><ActionControls b={currentBooking} current={account} membership={memberships.find((m) => m.shopId === currentBooking.shopId)} form={form} setForm={setForm} btn={btn} busy={busy} /></div><div className="bf-panel"><h2>Vehicle details</h2><div className="bf-vehicle-list">{Object.entries(currentBooking.vehicle).map(([k, v]) => <div key={k}><span>{pretty(k)}</span><strong>{String(v || "—")}</strong></div>)}</div></div>{currentBooking.qcIssues?.length > 0 && <div className="bf-panel"><h2>QC issues</h2>{currentBooking.qcIssues.map((x: any, i: number) => <p className="bf-note" key={i}>{x.issue}</p>)}</div>}</div></div></section>}

          </motion.div>
        </AnimatePresence>

        <footer className="bf-footer"><div className="bf-container bf-footer-grid"><div><div className="bf-logo bf-foot-logo"><span className="bf-logo-icon"><Layers3 size={23} /></span><span>bay<span className="bf-logo-accent">flow</span><small>THE AUTO SERVICE PLATFORM</small></span></div><p>Smarter automotive service.<br />Beautifully connected, every step of the way.</p></div><div><h4>PLATFORM</h4><button onClick={() => navigate("home")}>Home</button><button onClick={() => navigate("shops")}>Find a garage</button><button onClick={() => navigate("features")}>Features</button></div><div><h4>GET STARTED</h4><button onClick={() => navigate("auth")}>My account</button><button onClick={() => navigate("shops")}>Book a service</button>{account && <button onClick={() => navigate("dashboard")}>Dashboard</button>}</div><div><h4>DEVELOPED BY</h4><strong>Sultan Zaib</strong><p>Python Engineer | Backend Engineer</p><a href="https://github.com/szofficiall" target="_blank" rel="noopener noreferrer">GitHub profile <ArrowUpRight size={14} /></a></div></div><div className="bf-container bf-footer-bottom"><span>© 2026 BayFlow. All rights reserved.</span><span>Designed & developed by <a href="https://github.com/szofficiall" target="_blank" rel="noopener noreferrer">Sultan Zaib</a></span></div></footer>
      </div>
    </MotionConfig>
  );
}

function Inventory({ shopId }: { shopId: string }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => { if (shopId) api(`/inventory/${shopId}`).then(setData).catch(() => setData(null)); }, [shopId]);
  return <div className="bf-panel bf-inventory"><span className="bf-eyebrow">PARTS & SUPPLIES</span><h2>Inventory overview</h2><div className="bf-inventory-grid">{data?.inventory?.map((x: any) => <div key={x.id}><span className="bf-feature-icon"><PackageCheck size={20} /></span><strong>{x.name}</strong><small>{x.qty} in stock</small><span>{x.sku}</span></div>)}{!data?.inventory?.length && <p className="bf-muted">No inventory records available.</p>}</div></div>;
}

function ActionControls({ b, current, membership, form, setForm, btn, busy }: any) {
  const role = membership?.role || "customer";
  const own = b.customerId === current?.id;
  const advisor = ["advisor", "owner"].includes(role);
  const tech = role === "technician" && b.techId === current?.id;
  const parts = role === "parts" && b.partsId === current?.id;
  const qc = role === "qc" && b.qcId === current?.id;
  const [lineItems, setLineItems] = useState<any[]>([{ name: "Labor - inspection and repair", type: "labor", sku: "", qty: 1, price: 2500 }]);
  const estimateEditor = <div className="bf-estimate-editor">{lineItems.map((x, i) => <div key={i} className="bf-estimate-editor-row"><input placeholder="Item description" value={x.name} onChange={(e) => setLineItems((p) => p.map((v, j) => j === i ? { ...v, name: e.target.value } : v))}/><select value={x.type} onChange={(e) => setLineItems((p) => p.map((v, j) => j === i ? { ...v, type: e.target.value } : v))}><option value="labor">Labor</option><option value="part">Part</option></select><input placeholder="SKU" value={x.sku} onChange={(e) => setLineItems((p) => p.map((v, j) => j === i ? { ...v, sku: e.target.value } : v))}/><input type="number" min={1} placeholder="Qty" value={x.qty} onChange={(e) => setLineItems((p) => p.map((v, j) => j === i ? { ...v, qty: Number(e.target.value) } : v))}/><input type="number" min={0} placeholder="Unit price" value={x.price} onChange={(e) => setLineItems((p) => p.map((v, j) => j === i ? { ...v, price: Number(e.target.value) } : v))}/></div>)}<button className="bf-btn bf-outline" onClick={() => setLineItems((p) => [...p, { name: "", type: "part", sku: "", qty: 1, price: 0 }])}>Add estimate line <Plus size={16} /></button>{btn("Submit estimate", "estimate", { items: lineItems })}</div>;
  if (b.status === "PENDING" && advisor) return <div className="bf-action-stack">{btn("Confirm appointment", "confirm")}{btn("Decline appointment", "cancel")}</div>;
  if (b.status === "CONFIRMED" && advisor) return <div className="bf-action-stack"><label>Assign technician<select value={form.userId || ""} onChange={(e) => setForm({ ...form, userId: e.target.value })}><option value="">Select a technician</option>{b.staff?.filter((x: any) => x.role === "technician").map((x: any) => <option key={x.userId} value={x.userId}>{x.user?.name}</option>)}</select></label>{btn("Assign technician", "assign", { userId: form.userId })}</div>;
  if (b.status === "ASSIGNED" && tech) return btn("Start inspection", "inspect");
  if ((b.status === "INSPECTING" && tech) || (b.status === "ESTIMATE_REJECTED" && (advisor || tech))) return estimateEditor;
  if (b.status === "ESTIMATE_REVIEW" && advisor) return btn("Send estimate to customer", "send_estimate");
  if (b.status === "AWAITING_CUSTOMER" && own) return <div className="bf-action-stack">{btn("Approve estimate", "approve")}{btn("Request revised estimate", "reject")}</div>;
  if (b.status === "ESTIMATE_APPROVED" && advisor) return <div className="bf-action-stack"><label>Parts coordinator<select value={form.userId || ""} onChange={(e) => setForm({ ...form, userId: e.target.value })}><option value="">Select parts person</option>{b.staff?.filter((x: any) => x.role === "parts").map((x: any) => <option key={x.userId} value={x.userId}>{x.user?.name}</option>)}</select></label>{btn("Assign parts team", "assign_parts", { userId: form.userId })}</div>;
  if (b.status === "PARTS_PENDING" && parts) return btn("Check parts availability", "check_parts");
  if (b.status === "PARTS_ORDERED" && parts) return <div className="bf-action-stack"><p className="bf-note">Missing parts: {b.missingParts?.map((x: any) => x.name).join(", ") || "See orders"}</p>{btn("Receive ordered parts", "receive_parts")}</div>;
  if (b.status === "PARTS_READY" && parts) return btn("Allocate parts and start repair", "allocate");
  if (b.status === "IN_REPAIR" && tech) return btn("Send repair to QC", "submit_qc");
  if (b.status === "QC_PENDING" && role === "qc") return btn("Claim QC inspection", "claim_qc");
  if (b.status === "QC_IN_PROGRESS" && qc) return <div className="bf-action-stack"><label>Reason for QC failure<textarea value={form.issue || ""} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="What needs rework?" /></label>{btn("QC passed", "qc_pass")}{btn("QC failed - return to repair", "qc_fail", { issue: form.issue })}</div>;
  if (b.status === "READY_FOR_PICKUP" && (advisor || own)) return btn("Confirm pickup and complete", "complete");
  return <div className="bf-waiting"><Clock3 size={23}/><div><strong>Waiting for the next team</strong><p>The person assigned to this stage will move the job forward.</p></div></div>;
}
