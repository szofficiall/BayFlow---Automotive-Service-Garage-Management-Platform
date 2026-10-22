"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ClipboardCheck,
  Command,
  MapPin,
  GitBranch,
  Layers3,
  LockKeyhole,
  Menu,
  Moon,
  PackageCheck,
  Phone,
  Plus,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TrendingUp,
  Users2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const api = async (path: string, method = "GET", body?: any) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("bayflow-token")
      : null;
  const r = await fetch(BASE + "/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
};
const steps = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "INSPECTING",
  "ESTIMATE_REVIEW",
  "AWAITING_CUSTOMER",
  "ESTIMATE_APPROVED",
  "ESTIMATE_REJECTED",
  "PARTS_PENDING",
  "PARTS_ORDERED",
  "PARTS_READY",
  "IN_REPAIR",
  "QC_PENDING",
  "QC_IN_PROGRESS",
  "READY_FOR_PICKUP",
  "COMPLETED",
];
const pretty = (s: string) =>
  s
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
const features = [
  {
    icon: <CarFront />,
    title: "Effortless booking",
    desc: "Discover your trusted garage, pick a service and reserve a real slot in minutes.",
  },
  {
    icon: <GitBranch />,
    title: "One clear workflow",
    desc: "Track every handoff — from check-in and inspection to repair and final pickup.",
  },
  {
    icon: <ShieldCheck />,
    title: "Quality first",
    desc: "Mandatory independent quality checks and a built-in rework loop.",
  },
  {
    icon: <PackageCheck />,
    title: "Inventory in sync",
    desc: "Know what is in stock, what is missing and what is ready for repair.",
  },
  {
    icon: <Users2 />,
    title: "Built for teams",
    desc: "Dedicated workspaces for owners, advisors, technicians, parts and QC.",
  },
  {
    icon: <TrendingUp />,
    title: "Clearer decisions",
    desc: "Operational visibility across locations, bookings and service performance.",
  },
];
const initialVehicle = {
  plate: "",
  make: "",
  model: "",
  year: "2022",
  color: "",
  mileage: "",
};
export default function Home() {
  const [dark, setDark] = useState(true),
    [view, setView] = useState("home"),
    [shops, setShops] = useState<any[]>([]),
    [selected, setSelected] = useState<any>(null),
    [services, setServices] = useState<string[]>([]),
    [slot, setSlot] = useState(""),
    [vehicle, setVehicle] = useState(initialVehicle),
    [notes, setNotes] = useState(""),
    [step, setStep] = useState(1),
    [account, setAccount] = useState<any>(null),
    [memberships, setMemberships] = useState<any[]>([]),
    [bookings, setBookings] = useState<any[]>([]),
    [activeBooking, setActiveBooking] = useState<any>(null),
    [shopId, setShopId] = useState(""),
    [authMode, setAuthMode] = useState("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [menu, setMenu] = useState(false),
    [form, setForm] = useState<any>({}),
    [analytics, setAnalytics] = useState<any>(null);
  const loadShops = async () => {
    try {
      const data = await api("/shops");
      setShops(data);
    } catch {
      setError("Cannot connect to API. Start the server with npm run dev.");
    }
  };
  const loadUser = async () => {
    try {
      const d = await api("/me");
      setAccount(d.user);
      setMemberships(d.memberships);
      setShopId((old) => old || d.memberships[0]?.shopId || "");
    } catch {
      localStorage.removeItem("bayflow-token");
    }
  };
  const loadBookings = async () => {
    try {
      setBookings(await api("/bookings"));
      if (shopId)
        setAnalytics(await api(`/analytics/${shopId}`).catch(() => null));
    } catch (e: any) {
      setError(e.message);
    }
  };
  const loadBooking = async (id: string) => {
    try {
      setActiveBooking(await api("/bookings/" + id));
      setForm({});
      setView("booking");
      window.scrollTo(0, 0);
    } catch (e: any) {
      setError(e.message);
    }
  };
  useEffect(() => {
    setDark(localStorage.getItem("bayflow-theme") !== "light");
    loadShops();
    if (localStorage.getItem("bayflow-token")) loadUser();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("bayflow-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    if (account) loadBookings();
  }, [account, shopId]);
  const go = (v: string) => {
    setView(v);
    setError("");
    setSuccess("");
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const run = async (fn: () => Promise<any>) => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await fn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const submitAuth = () =>
    run(async () => {
      if (authMode === "register") {
        await api("/register", "POST", { name, email, password });
        setSuccess("Account created. Please sign in.");
        setAuthMode("login");
        return;
      }
      const d = await api("/login", "POST", { email, password });
      localStorage.setItem("bayflow-token", d.token);
      setAccount(d.user);
      setMemberships(d.memberships);
      setShopId(d.memberships[0]?.shopId || "");
      go("dashboard");
    });
  const submitBooking = () =>
    run(async () => {
      if (!account) {
        setSuccess("Sign in to finish your booking.");
        go("auth");
        return;
      }
      const b = await api("/bookings", "POST", {
        shopId: selected.id,
        serviceIds: services,
        slotId: slot,
        vehicle,
        notes,
      });
      await loadShops();
      await loadBookings();
      await loadBooking(b.id);
      setSuccess("Appointment requested successfully!");
    });
  const act = (action: string, extra: any = {}) =>
    run(async () => {
      const b = await api("/bookings/" + activeBooking.id + "/action", "POST", {
        action,
        ...extra,
      });
      await loadBooking(b.id);
      await loadBookings();
      setSuccess("Booking updated successfully.");
    });
  const logout = () => {
    localStorage.removeItem("bayflow-token");
    setAccount(null);
    setMemberships([]);
    setBookings([]);
    go("home");
  };
  const activeShop = shops.find((s) => s.id === shopId);
  const role = memberships.find((m) => m.shopId === shopId)?.role || "customer";
  const bookingBtn = (label: string, action: string, extra: any = {}) => (
    <button
      disabled={busy}
      className="btn primary"
      onClick={() => act(action, extra)}
    >
      {label}
      <ArrowRight size={16} />
    </button>
  );
  return (
    <main>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="announcement">
        <span className="pulse" /> THE NEW STANDARD IN AUTOMOTIVE CARE{" "}
        <span className="hide-mobile">— ALL IN ONE PLACE</span>{" "}
        <ArrowUpRight size={13} />
      </div>
      <header className="header wrap">
        <button className="brand" onClick={() => go("home")}>
          <span className="brand-icon">
            <Layers3 size={24} />
          </span>
          <span>
            bay<span className="accent">flow</span>
            <small>THE AUTO SERVICE PLATFORM</small>
          </span>
        </button>
        <nav className={menu ? "nav opened" : "nav"}>
          <button onClick={() => go("home")}>Home</button>
          <button onClick={() => go("shops")}>Find a garage</button>
          <button onClick={() => go("features")}>Platform</button>
          {account && (
            <button onClick={() => go("dashboard")}>Dashboard</button>
          )}
        </nav>
        <div className="nav-actions">
          <button
            aria-label="Toggle color theme"
            className="theme-toggle"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {account ? (
            <button className="btn outline compact" onClick={logout}>
              Sign out
            </button>
          ) : (
            <button className="btn outline compact" onClick={() => go("auth")}>
              Sign in <ArrowUpRight size={15} />
            </button>
          )}
          <button className="mobile-menu" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {error && (
        <div className="toast error" role="alert">
          {error}
          <button onClick={() => setError("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div className="toast success" role="status">
          {success}
          <button onClick={() => setSuccess("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {view === "home" && (
        <>
          <section className="hero wrap">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="pulse" /> THE OPERATING SYSTEM FOR MODERN GARAGES{" "}
                <ArrowUpRight size={15} />
              </div>
              <h1>
                Every repair,
                <br />
                <span className="gradient-text">reimagined.</span>
              </h1>
              <p>
                A premium digital experience that connects drivers, workshops and service teams — from first booking to the final quality check. Beautifully simple, built for real operations.
              </p>
              <div className="hero-buttons">
                <button
                  className="btn primary large"
                  onClick={() => go("shops")}
                >
                  Book your service <ArrowUpRight size={18} />
                </button>
                <button
                  className="btn ghost large"
                  onClick={() => go("features")}
                >
                  Explore the platform <ArrowRight size={18} />
                </button>
              </div>
              <div className="trust">
                <div className="avatars">
                  <span>AJ</span>
                  <span>MK</span>
                  <span>SA</span>
                </div>
                <div>
                  <b>Built for workshops that care</b>
                  <small>A seamless experience at every step</small>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-halo" aria-hidden="true" />
              <div className="hero-grid" aria-hidden="true" />
              <div className="orbit orbit1" />
              <div className="orbit orbit2" />
              <div className="dashboard-mock">
                <div className="mock-top">
                  <span className="dots">● ● ●</span>
                  <span>WORKSHOP OVERVIEW</span>
                  <span className="live-dot">● Live</span>
                </div>
                <div className="mock-content">
                  <div className="mock-label">
                    WORKSHOP INTELLIGENCE <SlidersHorizontal size={15} />
                  </div>
                  <h3>
                    Your workflow.
                    <br />
                    Beautifully in sync.
                  </h3>
                  <div className="mock-kpis">
                    <div>
                      <small>Active jobs</small>
                      <strong>
                        24 <span>↗</span>
                      </strong>
                    </div>
                    <div>
                      <small>Completed</small>
                      <strong>
                        86 <span>↗</span>
                      </strong>
                    </div>
                  </div>
                  <div className="mock-chart">
                    <i style={{ height: "32%" }} />
                    <i style={{ height: "54%" }} />
                    <i style={{ height: "42%" }} />
                    <i style={{ height: "70%" }} />
                    <i style={{ height: "55%" }} />
                    <i style={{ height: "86%" }} />
                    <i style={{ height: "74%" }} />
                    <i style={{ height: "100%" }} />
                    <i style={{ height: "80%" }} />
                  </div>
                  <div className="mock-row">
                    <span>
                      <CheckCircle2 size={15} /> Quality check passed
                    </span>
                    <b>JUST NOW</b>
                  </div>
                </div>
              </div>
              <div className="float-card top-float">
                <span className="mini-icon">
                  <Wrench size={18} />
                </span>
                <div>
                  <b>Repair in progress</b>
                  <small>Honda Civic · Job #2048</small>
                </div>
                <span className="tag">ACTIVE</span>
              </div>
              <div className="float-card bottom-float">
                <span className="mini-icon mint">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <b>Quality approved</b>
                  <small>Ready for collection</small>
                </div>
                <CheckCircle2 size={18} color="#47d6a0" />
              </div>
            </div>
          </section>
          <section className="partner-ribbon wrap" aria-label="Platform advantages">
            <span>TRUSTED WORKFLOW</span><b>01 / Book with confidence</b><i />
            <b>02 / Live status tracking</b><i />
            <b>03 / Quality-assured delivery</b>
          </section>
          <section className="metrics wrap">
            <div>
              <b>01</b>
              <span>Unified garage experience</span>
            </div>
            <div>
              <b>06</b>
              <span>Purpose-built team roles</span>
            </div>
            <div>
              <b>100%</b>
              <span>Transparent job journey</span>
            </div>
            <div>
              <b>24/7</b>
              <span>Online appointment access</span>
            </div>
          </section>
          <section className="section wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">WHY BAYFLOW / 01</div>
                <h2>
                  Everything connected.
                  <br />
                  <span className="muted">Nothing left behind.</span>
                </h2>
              </div>
              <p>
                Replace scattered spreadsheets, endless follow-ups and missed handoffs with one beautiful, unified platform.
              </p>
            </div>
            <div className="feature-grid">
              {features.map((f, i) => (
                <div className="feature" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <span className="feature-num">0{i + 1}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <ArrowUpRight className="feature-arrow" size={19} />
                </div>
              ))}
            </div>
          </section>
          <section className="showcase wrap">
            <div className="eyebrow">EFFORTLESS FROM START TO FINISH / 02</div>
            <div className="showcase-grid">
              <div>
                <h2>
                  Service, without
                  <br />
                  <span className="gradient-text">the guesswork.</span>
                </h2>
                <p>
                  Built around the actual way automotive businesses operate,
                  from customer appointments to workshop accountability.
                </p>
                <button className="btn primary" onClick={() => go("shops")}>
                  Book a service <ArrowRight size={17} />
                </button>
              </div>
              <div className="timeline">
                {[
                  [
                    "01",
                    "Discover & book",
                    "Choose a trusted garage and reserve your appointment.",
                  ],
                  [
                    "02",
                    "Inspect & approve",
                    "Receive an itemized quote and approve it online.",
                  ],
                  [
                    "03",
                    "Repair & verify",
                    "Your vehicle moves through service and quality control.",
                  ],
                  [
                    "04",
                    "Drive with confidence",
                    "Track completion and collect your car with peace of mind.",
                  ],
                ].map(([n, title, desc]) => (
                  <div className="timeline-item" key={n}>
                    <b>{n}</b>
                    <div>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                    <CheckCircle2 size={20} />
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="cta wrap">
            <div className="eyebrow">BUILT TO MOVE YOU FORWARD</div>
            <h2>
              Ready for a better
              <br />
              way to <em>work?</em>
            </h2>
            <p>
              Start with a booking. Discover a more connected automotive service
              experience.
            </p>
            <button className="btn light large" onClick={() => go("shops")}>
              Find your garage <ArrowUpRight size={18} />
            </button>
          </section>
        </>
      )}
      {view === "features" && (
        <section className="section wrap page-top">
          <div className="eyebrow">A CONNECTED WORKSPACE</div>
          <h1 className="page-heading">
            Powerful behind the scenes.
            <br />
            <span className="gradient-text">Simple on the surface.</span>
          </h1>
          <p className="intro">
            From booking to pickup, every step stays transparent, secure and
            organized.
          </p>
          <div className="feature-grid">
            {features.map((f, i) => (
              <div className="feature" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <span className="feature-num">0{i + 1}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="callout">
            Your team has one workspace. Your customers have peace of mind.{" "}
            <button className="btn primary" onClick={() => go("shops")}>
              Get started <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}
      {view === "shops" && (
        <section className="section wrap page-top">
          <div className="eyebrow">01 / DISCOVER</div>
          <h1 className="page-heading">
            Find your <span className="gradient-text">perfect garage.</span>
          </h1>
          <p className="intro">
            Explore trusted auto service centers, browse their expertise and
            book online.
          </p>
          <div className="shop-grid">
            {shops.map((s, i) => (
              <article className="shop-card" key={s.id}>
                <div className={"shop-cover cover-" + (i % 3)}>
                  <div className="cover-lines" />
                  <span className="shop-monogram">{s.initials}</span>
                  <span className="cover-pill">
                    <span className="pulse" /> ACCEPTING BOOKINGS
                  </span>
                </div>
                <div className="shop-details">
                  <span className="small-label">
                    PREMIUM AUTOMOTIVE SERVICE
                  </span>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <div className="shop-meta">
                    <span>
                      <MapPin size={15} />
                      {s.address}
                    </span>
                    <span>
                      <Clock3 size={15} />
                      {s.hours}
                    </span>
                  </div>
                  <button
                    className="btn primary"
                    onClick={() => {
                      setSelected(s);
                      setServices([]);
                      setSlot("");
                      setStep(1);
                      go("reserve");
                    }}
                  >
                    Book appointment <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {view === "reserve" && selected && (
        <section className="section wrap page-top">
          <div className="eyebrow">02 / YOUR BOOKING</div>
          <h1 className="page-heading">
            Make an <span className="gradient-text">appointment.</span>
          </h1>
          <p className="intro">
            {selected.name} · {selected.address}
          </p>
          <div className="wizard-steps">
            {["Services", "Time slot", "Your vehicle", "Review"].map((s, i) => (
              <div className={i + 1 <= step ? "selected" : ""} key={s}>
                <span>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
          <div className="wizard panel">
            {step === 1 && (
              <>
                <h2>What can we help with?</h2>
                <p className="muted">Select one or more services.</p>
                <div className="service-grid">
                  {selected.services.map((s: any) => (
                    <button
                      key={s.id}
                      className={
                        "service-option " +
                        (services.includes(s.id) ? "chosen" : "")
                      }
                      onClick={() =>
                        setServices((p) =>
                          p.includes(s.id)
                            ? p.filter((x) => x !== s.id)
                            : [...p, s.id],
                        )
                      }
                    >
                      <span>
                        <Wrench size={19} />
                        {s.name}
                      </span>
                      <span>
                        From PKR {s.price.toLocaleString()}{" "}
                        <CheckCircle2 size={17} />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Choose an available slot</h2>
                <p className="muted">
                  Available times are shown in local garage time.
                </p>
                <div className="slot-grid">
                  {selected.slots.slice(0, 48).map((s: any) => (
                    <button
                      className={
                        "slot-option " + (slot === s.id ? "chosen" : "")
                      }
                      key={s.id}
                      onClick={() => setSlot(s.id)}
                    >
                      <b>{s.date}</b>
                      <span>{s.time}</span>
                      <small>
                        {s.remaining} spot{s.remaining === 1 ? "" : "s"} left
                      </small>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2>Tell us about your vehicle</h2>
                <div className="form-grid">
                  {(
                    [
                      "plate",
                      "make",
                      "model",
                      "year",
                      "color",
                      "mileage",
                    ] as const
                  ).map((k) => (
                    <label key={k}>
                      {pretty(k)}
                      <input
                        value={vehicle[k]}
                        onChange={(e) =>
                          setVehicle((v) => ({ ...v, [k]: e.target.value }))
                        }
                        placeholder={
                          k === "plate"
                            ? "LEA-1234"
                            : k === "make"
                              ? "Honda"
                              : k === "model"
                                ? "Civic"
                                : k === "year"
                                  ? "2022"
                                  : ""
                        }
                      />
                    </label>
                  ))}
                  <label className="wide">
                    Describe the issue (optional)
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Tell our technicians what you noticed..."
                    />
                  </label>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h2>Review your appointment</h2>
                <div className="review-grid">
                  <div>
                    <small>Garage</small>
                    <b>{selected.name}</b>
                  </div>
                  <div>
                    <small>Services</small>
                    <b>
                      {selected.services
                        .filter((x: any) => services.includes(x.id))
                        .map((x: any) => x.name)
                        .join(", ")}
                    </b>
                  </div>
                  <div>
                    <small>Time slot</small>
                    <b>
                      {selected.slots.find((x: any) => x.id === slot)?.date} ·{" "}
                      {selected.slots.find((x: any) => x.id === slot)?.time}
                    </b>
                  </div>
                  <div>
                    <small>Vehicle</small>
                    <b>
                      {vehicle.year} {vehicle.make} {vehicle.model} ·{" "}
                      {vehicle.plate}
                    </b>
                  </div>
                </div>
                <p className="notice">
                  Your booking starts as a request. Garage staff will confirm it
                  and notify you through your dashboard.
                </p>
              </>
            )}
            <div className="wizard-actions">
              {step > 1 && (
                <button
                  className="btn outline"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}
              <button
                className="btn primary"
                disabled={
                  busy ||
                  (step === 1 && !services.length) ||
                  (step === 2 && !slot) ||
                  (step === 3 &&
                    (!vehicle.plate ||
                      !vehicle.make ||
                      !vehicle.model ||
                      !vehicle.year))
                }
                onClick={() => (step < 4 ? setStep(step + 1) : submitBooking())}
              >
                {step === 4
                  ? account
                    ? "Confirm booking"
                    : "Sign in & continue"
                  : "Continue"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}
      {view === "auth" && (
        <section className="section wrap auth-section">
          <div className="auth-card">
            <div className="eyebrow">WELCOME TO BAYFLOW</div>
            <h1>
              {authMode === "login" ? "Welcome back." : "Join the movement."}
            </h1>
            <p>
              {authMode === "login"
                ? "Sign in to see your appointments and workspace."
                : "Create your customer account to book your first service."}
            </p>
            {authMode === "register" && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </label>
            <button
              disabled={busy}
              className="btn primary full"
              onClick={submitAuth}
            >
              {authMode === "login" ? "Sign in" : "Create account"}{" "}
              <ArrowRight size={17} />
            </button>
            <p className="switch-auth">
              {authMode === "login"
                ? "Don't have an account? "
                : "Already a member? "}
              <button
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                {authMode === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
            <div className="demo-hint">
              <b>Explore the demo</b>
              <small>
                Use any seeded role account: owner, advisor, technician, qc,
                parts or customer <b>@bayflow.demo</b>
              </small>
              <small>
                Password: <b>Demo@12345</b>
              </small>
            </div>
          </div>
          <div className="auth-art">
            <div className="massive-icon">
              <CarFront size={114} />
            </div>
            <h2>
              Connected from
              <br />
              start to finish.
            </h2>
            <p>Every booking. Every approval. Every repair.</p>
          </div>
        </section>
      )}
      {view === "dashboard" && account && (
        <section className="section wrap page-top dashboard">
          <div className="eyebrow">YOUR CONTROL CENTER</div>
          <div className="dash-title">
            <div>
              <h1 className="page-heading">
                Good day,{" "}
                <span className="gradient-text">
                  {account.name.split(" ")[0]}.
                </span>
              </h1>
              <p className="intro">
                Here's everything that matters, all in one place.
              </p>
            </div>
            {memberships.length > 0 && (
              <select
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
              >
                {shops
                  .filter((s) => memberships.some((m) => m.shopId === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            )}
          </div>
          {memberships.length > 0 ? (
            <>
              <div className="role-label">
                <Settings2 size={16} /> {pretty(role)} workspace ·{" "}
                {activeShop?.name}
              </div>
              <div className="dash-stats">
                <div>
                  <span>
                    <ClipboardCheck size={18} /> Assigned bookings
                  </span>
                  <b>{bookings.length}</b>
                  <small>Across your accessible jobs</small>
                </div>
                <div>
                  <span>
                    <Zap size={18} /> Active jobs
                  </span>
                  <b>
                    {
                      bookings.filter(
                        (b) => !["COMPLETED", "CANCELLED"].includes(b.status),
                      ).length
                    }
                  </b>
                  <small>Currently in progress</small>
                </div>
                <div>
                  <span>
                    <ShieldCheck size={18} /> Completed
                  </span>
                  <b>
                    {bookings.filter((b) => b.status === "COMPLETED").length}
                  </b>
                  <small>Delivered successfully</small>
                </div>
                <div>
                  <span>
                    <TrendingUp size={18} /> Revenue
                  </span>
                  <b>PKR {(analytics?.revenue || 0).toLocaleString()}</b>
                  <small>Completed service estimates</small>
                </div>
              </div>
            </>
          ) : (
            <div className="notice">
              Your customer portal shows your bookings across all garages.
              Select a booking to track its full history.
            </div>
          )}
          <div className="panel list-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">WORKSHOP OVERVIEW</div>
                <h2>
                  {memberships.length ? "Workshop bookings" : "My appointments"}
                </h2>
              </div>
              <button className="btn outline" onClick={() => go("shops")}>
                New booking <Plus size={16} />
              </button>
            </div>
            {bookings.length ? (
              <div className="booking-table">
                <div className="table-head">
                  <span>REFERENCE / VEHICLE</span>
                  <span>GARAGE</span>
                  <span>STATUS</span>
                  <span>VIEW</span>
                </div>
                {bookings.map((b) => (
                  <button
                    className="booking-row"
                    key={b.id}
                    onClick={() => loadBooking(b.id)}
                  >
                    <span>
                      <b>{b.reference}</b>
                      <small>
                        {b.vehicle.make} {b.vehicle.model} · {b.vehicle.plate}
                      </small>
                    </span>
                    <span>{b.shop?.name}</span>
                    <span>
                      <span className="status">{pretty(b.status)}</span>
                    </span>
                    <span>
                      <ArrowUpRight size={19} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty">
                <CarFront size={40} />
                <h3>No bookings here yet</h3>
                <p>
                  New appointments will appear in your workspace automatically.
                </p>
              </div>
            )}
          </div>
          {role === "owner" && (
            <div className="panel admin-panel">
              <h2>Expand your operations</h2>
              <p className="muted">
                Create another location or add shop staff with the right
                permissions.
              </p>
              <div className="form-grid">
                <label>
                  New shop name
                  <input
                    value={form.newShopName || ""}
                    onChange={(e) =>
                      setForm({ ...form, newShopName: e.target.value })
                    }
                  />
                </label>
                <label>
                  Address
                  <input
                    value={form.newShopAddress || ""}
                    onChange={(e) =>
                      setForm({ ...form, newShopAddress: e.target.value })
                    }
                  />
                </label>
                <button
                  className="btn primary"
                  onClick={() =>
                    run(async () => {
                      await api("/shops", "POST", {
                        name: form.newShopName,
                        address: form.newShopAddress,
                      });
                      await loadShops();
                      await loadUser();
                      setSuccess("Shop created");
                    })
                  }
                >
                  Create shop <Plus size={16} />
                </button>
              </div>
              <div className="divider" />
              <div className="form-grid">
                <label>
                  Staff name
                  <input
                    value={form.staffName || ""}
                    onChange={(e) =>
                      setForm({ ...form, staffName: e.target.value })
                    }
                  />
                </label>
                <label>
                  Staff email
                  <input
                    value={form.staffEmail || ""}
                    onChange={(e) =>
                      setForm({ ...form, staffEmail: e.target.value })
                    }
                  />
                </label>
                <label>
                  Password
                  <input
                    value={form.staffPass || ""}
                    onChange={(e) =>
                      setForm({ ...form, staffPass: e.target.value })
                    }
                  />
                </label>
                <label>
                  Role
                  <select
                    value={form.staffRole || "advisor"}
                    onChange={(e) =>
                      setForm({ ...form, staffRole: e.target.value })
                    }
                  >
                    {["advisor", "technician", "qc", "parts"].map((r) => (
                      <option key={r} value={r}>
                        {pretty(r)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="btn primary"
                  onClick={() =>
                    run(async () => {
                      await api("/staff/" + shopId, "POST", {
                        name: form.staffName,
                        email: form.staffEmail,
                        password: form.staffPass,
                        role: form.staffRole || "advisor",
                      });
                      setSuccess("Team member created");
                      setForm({});
                    })
                  }
                >
                  Add staff member <Plus size={16} />
                </button>
              </div>
            </div>
          )}
          {(role === "owner" || role === "parts") && (
            <Inventory shopId={shopId} api={api} />
          )}
        </section>
      )}
      {view === "booking" && activeBooking && (
        <section className="section wrap page-top booking-detail">
          <button className="back-link" onClick={() => go("dashboard")}>
            ← Back to dashboard
          </button>
          <div className="detail-title">
            <div>
              <div className="eyebrow">
                SERVICE JOB / {activeBooking.reference}
              </div>
              <h1 className="page-heading">
                {activeBooking.vehicle.make}{" "}
                <span className="gradient-text">
                  {activeBooking.vehicle.model}
                </span>
              </h1>
              <p>
                {activeBooking.vehicle.plate} · {activeBooking.vehicle.year} ·{" "}
                {activeBooking.shop?.name}
              </p>
            </div>
            <span className="status big">{pretty(activeBooking.status)}</span>
          </div>
          <div className="detail-grid">
            <div>
              <div className="panel">
                <div className="panel-heading">
                  <h2>Service timeline</h2>
                  <ClipboardCheck />
                </div>
                <div className="status-track">
                  {steps
                    .filter((s) => s !== "ESTIMATE_REJECTED")
                    .map((s, i) => (
                      <div
                        className={
                          "track-item " +
                          (steps.indexOf(s) <=
                          steps.indexOf(activeBooking.status)
                            ? "passed"
                            : "")
                        }
                        key={s}
                      >
                        <span>{i + 1}</span>
                        <p>{pretty(s)}</p>
                      </div>
                    ))}
                </div>
              </div>
              <div className="panel">
                <h2>Itemized estimate</h2>
                {activeBooking.estimate?.length ? (
                  <>
                    <div className="estimate-lines">
                      {activeBooking.estimate.map((i: any) => (
                        <div key={i.id}>
                          <span>
                            {i.name}
                            <small>
                              {i.type} · Qty {i.qty}
                            </small>
                          </span>
                          <b>PKR {(i.qty * i.price).toLocaleString()}</b>
                        </div>
                      ))}
                    </div>
                    <div className="estimate-total">
                      <span>Total estimate</span>
                      <b>
                        PKR{" "}
                        {activeBooking.estimate
                          .reduce((a: number, i: any) => a + i.qty * i.price, 0)
                          .toLocaleString()}
                      </b>
                    </div>
                  </>
                ) : (
                  <p className="muted">
                    Your technician will create the estimate after inspection.
                  </p>
                )}
              </div>
              <div className="panel">
                <h2>Activity & accountability</h2>
                <div className="activity">
                  {activeBooking.audit
                    ?.slice()
                    .reverse()
                    .map((a: any) => (
                      <div key={a.id}>
                        <span className="activity-dot" />
                        <div>
                          <b>{pretty(a.action)}</b>
                          <small>
                            {a.detail || "Job status updated"} ·{" "}
                            {new Date(a.at).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <div className="panel action-panel">
                <div className="eyebrow">NEXT STEP</div>
                <h2>Move the job forward</h2>
                <p className="muted">
                  Actions are controlled by your role and the current job stage.
                </p>
                <ActionControls
                  b={activeBooking}
                  current={account}
                  membership={memberships.find(
                    (m) => m.shopId === activeBooking.shopId,
                  )}
                  form={form}
                  setForm={setForm}
                  bookingBtn={bookingBtn}
                  busy={busy}
                />
              </div>
              <div className="panel vehicle-panel">
                <h3>Vehicle information</h3>
                {Object.entries(activeBooking.vehicle).map(([k, v]) => (
                  <div key={k}>
                    <span>{pretty(k)}</span>
                    <b>{String(v || "—")}</b>
                  </div>
                ))}
              </div>
              {activeBooking.qcIssues?.length > 0 && (
                <div className="panel">
                  <h3>QC issues & rework</h3>
                  {activeBooking.qcIssues.map((x: any, i: number) => (
                    <p key={i} className="notice">
                      {x.issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <footer className="footer">
        <div className="wrap footer-inner">
          <div>
            <div className="brand footbrand">
              <span className="brand-icon">
                <Layers3 size={22} />
              </span>
              <span>
                bay<span className="accent">flow</span>
                <small>THE AUTO SERVICE PLATFORM</small>
              </span>
            </div>
            <p>
              Modern automotive service.
              <br />
              Beautifully connected.
            </p>
          </div>
          <div>
            <span>PLATFORM</span>
            <button onClick={() => go("shops")}>Find a garage</button>
            <button onClick={() => go("features")}>Features</button>
            <button onClick={() => go("dashboard")}>Dashboard</button>
          </div>
          <div>
            <span>GET STARTED</span>
            <button onClick={() => go("auth")}>My account</button>
            <button onClick={() => go("shops")}>Book a service</button>
          </div>
          <div>
            <span>BUILT WITH PURPOSE</span>
            <p>
              Next.js + Node.js
              <br />Designed for the modern workshop
            </p>
          </div>
        </div>
        <div className="wrap footer-bottom">
          © 2026 BayFlow. Crafted for confidence.{" "}
          <span>DESIGNED TO MOVE FORWARD ↗</span>
        </div>
      </footer>
    </main>
  );
}
function Inventory({ shopId, api }: { shopId: string; api: any }) {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (shopId)
      api("/inventory/" + shopId)
        .then(setData)
        .catch(() => {});
  }, [shopId]);
  return (
    <div className="panel inventory-panel">
      <h2>Parts inventory</h2>
      <div className="inventory-grid">
        {data?.inventory?.map((i: any) => (
          <div key={i.id}>
            <span className="mini-icon">
              <PackageCheck size={20} />
            </span>
            <b>{i.name}</b>
            <span>{i.qty} available</span>
            <small>{i.sku}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
function ActionControls({
  b,
  current,
  membership,
  form,
  setForm,
  bookingBtn,
  busy,
}: any) {
  const role = membership?.role || "customer";
  const own = b.customerId === current?.id;
  const validTech = b.techId === current?.id;
  const validParts = b.partsId === current?.id;
  const validQc = b.qcId === current?.id;
  const advisor = ["advisor", "owner"].includes(role);
  const [lineItems, setLineItems] = useState<any[]>([
    {
      name: "Labor – inspection & repair",
      type: "labor",
      sku: "",
      qty: 1,
      price: 2500,
    },
  ]);
  const items = () => (
    <div className="estimate-editor">
      {lineItems.map((item, i) => (
        <div className="estimate-edit-row" key={i}>
          <input
            placeholder="Item or labor description"
            value={item.name}
            onChange={(e) =>
              setLineItems((p) =>
                p.map((v, j) => (i === j ? { ...v, name: e.target.value } : v)),
              )
            }
          />
          <select
            value={item.type}
            onChange={(e) =>
              setLineItems((p) =>
                p.map((v, j) => (i === j ? { ...v, type: e.target.value } : v)),
              )
            }
          >
            <option value="labor">Labor</option>
            <option value="part">Part</option>
          </select>
          <input
            placeholder="Inventory SKU"
            value={item.sku}
            onChange={(e) =>
              setLineItems((p) =>
                p.map((v, j) => (i === j ? { ...v, sku: e.target.value } : v)),
              )
            }
          />
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={item.qty}
            onChange={(e) =>
              setLineItems((p) =>
                p.map((v, j) =>
                  i === j ? { ...v, qty: Number(e.target.value) } : v,
                ),
              )
            }
          />
          <input
            type="number"
            min="0"
            placeholder="PKR / unit"
            value={item.price}
            onChange={(e) =>
              setLineItems((p) =>
                p.map((v, j) =>
                  i === j ? { ...v, price: Number(e.target.value) } : v,
                ),
              )
            }
          />
        </div>
      ))}
      <button
        className="btn outline"
        onClick={() =>
          setLineItems((p) => [
            ...p,
            { name: "", type: "part", sku: "", qty: 1, price: 0 },
          ])
        }
      >
        Add line <Plus size={15} />
      </button>
      {bookingBtn("Submit itemized estimate", "estimate", { items: lineItems })}
    </div>
  );
  if (b.status === "PENDING" && advisor)
    return (
      <div className="action-buttons">
        {bookingBtn("Confirm appointment", "confirm")}
        {bookingBtn("Decline booking", "cancel")}
      </div>
    );
  if (b.status === "CONFIRMED" && advisor)
    return (
      <>
        <label>
          Assign workshop technician
          <select
            value={form.userId || ""}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            <option value="">Choose technician</option>
            {b.staff
              .filter((x: any) => x.role === "technician")
              .map((x: any) => (
                <option key={x.userId} value={x.userId}>
                  {x.user?.name}
                </option>
              ))}
          </select>
        </label>
        {bookingBtn("Assign technician", "assign", { userId: form.userId })}
      </>
    );
  if (b.status === "ASSIGNED" && role === "technician" && validTech)
    return bookingBtn("Start inspection", "inspect");
  if (
    (b.status === "INSPECTING" && role === "technician" && validTech) ||
    (b.status === "ESTIMATE_REJECTED" &&
      (advisor || (role === "technician" && validTech)))
  )
    return items();
  if (b.status === "ESTIMATE_REVIEW" && advisor)
    return bookingBtn("Send estimate to customer", "send_estimate");
  if (b.status === "AWAITING_CUSTOMER" && own)
    return (
      <div className="action-buttons">
        {bookingBtn("Approve estimate", "approve")}
        {bookingBtn("Reject estimate", "reject")}
      </div>
    );
  if (b.status === "ESTIMATE_APPROVED" && advisor)
    return (
      <>
        <label>
          Assign parts coordinator
          <select
            value={form.userId || ""}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            <option value="">Choose parts person</option>
            {b.staff
              .filter((x: any) => x.role === "parts")
              .map((x: any) => (
                <option key={x.userId} value={x.userId}>
                  {x.user?.name}
                </option>
              ))}
          </select>
        </label>
        {bookingBtn("Send to parts team", "assign_parts", {
          userId: form.userId,
        })}
      </>
    );
  if (b.status === "PARTS_PENDING" && role === "parts" && validParts)
    return bookingBtn("Check part availability", "check_parts");
  if (b.status === "PARTS_ORDERED" && role === "parts" && validParts)
    return (
      <>
        <p className="notice">
          Parts missing: {b.missingParts?.map((p: any) => p.name).join(", ")}.
          Open purchase orders will be received.
        </p>
        {bookingBtn("Receive ordered parts", "receive_parts")}
      </>
    );
  if (b.status === "PARTS_READY" && role === "parts" && validParts)
    return bookingBtn("Allocate parts & start repair", "allocate");
  if (b.status === "IN_REPAIR" && role === "technician" && validTech)
    return bookingBtn("Repair done — send to QC", "submit_qc");
  if (b.status === "QC_PENDING" && role === "qc")
    return bookingBtn("Claim QC inspection", "claim_qc");
  if (b.status === "QC_IN_PROGRESS" && role === "qc" && validQc)
    return (
      <>
        <label>
          QC issue (if failed)
          <textarea
            value={form.issue || ""}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
            placeholder="What needs rework?"
          />
        </label>
        <div className="action-buttons">
          {bookingBtn("QC passed", "qc_pass")}
          {bookingBtn("QC failed — return to repair", "qc_fail", {
            issue: form.issue,
          })}
        </div>
      </>
    );
  if (b.status === "READY_FOR_PICKUP" && (advisor || own))
    return bookingBtn("Confirm pickup & complete", "complete");
  return (
    <div className="waiting">
      <Clock3 size={22} />
      <div>
        <b>Waiting for the next team</b>
        <p>
          The responsible person can move this booking to the next stage. All
          updates will appear here.
        </p>
      </div>
    </div>
  );
}
