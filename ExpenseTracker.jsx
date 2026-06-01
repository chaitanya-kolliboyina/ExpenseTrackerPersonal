import { useState, useEffect, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, ResponsiveContainer, Legend
} from "recharts";

/* ─── FONTS ──────────────────────────────────────────── */
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2a2a3d; border-radius: 2px; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input, select, textarea { outline: none; border: none; background: none; }
`;

/* ─── CATEGORIES ─────────────────────────────────────── */
const CATS = {
  groceries:     { label:"Groceries",        icon:"🛒", color:"#4ade80", subs:["Fresh Produce","Dairy","Meat & Fish","Packaged Foods","Beverages","Other"] },
  food:          { label:"Food & Dining",     icon:"🍽️", color:"#fb923c", subs:["Restaurant","Delivery (Zomato/Swiggy)","Fast Food","Café","Other"] },
  fuel:          { label:"Fuel & Vehicle",    icon:"⛽", color:"#f97316", subs:["Petrol/Diesel","CNG / EV Charge","Maintenance","Insurance","Parking & Toll","Other"] },
  rent:          { label:"Rent",              icon:"🏠", color:"#c084fc", subs:["Home Rent","PG / Hostel","Office Rent","Other"] },
  utilities:     { label:"Utilities",         icon:"⚡", color:"#facc15", subs:["Electricity","Water","Internet","Mobile / DTH","Gas / LPG","Other"] },
  health:        { label:"Health & Wellness", icon:"💊", color:"#2dd4bf", subs:["Doctor / Hospital","Medicines","Gym / Fitness","Mental Health","Other"] },
  savings:       { label:"Savings",           icon:"🏦", color:"#34d399", subs:["FD","Savings Account","Emergency Fund","Other"] },
  investments:   { label:"Investments",       icon:"📈", color:"#818cf8", subs:["Stocks / MF","RD","PPF / EPF","Gold","Crypto","NPS","Other"] },
  loans:         { label:"Loans & EMI",       icon:"💳", color:"#f43f5e", subs:["Home Loan","Car Loan","Personal Loan","Credit Card EMI","Education Loan","Other"] },
  appliances:    { label:"Home & Appliances", icon:"🏡", color:"#60a5fa", subs:["Kitchen Appliance","Furniture","Electronics","Maintenance & Repair","Cleaning","Other"] },
  personal:      { label:"Personal Care",     icon:"🪞", color:"#fb7185", subs:["Clothing","Haircut / Salon","Skincare","Gifts","Other"] },
  entertainment: { label:"Entertainment",     icon:"🎬", color:"#a78bfa", subs:["OTT Subscriptions","Movies / Events","Gaming","Books","Other"] },
  travel:        { label:"Travel",            icon:"✈️", color:"#38bdf8", subs:["Flights","Hotels","Cab / Auto / Metro","Train / Bus","Other"] },
  education:     { label:"Education",         icon:"📚", color:"#fbbf24", subs:["Courses / Classes","Books & Materials","School / College Fees","Other"] },
  business:      { label:"Business",          icon:"💼", color:"#94a3b8", subs:["Office Supplies","Software / Subscriptions","Marketing","Client Expenses","Other"] },
};

const KW = [
  [/zomato|swiggy|food delivery|dominos|pizza|burger/i,              "food","Delivery (Zomato/Swiggy)"],
  [/restaurant|cafe|café|dine|mess|dhaba/i,                           "food","Restaurant"],
  [/petrol|diesel|bpcl|hpcl|iocl|indian oil|hp fuel/i,               "fuel","Petrol/Diesel"],
  [/cng|ev charg|electric vehicle/i,                                  "fuel","CNG / EV Charge"],
  [/puncture|tyre|car wash|vehicle service|bike service/i,            "fuel","Maintenance"],
  [/bescom|msedcl|electricity|power bill|eb bill/i,                   "utilities","Electricity"],
  [/water bill|water tax/i,                                           "utilities","Water"],
  [/internet|broadband|jio fiber|airtel fiber|act broadband/i,        "utilities","Internet"],
  [/recharge|airtel|jio |vi |vodafone|bsnl|tata sky|dish tv/i,        "utilities","Mobile / DTH"],
  [/lpg|indane|hp gas|bharat gas/i,                                   "utilities","Gas / LPG"],
  [/dmart|bigbasket|zepto|blinkit|instamart|reliance fresh|vegetable|sabzi|fruits/i,"groceries","Fresh Produce"],
  [/milk|dairy|curd|paneer|butter|cheese/i,                          "groceries","Dairy"],
  [/chicken|mutton|fish|egg|meat|seafood/i,                          "groceries","Meat & Fish"],
  [/netflix|prime video|hotstar|spotify|youtube premium|disney|zee5/i,"entertainment","OTT Subscriptions"],
  [/movie|cinema|pvr|inox|ticket|concert|show|event/i,              "entertainment","Movies / Events"],
  [/gym|fitness|cult\.fit|crossfit|yoga/i,                           "health","Gym / Fitness"],
  [/doctor|hospital|clinic|pharmacy|medicine|medic|health check/i,   "health","Doctor / Hospital"],
  [/house rent|monthly rent|pg rent|hostel/i,                        "rent","PG / Hostel"],
  [/\brent\b/i,                                                      "rent","Home Rent"],
  [/credit card emi|emi\b/i,                                         "loans","Credit Card EMI"],
  [/home loan|housing loan/i,                                        "loans","Home Loan"],
  [/car loan|vehicle loan/i,                                         "loans","Car Loan"],
  [/personal loan/i,                                                 "loans","Personal Loan"],
  [/sip|mutual fund|\bmf\b|groww|zerodha|kite|upstox|smallcase|\bstocks?\b|nifty|sensex/i,"investments","Stocks / MF"],
  [/\brd\b|recurring deposit/i,                                      "investments","RD"],
  [/ppf|epf|provident fund|nps|pension fund/i,                       "investments","PPF / EPF"],
  [/\bgold\b|digital gold|sovereign bond/i,                          "investments","Gold"],
  [/crypto|bitcoin|ethereum|binance|wazirx/i,                        "investments","Crypto"],
  [/\bfd\b|fixed deposit/i,                                          "savings","FD"],
  [/emergency fund/i,                                                "savings","Emergency Fund"],
  [/refrigerator|washing machine|\bac\b|air condition|microwave|oven/i,"appliances","Kitchen Appliance"],
  [/furniture|sofa|bed |table|chair|shelf|almirah/i,                 "appliances","Furniture"],
  [/laptop|mobile phone|smartphone|earphone|headphone|gadget/i,      "appliances","Electronics"],
  [/amazon|flipkart|appliances/i,                                    "appliances","Electronics"],
  [/myntra|ajio|clothing|clothes|shirt|pants|shoes|fashion/i,        "personal","Clothing"],
  [/salon|haircut|barber|spa|massage/i,                              "personal","Haircut / Salon"],
  [/flight|airline|indigo|spicejet|air india/i,                      "travel","Flights"],
  [/hotel|oyo|booking\.com|airbnb/i,                                 "travel","Hotels"],
  [/ola|uber|rapido|\bauto\b|\bcab\b|metro|bus pass/i,               "travel","Cab / Auto / Metro"],
  [/train ticket|irctc|\bbus\b/i,                                    "travel","Train / Bus"],
  [/udemy|coursera|course|coaching|tuition|school fee|college fee/i, "education","Courses / Classes"],
  [/aws|azure|gcp|hosting|domain|saas|software sub/i,               "business","Software / Subscriptions"],
  [/office|stationery|printing/i,                                    "business","Office Supplies"],
];

function detect(desc) {
  for (const [re, cat, sub] of KW) if (re.test(desc)) return { category: cat, subcategory: sub };
  return null;
}

/* ─── HELPERS ────────────────────────────────────────── */
const PERIODS = [
  { key:"daily", label:"Today" },
  { key:"weekly", label:"Week" },
  { key:"monthly", label:"Month" },
  { key:"quarterly", label:"3 Mo" },
  { key:"halfyearly", label:"6 Mo" },
  { key:"annual", label:"Year" },
];

function filterByPeriod(arr, period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return arr.filter(e => {
    const d = new Date(e.date);
    if (period === "daily")      return d >= today;
    if (period === "weekly")     return d >= new Date(today.getTime() - 6*864e5);
    if (period === "monthly")    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    if (period === "quarterly")  return d >= new Date(today.getTime() - 89*864e5);
    if (period === "halfyearly") return d >= new Date(today.getTime() - 179*864e5);
    if (period === "annual")     return d.getFullYear()===now.getFullYear();
    return true;
  });
}

function fmt(n) {
  if (n >= 1e5) return "₹" + (n/1e5).toFixed(1) + "L";
  if (n >= 1e3) return "₹" + (n/1e3).toFixed(1) + "K";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
function fmtFull(n) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
function fmtDate(s) {
  return new Date(s).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" });
}

/* ─── CUSTOM TOOLTIP ─────────────────────────────────── */
function CTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e1e2e", border:"1px solid #3a3a52", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#e2e8f0", fontFamily:"Plus Jakarta Sans, sans-serif" }}>
      <div style={{ color:"#94a3b8", marginBottom:2 }}>{payload[0].name}</div>
      <div style={{ color:"#fff", fontFamily:"JetBrains Mono", fontWeight:700 }}>{fmtFull(payload[0].value)}</div>
    </div>
  );
}

/* ─── TIME SERIES BUILDER ────────────────────────────── */
function buildTimeSeries(expenses, period) {
  const now = new Date();
  const map = {};
  if (period === "daily" || period === "weekly") {
    const days = period === "daily" ? 1 : 7;
    for (let i = days-1; i >= 0; i--) {
      const d = new Date(now.getTime() - i*864e5);
      const k = d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric" });
      map[k] = 0;
    }
    expenses.forEach(e => {
      const d = new Date(e.date);
      const k = d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric" });
      if (k in map) map[k] += e.amount;
    });
  } else if (period === "monthly") {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i);
      const k = d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
      map[k] = 0;
    }
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()) {
        const k = d.toLocaleDateString("en-IN", { day:"numeric", month:"short" });
        if (k in map) map[k] += e.amount;
      }
    });
  } else {
    const months = period === "quarterly" ? 3 : period === "halfyearly" ? 6 : 12;
    for (let i = months-1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const k = d.toLocaleDateString("en-IN", { month:"short", year:"2-digit" });
      map[k] = 0;
    }
    expenses.forEach(e => {
      const d = new Date(e.date);
      const k = d.toLocaleDateString("en-IN", { month:"short", year:"2-digit" });
      if (k in map) map[k] += e.amount;
    });
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

/* ─── MAIN COMPONENT ─────────────────────────────────── */
export default function ExpenseTracker() {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("dashboard");
  const [period, setPeriod]       = useState("monthly");
  const [histSearch, setHistSearch] = useState("");
  const [histCat, setHistCat]     = useState("all");
  const [toast, setToast]         = useState("");

  // Add form
  const blankForm = { amount:"", description:"", category:"", subcategory:"", date:new Date().toISOString().split("T")[0], note:"" };
  const [form, setForm]           = useState(blankForm);
  const [detected, setDetected]   = useState(null);
  const [accepted, setAccepted]   = useState(false);

  /* storage */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("xpns_v2");
        if (r?.value) setExpenses(JSON.parse(r.value));
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function persist(arr) {
    setExpenses(arr);
    try { await window.storage.set("xpns_v2", JSON.stringify(arr)); } catch {}
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  /* derived */
  const filtered = useMemo(() => filterByPeriod(expenses, period), [expenses, period]);
  const total     = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const catData = useMemo(() => {
    const m = {};
    filtered.forEach(e => { m[e.category] = (m[e.category] || 0) + e.amount; });
    return Object.entries(m)
      .map(([c, v]) => ({ name: CATS[c]?.label||c, value: v, color: CATS[c]?.color||"#888", cat: c }))
      .sort((a,b) => b.value - a.value);
  }, [filtered]);

  const timeSeries = useMemo(() => buildTimeSeries(filtered, period), [filtered, period]);

  const avgPerDay = useMemo(() => {
    if (!filtered.length) return 0;
    const days = { daily:1, weekly:7, monthly:30, quarterly:90, halfyearly:180, annual:365 }[period] || 30;
    return total / days;
  }, [total, filtered, period]);

  const topCat = catData[0] || null;

  /* monthly trend for insights */
  const monthlyTrend = useMemo(() => {
    const m = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(new Date().getFullYear(), new Date().getMonth()-i, 1);
      const k = d.toLocaleDateString("en-IN", { month:"short", year:"2-digit" });
      m[k] = 0;
    }
    expenses.forEach(e => {
      const d = new Date(e.date);
      const k = d.toLocaleDateString("en-IN", { month:"short", year:"2-digit" });
      if (k in m) m[k] += e.amount;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  /* subcategory breakdown for insights */
  const subData = useMemo(() => {
    if (!topCat) return [];
    const m = {};
    filtered.filter(e => e.category === topCat.cat).forEach(e => {
      m[e.subcategory] = (m[e.subcategory] || 0) + e.amount;
    });
    return Object.entries(m).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  }, [filtered, topCat]);

  /* form handlers */
  function handleDesc(v) {
    setForm(f => ({ ...f, description: v }));
    if (v.length > 2) {
      const d = detect(v);
      setDetected(d);
      if (d && !accepted) setForm(f => ({ ...f, category: d.category, subcategory: d.subcategory }));
    } else { setDetected(null); }
  }

  function acceptDetect() {
    if (!detected) return;
    setForm(f => ({ ...f, category: detected.category, subcategory: detected.subcategory }));
    setAccepted(true);
  }

  function selectCat(c) {
    setForm(f => ({ ...f, category: c, subcategory: CATS[c].subs[0] }));
    setAccepted(true);
    setDetected(null);
  }

  async function addExpense() {
    if (!form.amount || isNaN(+form.amount) || +form.amount <= 0) return showToast("Enter a valid amount");
    if (!form.category) return showToast("Select a category");
    const e = {
      id: Date.now().toString(),
      amount: parseFloat(form.amount),
      description: form.description || form.subcategory,
      category: form.category,
      subcategory: form.subcategory,
      date: form.date,
      note: form.note,
    };
    await persist([e, ...expenses]);
    setForm(blankForm);
    setDetected(null);
    setAccepted(false);
    showToast("✓ Expense added");
    setTab("dashboard");
  }

  async function delExpense(id) {
    await persist(expenses.filter(e => e.id !== id));
    showToast("Deleted");
  }

  const histList = useMemo(() => {
    let arr = [...expenses].sort((a,b)=>new Date(b.date)-new Date(a.date));
    if (histCat !== "all") arr = arr.filter(e => e.category === histCat);
    if (histSearch) arr = arr.filter(e =>
      e.description.toLowerCase().includes(histSearch.toLowerCase()) ||
      (CATS[e.category]?.label||"").toLowerCase().includes(histSearch.toLowerCase())
    );
    return arr;
  }, [expenses, histCat, histSearch]);

  /* ─── RENDER ─────────────────────────────────────────── */
  const S = styles;

  if (loading) return (
    <div style={S.root}>
      <style>{FONT_STYLE}</style>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"#94a3b8", fontFamily:"Plus Jakarta Sans" }}>Loading…</div>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{FONT_STYLE}</style>

      {/* ── TOP HEADER ── */}
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>💰 ExpenseIQ</div>
          <div style={S.headerSub}>Smart Expense Tracker</div>
        </div>
        {tab !== "add" && (
          <div style={S.periodRow}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{ ...S.periodBtn, ...(period===p.key ? S.periodBtnActive : {}) }}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div style={S.content}>
        {tab === "dashboard" && <DashTab {...{ filtered, total, catData, timeSeries, avgPerDay, topCat, period }} />}
        {tab === "add"       && <AddTab  {...{ form, setForm, detected, accepted, handleDesc, acceptDetect, selectCat, addExpense, expenses }} />}
        {tab === "history"   && <HistTab {...{ histList, histSearch, setHistSearch, histCat, setHistCat, delExpense }} />}
        {tab === "insights"  && <InsightsTab {...{ filtered, total, catData, subData, monthlyTrend, expenses, topCat }} />}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={S.nav}>
        {[
          { key:"dashboard", icon:"📊", label:"Dashboard" },
          { key:"add",       icon:"➕", label:"Add" },
          { key:"history",   icon:"🗓️", label:"History" },
          { key:"insights",  icon:"🔍", label:"Insights" },
        ].map(n => (
          <button key={n.key} onClick={() => setTab(n.key)} style={{ ...S.navBtn, ...(tab===n.key ? S.navBtnActive : {}) }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            <span style={{ fontSize:10, marginTop:2 }}>{n.label}</span>
          </button>
        ))}
      </div>

      {/* ── TOAST ── */}
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

/* ─────────── DASHBOARD TAB ─────────────────────────── */
function DashTab({ filtered, total, catData, timeSeries, avgPerDay, topCat, period }) {
  const recent = filtered.slice(0, 6);
  return (
    <div style={{ padding:"12px 14px 8px" }}>
      {/* Total card */}
      <div style={styles.totalCard}>
        <div style={{ color:"#94a3b8", fontSize:12, marginBottom:4 }}>Total — {PERIODS.find(p=>p.key===period)?.label}</div>
        <div style={styles.totalAmount}>{fmtFull(total)}</div>
        <div style={{ color:"#64748b", fontSize:11, marginTop:4 }}>{filtered.length} transaction{filtered.length!==1?"s":""}</div>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <StatCard label="Avg / day" val={fmt(avgPerDay)} icon="📅" color="#818cf8" />
        <StatCard label="Transactions" val={filtered.length} icon="🔢" color="#38bdf8" />
        <StatCard label="Top Category" val={topCat ? CATS[topCat.cat]?.icon : "—"} sub={topCat ? CATS[topCat.cat]?.label : "None"} color={topCat?.color||"#888"} />
      </div>

      {/* Donut */}
      {catData.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Spending by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {catData.map((e,i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={styles.legendGrid}>
            {catData.slice(0,8).map((e,i) => (
              <div key={i} style={styles.legendItem}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:e.color, display:"inline-block", marginRight:5, flexShrink:0 }}/>
                <span style={{ color:"#94a3b8", fontSize:11, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.name}</span>
                <span style={{ marginLeft:"auto", color:"#e2e8f0", fontSize:11, fontFamily:"JetBrains Mono", paddingLeft:4 }}>{fmt(e.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar chart */}
      {timeSeries.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Spending Over Time</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={timeSeries} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize:9, fill:"#64748b", fontFamily:"Plus Jakarta Sans" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize:9, fill:"#64748b", fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} width={40} tickFormatter={v=>fmt(v)} />
              <Tooltip content={<CTooltip />} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {timeSeries.map((e,i) => (
                  <Cell key={i} fill={`hsl(${250 + i*8}, 70%, ${55+i*2}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Recent Transactions</div>
          {recent.map(e => <TxRow key={e.id} e={e} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", color:"#64748b", padding:"40px 20px", fontSize:14 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🧾</div>
          No expenses yet for this period.<br/>Tap <b style={{color:"#6366f1"}}>Add</b> to record one.
        </div>
      )}
    </div>
  );
}

