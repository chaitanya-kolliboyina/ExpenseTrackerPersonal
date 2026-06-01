"use client";

import { useState } from "react";
import { CATS, detectCat } from "@/utils/categories";

export default function AddTab({ onAdd, showToast }: { onAdd: (data: any) => Promise<void>; showToast: (m: string) => void }) {
    const [amount, setAmount] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [note, setNote] = useState("");
    const [detected, setDetected] = useState<any>(null);

    const handleDescChange = (val: string) => {
        setDesc(val);
        if (val.length > 2) {
            const d = detectCat(val);
            if (d) {
                setDetected(d);
                setCategory(d.category);
                setSubcategory(d.subsubcategory);
            }
        } else {
            setDetected(null);
        }
    };

    const handleSubmit = async () => {
        const amt = parseFloat(amount);
        if (!amt || isNaN(amt) || amt <= 0) return showToast("Enter a valid amount");
        if (!category) return showToast("Select a category");

        await onAdd({ amount: amt, description: desc || subcategory, category, subcategory, date, note });
        setAmount(""); setDesc(""); setCategory(""); setSubcategory(""); setNote(""); setDetected(null);
        showToast("✓ Record Saved");
    };

    return (
        <div className="p-3">
            <div className="bg-[#16161f] border border-[#252535] rounded-xl p-4 space-y-4">
                {/* Input Box */}
                <div className="flex items-center justify-center border-b border-[#1e1e2e] pb-3">
                    <span className="font-mono text-2xl text-gray-400 mr-1">₹</span>
                    <input type="number" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-center text-3xl font-mono font-bold text-white bg-transparent outline-none" />
                </div>

                {/* Text Input */}
                <div>
                    <label className="block text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Description</label>
                    <input type="text" placeholder="e.g. Zomato, Petrol, Rent..." value={desc} onChange={e => handleDescChange(e.target.value)} className="w-full bg-[#1a1a2e] border border-[#2a2a3d] rounded-lg p-2.5 text-sm text-gray-200 outline-none" />
                </div>

                {/* AI Detection Prompt Indicator */}
                {detected && (
                    <div className="bg-[#1e1b4b] border border-indigo-900/40 rounded-lg p-2 flex items-center justify-between text-xs text-indigo-200">
                        <span>Match: <b style={{ color: CATS[detected.category]?.color }}>{CATS[detected.category]?.label}</b> › {detected.subsubcategory}</span>
                        <button className="bg-[#4f46e5] text-white px-2 py-0.5 rounded text-[11px] font-bold" onClick={() => setDetected(null)}>Accept ✓</button>
                    </div>
                )}

                {/* Grid Select Area */}
                <div>
                    <label className="block text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Category</label>
                    <div className="grid grid-cols-5 gap-1.5">
                        {Object.entries(CATS).map(([k, v]) => (
                            <button key={k} onClick={() => { setCategory(k); setSubcategory(v.subs[0]); setDetected(null); }} className="flex flex-col items-center p-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a3d] text-gray-400" style={category === k ? { backgroundColor: `${v.color}22`, borderColor: v.color, color: v.color } : {}}>
                                <span className="text-base">{v.icon}</span>
                                <span className="text-[9px] mt-1 text-center truncate w-full">{v.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subcategories Selector */}
                {category && CATS[category]?.subs.length > 0 && (
                    <div>
                        <label className="block text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Subcategory</label>
                        <div className="flex flex-wrap gap-1.5">
                            {CATS[category].subs.map(s => (
                                <button key={s} onClick={() => setSubcategory(s)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border bg-[#1a1a2e] border-[#2a2a3d] text-gray-400 ${subcategory === s ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400' : ''}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Date Row */}
                <div>
                    <label className="block text-gray-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#1a1a2e] border border-[#2a2a3d] rounded-lg p-2.5 text-sm text-gray-200 outline-none" />
                </div>

                <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white rounded-xl py-3 text-sm font-bold tracking-wide active:opacity-90">Save Record</button>
            </div>
        </div>
    );
}