/* ─────────── ADD TAB ────────────────────────────────── */
function AddTab({ form, setForm, detected, accepted, handleDesc, acceptDetect, selectCat, addExpense }) {
  const subs = form.category ? CATS[form.category]?.subs || [] : [];
  return (
    <div style={{ padding:"12px 14px 8px" }}>
      <div style={styles.card}>
        {/* Amount */}
        <div style={styles.amountWrap}>
          <span style={{ color:"#94a3b8", fontSize:26, fontFamily:"JetBrains Mono", marginRight:4 }}>₹</span>
          <input
            type="number" inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f=>({...f, amount:e.target.value}))}
            style={styles.amountInput}
          />
        </div>

        {/* Description */}
        <label style={styles.fieldLabel}>Description (auto-detects category)</label>
        <input
          type="text" placeholder="e.g. Zomato, Petrol, Netflix…"
          value={form.description}
          onChange={e => handleDesc(e.target.value)}
          style={styles.textInput}
        />

        {/* Auto-detect chip */}
        {detected && !accepted && (
          <div style={styles.detectChip}>
            <span>Detected: <b style={{color:CATS[detected.category]?.color}}>{CATS[detected.category]?.label}</b> › {detected.subcategory}</span>
            <button onClick={acceptDetect} style={styles.detectBtn}>Accept ✓</button>
          </div>
        )}

        {/* Category grid */}
        <label style={{ ...styles.fieldLabel, marginTop:14 }}>Category</label>
        <div style={styles.catGrid}>
          {Object.entries(CATS).map(([k,v]) => (
            <button key={k} onClick={()=>selectCat(k)} style={{ ...styles.catChip, ...(form.category===k ? { background:v.color+"22", borderColor:v.color, color:v.color } : {}) }}>
              <span style={{ fontSize:15 }}>{v.icon}</span>
              <span style={{ fontSize:10, marginTop:2, textAlign:"center" }}>{v.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Subcategory */}
        {subs.length > 0 && (
          <>
            <label style={{ ...styles.fieldLabel, marginTop:14 }}>Subcategory</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {subs.map(s => (
                <button key={s} onClick={() => setForm(f=>({...f, subcategory:s}))}
                  style={{ ...styles.subChip, ...(form.subcategory===s ? { background:"#6366f122", borderColor:"#6366f1", color:"#818cf8" } : {}) }}>
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Date */}
        <label style={{ ...styles.fieldLabel, marginTop:14 }}>Date</label>
        <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={styles.textInput} />

        {/* Note */}
        <label style={{ ...styles.fieldLabel, marginTop:14 }}>Note (optional)</label>
        <input type="text" placeholder="Add a note…" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} style={styles.textInput} />

        {/* Submit */}
        <button onClick={addExpense} style={styles.addBtn}>
          Add Expense
        </button>
      </div>
    </div>
  );
}

/* ─────────── HISTORY TAB ────────────────────────────── */
function HistTab({ histList, histSearch, setHistSearch, histCat, setHistCat, delExpense }) {
  const [confirmDel, setConfirmDel] = useState(null);

  function handleDel(id) {
    if (confirmDel === id) { delExpense(id); setConfirmDel(null); }
    else { setConfirmDel(id); setTimeout(()=>setConfirmDel(null), 2500); }
  }

  return (
    <div style={{ padding:"12px 14px 8px" }}>
      {/* Search */}
      <input type="text" placeholder="🔍  Search transactions…" value={histSearch}
        onChange={e=>setHistSearch(e.target.value)} style={{ ...styles.textInput, marginBottom:10 }} />

      {/* Category filter */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none" }}>
        <button onClick={()=>setHistCat("all")} style={{ ...styles.subChip, flexShrink:0, ...(histCat==="all"?{background:"#6366f122",borderColor:"#6366f1",color:"#818cf8"}:{}) }}>All</button>
        {Object.entries(CATS).map(([k,v])=>(
          <button key={k} onClick={()=>setHistCat(k)} style={{ ...styles.subChip, flexShrink:0, ...(histCat===k?{background:v.color+"22",borderColor:v.color,color:v.color}:{}) }}>
            {v.icon} {v.label.split(" ")[0]}
          </button>
        ))}
      </div>

      {histList.length === 0 ? (
        <div style={{ textAlign:"center", color:"#64748b", padding:"40px 20px", fontSize:14 }}>No transactions found.</div>
      ) : (
        <div style={styles.card}>
          <div style={{ color:"#64748b", fontSize:11, marginBottom:8 }}>{histList.length} records</div>
          {histList.map(e => (
            <div key={e.id} style={styles.txRowDel}>
              <div style={{ width:36, height:36, borderRadius:10, background:CATS[e.category]?.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                {CATS[e.category]?.icon}
              </div>
              <div style={{ flex:1, overflow:"hidden" }}>
                <div style={{ color:"#e2e8f0", fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.description}</div>
                <div style={{ color:"#64748b", fontSize:11 }}>{CATS[e.category]?.label} · {e.subcategory} · {fmtDate(e.date)}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ color:"#e2e8f0", fontSize:14, fontFamily:"JetBrains Mono", fontWeight:700 }}>₹{e.amount.toLocaleString("en-IN")}</div>
                <button onClick={()=>handleDel(e.id)} style={{ ...styles.delBtn, ...(confirmDel===e.id?{color:"#f43f5e",borderColor:"#f43f5e44"}:{}) }}>
                  {confirmDel===e.id ? "Confirm?" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── INSIGHTS TAB ───────────────────────────── */
function InsightsTab({ filtered, total, catData, subData, monthlyTrend, expenses, topCat }) {
  const allTotal = expenses.reduce((s,e)=>s+e.amount, 0);

  return (
    <div style={{ padding:"12px 14px 8px" }}>
      {/* Monthly trend */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>6-Month Spending Trend</div>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize:10, fill:"#64748b", fontFamily:"Plus Jakarta Sans" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:9, fill:"#64748b", fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} width={42} tickFormatter={v=>fmt(v)} />
            <Tooltip content={<CTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#trendGrad)" dot={{ r:3, fill:"#6366f1", stroke:"#0d0d14", strokeWidth:2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown bar */}
      {catData.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Top Categories ({PERIODS.find(p=>p.key==="monthly")?.label})</div>
          <ResponsiveContainer width="100%" height={Math.max(140, catData.length * 34)}>
            <BarChart data={catData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize:9, fill:"#64748b", fontFamily:"JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={v=>fmt(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:"#94a3b8", fontFamily:"Plus Jakarta Sans" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CTooltip />} />
              <Bar dataKey="value" radius={[0,4,4,0]}>
                {catData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top category subcategory breakdown */}
      {topCat && subData.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>{CATS[topCat.cat]?.icon} {CATS[topCat.cat]?.label} — Subcategories</div>
          {subData.map((s,i) => (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:"#94a3b8", fontSize:12 }}>{s.name}</span>
                <span style={{ color:"#e2e8f0", fontSize:12, fontFamily:"JetBrains Mono" }}>{fmtFull(s.value)}</span>
              </div>
              <div style={{ height:5, borderRadius:3, background:"#1e1e2e" }}>
                <div style={{ height:"100%", borderRadius:3, background:topCat.color, width:`${(s.value/subData[0].value)*100}%`, transition:"width 0.6s ease" }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary stats */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Summary (All Time)</div>
        <div style={styles.summaryGrid}>
          <SummaryRow label="Total Expenses" val={fmtFull(allTotal)} />
          <SummaryRow label="Total Transactions" val={expenses.length} />
          <SummaryRow label="Avg per transaction" val={expenses.length ? fmtFull(allTotal/expenses.length) : "—"} />
          <SummaryRow label="Categories used" val={[...new Set(expenses.map(e=>e.category))].length} />
        </div>
      </div>
    </div>
  );
}

/* ─────────── SMALL COMPONENTS ───────────────────────── */
function StatCard({ label, val, sub, icon, color }) {
  return (
    <div style={{ ...styles.statCard, borderTopColor:color }}>
      <div style={{ color:"#64748b", fontSize:10, marginBottom:4 }}>{label}</div>
      <div style={{ color:color||"#e2e8f0", fontSize:icon?22:16, fontFamily:"JetBrains Mono", fontWeight:700 }}>{val}</div>
      {sub && <div style={{ color:"#94a3b8", fontSize:10, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function TxRow({ e }) {
  return (
    <div style={styles.txRow}>
      <div style={{ width:34, height:34, borderRadius:9, background:CATS[e.category]?.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>
        {CATS[e.category]?.icon}
      </div>
      <div style={{ flex:1, overflow:"hidden" }}>
        <div style={{ color:"#e2e8f0", fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.description}</div>
        <div style={{ color:"#64748b", fontSize:10 }}>{e.subcategory} · {fmtDate(e.date)}</div>
      </div>
      <div style={{ color:CATS[e.category]?.color||"#e2e8f0", fontSize:13, fontFamily:"JetBrains Mono", fontWeight:700, flexShrink:0 }}>
        ₹{e.amount.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function SummaryRow({ label, val }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #1a1a2e" }}>
      <span style={{ color:"#94a3b8", fontSize:13 }}>{label}</span>
      <span style={{ color:"#e2e8f0", fontFamily:"JetBrains Mono", fontSize:13, fontWeight:600 }}>{val}</span>
    </div>
  );
}

/* ─────────── STYLES ─────────────────────────────────── */
const styles = {
  root: { background:"#0d0d14", minHeight:"100vh", height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Plus Jakarta Sans', sans-serif", overflow:"hidden" },
  header: { background:"#0d0d14", borderBottom:"1px solid #1a1a2e", padding:"12px 14px 10px", flexShrink:0, zIndex:10 },
  headerTitle: { color:"#e2e8f0", fontSize:18, fontWeight:800, letterSpacing:-0.5 },
  headerSub: { color:"#475569", fontSize:10, marginTop:1 },
  periodRow: { display:"flex", gap:4, marginTop:8, overflowX:"auto", scrollbarWidth:"none" },
  periodBtn: { background:"#16161f", border:"1px solid #252535", borderRadius:20, padding:"4px 10px", color:"#64748b", fontSize:11, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 },
  periodBtnActive: { background:"#6366f133", borderColor:"#6366f1", color:"#818cf8" },
  content: { flex:1, overflowY:"auto", paddingBottom:4 },
  nav: { display:"flex", background:"#0d0d14", borderTop:"1px solid #1a1a2e", flexShrink:0 },
  navBtn: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"8px 4px", background:"transparent", border:"none", color:"#475569", cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:10, fontWeight:500, gap:1 },
  navBtnActive: { color:"#6366f1" },
  toast: { position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", background:"#1e1e2e", border:"1px solid #3a3a52", borderRadius:20, padding:"8px 18px", color:"#a5b4fc", fontSize:13, fontFamily:"Plus Jakarta Sans", zIndex:99, whiteSpace:"nowrap", boxShadow:"0 4px 20px #0009" },

  /* dashboard */
  totalCard: { background:"linear-gradient(135deg, #1e1b4b 0%, #16161f 100%)", border:"1px solid #312e81", borderRadius:14, padding:"16px 18px", marginBottom:10 },
  totalAmount: { color:"#fff", fontSize:32, fontFamily:"JetBrains Mono", fontWeight:700, letterSpacing:-1 },
  statsRow: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 },
  statCard: { background:"#16161f", border:"1px solid #252535", borderTop:"2px solid transparent", borderRadius:12, padding:"10px 10px 8px" },
  card: { background:"#16161f", border:"1px solid #252535", borderRadius:14, padding:"14px", marginBottom:10 },
  cardTitle: { color:"#94a3b8", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:12 },
  legendGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 8px", marginTop:8 },
  legendItem: { display:"flex", alignItems:"center", gap:0, overflow:"hidden" },
  txRow: { display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"1px solid #1a1a2e" },
  txRowDel: { display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #1a1a2e" },

  /* add form */
  amountWrap: { display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 0 14px", borderBottom:"1px solid #1e1e2e", marginBottom:14 },
  amountInput: { color:"#fff", fontSize:36, fontFamily:"JetBrains Mono", fontWeight:700, textAlign:"center", width:"100%", letterSpacing:-1, caretColor:"#6366f1" },
  fieldLabel: { display:"block", color:"#64748b", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, marginBottom:6 },
  textInput: { width:"100%", background:"#1a1a2e", border:"1px solid #2a2a3d", borderRadius:10, padding:"10px 12px", color:"#e2e8f0", fontSize:13, fontFamily:"'Plus Jakarta Sans', sans-serif" },
  detectChip: { marginTop:6, background:"#1e1b4b", border:"1px solid #4338ca44", borderRadius:8, padding:"6px 10px", fontSize:12, color:"#c7d2fe", display:"flex", alignItems:"center", justifyContent:"space-between" },
  detectBtn: { background:"#4f46e5", border:"none", borderRadius:6, padding:"3px 8px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" },
  catGrid: { display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:6 },
  catChip: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, padding:"8px 4px", background:"#1a1a2e", border:"1px solid #2a2a3d", borderRadius:10, cursor:"pointer", color:"#94a3b8", fontFamily:"'Plus Jakarta Sans', sans-serif", transition:"all 0.15s" },
  subChip: { background:"#1a1a2e", border:"1px solid #2a2a3d", borderRadius:20, padding:"4px 10px", color:"#94a3b8", fontSize:11, fontWeight:500, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif" },
  addBtn: { width:"100%", marginTop:18, background:"linear-gradient(135deg, #4f46e5, #7c3aed)", border:"none", borderRadius:12, padding:"14px", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif", letterSpacing:0.3 },

  /* history */
  delBtn: { background:"transparent", border:"1px solid #2a2a3d", borderRadius:6, padding:"2px 6px", color:"#64748b", fontSize:10, cursor:"pointer", marginTop:2, fontFamily:"'Plus Jakarta Sans', sans-serif" },

  /* insights */
  summaryGrid: {},
};
